# Thinkara 🧠✨
### *Transform Your Notes into Knowledge with AI*

Thinkara is a premium, AI-powered study companion designed to supercharge your learning. Effortlessly turn your static notes and PDFs into interactive study materials, manage your schedule with a dynamic planner, and track your growth with advanced analytics.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🧠 AI Flashcards** | Automatically generate smart flashcards using Active Recall technology. |
| **📝 Auto-Quizzes** | Instantly create customized quizzes to test your mastery of any topic. |
| **📊 Smart Analytics** | Visualize your learning progress with beautiful, interactive charts. |
| **📅 Study Planner** | Organize your study sessions with a sleek, sticker-based calendar system. |
| **💬 AI Assistant** | A context-aware tutor that responds to your queries in real-time. |
| **🎨 Custom Themes** | Personalize your experience with elegant Light and Dark modes. |

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **AI Engine:** [OpenAI GPT-4o](https://openai.com/)

---

## 🏁 Getting Started (Step-by-Step)

Follow these steps to set up Thinkara on your local machine and start studying smarter.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Schandelxd/Thinkara.git
cd Thinkara
```

### 2️⃣ Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 3️⃣ Configure Environment Variables
1. Duplicate the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your credentials from Supabase and OpenAI:
   ```ini
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   REACT_APP_OPENAI_API_KEY=your-openai-key
   ```
   *Note: You can also configure these keys directly within the App's **Settings UI** for convenience.*

### 4️⃣ Database Setup (Supabase)
Initialize your Supabase project with following tables:
- `users` (Managed by Supabase Auth)
- `materials` (Stored in Supabase Storage & Database)
- `flashcards` & `quizzes`
- `sessions` (For study tracking)

### 5️⃣ Launch the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to see the magic happen! 🚀

---

## 🤝 Contributing
We welcome contributions! Please fork the repository, make your changes, and submit a PR.

## 📄 License
Thinkara is licensed under the [MIT License](LICENSE). 

---
Developed with ❤️ for curious minds everywhere.
