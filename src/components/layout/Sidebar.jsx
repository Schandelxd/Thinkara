import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers, CheckSquare, Calendar, BarChart2, Trello, Settings, GraduationCap, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { settings } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const initials = settings.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const links = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'AI Tutor', path: '/app/tutor', icon: GraduationCap },
    { name: 'Materials', path: '/app/materials', icon: BookOpen },
    { name: 'Flashcards', path: '/app/flashcards', icon: Layers },
    { name: 'Quiz Mode', path: '/app/quiz', icon: CheckSquare },
    { name: 'Planner', path: '/app/planner', icon: Calendar },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart2 },
    { name: 'Boards', path: '/app/boards', icon: Trello },
  ];

  return (
    <div className="sticker-card-no-hover" style={{ height: 'calc(100vh - 48px)', margin: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
        <img 
          src="/logo.png" 
          alt="Thinkara Logo" 
          style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain' }} 
        />
        <h1 style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.5px', color: 'var(--fg)' }}>Thinkara</h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/app'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              color: isActive ? 'var(--fg)' : 'var(--gray-500)',
              border: isActive ? '2px solid var(--fg)' : '2px solid transparent',
              backgroundColor: isActive ? 'var(--tertiary)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-hard-small)' : 'none',
              transition: 'all 0.2s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <link.icon size={18} style={{ color: isActive ? 'var(--fg)' : 'var(--gray-500)' }} />
                <span>{link.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile + Settings */}
      <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavLink
          to="/app/settings"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px',
            textDecoration: 'none', fontWeight: 600, fontSize: '14px',
            color: isActive ? 'var(--fg)' : 'var(--gray-500)',
            backgroundColor: isActive ? 'var(--gray-100)' : 'transparent',
            transition: 'all 0.2s ease'
          })}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        {/* Mini profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px' }}>
          {settings.avatar ? (
            <img src={settings.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--fg)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px' }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.fullName}</p>
            <p style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px',
            fontWeight: 600, fontSize: '14px', color: '#EF4444', transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
