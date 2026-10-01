import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Receipt, 
  Search, 
  Filter, 
  ShieldCheck, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign,
  Briefcase
} from 'lucide-react';
import { formatINR, getLoanStatus } from '../utils/financeCalc';

export default function LoansManager({ 
  loans, 
  teamMembers, 
  onSelectLoan, 
  onOpenCollectionForLoan, 
  onOpenNewLoan,
  searchQuery,
  setSearchQuery,
  activeRole,
  selectedAgentId
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredLoans = loans.filter(l => {
    // If agent role is selected, filter loans assigned to selected agent (or all if unspecified)
    if (activeRole === 'agent' && selectedAgentId && l.agentId !== selectedAgentId) {
      return false;
    }

    const matchesStatus = filterStatus === 'ALL' || l.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      l.id.toLowerCase().includes(q) ||
      l.customerName.toLowerCase().includes(q) ||
      (l.agentName && l.agentName.toLowerCase().includes(q)) ||
      (l.collateralType && l.collateralType.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Top Bar: Title, Filters & New Loan Button */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={22} color="#F59E0B" /> Loans & Interest Ledger Register
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Track active money lent, monthly interest rates, collaterals, and team agent assignments.
          </p>
        </div>

        {/* Filter Status Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {[
            { id: 'ALL', label: 'All Loans' },
            { id: 'active', label: 'Active' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'pending_approval', label: 'Pending Approval' },
            { id: 'closed', label: 'Closed' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: filterStatus === f.id ? 700 : 500,
                color: filterStatus === f.id ? '#FFF' : 'var(--text-muted)',
                background: filterStatus === f.id ? 'var(--accent-gold)' : 'transparent',
                color: filterStatus === f.id ? '#040912' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={onOpenNewLoan} className="btn-gold">
          <PlusCircle size={16} /> Disburse New Loan
        </button>

      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.25)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Loan ID & Debtor</th>
              <th style={{ padding: '0.85rem 1rem' }}>Principal Lent</th>
              <th style={{ padding: '0.85rem 1rem' }}>Interest Rate</th>
              <th style={{ padding: '0.85rem 1rem' }}>Monthly Interest Yield</th>
              <th style={{ padding: '0.85rem 1rem' }}>Total Interest Collected</th>
              <th style={{ padding: '0.85rem 1rem' }}>Assigned Agent</th>
              <th style={{ padding: '0.85rem 1rem' }}>Collateral Asset</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status / Next Due</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                  No loan records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredLoans.map(loan => {
                const isOverdue = loan.status === 'overdue';
                const monthlyYield = loan.byajType === 'Monthly % Byaj' 
                  ? (loan.principalAmount * loan.monthlyRatePct) / 100 
                  : (loan.dailyRateRupees * 30);

                return (
                  <tr 
                    key={loan.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isOverdue ? 'rgba(244, 63, 94, 0.04)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* ID & Customer */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{loan.customerName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{loan.id} • Start: {loan.startDate}</div>
                    </td>

                    {/* Principal */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#FFF' }}>
                      {formatINR(loan.principalAmount)}
                      {loan.totalPrincipalRepaid > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#10B981' }}>
                          Repaid: {formatINR(loan.totalPrincipalRepaid)}
                        </div>
                      )}
                    </td>

                    {/* Rate */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FBBF24' }}>
                        {loan.byajType === 'Monthly % Byaj' ? `${loan.monthlyRatePct}% / mo` : `₹${loan.dailyRateRupees} / day`}
                      </span>
                    </td>

                    {/* Monthly Yield */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#10B981' }}>
                      {formatINR(monthlyYield)}
                    </td>

                    {/* Total Byaj Collected */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#38BDF8' }}>
                      {formatINR(loan.totalByajCollected || 0)}
                    </td>

                    {/* Agent */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Briefcase size={14} color="#A78BFA" />
                        <span>{loan.agentName || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Collateral */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.76rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        🔒 {loan.collateralType}
                      </span>
                    </td>

                    {/* Status & Next Due */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`status-badge ${loan.status}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                      <div style={{ fontSize: '0.74rem', color: isOverdue ? '#FB7185' : 'var(--text-dim)', marginTop: '0.25rem' }}>
                        Due: {loan.nextDueDate}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        
                        <button
                          onClick={() => onOpenCollectionForLoan(loan)}
                          className="btn-emerald"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          title="Collect Cash / Payment"
                        >
                          <Receipt size={13} /> Collect
                        </button>

                        <button
                          onClick={() => onSelectLoan(loan)}
                          className="btn-icon"
                          title="View Ledger Passbook"
                        >
                          <Eye size={14} />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
