import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, MoreVertical, Search, Loader2, CheckCircle2, Sparkles, Scan, BookOpen, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { parseFileText } from '../services/fileParser';
import { generateFlashcards, generateQuiz } from '../services/aiService';

const SCAN_PHASES = [
  { label: 'Scanning document pages...', icon: Scan, duration: 1500 },
  { label: 'Extracting key concepts...', icon: BookOpen, duration: 2000 },
  { label: 'Highlighting important points...', icon: Sparkles, duration: 1800 },
  { label: 'Generating study aids...', icon: Loader2, duration: 2500 },
];

function AIScanAnimation({ currentPhase, fileName }) {
  return (
    <div className="ai-scan-container" style={{ marginBottom: '24px' }}>
      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="sparkle-particle"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.4}s`,
            background: ['var(--primary)', 'var(--secondary)', 'var(--tertiary)', 'var(--quaternary)'][i % 4],
          }}
        />
      ))}

      <div style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 3 }}>
        {/* Left: Fake document being scanned */}
        <div style={{ flex: 1 }}>
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            border: '2px solid var(--gray-200)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FileText size={20} color="var(--primary)" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg)' }}>{fileName}</span>
            </div>
            
            {/* Animated doc lines */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`scan-doc-line ${currentPhase >= 1 && i % 3 === 0 ? 'highlighted' : ''}`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  width: `${60 + Math.random() * 40}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Phase steps */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--fg)' }}>
            <Sparkles size={20} style={{ display: 'inline', marginRight: '8px', color: 'var(--primary)' }} />
            AI is reading your document
          </h3>
          
          {SCAN_PHASES.map((phase, i) => {
            const status = currentPhase > i ? 'done' : currentPhase === i ? 'active' : 'pending';
            return (
              <div
                key={i}
                className={`scan-phase ${status}`}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  opacity: status === 'pending' ? 0.4 : 1,
                }}
              >
                {status === 'done' ? (
                  <CheckCircle2 size={20} color="var(--quaternary)" />
                ) : status === 'active' ? (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <phase.icon size={20} />
                )}
                <span>{phase.label}</span>
              </div>
            );
          })}

          {/* Progress bar */}
          <div style={{
            marginTop: '16px',
            height: '8px',
            backgroundColor: 'var(--gray-200)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${((currentPhase + 1) / SCAN_PHASES.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              borderRadius: '999px',
              transition: 'width 0.5s ease-out',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useSound } from '../hooks/useSound';

export default function Materials() {
  const { materials, addMaterial, addFlashcards, addQuiz, deleteMaterial, settings } = useStore();
  const { playSound } = useSound();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [processingFileName, setProcessingFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        setScanPhase(prev => {
          if (prev < SCAN_PHASES.length - 1) return prev + 1;
          return prev;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const processFile = async (file) => {
    if (!settings.openaiApiKey) {
      setErrorMsg("Please add your OpenAI API Key in Settings first.");
      return;
    }
    
    setErrorMsg("");
    setIsProcessing(true);
    setScanPhase(0);
    setProcessingFileName(file.name);
    
    try {
      const text = await parseFileText(file);
      playSound('pop');
      
      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from this file. It may be empty or image-based.");
      }

      const newMaterial = {
        title: file.name,
        type: file.name.split('.').pop().toUpperCase(),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        content: text,
        wordCount: text.split(/\s+/).length,
      };
      
      const id = Date.now().toString();
      addMaterial({ id, ...newMaterial });

      // Trigger AI Generation in Background
      generateFlashcards(text, settings.openaiApiKey)
        .then(cards => addFlashcards(id, cards, file.name))
        .catch(err => console.error("Auto-flashcard generation failed", err));
        
      generateQuiz(text, settings.openaiApiKey)
        .then(quiz => {
          addQuiz(id, quiz, file.name);
          playSound('success');
        })
        .catch(err => console.error("Auto-quiz generation failed", err));
        
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to process file. Please try a different format.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setScanPhase(0);
        setProcessingFileName('');
      }, 800);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '48px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Study Materials</h1>
          <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500 }}>Upload documents for AI-powered study aids generation.</p>
        </div>
        <button className="btn-primary" style={{ padding: '16px 32px' }} onClick={() => fileInputRef.current?.click()}>
          <UploadCloud size={20} />
          Upload Material
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.txt,.md,.docx,.pptx" 
          onChange={onFileSelect}
        />
      </div>

      {/* AI Scanning Animation */}
      {isProcessing && <AIScanAnimation currentPhase={scanPhase} fileName={processingFileName} />}

      {/* Upload Zone - only show when not processing */}
      {!isProcessing && (
        <div 
          className={isDragging ? "sticker-card flex-center" : "sticker-card flex-center"} 
          style={{ 
            padding: '64px', 
            flexDirection: 'column', 
            backgroundColor: isDragging ? 'var(--primary)' : 'var(--gray-50)', 
            color: isDragging ? 'white' : 'var(--fg)',
            borderStyle: 'dashed', 
            marginBottom: '24px', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--tertiary)', border: '2px solid var(--fg)', boxShadow: 'var(--shadow-hard-small)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <UploadCloud size={32} color="var(--fg)" />
          </div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px', color: isDragging ? 'white' : 'inherit' }}>Drag and drop your files here</h3>
          <p style={{ color: isDragging ? 'rgba(255,255,255,0.8)' : 'var(--gray-500)', fontWeight: 500 }}>
            Support for PDF, Word (.docx), PowerPoint (.pptx), Markdown, and TXT files
          </p>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '16px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '12px', border: '2px solid #EF4444', marginBottom: '24px', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px' }}>Your Documents <span style={{ color: 'var(--gray-400)', fontSize: '16px' }}>({materials.length})</span></h2>
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="input-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', paddingRight: '16px', height: '40px' }}
          />
        </div>
      </div>

      <div className="layout-grid">
        {filteredMaterials.map((file) => (
          <div key={file.id} className="sticker-card col-span-4" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--quaternary)', border: '2px solid var(--fg)', boxShadow: 'var(--shadow-hard-small)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} color="var(--fg)" />
              </div>
              <button 
                onClick={() => deleteMaterial(file.id)}
                style={{ color: 'var(--gray-400)', padding: '4px', borderRadius: '8px', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{file.title}</h3>
            {file.wordCount && (
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '8px' }}>
                {file.wordCount.toLocaleString()} words extracted
              </p>
            )}
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '2px solid var(--gray-100)' }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 600 }}>{file.type}</span>
              <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500 }}>{file.size} • {new Date(file.dateAdded).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {materials.length === 0 && !isProcessing && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--gray-400)' }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '18px', fontWeight: 600 }}>No documents uploaded yet</p>
          <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '8px' }}>Upload a PDF, DOCX, PPTX, or text file to get started</p>
        </div>
      )}
    </div>
  );
}
