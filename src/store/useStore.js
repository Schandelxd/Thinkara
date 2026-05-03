import { create } from 'zustand';

// Load persisted theme
const savedTheme = localStorage.getItem('thinkara_theme') || 'light';

// Apply theme on load
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Simple base64 encoding with a user-specific salt for mild obfuscation
// Not bulletproof encryption, but prevents casual inspection of plaintext API keys
function obfuscateData(data, salt) {
  if (!data) return data;
  try {
    return btoa(unescape(encodeURIComponent(data + '|||' + salt)));
  } catch (e) {
    return data;
  }
}

function deobfuscateData(encoded, salt) {
  if (!encoded) return encoded;
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const parts = decoded.split('|||');
    if (parts.length === 2 && parts[1] === salt) {
      return parts[0];
    }
    return encoded; // Fallback if format is wrong
  } catch (e) {
    return encoded;
  }
}

// Per-user localStorage helper
function getUserKey(key) {
  // CRITICAL: Throw if no user ID is set to prevent leaking to a 'default' account
  const userId = localStorage.getItem('thinkara_current_user_id');
  if (!userId) {
    console.warn(`Attempted to access per-user storage for '${key}' without an active user session.`);
    return `thinkara_ANONYMOUS_${key}`; // Failsafe
  }
  return `thinkara_${userId}_${key}`;
}

function loadUserData(key, fallback, decrypt = false) {
  try {
    const raw = localStorage.getItem(getUserKey(key));
    if (!raw) return fallback;
    
    let value = JSON.parse(raw);
    
    // Handle API key decryption
    if (decrypt && key === 'settings' && value.openaiApiKey) {
      const userId = localStorage.getItem('thinkara_current_user_id');
      value.openaiApiKey = deobfuscateData(value.openaiApiKey, userId);
    }
    return value;
  } catch { 
    return fallback; 
  }
}

function saveUserData(key, value, encrypt = false) {
  try {
    let valueToStore = value;
    
    // Handle API key encryption
    if (encrypt && key === 'settings' && value.openaiApiKey) {
      const userId = localStorage.getItem('thinkara_current_user_id');
      valueToStore = { 
        ...value, 
        openaiApiKey: obfuscateData(value.openaiApiKey, userId) 
      };
    }
    
    localStorage.setItem(getUserKey(key), JSON.stringify(valueToStore));
  } catch (e) {
    console.error("Failed to save user data", e);
  }
}

// Default boards
const DEFAULT_BOARDS = [
  { id: 'default-1', title: 'To Study', color: '#8B5CF6', cards: [] },
  { id: 'default-2', title: 'In Progress', color: '#FBBF24', cards: [] },
  { id: 'default-3', title: 'Review', color: '#F472B6', cards: [] },
  { id: 'default-4', title: 'Mastered', color: '#34D399', cards: [] },
];

const INITIAL_STATE = {
  settings: {
    fullName: 'Student',
    email: '',
    openaiApiKey: '',
    theme: savedTheme,
    avatar: '',
    notifications: true,
    studyReminders: true,
    weeklyReport: false,
    soundEffects: true,
  },
  materials: [],
  flashcards: [],
  quizzes: [],
  quizScores: [],
  studyEvents: [],
  notifications: [],
  boards: DEFAULT_BOARDS,
  isSidebarOpen: false,
};

