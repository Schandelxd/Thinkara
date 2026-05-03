import { Link } from 'react-router-dom';
import { Sparkles, Brain, Clock, Zap, BookOpen, Target, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation */}
      <nav style={{ padding: '24px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/logo.png" 
            alt="Thinkara Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain' }} 
          />
          <h1 style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.5px' }}>Thinkara</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'var(--fg)', fontWeight: 700, textDecoration: 'none', padding: '12px 24px' }}>Log In</Link>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 5%', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        
        <div className="stagger-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '999px', backgroundColor: 'var(--tertiary)', border: '2px solid var(--fg)', boxShadow: 'var(--shadow-hard-small)', marginBottom: '32px', fontWeight: 700 }}>
          <Sparkles size={16} /> Your AI-Powered Study Companion
        </div>

        <h1 className="stagger-2" style={{ fontSize: 'clamp(40px, 8vw, 68px)', maxWidth: '900px', lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-2px' }}>
          Turn your notes into{' '}
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite'
          }}>straight A's</span>.
        </h1>
        
        <p className="stagger-3" style={{ fontSize: '22px', color: 'var(--gray-600)', maxWidth: '620px', marginBottom: '48px', lineHeight: 1.6, fontWeight: 500 }}>
          Upload any PDF, Word doc, or PowerPoint. Thinkara creates flashcards, quizzes, and study plans tailored for Indian university exams — in seconds.
        </p>

        <div className="stagger-4" style={{ display: 'flex', gap: '16px', marginBottom: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" className="btn-primary" style={{ padding: '18px 32px', fontSize: '18px', textDecoration: 'none' }}>
            Start Studying Now <ArrowRight size={22} />
          </Link>
          <button className="btn-secondary" style={{ padding: '18px 32px', fontSize: '18px' }}>See How It Works</button>
        </div>

        {/* Features Grid */}
        <div className="layout-grid" style={{ width: '100%', maxWidth: '1200px', textAlign: 'left' }}>
          {[
            { title: 'Smart Flashcards', desc: 'AI generates exam-focused flashcards from your syllabi, customizable by difficulty.', icon: Zap, color: 'var(--primary)' },
            { title: 'Exam-Level Quizzes', desc: 'Practice with university-standard MCQs tailored to your course material and difficulty level.', icon: Brain, color: 'var(--tertiary)' },
            { title: 'Multi-Format Upload', desc: 'Upload PDF, Word, PowerPoint — we extract every concept automatically.', icon: BookOpen, color: 'var(--quaternary)' },
          ].map((feature, i) => (
            <div key={i} className="sticker-card col-span-4" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', animation: `fadeInUp 0.5s ease-out ${0.2 + i * 0.1}s both` }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: feature.color, border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-hard-small)' }}>
                <feature.icon size={28} color="var(--fg)" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{feature.title}</h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '16px', fontWeight: 500, lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '32px 48px', textAlign: 'center', color: 'var(--gray-400)', fontWeight: 500, fontSize: '14px', position: 'relative', zIndex: 2 }}>
        Built with 💜 for students who dream big.
      </footer>
    </div>
  );
}
