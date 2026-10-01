import React, { useState, useMemo } from 'react';
import { FileText, Search, ShieldCheck, Clock, Filter, Download, Trash2, AlertTriangle } from 'lucide-react';

export default function AuditLogsView({ auditLogs = [], onClearAuditLogs }) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Unique action types for filter
  const actionTypes = useMemo(() => {
    const types = [...new Set(auditLogs.map(l => l.action))].sort();
    return types;
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l => {
      const matchSearch =
        (l.actor || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.target || '').toLowerCase().includes(search.toLowerCase());
      const matchAction = filterAction === 'all' || l.action === filterAction;
      return matchSearch && matchAction;
    });
  }, [auditLogs, search, filterAction]);

  // Color coding by action type
  const getActionColor = (action = '') => {
    if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('SESSION')) return { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' };
    if (action.includes('PAYMENT') || action.includes('DISBURSED') || action.includes('CAPITAL')) return { color: '#34D399', bg: 'rgba(52,211,153,0.12)' };
    if (action.includes('OVERDUE') || action.includes('REJECTED') || action.includes('RESET') || action.includes('REMOVED')) return { color: '#F87171', bg: 'rgba(248,113,113,0.12)' };
    if (action.includes('KYC') || action.includes('DOCUMENT') || action.includes('VERIFIED')) return { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' };
    if (action.includes('APPROVED') || action.includes('ONBOARDED') || action.includes('SAVED')) return { color: '#34D399', bg: 'rgba(52,211,153,0.12)' };
    if (action.includes('PERMISSIONS') || action.includes('USER')) return { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' };
    return { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' };
  };

  // Export logs as CSV
  const handleExportCSV = () => {
    const header = 'Timestamp,Actor,Action,Target,IP\n';
    const rows = filteredLogs.map(l =>
      `"${new Date(l.timestamp).toLocaleString()}","${l.actor}","${l.action}","${l.target}","${l.ip}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: '#0F172A', border: '1px solid #1E293B',
        borderRadius: '14px', padding: '1.2rem 1.5rem',
        marginBottom: '1.2rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <FileText size={20} color="#818CF8" />
            Security & Financial Audit Trail
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem', marginBottom: 0 }}>
            Permanent, tamper-evident log — audit logs are never deleted automatically. Only manually clearable.
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', background: '#1E293B', color: '#34D399', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 700, border: '1px solid #059669' }}>
              {auditLogs.length} Total Events Recorded
            </span>
            <span style={{ fontSize: '0.72rem', background: '#1E293B', color: '#818CF8', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 700 }}>
              Showing: {filteredLogs.length}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
              Logs persist across all resets & logouts
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.45rem 0.9rem', borderRadius: '8px',
            border: '1px solid #1E293B', background: '#1E293B',
            color: '#94A3B8', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer'
          }}>
            <Download size={13} /> Export CSV
          </button>

          {onClearAuditLogs && (
            <button onClick={() => setShowClearConfirm(true)} style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.45rem 0.9rem', borderRadius: '8px',
              border: '1px solid #7F1D1D', background: '#1C0A0A',
              color: '#F87171', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer'
            }}>
              <Trash2 size={13} /> Clear All Logs
            </button>
          )}
        </div>
      </div>

      {/* Manual Clear Confirm */}
      {showClearConfirm && (
        <div style={{
          background: '#1C0A0A', border: '1.5px solid #DC2626',
          borderRadius: '12px', padding: '1rem 1.2rem',
          marginBottom: '1.2rem', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 800, color: '#FCA5A5', fontSize: '0.88rem' }}>Permanently clear ALL audit logs?</div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>This cannot be undone. All {auditLogs.length} records will be deleted.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowClearConfirm(false)} style={{ padding: '0.38rem 0.8rem', borderRadius: '7px', border: '1px solid #334155', background: '#1E293B', color: '#94A3B8', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={() => { onClearAuditLogs(); setShowClearConfirm(false); }} style={{ padding: '0.38rem 0.8rem', borderRadius: '7px', border: 'none', background: '#DC2626', color: '#FFF', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
              Yes, Clear All
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            type="text"
            placeholder="Search actor, action, target..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.5rem 0.8rem 0.5rem 2.1rem',
              borderRadius: '8px', border: '1px solid #1E293B',
              background: '#0F172A', color: '#E2E8F0',
              fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action filter */}
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          style={{
            padding: '0.5rem 0.8rem', borderRadius: '8px',
            border: '1px solid #1E293B', background: '#0F172A',
            color: '#E2E8F0', fontSize: '0.82rem', outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Actions ({auditLogs.length})</option>
          {actionTypes.map(a => (
            <option key={a} value={a}>{a} ({auditLogs.filter(l => l.action === a).length})</option>
          ))}
        </select>

        <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600, marginLeft: 'auto' }}>
          {filteredLogs.length} of {auditLogs.length} records
        </span>
      </div>

      {/* Log Table */}
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '14px', overflow: 'hidden' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
            <FileText size={36} style={{ margin: '0 auto 0.8rem auto', display: 'block', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.88rem' }}>No audit events match your filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#1E293B', color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>#</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Target / Details</th>
                  <th style={{ padding: '0.75rem 1rem' }}>IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const { color, bg } = getActionColor(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #1E293B', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1A2234'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 600, fontSize: '0.72rem' }}>
                        {filteredLogs.length - idx}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748B', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
                        {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#818CF8' }}>{log.actor}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <code style={{ fontSize: '0.72rem', color, background: bg, padding: '0.18rem 0.5rem', borderRadius: '5px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {log.action}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#E2E8F0', maxWidth: '380px' }}>
                        <span style={{ fontSize: '0.78rem' }}>{log.target}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', fontSize: '0.72rem' }}>{log.ip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
