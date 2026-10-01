import React, { useState } from 'react';
import { X, Calculator, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { formatINR, calculateMonthlyByaj } from '../utils/financeCalc';

export default function ByajCalculatorModal({ onClose }) {
  const [amount, setAmount] = useState(100000);
  const [ratePct, setRatePct] = useState(2.0);
  const [tenureMonths, setTenureMonths] = useState(12);

  const calc = calculateMonthlyByaj(parseFloat(amount) || 0, parseFloat(ratePct) || 0, parseInt(tenureMonths) || 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calculator size={22} color="#F59E0B" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Interactive Loan & Interest Calculator</h3>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Principal Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FBBF24' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Monthly Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={ratePct}
                onChange={(e) => setRatePct(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Duration (Months)
              </label>
              <input
                type="number"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Calculated Results Display Box */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interest Calculation Summary
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Monthly Interest Income:</span>
            <strong style={{ color: '#10B981', fontSize: '1.05rem' }}>{formatINR(calc.monthlyInterest)} / mo</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Interest over {tenureMonths} mos:</span>
            <strong style={{ color: '#FBBF24' }}>{formatINR(calc.totalInterest)}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span style={{ color: '#FFF', fontWeight: 600 }}>Grand Total Repayment:</span>
            <strong style={{ color: '#FFF', fontSize: '1.15rem' }}>{formatINR(calc.totalRepayment)}</strong>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
          <button onClick={onClose} className="btn-secondary">
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
}
