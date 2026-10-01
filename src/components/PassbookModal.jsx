import React from 'react';
import { X, Receipt, Printer, Landmark, Lock, CheckCircle2, User, Phone, ShieldCheck, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';

export default function PassbookModal({ 
  account, 
  loan, 
  collections = [], 
  payments = [], 
  onClose 
}) {
  const activeAcc = account || loan;
  if (!activeAcc) return null;

  // Find payments allocated to this account
  const accPayments = payments.filter(p => p.accountId === activeAcc.id) || [];
  const totalPaid = accPayments.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalPrincipalPaid = accPayments.reduce((acc, c) => acc + (c.allocatedPrincipal || 0), 0);
  const totalInterestPaid = accPayments.reduce((acc, c) => acc + (c.allocatedInterest || 0), 0);

  const financedAmount = activeAcc.financedAmount || activeAcc.principalAmount || 0;
  const remainingPrincipal = Math.max(0, financedAmount - totalPrincipalPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF'
            }}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Borrower Passbook & Repayment Ledger
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Account No: <strong style={{ color: '#4F46E5' }}>{activeAcc.id}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              <Printer size={14} /> Print Statement
            </button>
            <button onClick={onClose} className="btn-icon">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Borrower & Loan Details Card */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.2rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Borrower Customer</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{activeAcc.customerName}</h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Phone: {activeAcc.customerPhone || 'On Record'}
            </span>
            {activeAcc.customerAadhaar && (
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                Aadhaar: {activeAcc.customerAadhaar}
              </div>
            )}
            {activeAcc.customerPan && (
              <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 600 }}>
                PAN: {activeAcc.customerPan}
              </div>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Principal Disbursed</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(financedAmount)}</h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Disbursed: {activeAcc.startDate || 'Recent'}
            </span>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              Scheme: {activeAcc.productName}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Collections Received</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4F46E5' }}>{formatCurrency(totalPaid)}</h4>
            <div style={{ fontSize: '0.72rem', color: '#059669' }}>
              Principal Repaid: {formatCurrency(totalPrincipalPaid)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#D97706' }}>
              Interest Earned: {formatCurrency(totalInterestPaid)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding Balance</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: remainingPrincipal > 0 ? '#DC2626' : '#059669' }}>
              {formatCurrency(remainingPrincipal)}
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Status: <span className={`badge-status ${activeAcc.status.toLowerCase()}`}>{activeAcc.status}</span>
            </span>
          </div>
        </div>

        {/* Repayment Installment Schedule */}
        {activeAcc.emiSchedule && activeAcc.emiSchedule.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Landmark size={16} color="var(--accent-indigo)" /> Repayment & EMI Schedule
            </h4>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.65rem 0.8rem' }}>#</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Due Date</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>EMI Amount</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Principal</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Interest</th>
                    <th style={{ padding: '0.65rem 0.8rem' }}>Remaining</th>
                    <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAcc.emiSchedule.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600 }}>{s.installmentNo}</td>
                      <td style={{ padding: '0.65rem 0.8rem', color: '#1E293B' }}>{s.dueDate}</td>
                      <td style={{ padding: '0.65rem 0.8rem', fontWeight: 700, color: '#0F172A' }}>{formatCurrency(s.emiAmount)}</td>
                      <td style={{ padding: '0.65rem 0.8rem', color: '#059669' }}>{formatCurrency(s.principalComponent)}</td>
                      <td style={{ padding: '0.65rem 0.8rem', color: '#D97706' }}>{formatCurrency(s.interestComponent)}</td>
                      <td style={{ padding: '0.65rem 0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(s.remainingBalance)}</td>
                      <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>
                        <span className={`badge-status ${s.status}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Receipts History */}
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Receipt size={16} color="#059669" /> Logged Payment Receipts ({accPayments.length} transactions)
        </h4>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.65rem 0.8rem' }}>Receipt #</th>
                <th style={{ padding: '0.65rem 0.8rem' }}>Date</th>
                <th style={{ padding: '0.65rem 0.8rem' }}>Mode</th>
                <th style={{ padding: '0.65rem 0.8rem' }}>Principal</th>
                <th style={{ padding: '0.65rem 0.8rem' }}>Interest</th>
                <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {accPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.8rem 1rem', color: 'var(--text-dim)' }}>
                    No payment receipts logged yet for this account.
                  </td>
                </tr>
              ) : (
                accPayments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.65rem 0.8rem', fontWeight: 700, color: '#D97706' }}>{p.receiptNo}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--text-muted)' }}>{new Date(p.timestamp).toLocaleDateString()}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--text-dim)' }}>{p.paymentMode}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#059669' }}>{formatCurrency(p.allocatedPrincipal)}</td>
                    <td style={{ padding: '0.65rem 0.8rem', color: '#D97706' }}>{formatCurrency(p.allocatedInterest)}</td>
                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Total Realized Collections: <strong style={{ color: '#059669' }}>{formatCurrency(totalPaid)}</strong>
          </span>

          <button onClick={onClose} className="btn-secondary">
            Close Passbook
          </button>
        </div>

      </div>
    </div>
  );
}
