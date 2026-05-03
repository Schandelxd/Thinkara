import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, verifyOtp, resendVerification, signOut } = useAuth();
  
  // Stages: 'details' -> 'verification' -> 'success'
  const [stage, setStage] = useState('details');
  
  // Details state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Global state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength check
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };
  const strength = getPasswordStrength();
  const strengthColor = ['var(--gray-300)', '#EF4444', '#F59E0B', '#10B981', '#059669'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      setStage('verification');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1); // Only allow 1 char
    if (!/^[0-9]*$/.test(value)) return; // Only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => !/^[0-9]$/.test(char))) return;
    
    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    otpRefs.current[lastIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(email, token);
      await signOut(); // Ensure they are signed out to force manual login next
      setStage('success');
      // After success, wait a bit then redirect to login page
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      await resendVerification(email);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER SUCCESS ---
  if (stage === 'success') {
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
          <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Email Verified! 🎉</h1>
          <p style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '8px', lineHeight: 1.6 }}>
            Your account is ready. Taking you to the login page...
          </p>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
             <Loader2 size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER VERIFICATION ---
  if (stage === 'verification') {
    return (
      <div className="auth-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="sticker-card page-enter" style={{ width: '100%', maxWidth: '440px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--card-bg-alt)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Mail size={28} color="var(--primary)" />
          </div>
          
          <h1 className="stagger-1" style={{ fontSize: '28px', marginBottom: '16px', textAlign: 'center' }}>Check your email</h1>
          <p className="stagger-2" style={{ color: 'var(--gray-500)', fontWeight: 500, marginBottom: '24px', textAlign: 'center', fontSize: '15px', lineHeight: 1.5 }}>
            A verification link has been sent to your email.<br/>
            Please verify your account before logging in.
          </p>

          <p className="stagger-3" style={{ color: 'var(--gray-400)', fontWeight: 600, fontSize: '14px', marginBottom: '24px' }}>
            Redirecting to login in 3 seconds...
          </p>
          
          <div className="stagger-4">
             <Loader2 size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER DETAILS (Default) ---
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <label style={{ fontWeight: 700, fontSize: '14px' }}>Password</label>
               {password.length > 0 && (
                 <span style={{ fontSize: '12px', fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
               )}
            </div>
            
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
            
            {/* Password strength meter */}
            {password.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', height: '4px', marginTop: '2px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} style={{ 
                    flex: 1, borderRadius: '2px', transition: 'background-color 0.3s',
                    backgroundColor: strength >= level ? strengthColor : 'var(--gray-200)' 
                  }} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary stagger-4" disabled={isLoading}
            style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '18px', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : <>Continue <ArrowRight size={20} /></>}
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
