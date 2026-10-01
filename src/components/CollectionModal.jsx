import React, { useState } from 'react';
import { X, Receipt, CheckCircle, DollarSign, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { formatINR } from '../utils/financeCalc';
import confetti from 'canvas-confetti';

export default function CollectionModal({ loans, initialLoan, teamMembers, onClose, onSaveCollection }) {
  const [selectedLoanId, setSelectedLoanId] = useState(initialLoan?.id || loans[0]?.id || '');
  const activeLoan = loans.find(l => l.id === selectedLoanId) || loans[0];

  // Auto-calculate suggested monthly interest amount based on rate
  const suggestedInterest = activeLoan?.byajType === 'Monthly % Byaj' 
    ? (activeLoan.principalAmount * activeLoan.monthlyRatePct) / 100 
    : (activeLoan?.dailyRateRupees || 200) * 30;

  const [amountPaid, setAmountPaid] = useState(suggestedInterest);
  const [collectionType, setCollectionType] = useState('Byaj Only'); // Byaj Only, Principal Repayment, Principal + Byaj, Late Penalty
  const [paymentMode, setPaymentMode] = useState('UPI / GPay');
  const [transactionRef, setTransactionRef] = useState(`UPI/${Math.floor(100000 + Math.random() * 900000)}`);
  const [agentName, setAgentName] = useState(activeLoan?.agentName || teamMembers[0]?.name || 'Ramesh Verma');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amountPaid || amountPaid <= 0) return;

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const collectionRecord = {
      id: `COL-${Date.now()}`,
      loanId: activeLoan.id,
      customerName: activeLoan.customerName,
      agentName,
      date: new Date().toISOString().split('T')[0],
      amountPaid: parseFloat(amountPaid),
      type: collectionType,
      paymentMode,
      transactionRef: transactionRef || 'CASH-REC',
      receiptNo
    };

    onSaveCollection(collectionRecord);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt size={22} color="#10B981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Record Cash / Byaj Collection</h3>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Select Active Loan Account */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Select Debtor Loan Account
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.92rem', fontWeight: 600 }}
            >
              {loans.map(l => (
                <option key={l.id} value={l.id}>
                  {l.customerName} ({l.id}) — Principal: {formatINR(l.principalAmount)}
                </option>
              ))}
            </select>
          </div>

          {/* Account Summary Banner */}
          {activeLoan && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.2rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Byaj Rate:</span>{' '}
                <strong style={{ color: '#FBBF24' }}>
                  {activeLoan.byajType === 'Monthly % Byaj' ? `${activeLoan.monthlyRatePct}% / mo` : `₹${activeLoan.dailyRateRupees}/day`}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Suggested Monthly Byaj:</span>{' '}
                <strong style={{ color: '#10B981' }}>{formatINR(suggestedInterest)}</strong>
              </div>
            </div>
          )}

          {/* Payment Type & Amount Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            
            {/* Amount Paid */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Amount Collected (₹)
              </label>
              <input
                type="number"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10B981' }}
              />
            </div>

            {/* Collection Type */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Payment Breakdown Type
              </label>
              <select
                value={collectionType}
                onChange={(e) => setCollectionType(e.target.value)}
                className="form-select"
              >
                <option value="Byaj Only">Byaj Only (Interest)</option>
                <option value="Principal Repayment">Principal Part-Payment</option>
                <option value="Principal + Byaj">Full Repayment (Principal + Interest)</option>
                <option value="Late Penalty">Late Payment Fine</option>
              </select>
            </div>

          </div>

          {/* Payment Mode & Collected By Agent */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            
            {/* Payment Mode */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Payment Channel
              </label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="form-select">
                <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                <option value="Cash">Hand Cash</option>
                <option value="Bank NEFT">Bank NEFT / RTGS</option>
                <option value="Cheque">Cheque Deposit</option>
              </select>
            </div>

            {/* Collected By Agent */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Collected By Team Agent
              </label>
              <select value={agentName} onChange={(e) => setAgentName(e.target.value)} className="form-select">
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

          </div>

          {/* Transaction Ref */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Transaction Ref / Receipt Note
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UTR / Cash receipt number"
              className="form-input"
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-emerald">
              <CheckCircle size={16} /> Issue Receipt & Log Collection
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
