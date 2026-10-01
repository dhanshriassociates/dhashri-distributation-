import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, Clock } from 'lucide-react';

export default function AuditLogsView({ auditLogs }) {
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(l => 
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="var(--accent-indigo)" /> Security & Financial Audit Logs (PRD Section 23)
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Searchable, immutable record of security events, document verifications, approvals, and payments.
          </p>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.25)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.85rem 1rem' }}>Actor User</th>
              <th style={{ padding: '0.85rem 1rem' }}>Action Event</th>
              <th style={{ padding: '0.85rem 1rem' }}>Target Resource</th>
              <th style={{ padding: '0.85rem 1rem' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#818CF8' }}>{log.actor}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <code style={{ fontSize: '0.78rem', color: '#FBBF24', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {log.action}
                  </code>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#FFF' }}>{log.target}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)' }}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