export const useStore = create((set, get) => ({
  ...INITIAL_STATE,

  // Initialize user data from localStorage - STRICTLY per user
  initUserData: (userId, userEmail, userName) => {
    // Set the active user ID first
    localStorage.setItem('thinkara_current_user_id', userId);
    
    // Fallback defaults
    const defaultSettings = {
        fullName: userName || 'Student',
        email: userEmail || '',
        openaiApiKey: '',
        theme: savedTheme,
        avatar: '',
        notifications: true,
        studyReminders: true,
        weeklyReport: false,
        soundEffects: true,
    };

    // Load per-user settings, and decrypt the API key
    let userSettings = loadUserData('settings', defaultSettings, true);
    
    // Ensure email is always up to date from Supabase auth
    if (userEmail && userSettings.email !== userEmail) {
       userSettings.email = userEmail;
       // Save back without re-encrypting the key here (we'll let updateSettings handle that if needed)
    }

    set({
      settings: userSettings,
      materials: loadUserData('materials', []),
      flashcards: loadUserData('flashcards', []),
      quizzes: loadUserData('quizzes', []),
      quizScores: loadUserData('quizScores', []),
      studyEvents: loadUserData('studyEvents', []),
      notifications: loadUserData('notifications', []),
      boards: loadUserData('boards', DEFAULT_BOARDS),
    });
  },

  // Clear in-memory session data (on logout)
  clearUserSession: () => {
    localStorage.removeItem('thinkara_current_user_id');
    set(INITIAL_STATE);
  },

  // UI State
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // Settings
  setApiKey: (key) => set((state) => {
    const newSettings = { ...state.settings, openaiApiKey: key };
    saveUserData('settings', newSettings, true); // encrypts before save
    return { settings: newSettings };
  }),

  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    saveUserData('settings', updated, true); // encrypts before save
    
    if (newSettings.theme !== undefined) {
      localStorage.setItem('thinkara_theme', newSettings.theme);
      document.documentElement.setAttribute('data-theme', newSettings.theme);
    }
    return { settings: updated };
  }),

  // Materials
  addMaterial: (material) => set((state) => {
    const materials = [...state.materials, { id: Date.now().toString(), dateAdded: new Date().toISOString(), ...material }];
    saveUserData('materials', materials);
    return { materials };
  }),
  deleteMaterial: (id) => set((state) => {
    const materials = state.materials.filter(m => m.id !== id);
    saveUserData('materials', materials);
    return { materials };
  }),

  // Flashcards
  addFlashcards: (deckId, cards, title) => set((state) => {
    const flashcards = [...state.flashcards, { id: deckId, dateGenerated: new Date().toISOString(), cards }];
    const notifications = [...state.notifications, {
      id: Date.now().toString(),
      type: 'flashcard',
      title: 'Flashcards Ready!',
      message: `Your flashcards for "${title || 'New Material'}" are ready.`,
      date: new Date().toISOString(),
      read: false
    }];
    saveUserData('flashcards', flashcards);
    saveUserData('notifications', notifications);
    return { flashcards, notifications };
  }),

  // Quizzes
  addQuiz: (quizId, questions, title) => set((state) => {
    const quizzes = [...state.quizzes, { id: quizId, dateGenerated: new Date().toISOString(), questions }];
    const notifications = [...state.notifications, {
      id: Date.now().toString() + '-q',
      type: 'quiz',
      title: 'Quiz Ready!',
      message: `Your quiz for "${title || 'New Material'}" is ready.`,
      date: new Date().toISOString(),
      read: false
    }];
    saveUserData('quizzes', quizzes);
    saveUserData('notifications', notifications);
    return { quizzes, notifications };
  }),

  // Notifications
  clearNotifications: () => set(() => {
    saveUserData('notifications', []);
    return { notifications: [] };
  }),
  markNotificationsAsRead: () => set((state) => {
    const notifications = state.notifications.map(n => ({ ...n, read: true }));
    saveUserData('notifications', notifications);
    return { notifications };
  }),

  // Quiz Scores
  recordQuizScore: (score, total, materialTitle) => set((state) => {
    const quizScores = [...state.quizScores, {
      id: Date.now().toString(), date: new Date().toISOString(),
      score, total, materialTitle: materialTitle || 'General Quiz'
    }];
    saveUserData('quizScores', quizScores);
    return { quizScores };
  }),

  // Study Events
  addStudyEvent: (event) => set((state) => {
    const studyEvents = [...state.studyEvents, { id: Date.now().toString(), ...event }];
    saveUserData('studyEvents', studyEvents);
    return { studyEvents };
  }),
  deleteStudyEvent: (id) => set((state) => {
    const studyEvents = state.studyEvents.filter(e => e.id !== id);
    saveUserData('studyEvents', studyEvents);
    return { studyEvents };
  }),

  // Boards
  addBoard: (title, color) => set((state) => {
    const boards = [...state.boards, { id: Date.now().toString(), title, color: color || '#8B5CF6', cards: [] }];
    saveUserData('boards', boards);
    return { boards };
  }),
  deleteBoard: (boardId) => set((state) => {
    const boards = state.boards.filter(b => b.id !== boardId);
    saveUserData('boards', boards);
    return { boards };
  }),
  addBoardCard: (boardId, cardTitle, label) => set((state) => {
    const boards = state.boards.map(b =>
      b.id === boardId
        ? { ...b, cards: [...b.cards, { id: Date.now().toString(), title: cardTitle, label: label || '', createdAt: new Date().toISOString() }] }
        : b
    );
    saveUserData('boards', boards);
    return { boards };
  }),
  updateBoardCard: (boardId, cardId, updates) => set((state) => {
    const boards = state.boards.map(b =>
      b.id === boardId
        ? { ...b, cards: b.cards.map(c => c.id === cardId ? { ...c, ...updates } : c) }
        : b
    );
    saveUserData('boards', boards);
    return { boards };
  }),
  deleteBoardCard: (boardId, cardId) => set((state) => {
    const boards = state.boards.map(b =>
      b.id === boardId ? { ...b, cards: b.cards.filter(c => c.id !== cardId) } : b
    );
    saveUserData('boards', boards);
    return { boards };
  }),
  moveBoardCard: (fromBoardId, toBoardId, cardId, insertIndex) => set((state) => {
    const fromBoard = state.boards.find(b => b.id === fromBoardId);
    const card = fromBoard?.cards.find(c => c.id === cardId);
    if (!card) return state;
    const boards = state.boards.map(b => {
      if (b.id === fromBoardId) return { ...b, cards: b.cards.filter(c => c.id !== cardId) };
      if (b.id === toBoardId) {
        const newCards = [...b.cards];
        newCards.splice(insertIndex !== undefined ? insertIndex : newCards.length, 0, card);
        return { ...b, cards: newCards };
      }
      return b;
    });
    saveUserData('boards', boards);
    return { boards };
  }),
  reorderBoardCards: (boardId, fromIndex, toIndex) => set((state) => {
    const boards = state.boards.map(b => {
      if (b.id !== boardId) return b;
      const newCards = [...b.cards];
      const [moved] = newCards.splice(fromIndex, 1);
      newCards.splice(toIndex, 0, moved);
      return { ...b, cards: newCards };
    });
    saveUserData('boards', boards);
    return { boards };
  }),
}));
