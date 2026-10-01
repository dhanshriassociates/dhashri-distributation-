import React, { useState } from 'react';
import { FileCheck, Plus, CheckCircle2, XCircle, AlertCircle, Landmark, ShieldCheck, Eye, X, PlusCircle } from 'lucide-react';
import { formatCurrency, generateEmiSchedule } from '../utils/financeEngine';
import confetti from 'canvas-confetti';

export default function ApplicationsWorkflowView({ 
  applications = [], 
  customers = [], 
  financeProducts = [], 
  onSaveApplication, 
  onApproveApplication, 
  onRejectApplication,
  onOpenDisburseLoan
}) {
  const [isNewAppOpen, setIsNewAppOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(financeProducts[0]?.id || '');
  const [requestedAmount, setRequestedAmount] = useState(100000);
  const [tenureMonths, setTenureMonths] = useState(12);

  // Review Modal State
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewerComment, setReviewerComment] = useState('');

  const activeProduct = financeProducts.find(p => p.id === selectedProductId) || financeProducts[0] || { annualRatePct: 14.5, calcMode: 'reducing', name: 'Standard Loan', id: 'p-1' };
  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Live calculated EMI
  const liveEmiSchedule = generateEmiSchedule(
    parseFloat(requestedAmount) || 50000, 
    activeProduct.annualRatePct, 
    parseInt(tenureMonths) || 12, 
    new Date().toISOString().split('T')[0], 
    activeProduct.calcMode
  );
  const calculatedEmi = liveEmiSchedule[0]?.emiAmount || 0;

  const handleOpenNewApp = () => {
    if (customers.length === 0) {
      if (confirm('No customers registered yet. Would you like to disburse a loan and create a customer directly?')) {
        if (onOpenDisburseLoan) onOpenDisburseLoan();
      }
      return;
    }
    setIsNewAppOpen(true);
  };

  const handleCreateApp = (e) => {
    e.preventDefault();
    if (!requestedAmount || requestedAmount <= 0) return;
    if (!activeCustomer) {
      alert('Please select a customer.');
      return;
    }

    const newApp = {
      id: `APP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      productId: activeProduct.id,
      productName: activeProduct.name,
      requestedAmount: parseFloat(requestedAmount),
      tenureMonths: parseInt(tenureMonths),
      annualRatePct: activeProduct.annualRatePct,
      calculatedEmi,
      status: 'Under Review',
      reviewerComment: '',
      reviewedBy: null,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveApplication(newApp);
    setIsNewAppOpen(false);
  };

  const handleApprove = (app) => {
    onApproveApplication(app.id, reviewerComment.trim() || 'Approved clean application with verified documents', 'System Approver');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setReviewingApp(null);
  };

  const handleReject = (app) => {
    if (!reviewerComment.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    onRejectApplication(app.id, reviewerComment.trim(), 'System Approver');
    setReviewingApp(null);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Controls */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={22} color="var(--accent-indigo)" /> Finance Applications & Credit Review
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Submit loan requests for approval or disburse capital directly with customer Aadhaar/PAN verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={onOpenDisburseLoan} className="btn-emerald">
            <PlusCircle size={16} /> Direct Loan Disbursal (Fast Track)
          </button>
          <button onClick={handleOpenNewApp} className="btn-indigo">
            <Plus size={16} /> Create Application
          </button>
        </div>
      </div>

      {/* Applications Register Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Application ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
              <th style={{ padding: '0.85rem 1rem' }}>Product</th>
              <th style={{ padding: '0.85rem 1rem' }}>Requested Amount</th>
              <th style={{ padding: '0.85rem 1rem' }}>Calculated EMI</th>
              <th style={{ padding: '0.85rem 1rem' }}>Date</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                  No pending finance applications. Use "Direct Loan Disbursal" or "+ Create Application" to start.
                </td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#4F46E5' }}>{app.id}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0F172A' }}>{app.customerName}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{app.productName}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(app.requestedAmount)}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#10B981' }}>{formatCurrency(app.calculatedEmi)}/mo</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)' }}>{app.createdAt}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge-status ${app.status.toLowerCase().replace(' ', '_')}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => setReviewingApp(app)} className="btn-indigo" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}>
                      <Eye size={13} /> Review Screen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Creation Modal */}
      {isNewAppOpen && (
        <div className="modal-overlay" onClick={() => setIsNewAppOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Create New Finance Application</h3>
              <button onClick={() => setIsNewAppOpen(false)} className="btn-icon"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateApp}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Select Verified Customer</label>
                <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="form-select">
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id}) • KYC: {c.kycStatus}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Select Finance Product</label>
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="form-select">
                  {financeProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.annualRatePct}% p.a.)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Requested Amount (₹)</label>
                  <input type="number" required value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} className="form-input" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Tenure (Months)</label>
                  <input type="number" required value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} className="form-input" />
                </div>
              </div>

              {/* Calculated EMI Display Box */}
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Monthly EMI:</span>
                <strong style={{ color: '#047857', fontSize: '1.1rem' }}>{formatCurrency(calculatedEmi)} / month</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsNewAppOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-indigo">Submit Application</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingApp && (
        <div className="modal-overlay" onClick={() => setReviewingApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Manager Application Review Screen</h3>
              <button onClick={() => setReviewingApp(null)} className="btn-icon"><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Applicant: </span><strong>{reviewingApp.customerName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Product: </span><strong>{reviewingApp.productName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Requested Capital: </span><strong style={{ color: '#059669' }}>{formatCurrency(reviewingApp.requestedAmount)}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Calculated Monthly EMI: </span><strong style={{ color: '#047857' }}>{formatCurrency(reviewingApp.calculatedEmi)}</strong></div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Review Notes / Approval Reason
                </label>
                <textarea
                  rows={3}
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder="Enter approval notes or mandatory rejection reason..."
                  className="form-textarea"
                />
              </div>
            </div>

            {/* Decision Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button type="button" onClick={() => handleReject(reviewingApp)} className="btn-secondary" style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
                <XCircle size={16} /> Reject Application
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setReviewingApp(null)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={() => handleApprove(reviewingApp)} className="btn-emerald">
                  <CheckCircle2 size={16} /> Approve & Disburse Capital
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
