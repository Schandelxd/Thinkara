import { Bell, Search, User } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function TopNav() {
  const { settings, notifications, markNotificationsAsRead } = useStore();
  const initials = settings.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '24px 48px 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
      
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        <input 
          type="text" 
          placeholder="Search materials, flashcards..." 
          className="input-base"
          style={{ paddingLeft: '48px', height: '48px', borderRadius: '48px' }}
        />
      </div>

      <button 
        className="sticker-card" 
        onClick={markNotificationsAsRead}
        style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--card-bg)', position: 'relative' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#EF4444', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, animation: 'popIn 0.3s ease-out' }}>
            {unreadCount}
          </div>
        )}
      </button>

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
