import { useState } from 'react';
import { ChevronLeft, Flag, BrainCircuit, CheckCircle2, Trophy, RotateCw, ArrowRight, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.js';
import { generateQuiz } from '../services/aiService.js';
import { useSound } from '../hooks/useSound.js';

const DIFFICULTIES = [
  { key: 'easy', label: '🎒 Easy', desc: 'School level (Class 10-12)' },
  { key: 'moderate', label: '🎓 University', desc: 'Semester exam level' },
  { key: 'hard', label: '🔥 Hard', desc: 'Competitive exams (GATE, NET)' },
  { key: 'exam', label: '📝 Exam Mode', desc: 'Indian University exam pattern' },
];

export default function Quiz() {
  const navigate = useNavigate();
  const { quizzes, materials, settings, addQuiz, recordQuizScore } = useStore();
  const { playSound } = useSound();
  
  // Selection state
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const [difficulty, setDifficulty] = useState('moderate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Use existing quizzes if no custom generation
  const existingQuestions = quizzes.flatMap(q => q.questions);
  const activeQuestions = generatedQuestions || (quizStarted ? existingQuestions : []);

  const toggleMaterial = (id) => {
    setSelectedMaterialIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerateQuiz = async () => {
    if (selectedMaterialIds.length === 0) return;
    setIsGenerating(true);
    try {
      const combinedText = selectedMaterialIds
        .map(id => materials.find(m => m.id === id)?.content || '')
        .join('\n\n--- NEXT DOCUMENT ---\n\n');
      
      const questions = await generateQuiz(combinedText, settings.openaiApiKey, difficulty);
      playSound('success');
      const materialCount = selectedMaterialIds.length;
      addQuiz(Date.now().toString(), questions, `${materialCount} document(s)`);
      setGeneratedQuestions(questions);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setCorrectCount(0);
      setIsComplete(false);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } catch (err) {
      alert('Failed to generate quiz: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExisting = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setIsComplete(false);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
  };

  const handleOptionClick = (idx) => {
    if (isAnswerRevealed) return;
    setSelectedOption(idx);
    setIsAnswerRevealed(true);
    
    if (idx === currentQuestion.correctAnswerIndex) {
      playSound('correct');
      setCorrectCount(prev => prev + 1);
    } else {
      playSound('incorrect');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex >= activeQuestions.length - 1) {
      const materialTitle = selectedMaterialIds.length > 0 
        ? materials.filter(m => selectedMaterialIds.includes(m.id)).map(m => m.title).join(', ').substring(0, 50)
        : materials.length > 0 ? materials[materials.length - 1].title : 'General';
      recordQuizScore(correctCount, activeQuestions.length, materialTitle);
      playSound('success');
      setIsComplete(true);
    } else {
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Selection Screen
  if (!quizStarted) {
    return (
      <div className="page-enter" style={{ paddingBottom: '48px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
          <Sparkles size={32} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle', color: 'var(--primary)' }} />
          Quiz Mode
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '40px' }}>
          Choose materials and difficulty to generate a custom quiz.
        </p>

        {/* Material Selection */}
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Select Study Materials</h2>
        {materials.length === 0 ? (
          <div className="sticker-card" style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--gray-50)', marginBottom: '32px' }}>
            <BrainCircuit size={40} color="var(--gray-400)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No materials uploaded yet</h3>
            <p style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '16px' }}>Upload a PDF, DOCX, or PPTX first.</p>
            <button className="btn-primary" onClick={() => navigate('/app/materials')}>Upload Materials</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <button 
                onClick={() => setSelectedMaterialIds(materials.map(m => m.id))}
                className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Select All
              </button>
              <button 
                onClick={() => setSelectedMaterialIds([])}
                className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {materials.map((m) => {
                const isSelected = selectedMaterialIds.includes(m.id);
                return (
                  <button 
                    key={m.id} 
                    className="sticker-card" 
                    onClick={() => toggleMaterial(m.id)}
                    style={{ 
                      padding: '20px', textAlign: 'left', width: '100%',
                      backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'white',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--fg)',
                      boxShadow: isSelected ? '4px 4px 0px var(--primary)' : 'var(--shadow-hard)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '6px', 
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--gray-300)'}`,
                        backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', flexShrink: 0
                      }}>
                        {isSelected && <CheckCircle2 size={14} color="white" />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3 }}>{m.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>{m.type} • {m.wordCount?.toLocaleString()} words</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Difficulty Selection */}
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Difficulty Level</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
          {DIFFICULTIES.map(d => (
            <button 
              key={d.key}
              className={`difficulty-pill ${d.key} ${difficulty === d.key ? 'active' : ''}`}
              onClick={() => setDifficulty(d.key)}
            >
              {d.label}
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, opacity: 0.8 }}>{d.desc}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            disabled={selectedMaterialIds.length === 0 || isGenerating}
            onClick={handleGenerateQuiz}
            style={{ padding: '16px 32px', opacity: selectedMaterialIds.length === 0 ? 0.5 : 1 }}
          >
            {isGenerating ? (
              <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Generating Quiz...</>
            ) : (
              <><Sparkles size={20} /> Generate Custom Quiz ({selectedMaterialIds.length} docs)</>
            )}
          </button>
          {existingQuestions.length > 0 && (
            <button className="btn-secondary" onClick={handleStartExisting} style={{ padding: '16px 32px' }}>
              Use Existing Quiz ({existingQuestions.length} Qs)
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz Complete Screen
  if (isComplete) {
    const pct = Math.round((correctCount / activeQuestions.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const message = pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep studying!';
    
    return (
      <div className="page-enter" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '48px', textAlign: 'center' }}>
        <div className="sticker-card" style={{ padding: '48px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 24px',
            background: pct >= 80 ? 'linear-gradient(135deg, var(--quaternary), #10B981)' : pct >= 50 ? 'linear-gradient(135deg, var(--tertiary), #F59E0B)' : 'linear-gradient(135deg, #F87171, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid var(--fg)', boxShadow: 'var(--shadow-hard)',
            animation: 'popIn 0.5s ease-out'
          }}>
            <Trophy size={48} color="white" />
          </div>
          
          <h1 style={{ fontSize: '48px', marginBottom: '8px', animation: 'fadeInUp 0.4s ease-out 0.2s both' }}>{emoji} {pct}%</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--gray-600)' }}>{message}</h2>
          <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '32px' }}>
            You got <strong>{correctCount}</strong> out of <strong>{activeQuestions.length}</strong> questions correct
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => {
              setQuizStarted(false);
              setGeneratedQuestions(null);
            }}>
              <RotateCw size={18} /> New Quiz
            </button>
            <button className="btn-primary" onClick={() => navigate('/app/analytics')}>
              View Analytics <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz
  const currentQuestion = activeQuestions[currentQuestionIndex];
  if (!currentQuestion) return null;
  const progressPercent = ((currentQuestionIndex) / activeQuestions.length) * 100;

  return (
    <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '48px' }}>
      <button onClick={() => { setQuizStarted(false); setGeneratedQuestions(null); }} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '24px' }}>
        <ChevronLeft size={20} /> Back to Selection
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 700 }}>AI GENERATED QUIZ</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600 }}>Q {currentQuestionIndex + 1}/{activeQuestions.length}</span>
          <div style={{ width: '120px', height: '12px', backgroundColor: 'var(--gray-200)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '999px', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>

      <div className="sticker-card" style={{ padding: '48px', marginBottom: '32px', animation: 'fadeInScale 0.3s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: '2px solid var(--fg)' }}>
            Score: {correctCount}/{currentQuestionIndex + (isAnswerRevealed ? 1 : 0)}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--gray-100)', border: '2px solid var(--fg)' }}>
            {DIFFICULTIES.find(d => d.key === difficulty)?.label || '🎓 University'}
          </span>
        </div>
        <h1 style={{ fontSize: '26px', lineHeight: 1.4 }}>{currentQuestion.question}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {currentQuestion.options.map((optionText, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOption === idx;
          const isCorrect = currentQuestion.correctAnswerIndex === idx;
          let bgColor = 'white', borderColor = 'var(--fg)';
          if (isAnswerRevealed) {
            if (isCorrect) { bgColor = '#DCFCE7'; borderColor = '#22C55E'; }
            else if (isSelected) { bgColor = '#FEE2E2'; borderColor = '#EF4444'; }
          } else if (isSelected) { bgColor = 'var(--gray-100)'; }

          return (
            <button key={idx} className="sticker-card" onClick={() => handleOptionClick(idx)} disabled={isAnswerRevealed}
              style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', width: '100%', backgroundColor: bgColor, borderColor, cursor: isAnswerRevealed ? 'default' : 'pointer', animation: `slideInLeft 0.3s ease-out ${idx * 0.05}s both` }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', backgroundColor: isAnswerRevealed && isCorrect ? '#22C55E' : 'var(--tertiary)', flexShrink: 0 }}>
                {isAnswerRevealed && isCorrect ? <CheckCircle2 size={24} color="white" /> : letter}
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>{optionText}</span>
            </button>
          );
        })}
      </div>

      {isAnswerRevealed && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', animation: 'fadeInUp 0.2s ease-out' }}>
          <button className="btn-primary" onClick={handleNext}>
            {currentQuestionIndex >= activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight size={18} />
          </button>
        </div>
      )}

      <div className="sticker-card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--secondary), #E879A6)', color: 'white', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '2px solid var(--border-color)', color: 'var(--fg)', boxShadow: 'var(--shadow-hard-small)' }}>
          <Flag size={24} color="var(--secondary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>HINT</h3>
          <p style={{ fontWeight: 500, opacity: 0.95 }}>{currentQuestion.hint || "Review your uploaded study material!"}</p>
        </div>
      </div>
    </div>
  );
}
