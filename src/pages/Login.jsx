import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../hooks/useSound.js';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { playSound } = useSound();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      playSound('success');
      setLoginSuccess(true);
      setTimeout(() => navigate('/app'), 1500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  // Loading state with Premium animation
  if (isLoading && !loginSuccess && !error) {
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="premium-loading-container">
          <div className="premium-logo-wrapper">
            <img 
              src="/logo.png" 
              alt="Thinkara Logo"
              className="premium-logo"
            />
          </div>
          <div className="premium-loading-text">
            <span>Authenticating</span>
            <span className="premium-loading-dots"></span>
          </div>
          <p style={{ color: 'var(--gray-500)', marginTop: '8px', fontWeight: 500, animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            Preparing your study session...
          </p>
        </div>
      </div>
    );
  }

  // Premium Success Overlay
  if (loginSuccess) {
    return (
      <div className="success-overlay">
        <div className="success-icon-wrapper">
          <Sparkles size={40} color="white" />
        </div>
        <h1 className="success-text">Welcome back!</h1>
        <p className="success-subtext">Taking you to your dashboard</p>
      </div>
    );
  }

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      <div className="sticker-card page-enter" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        
        {/* Logo */}
        <img 
          src={`${process.env.PUBLIC_URL}/logo.png`} 
          alt="Thinkara"
          style={{ width: '56px', height: '56px', borderRadius: '16px', marginBottom: '8px', objectFit: 'contain', animation: 'popIn 0.5s ease-out' }}
        />
        <h1 className="stagger-1" style={{ fontSize: '28px', marginBottom: '4px', textAlign: 'center' }}>Welcome to Thinkara</h1>
        <p className="stagger-2" style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '32px', textAlign: 'center', fontSize: '15px' }}>
          Sign in to access your personalized study space.
        </p>

        {error && (
          <div style={{ 
            width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            backgroundColor: '#FEE2E2', border: '2px solid #EF4444', color: '#DC2626',
            fontSize: '14px', fontWeight: 600, animation: 'fadeInUp 0.2s ease-out'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" placeholder="you@example.com" className="input-base" required
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                style={{ paddingLeft: '42px' }} />
            </div>
          </div>

          <div className="stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-base" required
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                style={{ paddingLeft: '42px', paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary stagger-4" disabled={isLoading}
            style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '18px', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : <><Sparkles size={20} /> Sign In</>}
          </button>
        </form>

        <div className="stagger-4" style={{ marginTop: '32px', width: '100%', textAlign: 'center', color: 'var(--gray-500)', fontWeight: 500, fontSize: '15px' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
        </div>
        
        <Link to="/" style={{ marginTop: '20px', color: 'var(--gray-400)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
