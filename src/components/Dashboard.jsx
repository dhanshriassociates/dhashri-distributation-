import React from 'react';
import { 
  Landmark, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  ArrowUpRight, 
  Receipt,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { formatINR, getLoanStatus } from '../utils/financeCalc';

export default function Dashboard({ 
  loans, 
  teamMembers, 
  collections, 
  onSelectLoan, 
  onApproveLoan, 
  onOpenCollection,
  onOpenNewLoan 
}) {
  // Calculations
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const pendingApprovals = loans.filter(l => l.status === 'pending_approval');
  
  const totalDeployedCapital = activeLoans.reduce((acc, l) => acc + (l.principalAmount - (l.totalPrincipalRepaid || 0)), 0);

  // Calculate Monthly Byaj Expected
  const expectedMonthlyByaj = activeLoans.reduce((acc, l) => {
    if (l.byajType === 'Monthly % Byaj') {
      return acc + (l.principalAmount * l.monthlyRatePct) / 100;
    } else if (l.byajType === 'Daily Roj Byaj') {
      return acc + (l.dailyRateRupees * 30);
    }
    return acc;
  }, 0);

  const totalCollectedByajAllTime = loans.reduce((acc, l) => acc + (l.totalByajCollected || 0), 0);

  const overdueLoans = activeLoans.filter(l => {
    const status = getLoanStatus(l.nextDueDate, l.status);
    return status.isOverdue || l.status === 'overdue';
  });

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Pending Loan Approvals Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.2rem 1.5rem',
          marginBottom: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldAlert size={26} color="#F59E0B" />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FBBF24' }}>
                {pendingApprovals.length} Loan(s) Submitted by Team Awaiting Owner Approval
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Field agents have requested disbursement. Review collateral and approve to disburse capital.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {pendingApprovals.map(pLoan => (
              <button
                key={pLoan.id}
                onClick={() => onApproveLoan(pLoan.id)}
                className="btn-gold"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
              >
                Approve {pLoan.customerName} ({formatINR(pLoan.principalAmount)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        
        {/* Metric 1: Total Deployed Capital */}
        <div className="glass-panel" style={{ padding: '1.3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL DEPLOYED CAPITAL</span>
            <Landmark size={20} color="#10B981" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{formatINR(totalDeployedCapital)}</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
            Across {activeLoans.length} active debtor accounts
          </p>
        </div>

        {/* Metric 2: Monthly Byaj Income Expected */}
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPECTED MONTHLY BYAJ</span>
            <TrendingUp size={20} color="#F59E0B" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24' }}>{formatINR(expectedMonthlyByaj)}</h2>
          <p style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <ArrowUpRight size={14} /> Monthly interest yield ~2.1%
          </p>
        </div>

        {/* Metric 3: Total Interest Collected */}
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ALL-TIME BYAJ EARNED</span>
            <CheckCircle2 size={20} color="#3B82F6" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60A5FA' }}>{formatINR(totalCollectedByajAllTime)}</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
            Realized cash collections
          </p>
        </div>

        {/* Metric 4: Overdue Risk Radar */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderColor: overdueLoans.length > 0 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>OVERDUE DEBTORS</span>
            <AlertTriangle size={20} color="#F43F5E" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: overdueLoans.length > 0 ? '#FB7185' : '#10B981' }}>
            {overdueLoans.length} Accounts
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
            {overdueLoans.length > 0 ? 'Requires field agent collection follow-up' : 'Zero default accounts'}
          </p>
        </div>

      </div>

      {/* Main Grid: Overdue Radar + Team Staff Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.8rem' }}>
        
        {/* Overdue & High Priority Accounts Radar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#F43F5E" /> Overdue Debtors & Follow-up Radar
            </h3>
            <button onClick={onOpenCollection} className="btn-emerald" style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}>
              Record Payment
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {overdueLoans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                🎉 All accounts are up-to-date! No overdue payments.
              </div>
            ) : (
              overdueLoans.map(loan => (
                <div
                  key={loan.id}
                  onClick={() => onSelectLoan(loan)}
                  style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFF' }}>{loan.customerName}</h4>
                      <span className="status-badge overdue">Overdue</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Principal: <strong>{formatINR(loan.principalAmount)}</strong> | Agent: {loan.agentName}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FBBF24' }}>
                      Due: {loan.nextDueDate}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#FB7185' }}>
                      Collateral: {loan.collateralType}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Staff Performance Overview */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="#10B981" /> Field Team & Agent Progress
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Monthly Target vs Collected</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {teamMembers.map(agent => {
              const pct = agent.monthlyTarget > 0 ? (agent.monthlyAchieved / agent.monthlyTarget) * 100 : 0;
              return (
                <div key={agent.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: agent.avatarColor || '#10B981', color: '#FFF', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {agent.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{agent.name}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{agent.role}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10B981' }}>
                        {formatINR(agent.monthlyAchieved)} / {formatINR(agent.monthlyTarget)}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{Math.round(pct)}% target</span>
                    </div>
                  </div>

                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: agent.avatarColor || '#10B981', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Collections Stream */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Receipt size={18} color="#F59E0B" /> Recent Cash & Digital Collections Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Receipt No</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Debtor Customer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Collected By</th>
                <th style={{ padding: '0.75rem 1rem' }}>Payment Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Mode</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {collections.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FBBF24' }}>{c.receiptNo}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{c.date}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>{c.customerName}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{c.agentName}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#34D399', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>{c.paymentMode}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#10B981' }}>
                    {formatINR(c.amountPaid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
