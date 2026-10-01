import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  User, 
  Search, 
  Landmark, 
  LayoutDashboard, 
  UserPlus, 
  FileCheck, 
  CreditCard, 
  Receipt, 
  AlertTriangle, 
  Sliders, 
  FileText,
  Bell
} from 'lucide-react';

export default function Header({
  activeRole,
  setActiveRole,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  auditCount,
  onOpenDisburseLoan,
  isDbConnected = true,
  isDbLoading = false
}) {
  const roles = [
    { id: 'admin', label: '👑 Admin (Owner)', color: '#4F46E5' },
    { id: 'employee', label: '👔 Employee / Staff', color: '#059669' }
  ];

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.8rem 1.8rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.2rem', flexWrap: 'wrap' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--accent-indigo-glow)'
          }}>
            <Landmark size={22} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>
                FINANCE <span style={{ color: 'var(--accent-indigo)' }}>PLATFORM</span>
              </h1>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                background: isDbConnected ? '#ECFDF5' : '#FEF3C7',
                border: `1px solid ${isDbConnected ? '#A7F3D0' : '#FDE68A'}`,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: isDbConnected ? '#047857' : '#B45309'
              }} title="Supabase PostgreSQL Database Status">
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isDbConnected ? '#10B981' : '#F59E0B'
                }} />
                {isDbLoading ? 'Syncing...' : isDbConnected ? 'Supabase Live DB' : 'Supabase Active'}
              </div>
            </div>
            <p style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontWeight: 600 }}>ENTERPRISE FMS • CLOUD POSTGRESQL</p>
          </div>
        </div>

        {/* Admin & Employee Role Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: '#F1F5F9',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '0.2rem'
        }}>
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '18px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: activeRole === r.id ? 700 : 500,
                color: activeRole === r.id ? '#FFF' : 'var(--text-muted)',
                background: activeRole === r.id ? r.color : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeRole === r.id ? `0 2px 8px ${r.color}44` : 'none'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Navigation Tabs (Admin & Employee) */}
        <nav style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'customer360', label: 'Borrowers 360', icon: Users },
            { id: 'onboarding', label: '+ Onboard', icon: UserPlus },
            { id: 'applications', label: 'Applications', icon: FileCheck },
              { id: 'payments', label: 'Payments', icon: Receipt },
              { id: 'overdue', label: 'Overdue Aging', icon: AlertTriangle },
              { id: 'products', label: 'Products', icon: CreditCard },
              { id: 'rbac', label: 'RBAC Matrix', icon: Sliders },
              { id: 'audit', label: 'Audit Logs', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFF' : 'var(--text-muted)',
                    background: isActive ? 'var(--accent-indigo)' : 'transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={13} /> {tab.label}
                </button>
              );
            })}
          </nav>

        {/* Quick Loan Button & Global Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {onOpenDisburseLoan && (
            <button
              onClick={onOpenDisburseLoan}
              className="btn-emerald"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', fontWeight: 700 }}
              title="Disburse Real Money Loan with Aadhaar & PAN intake"
            >
              + Give Loan
            </button>
          )}

          <div style={{ position: 'relative', width: '170px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Global Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', paddingTop: '0.38rem', paddingBottom: '0.38rem', fontSize: '0.8rem' }}
            />
          </div>

          <div 
            onClick={() => setActiveView('audit')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F8FAFC', padding: '0.4rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            title="View Security & Audit Trail"
          >
            <Bell size={15} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {auditCount} Audits
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
