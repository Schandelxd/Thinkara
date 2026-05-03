import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useSound } from '../../hooks/useSound.js';

export default function TopNav() {
  const { settings, notifications, markNotificationsAsRead } = useStore();
  const { playSound } = useSound();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  const initials = settings.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Keep track of unread count to trigger sound when a new one arrives
  const prevUnreadCountRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      // New notification arrived
      playSound('notification');
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, playSound]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const toggleNotifications = () => {
    if (!showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <div style={{ padding: '24px 48px 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 100 }}>
      
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        <input 
          type="text" 
          placeholder="Search materials, flashcards..." 
          className="input-base"
          style={{ paddingLeft: '48px', height: '48px', borderRadius: '48px' }}
        />
      </div>

      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button 
          className="sticker-card" 
          onClick={toggleNotifications}
          style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--card-bg)', position: 'relative', cursor: 'pointer' }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#EF4444', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, animation: 'popIn 0.3s ease-out' }}>
              {unreadCount}
            </div>
          )}
        </button>

        {showNotifications && (
          <div className="sticker-card" style={{ 
            position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '320px', 
            maxHeight: '400px', overflowY: 'auto', backgroundColor: 'var(--card-bg)', 
            borderRadius: '16px', padding: '16px', zIndex: 1000,
            animation: 'fadeInUp 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Notifications</h3>
              <button onClick={() => setShowNotifications(false)} style={{ color: 'var(--gray-400)', cursor: 'pointer' }}>
                 <X size={16} />
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
                <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 500 }}>No notifications yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.slice().reverse().map(n => (
                  <div key={n.id} style={{ 
                    padding: '12px', borderRadius: '10px', 
                    backgroundColor: n.read ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid', borderColor: n.read ? 'var(--gray-200)' : 'var(--primary)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.read ? 'transparent' : 'var(--primary)' }} />
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{n.title}</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: 0, paddingLeft: '16px', lineHeight: 1.4 }}>{n.message}</p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '6px', paddingLeft: '16px' }}>
                      {new Date(n.date).toLocaleDateString()} at {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 4px 16px', borderRadius: '999px', backgroundColor: 'var(--card-bg)', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-hard-small)' }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--fg)' }}>{settings.fullName}</span>
        {settings.avatar ? (
          <img src={settings.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--fg)', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>
            {initials}
          </div>
        )}
      </div>
      
    </div>
  );
}
