import React, { useState } from 'react';
import { Receipt, Plus, Printer, CheckCircle, Search, DollarSign, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';
import confetti from 'canvas-confetti';

export default function PaymentsLedgerView({ payments = [], financeAccounts = [], onSavePayment, onOpenDisburseLoan }) {
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(financeAccounts[0]?.id || '');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Always resolve valid active account
  const activeAcc = financeAccounts.find(a => a.id === selectedAccountId) || financeAccounts[0];
  const dueEmi = activeAcc?.emiSchedule?.find(s => s.status !== 'paid') || activeAcc?.emiSchedule?.[0];

  const [amountPaid, setAmountPaid] = useState(dueEmi?.emiAmount || 5000);

  const handleOpenCollect = (accId = null) => {
    if (financeAccounts.length === 0) {
      alert('No active loan accounts exist yet. Please disburse a loan first.');
      return;
    }
    const targetId = accId || selectedAccountId || financeAccounts[0]?.id;
    const acc = financeAccounts.find(a => a.id === targetId) || financeAccounts[0];
    if (acc) {
      setSelectedAccountId(acc.id);
      const due = acc?.emiSchedule?.find(s => s.status !== 'paid') || acc?.emiSchedule?.[0];
      setAmountPaid(due?.emiAmount || 5000);
    }
    setReferenceNo(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsCollectModalOpen(true);
  };

  const handleAccountChange = (accId) => {
    setSelectedAccountId(accId);
    const acc = financeAccounts.find(a => a.id === accId);
    const due = acc?.emiSchedule?.find(s => s.status !== 'paid') || acc?.emiSchedule?.[0];
    if (due) {
      setAmountPaid(due.emiAmount);
    }
  };

  const handleCollect = (e) => {
    e.preventDefault();
    if (!activeAcc) {
      alert('Please select an active loan account.');
      return;
    }
    if (!amountPaid || amountPaid <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      id: `PAY-${Date.now()}`,
      accountId: activeAcc.id,
      customerName: activeAcc.customerName,
      amount: parseFloat(amountPaid),
      paymentMode,
      referenceNo: referenceNo || `REF-${Date.now().toString().slice(-6)}`,
      installmentNo: dueEmi?.installmentNo || 1,
      allocatedPrincipal: dueEmi ? Math.round(dueEmi.principalComponent) : Math.round(amountPaid * 0.8),
      allocatedInterest: dueEmi ? Math.round(dueEmi.interestComponent) : Math.round(amountPaid * 0.2),
      receivedBy: 'System Cashier',
      timestamp: new Date().toISOString(),
      receiptNo
    };

    onSavePayment(newPayment);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setIsCollectModalOpen(false);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Bar */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={22} color="#059669" /> Append-Only Payment Ledger & Receipts
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Immutable cash and UPI receipt ledger with real-time principal/interest allocation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search receipt / borrower..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', width: '220px', fontSize: '0.82rem' }}
            />
          </div>
          <button onClick={() => handleOpenCollect()} className="btn-emerald">
            <Plus size={16} /> + Collect Payment / EMI
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Receipt No</th>
              <th style={{ padding: '0.85rem 1rem' }}>Date & Timestamp</th>
              <th style={{ padding: '0.85rem 1rem' }}>Account & Customer</th>
              <th style={{ padding: '0.85rem 1rem' }}>Mode & Reference</th>
              <th style={{ padding: '0.85rem 1rem' }}>Principal / Interest Allocation</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Amount Paid</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                  No payment transactions logged yet. Click "+ Collect Payment / EMI" when a borrower pays.
                </td>
              </tr>
            ) : payments.filter(p => {
              if (!searchFilter.trim()) return true;
              const q = searchFilter.toLowerCase();
              return (
                p.receiptNo?.toLowerCase().includes(q) ||
                p.customerName?.toLowerCase().includes(q) ||
                p.accountId?.toLowerCase().includes(q) ||
                p.referenceNo?.toLowerCase().includes(q)
              );
            }).length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                  No matching payment receipts found for "{searchFilter}".
                </td>
              </tr>
            ) : (
              payments.filter(p => {
                if (!searchFilter.trim()) return true;
                const q = searchFilter.toLowerCase();
                return (
                  p.receiptNo?.toLowerCase().includes(q) ||
                  p.customerName?.toLowerCase().includes(q) ||
                  p.accountId?.toLowerCase().includes(q) ||
                  p.referenceNo?.toLowerCase().includes(q)
                );
              }).map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#D97706' }}>{p.receiptNo}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{new Date(p.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.customerName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{p.accountId}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)' }}>{p.paymentMode} ({p.referenceNo})</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Principal: {formatCurrency(p.allocatedPrincipal)}</span> | {' '}
                    <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Interest: {formatCurrency(p.allocatedInterest)}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => setSelectedReceipt(p)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      <Printer size={13} /> View Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Collect Payment Modal */}
      {isCollectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCollectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={22} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Record Payment / EMI Collection</h3>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)} className="btn-icon"><X size={16} /></button>
            </div>

            <form onSubmit={handleCollect}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Select Loan Account *
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="form-select"
                  style={{ fontWeight: 600 }}
                >
                  {financeAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.customerName} • {a.id} ({formatCurrency(a.financedAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {activeAcc && (
                <div style={{ background: '#F8FAFC', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer: <strong>{activeAcc.customerName}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>Scheme: <strong>{activeAcc.productName}</strong></span>
                  </div>
                  {dueEmi && (
                    <div style={{ color: '#059669', fontWeight: 700 }}>
                      Next Installment #{dueEmi.installmentNo} Due: {formatCurrency(dueEmi.emiAmount)} (Due on {dueEmi.dueDate})
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Payment Mode
                  </label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="form-select">
                    <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="NEFT">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Reference / UTR / Voucher No
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. UPI/819230192"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Amount Received (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#059669' }}>₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2rem', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsCollectModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-emerald">
                  <CheckCircle size={16} /> Collect & Generate Receipt
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* View Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>FINANCE PAYMENT RECEIPT</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OFFICIAL RECORD OF MONEY COLLECTION</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Receipt No:</span>
                <strong style={{ color: '#D97706' }}>{selectedReceipt.receiptNo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <span>{new Date(selectedReceipt.timestamp).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Borrower:</span>
                <strong style={{ color: '#0F172A' }}>{selectedReceipt.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account ID:</span>
                <code>{selectedReceipt.accountId}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                <span>{selectedReceipt.paymentMode} ({selectedReceipt.referenceNo})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Principal Repaid:</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>{formatCurrency(selectedReceipt.allocatedPrincipal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Interest Component:</span>
                <span style={{ color: '#D97706', fontWeight: 600 }}>{formatCurrency(selectedReceipt.allocatedInterest)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #CBD5E1', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 800 }}>Total Paid:</span>
                <strong style={{ color: '#059669', fontSize: '1.2rem' }}>{formatCurrency(selectedReceipt.amount)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => window.print()} className="btn-secondary">
                <Printer size={15} /> Print Receipt
              </button>
              <button onClick={() => setSelectedReceipt(null)} className="btn-indigo">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
