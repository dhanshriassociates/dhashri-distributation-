import React from 'react';
import { CreditCard, Plus, ShieldCheck, Check, Settings } from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';

export default function FinanceProductsView({ financeProducts }) {
  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={22} color="var(--accent-indigo)" /> Finance Products Configuration (PRD Section 9)
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Configure product amount ranges, interest rates, tenure limits, EMI modes, and mandatory document rules.
          </p>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {financeProducts.map(prod => (
          <div key={prod.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo)', background: 'rgba(99, 102, 241, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {prod.code}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>
                  {prod.calcMode.toUpperCase()} BAL
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginBottom: '0.4rem' }}>{prod.name}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', margin: '1rem 0', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Amount Range</span>
                  <div style={{ fontWeight: 700, color: '#FBBF24' }}>{formatCurrency(prod.minAmount)} - {formatCurrency(prod.maxAmount)}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Annual Rate (%)</span>
                  <div style={{ fontWeight: 700, color: '#10B981' }}>{prod.annualRatePct}% p.a.</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Tenure Limits</span>
                  <div style={{ fontWeight: 700, color: '#FFF' }}>{prod.minTenureMonths} - {prod.maxTenureMonths} Months</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Processing Fee</span>
                  <div style={{ fontWeight: 700, color: '#818CF8' }}>{prod.processingFeePct}%</div>
                </div>
              </div>

              {/* Mandatory Documents Checklist */}
              <div>
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Mandatory Required Documents (PRD Section 14):
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {prod.requiredDocuments.map((doc, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Check size={13} color="#10B981" /> {doc}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
