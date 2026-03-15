import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="sticker-card" style={{ maxWidth: '440px', width: '100%', padding: '48px', textAlign: 'center', position: 'relative', zIndex: 2, animation: 'fadeInScale 0.4s ease-out' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, var(--quaternary), #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid var(--border-color)', boxShadow: 'var(--shadow-hard)',
            animation: 'popIn 0.5s ease-out',
          }}>
            <CheckCircle2 size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Account Created! 🎉</h1>
          <p style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '8px', lineHeight: 1.6 }}>
            Check your email for a confirmation link, then sign in.
          </p>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', marginTop: '24px', display: 'inline-flex' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      <div className="sticker-card page-enter" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        
        <img 
          src={`${process.env.PUBLIC_URL}/logo.png`} 
          alt="Thinkara"
          style={{ width: '56px', height: '56px', borderRadius: '16px', marginBottom: '8px', objectFit: 'contain', animation: 'popIn 0.5s ease-out' }}
        />
        <h1 className="stagger-1" style={{ fontSize: '28px', marginBottom: '4px', textAlign: 'center' }}>Create Your Account</h1>
        <p className="stagger-2" style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '32px', textAlign: 'center', fontSize: '15px' }}>
          Join thousands of students studying smarter.
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

        <form onSubmit={handleSignup} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Your full name" className="input-base" required
                value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading}
                style={{ paddingLeft: '42px' }} />
            </div>
          </div>

          <div className="stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" className="input-base" required
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
            {isLoading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : <><Sparkles size={20} /> Create Account</>}
          </button>
        </form>

        <div className="stagger-4" style={{ marginTop: '32px', width: '100%', textAlign: 'center', color: 'var(--gray-500)', fontWeight: 500, fontSize: '15px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </div>
        
        <Link to="/" style={{ marginTop: '20px', color: 'var(--gray-400)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
