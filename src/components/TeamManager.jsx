import React, { useState } from 'react';
import { UserCheck, UserPlus, Phone, Mail, Award, DollarSign, Shield, X } from 'lucide-react';
import { formatINR } from '../utils/financeCalc';

export default function TeamManager({ teamMembers, loans, onAddTeamMember }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Field Recovery Agent');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState(10000);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember = {
      id: `agent-${Date.now()}`,
      name: name.trim(),
      role,
      phone: phone || '+91 98000 00000',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@finlend.in`,
      assignedCustomersCount: 0,
      totalManagedCapital: 0,
      monthlyTarget: parseFloat(monthlyTarget) || 10000,
      monthlyAchieved: 0,
      status: 'Active',
      avatarColor: ['#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 5)]
    };

    onAddTeamMember(newMember);
    setName('');
    setPhone('');
    setEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={22} color="#10B981" /> Team & Field Recovery Staff Management
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Control team members, assign debtor accounts, and monitor monthly collection targets.
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn-emerald">
          <UserPlus size={16} /> Add Team Member
        </button>
      </div>

      {/* Staff Roster Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {teamMembers.map(agent => {
          const agentLoans = loans.filter(l => l.agentId === agent.id);
          const managedCapital = agentLoans.reduce((acc, l) => acc + (l.principalAmount - (l.totalPrincipalRepaid || 0)), 0);
          const activeDebtorsCount = agentLoans.length;

          const pct = agent.monthlyTarget > 0 ? (agent.monthlyAchieved / agent.monthlyTarget) * 100 : 0;

          return (
            <div key={agent.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              <div>
                {/* Agent Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: agent.avatarColor || '#10B981',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 15px rgba(0,0,0,0.4)'
                    }}>
                      {agent.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFF' }}>{agent.name}</h3>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                        {agent.role}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, border: '1px solid #10B981', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                    {agent.status}
                  </span>
                </div>

                {/* Contact Information */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.2rem', padding: '0.6rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={13} color="var(--text-dim)" /> {agent.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={13} color="var(--text-dim)" /> {agent.email}
                  </div>
                </div>

                {/* Performance Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.2rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Managed Debtors</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>{activeDebtorsCount} Accounts</h4>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Managed Capital</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FBBF24' }}>{formatINR(managedCapital)}</h4>
                  </div>
                </div>

                {/* Monthly Collection Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Monthly Collection Target</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>
                      {formatINR(agent.monthlyAchieved)} / {formatINR(agent.monthlyTarget)} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: agent.avatarColor || '#10B981', borderRadius: '4px' }} />
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Add Team Member Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add New Team Field Agent</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Designated Role
                </label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                  <option value="Field Recovery Agent">Field Recovery Agent</option>
                  <option value="Senior Loan Officer">Senior Loan Officer</option>
                  <option value="Collection Manager">Collection Manager</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-emerald">
                  Add Member
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
