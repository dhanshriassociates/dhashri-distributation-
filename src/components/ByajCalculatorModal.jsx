import React, { useState } from 'react';
import { X, Calculator, DollarSign, TrendingUp, RefreshCw, Sparkles, Sun, Calendar } from 'lucide-react';
import { formatINR, calculateMonthlyByaj, calculateFixRepayment } from '../utils/financeCalc';

export default function ByajCalculatorModal({ onClose }) {
  const [calcMode, setCalcMode] = useState('fix_total'); // 'fix_total' or 'monthly_percent'
  
  // Fix Total Specific State
  const [fixPrincipal, setFixPrincipal] = useState(85000);
  const [fixTarget, setFixTarget] = useState(100000);
  const [fixFrequency, setFixFrequency] = useState('daily');
  const [fixKistAmount, setFixKistAmount] = useState(1000);

  // Standard Monthly % Byaj State
  const [amount, setAmount] = useState(100000);
  const [ratePct, setRatePct] = useState(2.0);
  const [tenureMonths, setTenureMonths] = useState(12);

  const fixCalc = calculateFixRepayment(
    parseFloat(fixPrincipal) || 0,
    parseFloat(fixTarget) || 0,
    fixFrequency,
    parseFloat(fixKistAmount) || 1000
  );

  const monthlyCalc = calculateMonthlyByaj(parseFloat(amount) || 0, parseFloat(ratePct) || 0, parseInt(tenureMonths) || 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calculator size={22} color="#059669" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Quick Loan & Interest Calculator</h3>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Scheme Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button
            type="button"
            onClick={() => setCalcMode('fix_total')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: calcMode === 'fix_total' ? '2px solid #059669' : '1px solid #CBD5E1',
              background: calcMode === 'fix_total' ? '#ECFDF5' : '#FFF',
              color: calcMode === 'fix_total' ? '#059669' : '#475569',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            🌟 Fixed Total Return (₹85k ➔ ₹100k)
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('monthly_percent')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: calcMode === 'monthly_percent' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
              background: calcMode === 'monthly_percent' ? '#EEF2FF' : '#FFF',
              color: calcMode === 'monthly_percent' ? '#4F46E5' : '#475569',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            Monthly % Interest
          </button>
        </div>

        {/* Form Controls */}
        {calcMode === 'fix_total' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Principal Disbursed (₹)
                </label>
                <input
                  type="number"
                  value={fixPrincipal}
                  onChange={(e) => setFixPrincipal(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Total Target Repayment (₹)
                </label>
                <input
                  type="number"
                  value={fixTarget}
                  onChange={(e) => setFixTarget(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', border: '2px solid #10B981' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Payment Frequency
                </label>
                <select
                  value={fixFrequency}
                  onChange={(e) => setFixFrequency(e.target.value)}
                  className="form-select"
                  style={{ fontWeight: 600 }}
                >
                  <option value="daily">☀️ Daily</option>
                  <option value="weekly">📅 Weekly</option>
                  <option value="monthly">📆 Monthly</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Installment Amount (₹)
                </label>
                <input
                  type="number"
                  value={fixKistAmount}
                  onChange={(e) => setFixKistAmount(e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 800, color: '#4F46E5' }}
                />
              </div>
            </div>
          </div>
        ) : (
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
                style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}
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
        )}

        {/* Calculated Results Display Box */}
        {calcMode === 'fix_total' ? (
          <div style={{
            background: '#F0FDF4',
            border: '2px solid #86EFAC',
            borderRadius: 'var(--radius-lg)',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fixed Total Return Summary
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid #BBF7D0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#065F46' }}>Installment Amount:</span>
              <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                {formatINR(fixCalc.installmentAmount)} / {fixFrequency === 'daily' ? 'day' : fixFrequency === 'weekly' ? 'week' : 'mo'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid #BBF7D0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#065F46' }}>Total Duration:</span>
              <strong style={{ color: '#047857' }}>
                {fixCalc.totalInstallments} {fixFrequency === 'daily' ? 'Days' : fixFrequency === 'weekly' ? 'Weeks' : 'Months'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid #BBF7D0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#065F46' }}>Total Expected Profit:</span>
              <strong style={{ color: '#B45309' }}>{formatINR(fixCalc.totalProfit)} ({fixCalc.profitPercentage}%)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: '#0F172A', fontWeight: 800 }}>Total Target Repayment:</span>
              <strong style={{ color: '#065F46', fontSize: '1.2rem' }}>{formatINR(fixCalc.totalRepayment)}</strong>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interest Calculation Summary
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Monthly Interest Income:</span>
              <strong style={{ color: '#10B981', fontSize: '1.05rem' }}>{formatINR(monthlyCalc.monthlyInterest)} / mo</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Interest over {tenureMonths} mos:</span>
              <strong style={{ color: '#D97706' }}>{formatINR(monthlyCalc.totalInterest)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>Grand Total Repayment:</span>
              <strong style={{ color: '#0F172A', fontSize: '1.15rem' }}>{formatINR(monthlyCalc.totalRepayment)}</strong>
            </div>
          </div>
        )}

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
