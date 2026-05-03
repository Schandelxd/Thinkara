import { useState } from 'react';
import { Layers, RotateCw, X, Check, BrainCircuit, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { useNavigate } from 'react-router-dom';
import { generateFlashcards } from '../services/aiService.js';
import { useSound } from '../hooks/useSound.js';

const DIFFICULTIES = [
  { key: 'easy', label: '🎒 Easy', desc: 'School level' },
  { key: 'moderate', label: '🎓 University', desc: 'Semester exams' },
  { key: 'hard', label: '🔥 Hard', desc: 'Competitive' },
  { key: 'exam', label: '📝 Exam Mode', desc: 'Indian University' },
];

export default function Flashcards() {
  const navigate = useNavigate();
  const { flashcards, materials, settings, addFlashcards } = useStore();
  const { playSound } = useSound();

  // Selection state
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const [difficulty, setDifficulty] = useState('moderate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState(null);

  // Review state
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewStarted, setReviewStarted] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  const existingCards = flashcards.flatMap(deck => deck.cards);
  const activeCards = generatedCards || (reviewStarted ? 
    (selectedDeck !== null ? (selectedDeck === -1 ? existingCards : flashcards[selectedDeck]?.cards || []) : [])
    : []);

  const toggleMaterial = (id) => {
    setSelectedMaterialIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedMaterialIds.length === 0) return;
    setIsGenerating(true);
    try {
      const combinedText = selectedMaterialIds
        .map(id => materials.find(m => m.id === id)?.content || '')
        .join('\n\n--- NEXT DOCUMENT ---\n\n');
      const cards = await generateFlashcards(combinedText, settings.openaiApiKey, difficulty);
      playSound('success');
      const materialCount = selectedMaterialIds.length;
      addFlashcards(Date.now().toString(), cards, `${materialCount} document(s)`);
      setGeneratedCards(cards);
      setReviewStarted(true);
      setCurrentCardIndex(0);
      setKnownCount(0);
      setReviewCount(0);
      setIsFlipped(false);
    } catch (err) {
      alert('Failed to generate flashcards: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExisting = (deckIdx) => {
    setSelectedDeck(deckIdx);
    setReviewStarted(true);
    setCurrentCardIndex(0);
    setKnownCount(0);
    setReviewCount(0);
    setIsFlipped(false);
    setGeneratedCards(null);
  };

  // Selection / main screen
  if (!reviewStarted) {
    return (
      <div className="page-enter" style={{ paddingBottom: '48px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
          <Sparkles size={32} style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle', color: 'var(--primary)' }} />
          Flashcards
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '40px' }}>
          Generate custom flashcards from your materials or review existing decks.
        </p>

        {/* Material Selection */}
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Generate New Flashcards</h2>
        {materials.length === 0 ? (
          <div className="sticker-card" style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--gray-50)', marginBottom: '32px' }}>
            <BrainCircuit size={40} color="var(--gray-400)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No materials uploaded yet</h3>
            <p style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '16px' }}>Upload a document to generate flashcards.</p>
            <button className="btn-primary" onClick={() => navigate('/app/materials')}>Upload Materials</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setSelectedMaterialIds(materials.map(m => m.id))} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Select All</button>
              <button onClick={() => setSelectedMaterialIds([])} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Clear</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {materials.map((m) => {
                const isSelected = selectedMaterialIds.includes(m.id);
                return (
                  <button key={m.id} className="sticker-card" onClick={() => toggleMaterial(m.id)}
                    style={{ padding: '20px', textAlign: 'left', width: '100%', backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'white', borderColor: isSelected ? 'var(--primary)' : 'var(--fg)', boxShadow: isSelected ? '4px 4px 0px var(--primary)' : 'var(--shadow-hard)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--gray-300)'}`, backgroundColor: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSelected && <CheckCircle2 size={14} color="white" />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>{m.type} • {m.wordCount?.toLocaleString()} words</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Difficulty */}
            <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>Difficulty Level</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              {DIFFICULTIES.map(d => (
                <button key={d.key} className={`difficulty-pill ${d.key} ${difficulty === d.key ? 'active' : ''}`} onClick={() => setDifficulty(d.key)}>
                  {d.label}
                </button>
              ))}
            </div>

            <button className="btn-primary" disabled={selectedMaterialIds.length === 0 || isGenerating} onClick={handleGenerate}
              style={{ padding: '16px 32px', opacity: selectedMaterialIds.length === 0 ? 0.5 : 1 }}>
              {isGenerating ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles size={20} /> Generate Flashcards ({selectedMaterialIds.length} docs)</>}
            </button>
          </>
        )}

        {/* Existing Decks */}
        {flashcards.length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '2px solid var(--gray-200)', margin: '40px 0' }} />
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Existing Decks</h2>

            {flashcards.length > 1 && (
              <button className="sticker-card" onClick={() => handleStartExisting(-1)}
                style={{ width: '100%', padding: '20px', textAlign: 'left', marginBottom: '16px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>All Cards Combined</h3>
                  <p style={{ fontSize: '14px', fontWeight: 500, opacity: 0.9 }}>{existingCards.length} cards total</p>
                </div>
                <Layers size={24} />
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {flashcards.map((deck, i) => (
                <button key={deck.id} className="sticker-card" onClick={() => handleStartExisting(i)}
                  style={{ padding: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Deck {i + 1}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500 }}>{deck.cards.length} cards • {new Date(deck.dateGenerated).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight size={20} color="var(--gray-400)" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Review complete
  if (currentCardIndex >= activeCards.length) {
    return (
      <div className="page-enter" style={{ paddingBottom: '48px', maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '64px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '3px solid var(--fg)', boxShadow: 'var(--shadow-hard)', animation: 'popIn 0.5s ease-out' }}>
          <Check size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>🎉 Review Complete!</h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '8px' }}>
          <strong style={{ color: 'var(--quaternary)' }}>{knownCount}</strong> known &middot; <strong style={{ color: '#EF4444' }}>{reviewCount}</strong> need review
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          <button className="btn-secondary" onClick={() => { setCurrentCardIndex(0); setKnownCount(0); setReviewCount(0); setIsFlipped(false); }}>
            <RotateCw size={18} /> Start Over
          </button>
          <button className="btn-primary" onClick={() => { setReviewStarted(false); setGeneratedCards(null); }}>
            New Flashcards
          </button>
        </div>
      </div>
    );
  }

  const currentCard = activeCards[currentCardIndex];

  const handleKnown = () => { setKnownCount(prev => prev + 1); setIsFlipped(false); setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150); };
  const handleReview = () => { setReviewCount(prev => prev + 1); setIsFlipped(false); setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150); };

  return (
    <div className="page-enter" style={{ paddingBottom: '48px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <button onClick={() => { setReviewStarted(false); setGeneratedCards(null); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
            <ChevronLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Flashcard Review</h1>
          <p style={{ fontSize: '16px', color: 'var(--gray-500)', fontWeight: 500 }}>Card {currentCardIndex + 1} of {activeCards.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--quaternary)' }}>✓ {knownCount}</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>✗ {reviewCount}</span>
        </div>
      </div>

      <div style={{ height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '999px', overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ height: '100%', width: `${(currentCardIndex / activeCards.length) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '999px', transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ perspective: '1000px', height: '380px', marginBottom: '48px' }}>
        <div className={!isFlipped ? "sticker-card" : "sticker-card-no-hover"}
          style={{ width: '100%', height: '100%', position: 'relative', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', cursor: 'pointer' }}
          onClick={() => {
            setIsFlipped(!isFlipped);
            playSound('flip');
          }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 'auto' }}>Question</p>
            <h2 style={{ fontSize: '26px', marginBottom: 'auto', lineHeight: 1.4 }}>{currentCard.front}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-400)', fontWeight: 500, fontSize: '14px' }}><RotateCw size={16} /> Tap to flip</div>
          </div>
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', textAlign: 'center', background: 'linear-gradient(135deg, #FAF5FF, #FDF4FF)', transform: 'rotateY(180deg)' }}>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 'auto' }}>Answer</p>
            <h2 style={{ fontSize: '22px', marginBottom: 'auto', lineHeight: 1.5, color: 'var(--primary)' }}>{currentCard.back}</h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
        <button onClick={handleReview} className="sticker-card" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', borderColor: '#EF4444', transition: 'transform 0.2s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <X size={40} color="#EF4444" strokeWidth={3} />
        </button>
        <button onClick={handleKnown} className="sticker-card" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCFCE7', borderColor: '#22C55E', transition: 'transform 0.2s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <Check size={40} color="#22C55E" strokeWidth={3} />
        </button>
      </div>
      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--gray-500)', fontWeight: 600, fontSize: '14px' }}>
        <span style={{ color: '#EF4444' }}>Review Again</span> or <span style={{ color: '#22C55E' }}>Known</span>
      </p>
    </div>
  );
}
