import React from 'react';
import { AlertTriangle, PhoneCall, Calendar, UserCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';

export default function OverdueCollectionsView({ overdueFollowups, onSaveFollowupNote }) {
  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={22} color="#F43F5E" /> Overdue Collections & Aging Radar (PRD Section 22)
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Categorized overdue aging buckets: 0-30 days, 31-60 days, 61-90 days, 90+ days (NPA).
          </p>
        </div>
      </div>

      {/* Aging Bucket Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { title: '0-30 Days Overdue', color: '#F59E0B', count: overdueFollowups.filter(f => f.agingBucket === '0-30 Days').length },
          { title: '31-60 Days Overdue', color: '#FB7185', count: overdueFollowups.filter(f => f.agingBucket === '31-60 Days').length },
          { title: '61-90 Days Overdue', color: '#F43F5E', count: overdueFollowups.filter(f => f.agingBucket === '61-90 Days').length },
          { title: '90+ Days (NPA)', color: '#991B1B', count: overdueFollowups.filter(f => f.agingBucket === '90+ Days (NPA)').length }
        ].map(b => (
          <div key={b.title} className="glass-panel" style={{ padding: '1rem', borderLeft: `4px solid ${b.color}` }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>{b.title}</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: b.color, marginTop: '0.2rem' }}>{b.count} Accounts</h3>
          </div>
        ))}
      </div>

      {/* Follow-up Accounts Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.25)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Account & Customer</th>
              <th style={{ padding: '0.85rem 1rem' }}>Aging Bucket</th>
              <th style={{ padding: '0.85rem 1rem' }}>Overdue Days</th>
              <th style={{ padding: '0.85rem 1rem' }}>Amount Due</th>
              <th style={{ padding: '0.85rem 1rem' }}>Assigned Agent</th>
              <th style={{ padding: '0.85rem 1rem' }}>Last Contact Date</th>
              <th style={{ padding: '0.85rem 1rem' }}>Follow-up Outcome Notes</th>
            </tr>
          </thead>
          <tbody>
            {overdueFollowups.map(fol => (
              <tr key={fol.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#FFF' }}>{fol.customerName}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge-status overdue">{fol.agingBucket}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#FB7185' }}>{fol.overdueDays} Days</td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#FBBF24' }}>{formatCurrency(fol.amountDue)}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#818CF8' }}>{fol.assignedAgent}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)' }}>{fol.lastContactDate}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>"{fol.notes}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
