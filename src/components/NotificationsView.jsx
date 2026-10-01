import React, { useState, useMemo } from 'react';
import {
  Bell, AlertTriangle, CheckCircle2, Clock, TrendingDown,
  ChevronRight, X, Filter, RefreshCw, CalendarCheck, FileText,
  Users, CreditCard, Landmark, Eye
} from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';

export default function NotificationsView({
  financeAccounts = [],
  customers = [],
  payments = [],
  applications = [],
  onNavigateTo
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dismissed, setDismissed] = useState(() => {
    const s = localStorage.getItem('dismissed_notifications');
    return s ? JSON.parse(s) : [];
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate all system alerts
  const allAlerts = useMemo(() => {
    const alerts = [];

    // Overdue EMI alerts
    financeAccounts.forEach(acc => {
      const overdueEmis = (acc.emiSchedule || []).filter(e => {
        if (e.status === 'paid') return false;
        const due = new Date(e.dueDate);
        return due < today;
      });

      if (overdueEmis.length > 0) {
        const daysOverdue = Math.floor((today - new Date(overdueEmis[0].dueDate)) / 86400000);
        alerts.push({
          id: `overdue-${acc.id}`,
          type: 'overdue',
          severity: daysOverdue > 60 ? 'critical' : daysOverdue > 30 ? 'high' : 'medium',
          title: `Overdue EMI — ${acc.customerName}`,
          message: `${overdueEmis.length} unpaid EMI${overdueEmis.length > 1 ? 's' : ''} overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}. Principal: ${formatCurrency(acc.financedAmount)}`,
          action: 'overdue',
          actionLabel: 'View Recovery',
          timestamp: overdueEmis[0].dueDate,
          icon: AlertTriangle,
          color: daysOverdue > 60 ? '#DC2626' : daysOverdue > 30 ? '#D97706' : '#F59E0B'
        });
      }
    });

    // EMI due in next 3 days
    financeAccounts.forEach(acc => {
      const upcoming = (acc.emiSchedule || []).find(e => {
        if (e.status === 'paid') return false;
        const due = new Date(e.dueDate);
        const diff = (due - today) / 86400000;
        return diff >= 0 && diff <= 3;
      });

      if (upcoming) {
        const daysLeft = Math.ceil((new Date(upcoming.dueDate) - today) / 86400000);
        alerts.push({
          id: `upcoming-${acc.id}`,
          type: 'upcoming',
          severity: 'info',
          title: `EMI Due Soon — ${acc.customerName}`,
          message: `EMI of ${formatCurrency(upcoming.emiAmount)} due in ${daysLeft === 0 ? 'TODAY' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`} (${upcoming.dueDate})`,
          action: 'dailyRoute',
          actionLabel: "View Today's Route",
          timestamp: upcoming.dueDate,
          icon: Clock,
          color: '#4F46E5'
        });
      }
    });

    // KYC pending alerts
    customers.forEach(c => {
      if (c.kycStatus === 'Under Review' || c.kycStatus === 'Uploaded') {
        alerts.push({
          id: `kyc-${c.id}`,
          type: 'kyc',
          severity: 'medium',
          title: `KYC Pending Review — ${c.name}`,
          message: `Documents awaiting verification for borrower ${c.name}. Aadhaar & PAN uploaded.`,
          action: 'docsVault',
          actionLabel: 'Review Documents',
          timestamp: new Date().toISOString().split('T')[0],
          icon: FileText,
          color: '#0284C7'
        });
      }
    });

    // Pending applications
    const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Under Review');
    if (pendingApps.length > 0) {
      alerts.push({
        id: 'pending-apps',
        type: 'application',
        severity: 'medium',
        title: `${pendingApps.length} Loan Application${pendingApps.length > 1 ? 's' : ''} Pending Approval`,
        message: `${pendingApps.map(a => a.customerName || a.applicantName).slice(0, 3).join(', ')} ${pendingApps.length > 3 ? `+${pendingApps.length - 3} more` : ''} awaiting credit decision.`,
        action: 'applications',
        actionLabel: 'Review Applications',
        timestamp: new Date().toISOString().split('T')[0],
        icon: CheckCircle2,
        color: '#059669'
      });
    }

    // No new payments in 7+ days warning
    if (payments.length > 0) {
      const lastPayment = payments.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      const daysSinceLast = Math.floor((today - new Date(lastPayment.timestamp)) / 86400000);
      if (daysSinceLast >= 7) {
        alerts.push({
          id: 'stale-collections',
          type: 'system',
          severity: 'high',
          title: 'No Collections in 7+ Days',
          message: `Last payment was recorded ${daysSinceLast} days ago on ${new Date(lastPayment.timestamp).toLocaleDateString('en-IN')}. Field collection may need attention.`,
          action: 'dailyRoute',
          actionLabel: "Open Today's Route",
          timestamp: lastPayment.timestamp,
          icon: TrendingDown,
          color: '#DC2626'
        });
      }
    }

    return alerts
      .filter(a => !dismissed.includes(a.id))
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, info: 3 };
        return (order[a.severity] || 3) - (order[b.severity] || 3);
      });
  }, [financeAccounts, customers, payments, applications, dismissed]);

  const filters = [
    { id: 'all', label: 'All Alerts', count: allAlerts.length },
    { id: 'overdue', label: 'Overdue EMI', count: allAlerts.filter(a => a.type === 'overdue').length },
    { id: 'upcoming', label: 'Due Soon', count: allAlerts.filter(a => a.type === 'upcoming').length },
    { id: 'kyc', label: 'KYC Pending', count: allAlerts.filter(a => a.type === 'kyc').length },
    { id: 'application', label: 'Applications', count: allAlerts.filter(a => a.type === 'application').length },
  ];

  const visibleAlerts = activeFilter === 'all' ? allAlerts : allAlerts.filter(a => a.type === activeFilter);

  const handleDismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
  };

  const handleDismissAll = () => {
    const updated = [...dismissed, ...allAlerts.map(a => a.id)];
    setDismissed(updated);
    localStorage.setItem('dismissed_notifications', JSON.stringify(updated));
  };

  const handleReset = () => {
    setDismissed([]);
    localStorage.removeItem('dismissed_notifications');
  };

  const severityConfig = {
    critical: { bg: '#FEF2F2', border: '#FECACA', badge: '#DC2626', text: 'Critical' },
    high: { bg: '#FFFBEB', border: '#FED7AA', badge: '#D97706', text: 'High' },
    medium: { bg: '#F0F9FF', border: '#BAE6FD', badge: '#0284C7', text: 'Medium' },
    info: { bg: '#EEF2FF', border: '#C7D2FE', badge: '#4F46E5', text: 'Info' },
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: '14px', padding: '1.2rem 1.6rem',
        marginBottom: '1.2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color="#4F46E5" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Notifications & Alerts
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.1rem 0 0 0' }}>
              {allAlerts.length} active alert{allAlerts.length !== 1 ? 's' : ''} requiring attention
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
            <RefreshCw size={13} /> Restore All
          </button>
          {allAlerts.length > 0 && (
            <button onClick={handleDismissAll} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', color: '#DC2626' }}>
              <X size={13} /> Dismiss All
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '20px',
              border: `1.5px solid ${activeFilter === f.id ? '#4F46E5' : '#E2E8F0'}`,
              background: activeFilter === f.id ? '#4F46E5' : '#FFF',
              color: activeFilter === f.id ? '#FFF' : '#475569',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              transition: 'all 0.2s ease'
            }}
          >
            {f.label}
            {f.count > 0 && (
              <span style={{
                background: activeFilter === f.id ? 'rgba(255,255,255,0.3)' : '#EEF2FF',
                color: activeFilter === f.id ? '#FFF' : '#4F46E5',
                fontSize: '0.68rem', fontWeight: 800,
                padding: '0.05rem 0.4rem', borderRadius: '10px'
              }}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {visibleAlerts.length === 0 ? (
        <div style={{
          background: '#FFFFFF', border: '2px dashed #E2E8F0',
          borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center'
        }}>
          <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 0.8rem auto', display: 'block' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            All Clear
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
            No active alerts in this category. Your portfolio looks healthy!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visibleAlerts.map(alert => {
            const cfg = severityConfig[alert.severity];
            const Icon = alert.icon;
            return (
              <div key={alert.id} style={{
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: '12px', padding: '1rem 1.2rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <Icon size={18} color={alert.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{alert.title}</span>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '8px', background: cfg.badge, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cfg.text}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.6rem 0', lineHeight: 1.4 }}>{alert.message}</p>
                  <button
                    onClick={() => onNavigateTo && onNavigateTo(alert.action)}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '7px',
                      border: `1px solid ${alert.color}`, background: '#FFF',
                      color: alert.color, fontSize: '0.76rem', fontWeight: 700,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                    }}
                  >
                    {alert.actionLabel} <ChevronRight size={12} />
                  </button>
                </div>

                <button
                  onClick={() => handleDismiss(alert.id)}
                  title="Dismiss this alert"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.2rem', flexShrink: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
