import { useState, useRef, useEffect } from 'react';
import { MessageSquareText, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatWithAI } from '../services/aiService';

export default function AIAssistantOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', content: "Hi! I'm Thinkara, your AI study buddy. Ask me anything about your uploaded materials!" }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { settings, materials } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

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
      // Gather all material text for context
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

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="sticker-card"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <MessageSquareText size={32} color="var(--fg)" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="sticker-card"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '400px',
            height: '600px',
            maxHeight: '80vh',
            backgroundColor: 'var(--card-bg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--fg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} />
              <h3 style={{ fontWeight: 800, fontSize: '18px', margin: 0 }}>Thinkara AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                {msg.role === 'model' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--tertiary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyItems: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} />
                  </div>
                )}
                
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: msg.role === 'user' ? 'var(--quaternary)' : 'white',
                  border: '2px solid var(--fg)',
                  boxShadow: 'var(--shadow-hard-small)',
                  color: 'var(--fg)',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  fontWeight: 500,
                  borderBottomRightRadius: msg.role === 'user' ? '0' : '16px',
                  borderBottomLeftRadius: msg.role === 'model' ? '0' : '16px',
                }}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} color="white" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--tertiary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={16} />
                  </div>
                  <div style={{ padding: '8px 16px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '2px solid var(--border-color)' }}>
                    <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--card-bg)', display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-base" 
              placeholder="Ask a question..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '12px' }}
            />
            <button 
              className="btn-primary" 
              style={{ padding: '0 16px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}
              onClick={handleSend}
              disabled={isTyping}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
