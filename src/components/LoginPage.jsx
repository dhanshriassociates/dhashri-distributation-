import React, { useState } from 'react';
import { 
  Landmark, 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Shield, 
  Sparkles,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage({ 
  appUsers = [], 
  onLoginSuccess 
}) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = passcode.trim();

    setTimeout(() => {
      // Find matching user from database
      const foundUser = appUsers.find(u => 
        u.email?.toLowerCase() === cleanEmail || 
        u.name?.toLowerCase() === cleanEmail ||
        u.id?.toLowerCase() === cleanEmail
      );

      if (!foundUser) {
        setIsLoading(false);
        setErrorMessage('User account not found. Please check your email or use 1-Click Fast Login below.');
        return;
      }

      // Check passcode
      if (foundUser.passcode && foundUser.passcode !== cleanPin) {
        setIsLoading(false);
        setErrorMessage('Incorrect Passcode PIN. (Default Admin PIN: 1234)');
        return;
      }

      // Check account status
      if (foundUser.status === 'Suspended') {
        setIsLoading(false);
        setErrorMessage('This user account has been SUSPENDED by the Admin. Access denied.');
        return;
      }

      setIsLoading(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      onLoginSuccess(foundUser);
    }, 350);
  };

  // Quick 1-Click Fast Login
  const handleQuickLogin = (targetUser) => {
    setEmail(targetUser.email);
    setPasscode(targetUser.passcode || '1234');
    setErrorMessage('');
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    onLoginSuccess(targetUser);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at top, #1E1B4B 0%, #0F172A 70%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Decorative Ambient Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '20%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5, 150, 105, 0.2) 0%, rgba(5, 150, 105, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '2.4rem 2.2rem',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4F46E5, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
            color: '#FFFFFF'
          }}>
            <Landmark size={32} />
          </div>

          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            margin: 0
          }}>
            DHANSHRI <span style={{ color: 'var(--accent-indigo)' }}>ASSOCIATES</span>
          </h1>
          <p style={{
            fontSize: '0.8rem',
            color: '#64748B',
            fontWeight: 600,
            marginTop: '0.35rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Finance Management System • Secure Portal
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#B91C1C',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Email / Username Field */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '0.4rem'
            }}>
              Email Address / System Login ID
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8'
              }} />
              <input
                type="text"
                required
                placeholder="e.g. admin@dhanshri.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem 0.75rem 2.4rem',
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Passcode / PIN Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155'
              }}>
                Security Passcode PIN
              </label>
              <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>
                Default: 1234
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8'
              }} />
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                placeholder="Enter 4-digit PIN"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
              boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
              cursor: isLoading ? 'wait' : 'pointer'
            }}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.6rem 0 1.2rem 0',
          gap: '0.8rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instant 1-Click Fast Logins
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Fast 1-Click Test Logins Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {appUsers.slice(0, 4).map(u => {
            const isAdmin = u.role === 'Admin';
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  border: isAdmin ? '1.5px solid #C7D2FE' : '1px solid #E2E8F0',
                  background: isAdmin ? '#EEF2FF' : '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Log in instantly as ${u.name}`}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isAdmin ? '#312E81' : '#1E293B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {isAdmin ? '👑' : '👔'} {u.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.68rem', color: isAdmin ? '#4338CA' : '#64748B', marginTop: '0.15rem' }}>
                  {u.role.split(' ')[0]} • ({u.allowedModules?.length || 0} modules)
                </div>
              </button>
            );
          })}
        </div>

        {/* Security & Access Info Footer */}
        <div style={{
          borderTop: '1px solid #F1F5F9',
          paddingTop: '1rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#64748B',
          lineHeight: '1.4'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.2rem', color: '#059669', fontWeight: 700 }}>
            <ShieldCheck size={14} /> 256-Bit Cloud Security • Supabase PostgreSQL
          </div>
          <span>Admin gets 100% root access to all modules and can assign access to staff in User Management.</span>
        </div>

      </div>

    </div>
  );
}
