import React, { useMemo } from 'react';
import {
  Landmark, TrendingUp, AlertTriangle, CheckCircle2, Users, Receipt,
  ArrowUpRight, ShieldCheck, Download, RotateCcw, Sparkles, Printer,
  ChevronRight, ExternalLink, CalendarCheck, UserPlus, FileCheck,
  CreditCard, BarChart3, Calendar, Calculator, FolderCheck, Bell,
  ClipboardList, UserCheck, Wallet, Clock, TrendingDown, FileText
} from 'lucide-react';
import { formatCurrency, getOverdueBucket } from '../utils/financeEngine';

/* ──────────────────────────────────────────────
   Small reusable Widget card component
────────────────────────────────────────────── */
function ModuleWidget({ title, icon: Icon, iconColor = '#4F46E5', iconBg = '#EEF2FF', onClick, children, actionLabel = 'Open Module', badge = null }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '14px',
        padding: '1.1rem 1.2rem', cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: '0.75rem'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Widget Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} color={iconColor} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {badge && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '10px', background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          )}
          <ChevronRight size={14} color="#94A3B8" />
        </div>
      </div>

      {/* Widget Content */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.55rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {actionLabel} <ChevronRight size={11} />
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Mini stat pill used inside widgets
────────────────────────────────────────────── */
function StatPill({ label, value, color = '#059669', bg = '#ECFDF5' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', background: bg, borderRadius: '7px', marginBottom: '0.35rem' }}>
      <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD VIEW
═══════════════════════════════════════════════════════════════ */
export default function DashboardView({
  activeRole,
  customers = [],
  applications = [],
  financeAccounts = [],
  payments = [],
  overdueFollowups = [],
  currentUser,
  onNavigateTo,
  onOpenDisburseLoan,
  onOpenCollectPayment,
  onOpenPassbook,
  onResetData,
  onExportData,
  staffMembers = []
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  // ── Core Financial Metrics ──────────────────────────────────
  const activeAccounts   = financeAccounts.filter(a => a.status === 'Active' || a.status === 'Overdue');
  const closedAccounts   = financeAccounts.filter(a => a.status === 'Closed');
  const totalFinanced    = financeAccounts.reduce((s, a) => s + (a.financedAmount || 0), 0);
  const totalCollections = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPrincipalRepaid = payments.reduce((s, p) => s + (p.allocatedPrincipal || 0), 0);
  const totalInterest    = payments.reduce((s, p) => s + (p.allocatedInterest || 0), 0);
  const outstanding      = Math.max(0, totalFinanced - totalPrincipalRepaid);
  const totalTurnover    = totalFinanced + totalCollections;

  // ── Borrowers ──────────────────────────────────────────────
  const verifiedKYC  = customers.filter(c => c.kycStatus === 'Verified').length;
  const pendingKYC   = customers.filter(c => c.kycStatus === 'Under Review' || c.kycStatus === 'Uploaded').length;
  const totalDocs    = customers.reduce((s, c) => s + (c.documents?.length || 0), 0);

  // ── Overdue Buckets ────────────────────────────────────────
  let overdueCount = 0, b0_30 = 0, b31_60 = 0, b61_90 = 0, b90plus = 0;
  activeAccounts.forEach(acc => {
    const overdueEmis = (acc.emiSchedule || []).filter(s => {
      if (s.status === 'overdue') return true;
      if (s.status !== 'paid' && s.dueDate) return new Date(s.dueDate) < today;
      return false;
    });
    if (overdueEmis.length > 0) {
      overdueCount++;
      const bucket = getOverdueBucket(overdueEmis[0]?.dueDate);
      if (bucket === '0-30 Days') b0_30++;
      else if (bucket === '31-60 Days') b31_60++;
      else if (bucket === '61-90 Days') b61_90++;
      else if (bucket === '90+ Days (NPA)') b90plus++;
    }
  });

  // ── Today's Route ──────────────────────────────────────────
  const todayDue = activeAccounts.filter(acc =>
    (acc.emiSchedule || []).some(e => e.status !== 'paid' && e.dueDate === today.toISOString().split('T')[0])
  );

  // ── Applications ───────────────────────────────────────────
  const pendingApps  = applications.filter(a => a.status === 'Pending' || a.status === 'Under Review');
  const approvedApps = applications.filter(a => a.status === 'Approved');

  // ── Calendar — Upcoming dues (next 7 days) ─────────────────
  const upcomingDues = useMemo(() => {
    const result = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      activeAccounts.forEach(acc => {
        const e = (acc.emiSchedule || []).find(s => s.dueDate === ds && s.status !== 'paid');
        if (e) result.push({ name: acc.customerName, date: ds, amount: e.emiAmount });
      });
    }
    return result.slice(0, 5);
  }, [activeAccounts, today]);

  // ── Notifications count ────────────────────────────────────
  const alertCount = overdueCount + pendingKYC + pendingApps.length;

  // ── Last 5 payments ────────────────────────────────────────
  const recentPayments = [...payments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4);

  // ── Greeting ───────────────────────────────────────────────
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  const todayStr  = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: '1.4rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>

      {/* ── GREETING STRIP ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #312E81 100%)',
        borderRadius: '16px', padding: '1.2rem 1.6rem', marginBottom: '1.2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', boxShadow: '0 8px 20px -4px rgba(79,70,229,0.35)'
      }}>
        <div>
          <div style={{ fontSize: '0.73rem', color: '#C7D2FE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{todayStr}</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', margin: '0.2rem 0 0.15rem 0' }}>
            {greeting}, {currentUser?.name?.split(' ')[0] || 'Admin'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#A5B4FC', margin: 0 }}>
            {customers.length} Borrowers &nbsp;·&nbsp; {activeAccounts.length} Active Loans &nbsp;·&nbsp;
            {overdueCount > 0 ? <span style={{ color: '#FCA5A5', fontWeight: 700 }}>Warning: {overdueCount} Overdue</span> : <span style={{ color: '#6EE7B7' }}>Portfolio Healthy</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {onOpenDisburseLoan && (
            <button onClick={onOpenDisburseLoan} style={{ padding: '0.55rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.14)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              + Give Loan
            </button>
          )}
          {onOpenCollectPayment && (
            <button onClick={onOpenCollectPayment} style={{ padding: '0.55rem 1rem', borderRadius: '10px', background: '#059669', color: '#FFF', border: '1px solid #047857', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              Collect Payment
            </button>
          )}
          <button onClick={() => onNavigateTo('dailyRoute')} style={{ padding: '0.55rem 1rem', borderRadius: '10px', background: '#D97706', color: '#FFF', border: '1px solid #B45309', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            Today's Route
          </button>
        </div>
      </div>

      {/* ── HERO FINANCIAL BANNER ───────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
        borderRadius: '16px', padding: '1.5rem 1.8rem', color: '#FFF',
        marginBottom: '1.4rem', boxShadow: '0 15px 35px -5px rgba(30,27,75,0.3)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem'
      }}>
        {[
          { label: 'Total Business Turnover', value: formatCurrency(totalTurnover), color: '#FFF', sub: 'Capital Disbursed + Collections', accent: '#A5B4FC' },
          { label: 'Total Capital Disbursed', value: formatCurrency(totalFinanced), color: '#38BDF8', sub: `${financeAccounts.length} Loans Given`, accent: '#BAE6FD' },
          { label: 'Total Collections', value: formatCurrency(totalCollections), color: '#34D399', sub: `${payments.length} Receipts`, accent: '#A7F3D0' },
          { label: 'Market Outstanding', value: formatCurrency(outstanding), color: '#FBBF24', sub: 'Active Dues', accent: '#FDE68A' },
          { label: 'Interest Profit Earned', value: formatCurrency(totalInterest), color: '#A78BFA', sub: 'Realized Byaj', accent: '#DDD6FE' },
        ].map((m, i) => (
          <div key={i} onClick={() => onNavigateTo(i === 0 ? 'customer360' : i === 2 ? 'payments' : i === 3 ? 'dailyRoute' : 'analytics')}
            style={{ cursor: 'pointer', padding: i === 0 ? '0' : '0.4rem 0.8rem', borderRadius: '10px', background: i === 0 ? 'transparent' : 'rgba(255,255,255,0.03)', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRight: i === 0 ? '1px solid rgba(255,255,255,0.12)' : undefined, paddingRight: i === 0 ? '1rem' : undefined, transition: 'background 0.2s' }}
            onMouseEnter={e => { if (i > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if (i > 0) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <div style={{ fontSize: '0.7rem', color: m.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{m.label}</div>
            <div style={{ fontSize: i === 0 ? '2.1rem' : '1.55rem', fontWeight: 900, color: m.color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{m.value}</div>
            <div style={{ fontSize: '0.71rem', color: m.accent, marginTop: '0.35rem' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── EXPORT / RESET BAR ──────────────────────────────── */}
      <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.7rem 1.2rem', marginBottom: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #4F46E5, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={15} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Executive Financial Overview
              <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.1rem 0.4rem', borderRadius: '8px', fontWeight: 700 }}>Live Sync</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{customers.length} borrowers · {financeAccounts.length} accounts · {payments.length} payments</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.45rem' }}>
          {onExportData && (
            <button onClick={onExportData} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.38rem 0.75rem', borderRadius: '7px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#334155' }}>
              <Download size={12} /> Export
            </button>
          )}
          {onResetData && (
            <button onClick={onResetData} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.38rem 0.75rem', borderRadius: '7px', border: '1px solid #FECACA', background: '#FEF2F2', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#DC2626' }}>
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION LABEL ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>All Modules — Quick Overview</span>
        <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
      </div>

      {/* ══════════════════════════════════════════════════════
          MODULE WIDGETS GRID
      ══════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.6rem' }}>

        {/* ── 1. TODAY'S ROUTE ───────────────────────────────── */}
        <ModuleWidget title="Today's Route" icon={CalendarCheck} iconColor="#059669" iconBg="#ECFDF5" onClick={() => onNavigateTo('dailyRoute')} actionLabel="Open Daily Due Sheet"
          badge={todayDue.length > 0 ? { label: `${todayDue.length} Due Today`, bg: '#ECFDF5', color: '#047857' } : null}>
          <StatPill label="EMIs due today" value={todayDue.length} color="#059669" bg="#ECFDF5" />
          <StatPill label="Total active accounts" value={activeAccounts.length} color="#0F172A" bg="#F8FAFC" />
          <StatPill label="Overdue accounts" value={overdueCount} color={overdueCount > 0 ? '#DC2626' : '#059669'} bg={overdueCount > 0 ? '#FEF2F2' : '#ECFDF5'} />
        </ModuleWidget>

        {/* ── 2. BORROWERS 360 ───────────────────────────────── */}
        <ModuleWidget title="Borrowers 360 & KYC" icon={Users} iconColor="#4F46E5" iconBg="#EEF2FF" onClick={() => onNavigateTo('customer360')} actionLabel="Open Borrower Directory">
          <StatPill label="Registered borrowers" value={customers.length} color="#4338CA" bg="#EEF2FF" />
          <StatPill label="KYC Verified" value={verifiedKYC} color="#059669" bg="#ECFDF5" />
          <StatPill label="KYC Pending Review" value={pendingKYC} color={pendingKYC > 0 ? '#D97706' : '#94A3B8'} bg={pendingKYC > 0 ? '#FFFBEB' : '#F8FAFC'} />
        </ModuleWidget>

        {/* ── 3. PAYMENTS LEDGER ─────────────────────────────── */}
        <ModuleWidget title="Payments Ledger" icon={Receipt} iconColor="#D97706" iconBg="#FFFBEB" onClick={() => onNavigateTo('payments')} actionLabel="Open Full Ledger">
          <StatPill label="Total payments" value={payments.length} color="#D97706" bg="#FFFBEB" />
          <StatPill label="Total collected" value={formatCurrency(totalCollections)} color="#059669" bg="#ECFDF5" />
          {recentPayments[0] && (
            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: '#F8FAFC', borderRadius: '7px', fontSize: '0.74rem' }}>
              <span style={{ color: '#94A3B8' }}>Last: </span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{recentPayments[0].customerName}</span>
              <span style={{ float: 'right', color: '#059669', fontWeight: 800 }}>{formatCurrency(recentPayments[0].amount)}</span>
            </div>
          )}
        </ModuleWidget>

        {/* ── 4. OVERDUE RECOVERY ────────────────────────────── */}
        <ModuleWidget title="Overdue Collections & NPA" icon={AlertTriangle} iconColor={overdueCount > 0 ? '#DC2626' : '#10B981'} iconBg={overdueCount > 0 ? '#FEF2F2' : '#ECFDF5'}
          onClick={() => onNavigateTo('overdue')} actionLabel="Open Recovery Module"
          badge={overdueCount > 0 ? { label: 'Action Required', bg: '#FEF2F2', color: '#DC2626' } : { label: 'Healthy', bg: '#ECFDF5', color: '#059669' }}>
          <StatPill label="0–30 days" value={`${b0_30} accounts`} color="#D97706" bg="#FFFBEB" />
          <StatPill label="31–60 days" value={`${b31_60} accounts`} color="#DC2626" bg="#FEF2F2" />
          <StatPill label="61–90 days" value={`${b61_90} accounts`} color="#B91C1C" bg="#FEE2E2" />
          <StatPill label="90+ days (NPA)" value={`${b90plus} accounts`} color="#7F1D1D" bg="#FEE2E2" />
        </ModuleWidget>

        {/* ── 5. LOAN APPLICATIONS ───────────────────────────── */}
        <ModuleWidget title="Loan Applications" icon={FileCheck} iconColor="#0284C7" iconBg="#F0F9FF" onClick={() => onNavigateTo('applications')} actionLabel="Open Application Workflow"
          badge={pendingApps.length > 0 ? { label: `${pendingApps.length} Pending`, bg: '#FFFBEB', color: '#D97706' } : null}>
          <StatPill label="Total applications" value={applications.length} color="#0284C7" bg="#F0F9FF" />
          <StatPill label="Pending / Under Review" value={pendingApps.length} color={pendingApps.length > 0 ? '#D97706' : '#94A3B8'} bg={pendingApps.length > 0 ? '#FFFBEB' : '#F8FAFC'} />
          <StatPill label="Approved" value={approvedApps.length} color="#059669" bg="#ECFDF5" />
        </ModuleWidget>

        {/* ── 6. ANALYTICS ───────────────────────────────────── */}
        <ModuleWidget title="Portfolio Analytics & PAR" icon={BarChart3} iconColor="#7C3AED" iconBg="#F5F3FF" onClick={() => onNavigateTo('analytics')} actionLabel="Open Analytics Dashboard">
          <StatPill label="Total disbursed" value={formatCurrency(totalFinanced)} color="#7C3AED" bg="#F5F3FF" />
          <StatPill label="Market outstanding" value={formatCurrency(outstanding)} color="#D97706" bg="#FFFBEB" />
          <StatPill label="Interest profit" value={formatCurrency(totalInterest)} color="#059669" bg="#ECFDF5" />
        </ModuleWidget>

        {/* ── 7. DUE CALENDAR ────────────────────────────────── */}
        <ModuleWidget title="Installment Due Calendar" icon={Calendar} iconColor="#0891B2" iconBg="#ECFEFF" onClick={() => onNavigateTo('calendar')} actionLabel="Open Due Calendar">
          {upcomingDues.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center', padding: '0.5rem 0' }}>No dues in next 7 days</div>
          ) : (
            upcomingDues.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.6rem', background: '#ECFEFF', borderRadius: '6px', marginBottom: '0.3rem' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>{d.name}</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748B' }}>{d.date}</div>
                </div>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0891B2' }}>{formatCurrency(d.amount)}</span>
              </div>
            ))
          )}
        </ModuleWidget>

        {/* ── 8. KYC DOCS VAULT ──────────────────────────────── */}
        <ModuleWidget title="KYC & Legal Docs Vault" icon={FolderCheck} iconColor="#0369A1" iconBg="#F0F9FF" onClick={() => onNavigateTo('docsVault')} actionLabel="Open Document Vault"
          badge={pendingKYC > 0 ? { label: `${pendingKYC} Pending`, bg: '#FFFBEB', color: '#D97706' } : null}>
          <StatPill label="Total documents uploaded" value={totalDocs} color="#0369A1" bg="#F0F9FF" />
          <StatPill label="KYC Verified borrowers" value={verifiedKYC} color="#059669" bg="#ECFDF5" />
          <StatPill label="Under review" value={pendingKYC} color={pendingKYC > 0 ? '#D97706' : '#94A3B8'} bg={pendingKYC > 0 ? '#FFFBEB' : '#F8FAFC'} />
        </ModuleWidget>

        {/* ── 9. CASHIER DAY-BOOK ─────────────────────────────── */}
        <ModuleWidget title="Cashier Day-Book" icon={Wallet} iconColor="#065F46" iconBg="#ECFDF5" onClick={() => onNavigateTo('dayBook')} actionLabel="Open Day-Book & Handover">
          {(() => {
            const todayStr2 = new Date().toISOString().split('T')[0];
            const todayPayments = payments.filter(p => p.timestamp?.startsWith(todayStr2));
            const todayCash = todayPayments.filter(p => p.paymentMode === 'Cash').reduce((s, p) => s + (p.amount || 0), 0);
            const todayUPI  = todayPayments.filter(p => p.paymentMode !== 'Cash').reduce((s, p) => s + (p.amount || 0), 0);
            return (
              <>
                <StatPill label="Today's cash collected" value={formatCurrency(todayCash)} color="#065F46" bg="#ECFDF5" />
                <StatPill label="Today's UPI / online" value={formatCurrency(todayUPI)} color="#4F46E5" bg="#EEF2FF" />
                <StatPill label="Total receipts today" value={todayPayments.length} color="#0F172A" bg="#F8FAFC" />
              </>
            );
          })()}
        </ModuleWidget>

        {/* ── 10. NOTIFICATIONS ──────────────────────────────── */}
        <ModuleWidget title="Notifications & Alerts" icon={Bell} iconColor="#DC2626" iconBg="#FEF2F2" onClick={() => onNavigateTo('notifications')} actionLabel="View All Alerts"
          badge={alertCount > 0 ? { label: `${alertCount} Active`, bg: '#FEF2F2', color: '#DC2626' } : { label: 'All Clear', bg: '#ECFDF5', color: '#059669' }}>
          <StatPill label="Overdue EMI alerts" value={overdueCount} color={overdueCount > 0 ? '#DC2626' : '#94A3B8'} bg={overdueCount > 0 ? '#FEF2F2' : '#F8FAFC'} />
          <StatPill label="KYC pending review" value={pendingKYC} color={pendingKYC > 0 ? '#D97706' : '#94A3B8'} bg={pendingKYC > 0 ? '#FFFBEB' : '#F8FAFC'} />
          <StatPill label="Pending applications" value={pendingApps.length} color={pendingApps.length > 0 ? '#D97706' : '#94A3B8'} bg={pendingApps.length > 0 ? '#FFFBEB' : '#F8FAFC'} />
        </ModuleWidget>

        {/* ── 11. REPORTS ────────────────────────────────────── */}
        <ModuleWidget title="Reports & Statements" icon={ClipboardList} iconColor="#0F172A" iconBg="#F1F5F9" onClick={() => onNavigateTo('reports')} actionLabel="Generate Reports">
          {(() => {
            const d = new Date();
            const thisMonthPayments = payments.filter(p => {
              const pd = new Date(p.timestamp);
              return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
            });
            const thisMonthTotal = thisMonthPayments.reduce((s, p) => s + (p.amount || 0), 0);
            const monthLabel = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            return (
              <>
                <StatPill label={`${monthLabel} collections`} value={formatCurrency(thisMonthTotal)} color="#059669" bg="#ECFDF5" />
                <StatPill label="Monthly receipts" value={thisMonthPayments.length} color="#0F172A" bg="#F8FAFC" />
                <StatPill label="Available report types" value="3" color="#4F46E5" bg="#EEF2FF" />
              </>
            );
          })()}
        </ModuleWidget>

        {/* ── 12. BYAJ CALCULATOR ────────────────────────────── */}
        <ModuleWidget title="Byaj & EMI Calculator" icon={Calculator} iconColor="#7C3AED" iconBg="#F5F3FF" onClick={() => onNavigateTo('byajCalc')} actionLabel="Open Calculator">
          <div style={{ background: '#F5F3FF', borderRadius: '8px', padding: '0.65rem 0.8rem', fontSize: '0.78rem', color: '#4C1D95', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Quick Reference Rates</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Daily 100-day scheme</span><span style={{ fontWeight: 700 }}>1% / day</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Monthly flat byaj</span><span style={{ fontWeight: 700 }}>1.5–3%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Reducing balance EMI</span><span style={{ fontWeight: 700 }}>Configurable</span></div>
          </div>
        </ModuleWidget>

        {/* ── 13. STAFF & TEAM ───────────────────────────────── */}
        <ModuleWidget title="Staff & Team" icon={UserCheck} iconColor="#B45309" iconBg="#FFFBEB" onClick={() => onNavigateTo('staff')} actionLabel="Manage Team">
          <StatPill label="Total staff members" value={staffMembers.length} color="#B45309" bg="#FFFBEB" />
          <StatPill label="Active agents" value={staffMembers.filter(s => s.status === 'Active').length} color="#059669" bg="#ECFDF5" />
          <StatPill label="Collection agents" value={staffMembers.filter(s => s.role?.toLowerCase().includes('collection') || s.role?.toLowerCase().includes('field')).length} color="#0369A1" bg="#F0F9FF" />
        </ModuleWidget>

        {/* ── 14. ONBOARDING ─────────────────────────────────── */}
        <ModuleWidget title="Onboard New Borrower" icon={UserPlus} iconColor="#059669" iconBg="#ECFDF5" onClick={() => onNavigateTo('onboarding')} actionLabel="Start Onboarding Wizard">
          <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '0.65rem 0.8rem', fontSize: '0.78rem', color: '#14532D', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Onboarding Checklist</div>
            {['Personal details & photo', 'Aadhaar card upload', 'PAN card upload', 'Guarantor details', 'Loan disbursement'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#FFF', fontSize: '0.5rem', fontWeight: 900 }}>✓</span>
                </div>
                {step}
              </div>
            ))}
          </div>
        </ModuleWidget>

        {/* ── 15. FINANCE PRODUCTS ───────────────────────────── */}
        <ModuleWidget title="Finance Products" icon={CreditCard} iconColor="#0284C7" iconBg="#F0F9FF" onClick={() => onNavigateTo('products')} actionLabel="View Product Catalog">
          <StatPill label="Active loan products" value={financeAccounts.length > 0 ? [...new Set(financeAccounts.map(a => a.productName))].length : 0} color="#0284C7" bg="#F0F9FF" />
          <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
            Configure daily/monthly byaj interest rates, tenure and disbursement rules for each loan product.
          </div>
        </ModuleWidget>

        {/* ── 16. USER ACCESS ────────────────────────────────── */}
        <ModuleWidget title="User Access & Permissions" icon={ShieldCheck} iconColor="#4F46E5" iconBg="#EEF2FF" onClick={() => onNavigateTo('userManagement')} actionLabel="Manage User Access">
          <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '0.4rem' }}>
            Logged in as: <strong style={{ color: '#0F172A' }}>{currentUser?.name}</strong>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '8px', background: currentUser?.role === 'Admin' ? '#EEF2FF' : '#ECFDF5', color: currentUser?.role === 'Admin' ? '#4F46E5' : '#059669' }}>
              {currentUser?.role}
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '8px', background: '#F8FAFC', color: '#475569' }}>
              {currentUser?.allowedModules?.length || 0} Modules
            </span>
          </div>
        </ModuleWidget>

        {/* ── 17. AUDIT LOGS ─────────────────────────────────── */}
        <ModuleWidget title="Audit Trail & Logs" icon={FileText} iconColor="#475569" iconBg="#F8FAFC" onClick={() => onNavigateTo('audit')} actionLabel="View Audit Logs">
          <StatPill label="Total audit events" value={0} color="#475569" bg="#F8FAFC" />
          <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
            Tamper-evident log of every transaction, login, disbursal, and system change.
          </div>
        </ModuleWidget>

      </div>

      {/* ── ACTIVE LOANS TABLE ──────────────────────────────── */}
      {financeAccounts.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.4rem', marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Landmark size={17} color="#059669" /> Active Disbursed Loans ({financeAccounts.length})
            </h3>
            <button onClick={() => onNavigateTo('customer360')} className="btn-secondary" style={{ fontSize: '0.74rem', padding: '0.3rem 0.7rem', fontWeight: 700 }}>
              View All →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  {['Borrower', 'Principal', 'Scheme', 'Next Due', 'Passbook'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: h === 'Passbook' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financeAccounts.slice(0, 5).map(acc => {
                  const nextEmi = acc.emiSchedule?.find(s => s.status !== 'paid');
                  return (
                    <tr key={acc.id} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => onOpenPassbook && onOpenPassbook(acc)}>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{acc.customerName}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{acc.customerPhone || acc.id}</div>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(acc.financedAmount)}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.77rem', color: '#64748B' }}>{acc.productName}</td>
                      <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.77rem', color: '#1E293B', fontWeight: 600 }}>
                        {nextEmi ? `${nextEmi.dueDate} (${formatCurrency(nextEmi.emiAmount)})` : 'Fully Paid'}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <button onClick={e => { e.stopPropagation(); onOpenPassbook && onOpenPassbook(acc); }} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.22rem 0.5rem' }}>
                          <Printer size={11} /> Statement
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────── */}
      {financeAccounts.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, #FFF 0%, #F8FAFC 100%)', border: '2px dashed #CBD5E1', borderRadius: '16px', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Sparkles size={28} color="#4F46E5" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Ready for Real Finance Operations!</h2>
          <p style={{ maxWidth: '520px', margin: '0 auto 1.4rem auto', color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5 }}>
            All demo data cleared. Click below to disburse a real loan with Aadhaar & PAN documents.
          </p>
          <button onClick={onOpenDisburseLoan} className="btn-emerald" style={{ fontSize: '0.92rem', padding: '0.7rem 1.5rem', fontWeight: 800 }}>
            + Disburse Real Loan (Aadhaar + PAN)
          </button>
        </div>
      )}

    </div>
  );
}
