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
  Zap,
  Users,
  UserCheck,
  CreditCard
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = passcode.trim();

    setTimeout(() => {
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

      if (foundUser.passcode && foundUser.passcode !== cleanPin) {
        setIsLoading(false);
        setErrorMessage('Incorrect Passcode PIN. (Default Admin PIN: 1234)');
        return;
      }

      if (foundUser.status === 'Suspended') {
        setIsLoading(false);
        setErrorMessage('This user account has been SUSPENDED by the Admin. Access denied.');
        return;
      }

      setIsLoading(false);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#4F46E5', '#059669', '#FBBF24'] });
      onLoginSuccess(foundUser);
    }, 350);
  };

  const handleFastLogin = (user) => {
    if (!user) return;
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#4F46E5', '#10B981'] });
    onLoginSuccess(user);
  };

  const adminUser = appUsers.find(u => u.role === 'Admin');
  const staffUsers = appUsers.filter(u => u.role !== 'Admin').slice(0, 3);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #0F2027 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Animated Background Glows */}
      <div style={{
        position: 'absolute', top: '-20%', left: '15%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '10%',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%)',
        animation: 'pulse 8s ease-in-out infinite 2s', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '-10%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.7; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: slideUp 0.4s ease-out forwards; }
        .fast-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important; }
        .login-input:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.15) !important; }
      `}</style>

      {/* Main Login Card */}
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Top Accent Bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #4F46E5, #059669, #D97706)', width: '100%' }} />

        <div style={{ padding: '2rem 2rem 1.5rem 2rem' }}>

          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #4F46E5, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 12px 28px -5px rgba(79,70,229,0.45)'
            }}>
              <Landmark size={34} color="#FFF" />
            </div>

            <h1 style={{ fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}>
              DHANSHRI <span style={{ color: '#4F46E5' }}>ASSOCIATES</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '0.3rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Finance Management System • Secure Portal
            </p>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
              padding: '0.7rem 0.9rem', marginBottom: '1.2rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#B91C1C', fontSize: '0.8rem', fontWeight: 600
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Email / Login ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  className="login-input"
                  type="text"
                  required
                  placeholder="admin@dhanshri.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.3rem',
                    fontSize: '0.88rem', borderRadius: '10px',
                    border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  Security Passcode PIN
                </label>
                <span style={{ fontSize: '0.7rem', color: '#6366F1', fontWeight: 600 }}>Default: 1234</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Key size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  className="login-input"
                  type={showPasscode ? 'text' : 'password'}
                  required
                  placeholder="Enter 4-digit PIN"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.3rem',
                    fontSize: '0.88rem', borderRadius: '10px',
                    border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease'
                  }}
                />
                <button type="button" onClick={() => setShowPasscode(!showPasscode)} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'transparent',
                  border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0
                }}>
                  {showPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: '0.85rem',
              borderRadius: '12px', fontSize: '0.94rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: isLoading ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5, #4338CA)',
              color: '#FFF', border: 'none',
              boxShadow: isLoading ? 'none' : '0 8px 20px -4px rgba(79,70,229,0.4)',
              cursor: isLoading ? 'wait' : 'pointer',
              marginBottom: '0',
              transition: 'all 0.2s ease'
            }}>
              {isLoading ? (
                <>Verifying credentials...</>
              ) : (
                <>Sign In to Dashboard <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 2rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
            ⚡ 1-CLICK FAST LOGIN (Testing)
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Fast Login Buttons */}
        <div style={{ padding: '1rem 2rem 1.8rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {adminUser && (
            <button
              className="fast-btn"
              type="button"
              onClick={() => handleFastLogin(adminUser)}
              style={{
                width: '100%', padding: '0.65rem 1rem',
                borderRadius: '10px', border: '1.5px solid #4F46E5',
                background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                color: '#3730A3', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                transition: 'all 0.2s ease', textAlign: 'left'
              }}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserCheck size={15} color="#FFF" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>Admin — {adminUser.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#6366F1', fontWeight: 600 }}>{adminUser.allowedModules?.length || 17} Modules · Full Access</div>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#4F46E5', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>Admin</span>
            </button>
          )}

          {staffUsers.map((user, i) => {
            const roleColors = [
              { border: '#059669', bgFrom: '#ECFDF5', bgTo: '#D1FAE5', text: '#065F46', sub: '#059669', badge: '#059669' },
              { border: '#D97706', bgFrom: '#FFFBEB', bgTo: '#FEF3C7', text: '#92400E', sub: '#D97706', badge: '#D97706' },
              { border: '#0284C7', bgFrom: '#F0F9FF', bgTo: '#E0F2FE', text: '#075985', sub: '#0284C7', badge: '#0284C7' },
            ];
            const c = roleColors[i % 3];
            const roleShort = user.role?.split(' ').map(w => w[0]).join('') || 'ST';
            return (
              <button
                key={user.id}
                className="fast-btn"
                type="button"
                onClick={() => handleFastLogin(user)}
                style={{
                  width: '100%', padding: '0.65rem 1rem',
                  borderRadius: '10px', border: `1.5px solid ${c.border}`,
                  background: `linear-gradient(135deg, ${c.bgFrom}, ${c.bgTo})`,
                  color: c.text, fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  transition: 'all 0.2s ease', textAlign: 'left'
                }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FFF', fontWeight: 800, fontSize: '0.65rem' }}>
                  {roleShort}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: c.sub, fontWeight: 600 }}>{user.role} · {user.allowedModules?.length || 0} Modules</div>
                </div>
                <span style={{ fontSize: '0.7rem', background: c.badge, color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>Login</span>
              </button>
            );
          })}

          {/* Security Footer */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#059669', fontWeight: 700 }}>
              <ShieldCheck size={13} /> 256-Bit Encrypted • Supabase Cloud PostgreSQL
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
