import { BookOpen, Target, Clock, Zap, BrainCircuit, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { materials, flashcards, quizzes, quizScores, settings } = useStore();
  const navigate = useNavigate();

  const totalCards = flashcards.reduce((acc, deck) => acc + deck.cards.length, 0);
  const totalQuizzes = quizzes.length;
  const avgScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / quizScores.length)
    : 0;
  const totalWords = materials.reduce((acc, m) => acc + (m.wordCount || 0), 0);

  const stats = [
    { title: 'Documents', value: materials.length, icon: FileText, color: 'var(--tertiary)', subtitle: `${totalWords.toLocaleString()} words total` },
    { title: 'Flashcards', value: totalCards, icon: BookOpen, color: 'var(--primary)', subtitle: `${flashcards.length} decks` },
    { title: 'Quizzes Taken', value: quizScores.length, icon: Target, color: 'var(--quaternary)', subtitle: avgScore > 0 ? `${avgScore}% avg score` : 'No scores yet' },
    { title: 'Quiz Questions', value: quizzes.reduce((acc, q) => acc + q.questions.length, 0), icon: BarChart3, color: 'var(--secondary)', subtitle: `${totalQuizzes} quiz sets` },
  ];

  const recentScores = quizScores.slice(-5).reverse();

  return (
    <div style={{ paddingBottom: '48px' }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Welcome back, {settings.fullName.split(' ')[0]}! 👋</h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500 }}>Here's your study overview at a glance.</p>
      </header>

      {/* Stats Grid */}
      <div className="layout-grid" style={{ marginBottom: '48px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="sticker-card" style={{ gridColumn: 'span 3', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: stat.color, border: '2px solid var(--fg)', boxShadow: 'var(--shadow-hard-small)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} color="var(--fg)" />
            </div>
            <div>
              <p style={{ color: 'var(--gray-500)', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{stat.title}</p>
              <p style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 500, marginTop: '4px' }}>{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="layout-grid">
        {/* Recent Materials */}
        <div style={{ gridColumn: 'span 8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px' }}>Recent Materials</h2>
            <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => navigate('/app/materials')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {materials.length === 0 ? (
              <div className="sticker-card" style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--gray-50)' }}>
                <BrainCircuit size={32} color="var(--gray-400)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', color: 'var(--gray-600)' }}>No materials uploaded yet</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '16px' }}>Upload a PDF, DOCX, or PPTX to get started</p>
                <button className="btn-primary" style={{ marginTop: '8px' }} onClick={() => navigate('/app/materials')}>Upload Notes</button>
              </div>
            ) : (
              materials.slice(-5).reverse().map((material) => (
                <div key={material.id} className="sticker-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--gray-100)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>{material.title}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500 }}>
                        {material.type} • {material.wordCount ? `${material.wordCount.toLocaleString()} words` : ''} • {new Date(material.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/app/flashcards')}>Review</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quiz Scores */}
        <div style={{ gridColumn: 'span 4' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Recent Scores</h2>
          {recentScores.length === 0 ? (
            <div className="sticker-card" style={{ padding: '24px', backgroundColor: 'var(--gray-50)', textAlign: 'center' }}>
              <Target size={32} color="var(--gray-400)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--gray-500)', fontWeight: 600 }}>No quiz scores yet</p>
              <p style={{ color: 'var(--gray-400)', fontWeight: 500, fontSize: '14px', marginTop: '4px' }}>Upload materials and take a quiz!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentScores.map((score) => {
                const pct = Math.round((score.score / score.total) * 100);
                return (
                  <div key={score.id} className="sticker-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{score.materialTitle}</span>
                      <span style={{ fontWeight: 800, color: pct >= 80 ? 'var(--quaternary)' : pct >= 50 ? 'var(--tertiary)' : '#EF4444' }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', width: `${pct}%`, 
                        backgroundColor: pct >= 80 ? 'var(--quaternary)' : pct >= 50 ? 'var(--tertiary)' : '#EF4444', 
                        borderRadius: '999px', transition: 'width 0.5s ease' 
                      }} />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '6px' }}>
                      {score.score}/{score.total} correct • {new Date(score.date).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
              <button className="btn-secondary" style={{ padding: '10px', fontSize: '14px' }} onClick={() => navigate('/app/analytics')}>
                View All Analytics <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
