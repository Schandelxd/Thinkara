import { useState, useRef } from 'react';
import { User, Bell, Shield, Key, Palette, Camera, Sun, Moon, Sparkles, Zap, Check, Save, Eye, EyeOff, Trash2, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const THEMES = [
  { key: 'light', label: 'Light', icon: Sun, preview: 'linear-gradient(135deg, #FFFDF5, #FFF8E7)', desc: 'Clean & bright' },
  { key: 'dark', label: 'Dark', icon: Moon, preview: 'linear-gradient(135deg, #0F172A, #1E293B)', desc: 'Easy on the eyes' },
  { key: 'neon', label: 'Neon', icon: Zap, preview: 'linear-gradient(135deg, #0A0A1A, #1A0A2E)', desc: 'Vibrant & electric' },
  { key: 'midnight', label: 'Midnight', icon: Sparkles, preview: 'linear-gradient(135deg, #0C1222, #162032)', desc: 'Deep & focused' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, setApiKey } = useStore();
  const { user, updatePassword, deleteAccount } = useAuth();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const fileInputRef = useRef(null);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateSettings({ avatar: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    try {
      await updatePassword(newPassword);
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL WARNING: This will permanently delete your account, API key, and all study materials. This action CANNOT be undone. Are you absolutely sure?')) {
      try {
        await deleteAccount();
        navigate('/');
      } catch (err) {
        alert('Failed to delete account. Please try again later.');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your local study data? Your account will remain active.')) {
        const userId = user?.id;
        if (userId) {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Don't remove settings, just data
            if (key && key.startsWith(`thinkara_${userId}_`) && !key.includes('settings')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          window.location.reload();
        }
    }
  }

  const initials = settings.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const sections = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'api', label: 'API & Integration', icon: Key },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'danger', label: 'Danger Zone', icon: Shield },
  ];

  return (
    <div className="page-enter" style={{ paddingBottom: '48px', maxWidth: '1000px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>⚙️ Settings</h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', fontWeight: 500 }}>Customize Thinkara to match your style.</p>
      </header>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Sidebar Nav */}
        <div style={{ flex: '0 0 200px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'sticky', top: '120px' }}>
            {sections.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px',
                  fontWeight: 600, fontSize: '14px', textAlign: 'left', transition: 'all 0.2s',
                  backgroundColor: activeSection === s.key ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: activeSection === s.key ? 'var(--primary)' : 'var(--gray-600)',
                  border: activeSection === s.key ? '2px solid var(--primary)' : '2px solid transparent',
                }}>
                <s.icon size={18} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <section className="sticker-card" style={{ padding: '32px', animation: 'fadeInUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Profile Details</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                  {settings.avatar ? (
                    <img src={settings.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--fg)', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: '3px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                      {initials}
                    </div>
                  )}
                  <button onClick={() => fileInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-hard-small)' }}>
                    <Camera size={14} color="white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{settings.fullName}</h3>
                  <p style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{settings.email}</p>
                  {settings.avatar && (
                    <button onClick={() => updateSettings({ avatar: '' })} style={{ color: 'var(--gray-400)', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Remove photo</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '14px' }}>Full Name</label>
                  <input type="text" className="input-base" value={settings.fullName} onChange={(e) => updateSettings({ fullName: e.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', color: 'var(--gray-400)' }}>Email Address (Verified)</label>
                  <input type="email" className="input-base" value={settings.email} readOnly disabled style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-500)', cursor: 'not-allowed', opacity: 0.8 }} />
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: '24px' }} onClick={handleSave}>
                {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
              </button>
            </section>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <section className="sticker-card" style={{ padding: '32px', animation: 'fadeInUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Theme</h2>
              <p style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '24px' }}>Choose a look that works for you.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {THEMES.map((theme) => {
                  const isActive = settings.theme === theme.key;
                  return (
                    <button 
                      key={theme.key}
                      onClick={() => updateSettings({ theme: theme.key })}
                      style={{ 
                        padding: '20px', borderRadius: '14px', textAlign: 'left',
                        border: isActive ? '3px solid var(--primary)' : '2px solid var(--gray-200)',
                        backgroundColor: 'var(--card-bg, white)',
                        boxShadow: isActive ? '4px 4px 0 var(--primary)' : 'none',
                        transition: 'all 0.2s ease', cursor: 'pointer', position: 'relative',
                      }}
                      onMouseOver={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--gray-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {isActive && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="white" />
                        </div>
                      )}
                      <div style={{ width: '100%', height: '48px', borderRadius: '8px', background: theme.preview, border: '2px solid var(--fg)', marginBottom: '12px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <theme.icon size={18} />
                        <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{theme.label}</h3>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>{theme.desc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <section className="sticker-card" style={{ padding: '32px', animation: 'fadeInUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Notifications</h2>
              
              {[
                { key: 'notifications', label: 'Email Notifications', desc: 'Receive daily study reminders.' },
                { key: 'studyReminders', label: 'Study Reminders', desc: 'Get push reminders before scheduled sessions.' },
                { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Receive a weekly summary of your analytics.' },
                { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds on notifications, quizzes and flashcards.' },
              ].map((pref, i) => (
                <div key={pref.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{pref.label}</h3>
                      <p style={{ color: 'var(--gray-500)', fontWeight: 500, fontSize: '14px' }}>{pref.desc}</p>
                    </div>
                    <button onClick={() => updateSettings({ [pref.key]: !settings[pref.key] })}
                      style={{ 
                        width: '52px', height: '28px', borderRadius: '999px', 
                        backgroundColor: settings[pref.key] ? 'var(--primary)' : 'var(--gray-300)',
                        border: '2px solid var(--fg)', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                      }}>
                      <div style={{ 
                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', border: '2px solid var(--fg)',
                        position: 'absolute', top: '2px', transition: 'left 0.2s ease',
                        left: settings[pref.key] ? '26px' : '2px',
                      }} />
                    </button>
                  </div>
                  {i < 3 && <div style={{ height: '2px', backgroundColor: 'var(--gray-100)' }} />}
                </div>
              ))}
            </section>
          )}

          {/* API Section */}
          {activeSection === 'api' && (
            <section className="sticker-card" style={{ padding: '32px', animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--fg)' }}>
                  <Key size={20} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '24px' }}>OpenAI API Key</h2>
                  <p style={{ color: 'var(--gray-500)', fontWeight: 500, fontSize: '14px' }}>Required for AI-powered flashcards, quizzes, and tutor.</p>
                </div>
              </div>
              
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input type={showApiKey ? 'text' : 'password'} className="input-base" placeholder="sk-proj-..." 
                  value={settings.openaiApiKey} onChange={(e) => setApiKey(e.target.value)}
                  style={{ borderColor: 'var(--primary)', paddingRight: '48px' }} />
                <button onClick={() => setShowApiKey(!showApiKey)} 
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <p style={{ fontSize: '13px', color: 'var(--quaternary)', fontWeight: 600 }}>
                   🔒 Encrypted and stored securely in your browser. Not accessible by other users.
                 </p>
                 <button onClick={() => setApiKey('')} style={{ color: '#EF4444', fontSize: '13px', fontWeight: 600 }}>
                   Remove Key
                 </button>
              </div>
            </section>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <section className="sticker-card" style={{ padding: '32px', animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--card-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--fg)' }}>
                  <Lock size={20} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '24px' }}>Change Password</h2>
              </div>

              {passwordError && (
                <div style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#FEE2E2', border: '2px solid #EF4444', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#D1FAE5', border: '2px solid #10B981', color: '#059669', fontSize: '14px', fontWeight: 600 }}>
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '14px' }}>New Password</label>
                  <input type="password" placeholder="Min 6 characters" className="input-base" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: 'max-content' }}>
                   Update Password
                </button>
              </form>
            </section>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <section className="sticker-card" style={{ padding: '32px', border: '2px solid #EF4444', animation: 'fadeInUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--fg)' }}>
                  <Shield size={20} color="#EF4444" />
                </div>
                <h2 style={{ fontSize: '24px', color: '#EF4444' }}>Danger Zone</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '2px solid var(--gray-200)' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Clear Local Data</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500 }}>Remove all materials, flashcards, quizzes, and scores from this device.</p>
                  </div>
                  <button className="btn-secondary" style={{ color: '#EF4444', borderColor: '#EF4444', padding: '8px 16px', fontSize: '14px' }}
                    onClick={handleClearData}>
                    <Trash2 size={16} /> Clear Data
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '2px solid #FEE2E2', backgroundColor: '#FEF2F2' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: '#EF4444' }}>Delete Account</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: 500 }}>Permanently delete your account and all data. This cannot be undone.</p>
                  </div>
                  <button className="btn-secondary" onClick={handleDeleteAccount} style={{ backgroundColor: '#FEE2E2', color: '#EF4444', borderColor: '#EF4444', padding: '8px 16px', fontSize: '14px' }}>
                    Delete Account
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
