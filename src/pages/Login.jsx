import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Mail, Lock, Eye, EyeOff, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSound } from '../hooks/useSound.js';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, resetPasswordRequest, verifyPasswordResetOtp, updatePassword } = useAuth();
  const { playSound } = useSound();
  
  // Stages: 'login' -> 'forgot_email' -> 'forgot_otp' -> 'forgot_new_password'
  const [stage, setStage] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Password Reset State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      playSound('success');
      setLoginSuccess(true);
      setTimeout(() => navigate('/app'), 2500);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
      setIsLoading(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address above first.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await resetPasswordRequest(email);
      setStage('forgot_otp');
    } catch (err) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };
  
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await verifyPasswordResetOtp(email, token);
      setStage('forgot_new_password');
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      setStage('login');
      setPassword(newPassword);
      setError('Password updated successfully. You can now log in.');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- PREMIUM LOADING UI ---
  if (isLoading && !loginSuccess && !error && stage === 'login') {
    const loadingText = "THINKARA".split('');
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="premium-loading-container" style={{ gap: '24px' }}>
          <div className="cool-text-loader">
            {loadingText.map((char, index) => (
              <span key={index}>{char}</span>
            ))}
          </div>
          <div style={{ color: 'var(--gray-500)', fontWeight: 700, animation: 'fadeInUp 0.6s ease-out 0.2s both', fontSize: '16px', letterSpacing: '2px', opacity: 0.8 }}>
            AUTHENTICATING...
          </div>
        </div>
      </div>
    );
  }

  // --- PREMIUM SUCCESS OVERLAY ---
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

  // --- PASSWORD RESET: OTP INPUT ---
  if (stage === 'forgot_otp') {
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="sticker-card page-enter" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--card-bg-alt)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Key size={28} color="var(--primary)" />
          </div>
          <h1 className="stagger-1" style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>Reset Password</h1>
          <p className="stagger-2" style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '32px', textAlign: 'center', fontSize: '15px' }}>
            Enter the 6-digit code sent to<br/><strong style={{ color: 'var(--fg)' }}>{email}</strong>
          </p>

          {error && (
            <div style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#FEE2E2', border: '2px solid #EF4444', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyResetOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="stagger-3" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              {otp.map((digit, index) => (
                <input key={index} ref={(el) => (otpRefs.current[index] = el)} type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} disabled={isLoading}
                  style={{ width: '48px', height: '56px', fontSize: '24px', fontWeight: 800, textAlign: 'center', borderRadius: '12px', border: `2px solid ${digit ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: 'var(--card-bg)', color: 'var(--fg)', outline: 'none' }}
                />
              ))}
            </div>
            <button type="submit" className="btn-primary stagger-4" disabled={isLoading || otp.join('').length !== 6} style={{ width: '100%', padding: '14px', fontSize: '18px' }}>
              {isLoading ? <Loader2 size={20} className="spin" /> : 'Verify Code'}
            </button>
          </form>
          <button onClick={() => setStage('login')} className="stagger-4" style={{ marginTop: '24px', color: 'var(--gray-500)', fontSize: '14px', fontWeight: 600 }}>Cancel</button>
        </div>
      </div>
    );
  }

  // --- PASSWORD RESET: NEW PASSWORD ---
  if (stage === 'forgot_new_password') {
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="sticker-card page-enter" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--card-bg-alt)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Lock size={28} color="var(--primary)" />
          </div>
          <h1 className="stagger-1" style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>New Password</h1>
          <p className="stagger-2" style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '32px', textAlign: 'center', fontSize: '15px' }}>
            Choose a new, strong password.
          </p>

          {error && (
            <div style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#FEE2E2', border: '2px solid #EF4444', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="stagger-3" style={{ position: 'relative' }}>
              <Lock size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" className="input-base" required
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading} style={{ paddingLeft: '42px', paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="btn-primary stagger-4" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '18px' }}>
              {isLoading ? <Loader2 size={20} className="spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DEFAULT LOGIN VIEW ---
  return (
    <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="sticker-card page-enter" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Thinkara" style={{ width: '56px', height: '56px', borderRadius: '16px', marginBottom: '8px', objectFit: 'contain', animation: 'popIn 0.5s ease-out' }} />
        <h1 className="stagger-1" style={{ fontSize: '28px', marginBottom: '4px', textAlign: 'center' }}>Welcome to Thinkara</h1>
        <p className="stagger-2" style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '32px', textAlign: 'center', fontSize: '15px' }}>
          Sign in to access your personalized study space.
        </p>

        {error && (
          <div style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#FEE2E2', border: '2px solid #EF4444', color: '#DC2626', fontSize: '14px', fontWeight: 600, animation: 'fadeInUp 0.2s ease-out' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" placeholder="you@example.com" className="input-base" required
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} style={{ paddingLeft: '42px' }} />
            </div>
          </div>

          <div className="stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 700, fontSize: '14px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-base" required
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} style={{ paddingLeft: '42px', paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" onClick={handleResetRequest} disabled={isLoading} style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>Forgot password?</button>
            </div>
          </div>

          <button type="submit" className="btn-primary stagger-4" disabled={isLoading} style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '18px', opacity: isLoading ? 0.7 : 1 }}>
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
