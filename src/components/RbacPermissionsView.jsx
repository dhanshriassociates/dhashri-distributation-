import React, { useState } from 'react';
import { Sliders, ShieldCheck, CheckCircle2, Lock, Users } from 'lucide-react';

export default function RbacPermissionsView({ roles, permissionMatrix }) {
  const [selectedRole, setSelectedRole] = useState('admin');

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={22} color="var(--accent-indigo)" /> Admin & Employee Access Control
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            System roles strictly partitioned for Admin (Business Owner) and Employee (Loan & Collection Staff).
          </p>
        </div>
      </div>

      {/* Roles Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
        {roles.map(r => (
          <div
            key={r.id}
            onClick={() => setSelectedRole(r.id)}
            className="glass-panel"
            style={{
              padding: '1.3rem',
              cursor: 'pointer',
              border: selectedRole === r.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
              background: selectedRole === r.id ? '#EEF2FF' : '#FFF',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: selectedRole === r.id ? '#1E1B4B' : '#0F172A', marginBottom: '0.35rem' }}>
              {r.name}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-indigo)', fontWeight: 700 }}>Scope: {r.scope}</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>{r.description}</p>
          </div>
        ))}
      </div>

      {/* Permission Baseline Matrix Table */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
        🛡️ Access Rights & Authority Matrix
      </h3>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Operational Module</th>
              <th style={{ padding: '0.85rem 1rem' }}>Employee Authority</th>
              <th style={{ padding: '0.85rem 1rem' }}>Admin / Owner Authority</th>
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map(row => (
              <tr key={row.module} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0F172A' }}>{row.module}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#059669', fontWeight: 600 }}>{row.employee}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#4F46E5', fontWeight: 800 }}>{row.admin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
