import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Materials from './pages/Materials.jsx';
import Quiz from './pages/Quiz.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Planner from './pages/StudyPlanner.jsx';
import Analytics from './pages/Analytics.jsx';
import Boards from './pages/Boards.jsx';
import Settings from './pages/Settings.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AITutor from './pages/AITutor.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Thinkara" 
            style={{ width: '64px', height: '64px', marginBottom: '16px', animation: 'popIn 0.5s ease-out' }} />
          <p style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

import ErrorBoundary from './components/common/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            
            <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="materials" element={<Materials />} />
              <Route path="tutor" element={<AITutor />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="planner" element={<Planner />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="boards" element={<Boards />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
