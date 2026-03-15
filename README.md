# Thinkara 🧠

Thinkara is an AI-powered study assistant designed to help students turn notes into interactive summaries, flashcards, quizzes, and personalized study plans. Featuring a smart learning dashboard, detailed analytics, and organizational tools, Thinkara makes studying faster, more structured, and highly efficient. 

## Features ✨

*   **AI Summaries:** Instantly digest long notes into concise, easy-to-read summaries.
*   **Smart Flashcards:** Automatically generate flashcards from your study materials for active recall.
*   **Auto-Quizzes:** Test your knowledge with AI-generated quizzes tailored to your content.
*   **Study Plans:** Create personalized, structured study schedules.
*   **Learning Dashboard:** Track your progress and view detailed analytics.
*   **Organization:** Keep everything organized with intuitive board-based workflows.

## Tech Stack 🛠️

*   **Frontend:** React, Tailwind CSS, Lucide React
*   **Backend & Auth:** Supabase (Database, Authentication)
*   **AI Integration:** OpenAI API

---

## 🚀 Running Thinkara Locally

Follow these step-by-step instructions to set up and run Thinkara on your local machine.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v16 or higher recommended).
2.  **Supabase Account**: You'll need a free account at [Supabase](https://supabase.com/) to set up the database and authentication.
3.  **OpenAI API Key**: You'll need an active [OpenAI API Key](https://platform.openai.com/api-keys) to power the AI features.

### Step 1: Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/Schandelxd/Thinkara.git
cd Thinkara
```

### Step 2: Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

### Step 3: Set up Supabase

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Wait for the database to be provisioned.
3.  Navigate to **Project Settings** -> **API**.
4.  Copy your **Project URL** and your **anon/public Key**.

You will also need to set up Authentication (e.g., enable Email/Password login) and create the necessary tables in the Supabase SQL Editor based on the application's data models (e.g., users, notes, flashcards, quizzes).

### Step 4: Configure Environment Variables

1.  In the root folder of the project, duplicate the `.env.example` file and rename it to `.env`.
2.  Open the `.env` file and fill in your keys:

```ini
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```
*(Replace the placeholder text with your actual keys. Ensure there are no spaces around the `=` sign).*

### Step 5: Start the Development Server

Start the application locally:

```bash
npm start
```

The app should now be running in your browser at `http://localhost:3000`. 

---

### Contributing

Feel free to fork the repository and submit pull requests to help improve Thinkara!

### License

This project is open-source and available under the standard MIT License.
