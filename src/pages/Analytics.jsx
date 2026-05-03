import { TrendingUp, Clock, Target, Award, FileText, BookOpen, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Analytics() {
  const { materials, flashcards, quizzes, quizScores } = useStore();

  const totalCards = flashcards.reduce((acc, deck) => acc + deck.cards.length, 0);
  const totalQuestions = quizzes.reduce((acc, q) => acc + q.questions.length, 0);
  const avgScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / quizScores.length)
    : 0;
  const bestScore = quizScores.length > 0
    ? Math.round(Math.max(...quizScores.map(s => (s.score / s.total) * 100)))
    : 0;

  // Group scores by date for a simple chart
  const last7Scores = quizScores.slice(-7);
  const maxBarScore = last7Scores.length > 0 ? Math.max(...last7Scores.map(s => (s.score / s.total) * 100)) : 100;

  // Subject breakdown from material titles
  const subjectMap = {};
  materials.forEach(m => {
    const name = m.title.split('.')[0].substring(0, 20);
    subjectMap[name] = (subjectMap[name] || 0) + (m.wordCount || 1000);
  });
  const totalWords = Object.values(subjectMap).reduce((a, b) => a + b, 0) || 1;
  const subjects = Object.entries(subjectMap).map(([name, words]) => ({
    name,
    val: Math.round((words / totalWords) * 100),
    color: ['var(--primary)', 'var(--secondary)', 'var(--quaternary)', 'var(--tertiary)'][Object.keys(subjectMap).indexOf(name) % 4]
  }));

  return (
    <div style={{ paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Learning Analytics</h1>
          <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500 }}>Track your progress and identify areas for improvement.</p>
        </div>
      </div>

      <div className="layout-grid" style={{ marginBottom: '48px' }}>
        <div className="sticker-card col-span-3" style={{ padding: '24px', backgroundColor: 'var(--primary)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FileText size={24} />
            <span style={{ fontWeight: 600, fontSize: '18px' }}>Materials</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>{materials.length}</p>
          <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>
            {materials.reduce((acc, m) => acc + (m.wordCount || 0), 0).toLocaleString()} words processed
          </div>
        </div>

        <div className="sticker-card col-span-3" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--gray-600)' }}>
            <Target size={24} />
            <span style={{ fontWeight: 600, fontSize: '18px', color: 'var(--fg)' }}>Avg Quiz Score</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '8px', color: 'var(--fg)' }}>{avgScore}<span style={{ fontSize: '18px' }}>%</span></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: bestScore >= 80 ? 'var(--quaternary)' : 'var(--gray-400)' }}>
            {quizScores.length > 0 && <><TrendingUp size={16} /> Best: {bestScore}%</>}
            {quizScores.length === 0 && 'No quizzes taken yet'}
          </div>
        </div>

        <div className="sticker-card col-span-3" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--gray-600)' }}>
            <BookOpen size={24} />
            <span style={{ fontWeight: 600, fontSize: '18px', color: 'var(--fg)' }}>Flashcards</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '8px', color: 'var(--fg)' }}>{totalCards}</p>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-400)' }}>
            {flashcards.length} decks generated
          </div>
        </div>

        <div className="sticker-card col-span-3" style={{ padding: '24px', backgroundColor: 'var(--secondary)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Award size={24} />
            <span style={{ fontWeight: 600, fontSize: '18px' }}>Quizzes Taken</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>{quizScores.length}</p>
          <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>
            {totalQuestions} questions available
          </div>
        </div>
      </div>

      <div className="layout-grid">
        <div className="sticker-card col-span-8" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>
            <BarChart3 size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Quiz Performance
          </h2>
          {last7Scores.length === 0 ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--gray-300)', borderRadius: '12px', color: 'var(--gray-400)' }}>
              <div style={{ textAlign: 'center' }}>
                <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>Take quizzes to see your performance chart</p>
              </div>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-evenly', padding: '24px', border: '2px solid var(--gray-200)', borderRadius: '12px', backgroundColor: 'var(--gray-50)' }}>
              {last7Scores.map((score, i) => {
                const pct = Math.round((score.score / score.total) * 100);
                const barH = (pct / maxBarScore) * 85;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: pct >= 80 ? 'var(--quaternary)' : pct >= 50 ? 'var(--tertiary)' : '#EF4444' }}>{pct}%</span>
                    <div style={{ 
                      width: '40px', height: `${barH}%`, minHeight: '20px',
                      backgroundColor: pct >= 80 ? 'var(--quaternary)' : pct >= 50 ? 'var(--tertiary)' : '#EF4444',
                      borderRadius: '6px 6px 0 0', border: '2px solid var(--fg)',
                      transition: 'height 0.5s ease'
                    }} />
                    <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 }}>
                      {new Date(score.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticker-card col-span-4" style={{ padding: '32px', backgroundColor: 'var(--tertiary)' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Material Breakdown</h2>
          {subjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-600)' }}>
              <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <p style={{ fontWeight: 600 }}>Upload materials to see breakdown</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {subjects.slice(0, 5).map((sub, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</span>
                    <span>{sub.val}%</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg)', borderRadius: '999px', border: '2px solid var(--fg)', overflow: 'hidden' }}>
                    <div style={{ width: `${sub.val}%`, height: '100%', backgroundColor: sub.color, borderRight: '2px solid var(--fg)', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent quiz scores table */}
        {quizScores.length > 0 && (
          <div className="sticker-card col-span-12" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Quiz History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 700, color: 'var(--gray-500)', fontSize: '14px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 700, color: 'var(--gray-500)', fontSize: '14px' }}>Material</th>
                    <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700, color: 'var(--gray-500)', fontSize: '14px' }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700, color: 'var(--gray-500)', fontSize: '14px' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {[...quizScores].reverse().map((score) => {
                    const pct = Math.round((score.score / score.total) * 100);
                    return (
                      <tr key={score.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '16px 0', fontWeight: 500 }}>{new Date(score.date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 0', fontWeight: 600 }}>{score.materialTitle}</td>
                        <td style={{ padding: '16px 0', textAlign: 'center', fontWeight: 700 }}>{score.score}/{score.total}</td>
                        <td style={{ padding: '16px 0', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                            backgroundColor: pct >= 80 ? '#DCFCE7' : pct >= 50 ? '#FEF3C7' : '#FEE2E2',
                            color: pct >= 80 ? '#15803D' : pct >= 50 ? '#92400E' : '#B91C1C',
                          }}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
