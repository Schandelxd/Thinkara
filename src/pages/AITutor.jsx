import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Sparkles, User, Loader2, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatWithAI } from '../services/aiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

export default function AITutor() {
  const [messages, setMessages] = useState([{ 
    role: 'model', 
    content: "# Welcome to your AI Deep Study Session\nI'm Thinkara, your personal AI Tutor. We can dive deep into any topic from your uploaded materials. What would you like to explore today?" 
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { settings, materials } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    if (!settings.openaiApiKey) {
      alert("Please configure your OpenAI API Key in the Settings page to chat.");
      return;
    }

    const newUserMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const contextText = materials.map(m => `--- ${m.title} ---\n${m.content}`).join('\n\n');
      const response = await chatWithAI(messages, newUserMsg.content, contextText, settings.openaiApiKey);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I ran into an error connecting to OpenAI. Please check your API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExportPDF = async () => {
    if (!chatContainerRef.current) return;
    setIsExporting(true);
    
    try {
      // Temporarily expand to capture everything
      const originalHeight = chatContainerRef.current.style.height;
      const originalOverflow = chatContainerRef.current.style.overflow;
      chatContainerRef.current.style.height = 'auto';
      chatContainerRef.current.style.overflow = 'visible';
      
      const canvas = await html2canvas(chatContainerRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Restore styles
      chatContainerRef.current.style.height = originalHeight;
      chatContainerRef.current.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Handle multi-page PDF rendering
      while (position < pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
          position += pageHeight;
          if (position < pdfHeight) {
              pdf.addPage();
          }
      }

      pdf.save('Thinkara-Study-Session.pdf');
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("There was an issue exporting the chat to PDF.");
    } finally {
      setIsExporting(true); // Small delay to prevent double clicks easily
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: '0 0 8px 0', letterSpacing: '-1px' }}>AI Tutor Deep Dive</h2>
          <p style={{ margin: 0, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Info size={16} /> Fully immersive chat environment tailored with your syllabus data.
          </p>
        </div>
        
        <button 
            className="btn-secondary" 
            onClick={handleExportPDF}
            disabled={isExporting || messages.length <= 1}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isExporting ? <Loader2 size={20} className="lucide-spin" /> : <Download size={20} />}
          Export Session as PDF
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="sticker-card-no-hover" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'var(--card-bg)',
          overflow: 'hidden'
      }}>
        
        {/* Messages Scroll Area */}
        <div 
            ref={chatContainerRef}
            style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '32px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '32px', 
                backgroundColor: 'var(--bg)' 
            }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              {msg.role === 'model' && (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--tertiary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-hard-small)' }}>
                  <Sparkles size={24} />
                </div>
              )}
              
              <div style={{
                padding: '24px',
                borderRadius: '24px',
                backgroundColor: msg.role === 'user' ? 'var(--quaternary)' : 'var(--card-bg)',
                border: '2px solid var(--fg)',
                boxShadow: 'var(--shadow-hard-small)',
                color: 'var(--fg)',
                fontSize: '16px',
                lineHeight: 1.6,
                borderBottomRightRadius: msg.role === 'user' ? '0' : '24px',
                borderBottomLeftRadius: msg.role === 'model' ? '0' : '24px',
                width: '100%'
              }}>
                {/* React Markdown renders rich formatting, code blocks, lists */}
                {msg.role === 'user' ? (
                    <div style={{ fontWeight: 500 }}>{msg.content}</div>
                ) : (
                    <div className="markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-hard-small)' }}>
                  <User size={24} color="white" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--tertiary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-hard-small)' }}>
                  <Sparkles size={24} />
                </div>
                <div className="sticker-card-no-hover" style={{ padding: '16px 24px', borderRadius: '24px', borderBottomLeftRadius: 0 }}>
                  <Loader2 size={24} className="lucide-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                </div>
              </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Custom scrollbar and markdown styles defined inline or in global CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          .markdown-body h1, .markdown-body h2, .markdown-body h3 {
              margin-top: 0;
              margin-bottom: 12px;
          }
          .markdown-body p:last-child {
              margin-bottom: 0;
          }
          .markdown-body pre {
              background-color: var(--gray-100);
              padding: 16px;
              border-radius: 8px;
              border: 2px solid var(--gray-300);
              overflow-x: auto;
          }
          .markdown-body code {
              background-color: var(--gray-100);
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
          }
        `}} />

        {/* Input Bar */}
        <div style={{ padding: '24px', borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--card-bg)', display: 'flex', gap: '16px' }}>
          <input 
            type="text" 
            className="input-base" 
            placeholder="Ask Thinkara for an in-depth explanation..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '16px', fontSize: '16px' }}
          />
          <button 
            className="btn-primary" 
            style={{ padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', gap: '8px', fontSize: '16px' }}
            onClick={handleSend}
            disabled={isTyping}
          >
            <Send size={24} />
            Study
          </button>
        </div>
      </div>
    </div>
  );
}
