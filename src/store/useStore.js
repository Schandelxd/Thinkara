import { create } from 'zustand';

// Load persisted theme
const savedTheme = localStorage.getItem('thinkara_theme') || 'light';

// Apply theme on load
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Per-user localStorage helper
function getUserKey(key) {
  const userId = localStorage.getItem('thinkara_current_user_id') || 'default';
  return `thinkara_${userId}_${key}`;
}

function loadUserData(key, fallback) {
  try {
    const raw = localStorage.getItem(getUserKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveUserData(key, value) {
  localStorage.setItem(getUserKey(key), JSON.stringify(value));
}

// Default boards
const DEFAULT_BOARDS = [
  { id: 'default-1', title: 'To Study', color: '#8B5CF6', cards: [] },
  { id: 'default-2', title: 'In Progress', color: '#FBBF24', cards: [] },
  { id: 'default-3', title: 'Review', color: '#F472B6', cards: [] },
  { id: 'default-4', title: 'Mastered', color: '#34D399', cards: [] },
];

export const useStore = create((set, get) => ({
  // Settings
  settings: {
    fullName: 'Student',
    email: '',
    openaiApiKey: typeof process !== 'undefined' && process.env.REACT_APP_OPENAI_API_KEY ? process.env.REACT_APP_OPENAI_API_KEY : '',
    theme: savedTheme,
    avatar: '',
    notifications: true,
    studyReminders: true,
    weeklyReport: false,
    soundEffects: true,
  },

  // Data State — loaded per user
  materials: [],
  flashcards: [],
  quizzes: [],
  quizScores: [],
  studyEvents: [],
  notifications: [],
  boards: DEFAULT_BOARDS,

  // Initialize user data from localStorage
  initUserData: (userId, userEmail, userName) => {
    localStorage.setItem('thinkara_current_user_id', userId);
    
    // Load per-user settings or fallback to globals
    const userSettings = loadUserData('settings', {
        fullName: userName || localStorage.getItem('thinkara_fullName') || 'Student',
        email: userEmail || localStorage.getItem('thinkara_email') || '',
        openaiApiKey: localStorage.getItem('thinkara_openai_api_key') || process.env.REACT_APP_OPENAI_API_KEY || '',
        theme: savedTheme,
        avatar: localStorage.getItem('thinkara_avatar') || '',
        notifications: true,
        studyReminders: true,
        weeklyReport: false,
        soundEffects: true,
    });

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

  // Persist helper
  _persist: (key) => {
    const value = get()[key];
    saveUserData(key, value);
  },

  // Settings
  setApiKey: (key) => set((state) => {
    const newSettings = { ...state.settings, openaiApiKey: key };
    saveUserData('settings', newSettings);
    // Also keep in global fallback for convenience
    localStorage.setItem('thinkara_openai_api_key', key);
    return { settings: newSettings };
  }),

  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    saveUserData('settings', updated);
    
    // Global fallbacks for specific fields (compat)
    if (newSettings.fullName !== undefined) localStorage.setItem('thinkara_fullName', newSettings.fullName);
    if (newSettings.email !== undefined) localStorage.setItem('thinkara_email', newSettings.email);
    if (newSettings.avatar !== undefined) localStorage.setItem('thinkara_avatar', newSettings.avatar);
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
