import React from 'react';
import { 
  Landmark, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Receipt, 
  ArrowUpRight, 
  ShieldCheck, 
  DollarSign, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Printer,
  ChevronRight,
  ExternalLink,
  CalendarCheck
} from 'lucide-react';
import { formatCurrency, getOverdueBucket } from '../utils/financeEngine';

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
  onExportData
}) {
  // Financial Computations from Real Data
  const activeAccounts = financeAccounts.filter(a => a.status === 'Active' || a.status === 'Overdue');
  const closedAccounts = financeAccounts.filter(a => a.status === 'Closed');

  // Total Financed Capital (All disbursed loans)
  const totalFinancedAmount = financeAccounts.reduce((acc, a) => acc + (a.financedAmount || 0), 0);

  // Total Realized Collections
  const totalCollections = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPrincipalRepaid = payments.reduce((acc, p) => acc + (p.allocatedPrincipal || 0), 0);
  const totalInterestEarned = payments.reduce((acc, p) => acc + (p.allocatedInterest || 0), 0);

  // Active Market Outstanding Balance (Market me phasa / baqi balance)
  const activeMarketBalance = Math.max(0, totalFinancedAmount - totalPrincipalRepaid);

  // Total Business Turnover (All loans disbursed + Collections cash flow)
  const totalTurnover = totalFinancedAmount + totalCollections;

  // KYC Verified borrowers
  const verifiedBorrowersCount = customers.filter(c => c.kycStatus === 'Verified').length;
  const pendingKYCCount = customers.filter(c => c.kycStatus === 'Under Review' || c.kycStatus === 'Uploaded').length;

  // Overdue Aging Calculation from real emiSchedules
  let overdueAccountsCount = 0;
  let bucket0_30 = 0;
  let bucket31_60 = 0;
  let bucket61_90 = 0;
  let bucket90Plus = 0;

  activeAccounts.forEach(acc => {
    const overdueEmis = acc.emiSchedule?.filter(s => {
      if (s.status === 'overdue') return true;
      if (s.status !== 'paid' && s.dueDate) {
        const due = new Date(s.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
      }
      return false;
    }) || [];

    if (overdueEmis.length > 0) {
      overdueAccountsCount++;
      const worstDue = overdueEmis[0]?.dueDate;
      const bucket = getOverdueBucket(worstDue);
      if (bucket === '0-30 Days') bucket0_30++;
      else if (bucket === '31-60 Days') bucket31_60++;
      else if (bucket === '61-90 Days') bucket61_90++;
      else if (bucket === '90+ Days (NPA)') bucket90Plus++;
    }
  });

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Clean Non-Redundant Top Bar (Duplicates removed, clean sync & export status) */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.9rem 1.4rem',
        marginBottom: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4F46E5, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF'
          }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Executive Financial Overview
              </h2>
              <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                ● Real-Time Cloud Sync
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
              Portfolio Status: <strong>{customers.length}</strong> borrowers • <strong>{financeAccounts.length}</strong> active accounts • <strong>{payments.length}</strong> payments recorded
            </p>
          </div>
        </div>

        {/* Data Utilities (Export & Clean Reset) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onExportData && (
            <button 
              onClick={onExportData} 
              className="btn-secondary" 
              title="Export all database records to JSON"
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Download size={13} /> Export Ledger Data
            </button>
          )}

          {onResetData && (
            <button 
              onClick={onResetData} 
              className="btn-secondary" 
              title="Reset system to fresh clean start"
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={13} /> Clean Reset
            </button>
          )}
        </div>
      </div>

      {/* Hero Financial Turnover & Metric Banner (Every metric block is clickable!) */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.8rem 2rem',
        color: '#FFFFFF',
        marginBottom: '1.8rem',
        boxShadow: '0 15px 35px -5px rgba(30, 27, 75, 0.3)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.4rem',
        alignItems: 'stretch'
      }}>
        
        {/* Main Turnover Metric */}
        <div 
          onClick={() => onNavigateTo('customer360')}
          style={{
            borderRight: '1px solid rgba(255,255,255,0.12)',
            paddingRight: '1rem',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          title="Click to view all Borrowers & Loan accounts"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TOTAL BUSINESS TURNOVER
            </span>
            <ArrowUpRight size={15} color="#34D399" />
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            {formatCurrency(totalTurnover)}
          </h1>
          <span style={{ fontSize: '0.74rem', color: '#C7D2FE', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Volume: Capital Disbursed + Collections <ChevronRight size={12} />
          </span>
        </div>

        {/* Total Capital Disbursed */}
        <div 
          onClick={() => onNavigateTo('customer360')}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          title="Click to inspect all disbursed loan accounts"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              TOTAL CAPITAL DISBURSED
            </span>
            <ExternalLink size={13} color="#38BDF8" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#38BDF8', margin: '0.3rem 0 0.15rem 0' }}>
            {formatCurrency(totalFinancedAmount)}
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#BAE6FD', display: 'block' }}>
            {financeAccounts.length} Loans Given • Click to View →
          </span>
        </div>

        {/* Total Collections Received */}
        <div 
          onClick={() => onNavigateTo('payments')}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          title="Click to view Payment Ledger & Collections"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              TOTAL COLLECTIONS
            </span>
            <ExternalLink size={13} color="#34D399" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34D399', margin: '0.3rem 0 0.15rem 0' }}>
            {formatCurrency(totalCollections)}
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#A7F3D0', display: 'block' }}>
            {payments.length} Payments Realized • View Ledger →
          </span>
        </div>

        {/* Active Market Outstanding Dues */}
        <div 
          onClick={() => onNavigateTo('dailyRoute')}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          title="Click to view Today's Route & Dues planner"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              MARKET OUTSTANDING DUES
            </span>
            <ExternalLink size={13} color="#FBBF24" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FBBF24', margin: '0.3rem 0 0.15rem 0' }}>
            {formatCurrency(activeMarketBalance)}
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#FDE68A', display: 'block' }}>
            Active Dues • Open Today's Route →
          </span>
        </div>

        {/* Realized Interest Profit */}
        <div 
          onClick={() => onNavigateTo('payments')}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          title="Click to view realized interest breakdown"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              INTEREST PROFIT EARNED
            </span>
            <ExternalLink size={13} color="#A78BFA" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#A78BFA', margin: '0.3rem 0 0.15rem 0' }}>
            {formatCurrency(totalInterestEarned)}
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#DDD6FE', display: 'block' }}>
            Realized Byaj Profit • View →
          </span>
        </div>

      </div>

      {/* Secondary KPI Cards Grid (All Cards Are Clickable) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        
        {/* KPI 1: Active Accounts */}
        <div 
          onClick={() => onNavigateTo('customer360')}
          className="glass-panel" 
          style={{ padding: '1.2rem', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to view all Active Accounts in Borrowers 360"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE LOAN ACCOUNTS</span>
            <Landmark size={20} color="#059669" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{activeAccounts.length} Loans</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {closedAccounts.length} Fully Repaid • View All <ChevronRight size={11} />
          </span>
        </div>

        {/* KPI 2: Total Borrowers */}
        <div 
          onClick={() => onNavigateTo('customer360')}
          className="glass-panel" 
          style={{ padding: '1.2rem', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to open Customer 360 directory"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>REGISTERED BORROWERS</span>
            <Users size={20} color="#4F46E5" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4338CA', margin: 0 }}>{customers.length} Borrowers</h2>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            ✓ {verifiedBorrowersCount} KYC Verified • Open 360 <ChevronRight size={11} />
          </span>
        </div>

        {/* KPI 3: KYC Documents Verification Queue */}
        <div 
          onClick={() => onNavigateTo('customer360')}
          className="glass-panel" 
          style={{ padding: '1.2rem', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to review Aadhaar & PAN documents"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>AADHAAR & PAN DOCS</span>
            <ShieldCheck size={20} color="#0284C7" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369A1', margin: 0 }}>
            {customers.reduce((sum, c) => sum + (c.documents?.length || 0), 0)} Attached
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {pendingKYCCount > 0 ? `${pendingKYCCount} Pending Review` : 'All documents verified'} • View <ChevronRight size={11} />
          </span>
        </div>

        {/* KPI 4: Overdue Radar */}
        <div 
          onClick={() => onNavigateTo('overdue')}
          className="glass-panel" 
          style={{ padding: '1.2rem', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
          title="Click to view Overdue Recovery module"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>OVERDUE ACCOUNTS</span>
            <AlertTriangle size={20} color={overdueAccountsCount > 0 ? '#DC2626' : '#10B981'} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: overdueAccountsCount > 0 ? '#DC2626' : '#059669', margin: 0 }}>
            {overdueAccountsCount} Accounts
          </h2>
          <span style={{ fontSize: '0.72rem', color: overdueAccountsCount > 0 ? '#DC2626' : '#059669', fontWeight: 600, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {overdueAccountsCount > 0 ? 'Action Required • Open Recovery →' : '✓ 0 overdue portfolio'}
          </span>
        </div>

      </div>

      {/* Main Section: Zero State or Active Operations */}
      {financeAccounts.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: '2px dashed #CBD5E1',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#EEF2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.2rem auto',
            color: '#4F46E5'
          }}>
            <Sparkles size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>
            Ready for Real Finance Operations!
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.5rem auto', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            All mock data has been purged. Click the button below to disburse a real money loan while taking customer Aadhaar, PAN card, and photo documents.
          </p>

          <button 
            onClick={onOpenDisburseLoan} 
            className="btn-emerald" 
            style={{ fontSize: '0.95rem', padding: '0.75rem 1.6rem', fontWeight: 800 }}
          >
            + Disburse Real Loan (Aadhaar + PAN)
          </button>
        </div>
      ) : (
        /* Active Operations Tables Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Active Loans Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Landmark size={18} color="#059669" /> Active Disbursed Loans ({financeAccounts.length})
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Latest borrower accounts & due dates</span>
              </div>

              <button 
                onClick={() => onNavigateTo('customer360')} 
                className="btn-secondary" 
                style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
                title="View complete borrower list and dossier"
              >
                View All Borrowers →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Borrower</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Principal</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Scheme</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Next Due</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Passbook</th>
                  </tr>
                </thead>
                <tbody>
                  {financeAccounts.slice(0, 6).map(acc => {
                    const nextEmi = acc.emiSchedule?.find(s => s.status !== 'paid');
                    return (
                      <tr 
                        key={acc.id} 
                        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        onClick={() => onOpenPassbook && onOpenPassbook(acc)}
                        title="Click to view Passbook statement"
                      >
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{acc.customerName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {acc.customerPhone || acc.id} • Aadhaar: {acc.customerAadhaar || 'Verified'}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#059669' }}>
                          {formatCurrency(acc.financedAmount)}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {acc.productName}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.78rem', color: '#1E293B', fontWeight: 600 }}>
                          {nextEmi ? `${nextEmi.dueDate} (${formatCurrency(nextEmi.emiAmount)})` : 'Fully Paid'}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPassbook && onOpenPassbook(acc);
                            }}
                            className="btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                            title="View and print Passbook statement"
                          >
                            <Printer size={12} /> Statement
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Collections Feed */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Receipt size={18} color="#4F46E5" /> Realized Payment Ledger ({payments.length})
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cash & UPI collections realized</span>
              </div>

              <button 
                onClick={() => onNavigateTo('payments')} 
                className="btn-secondary" 
                style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
                title="View full Payment Ledger"
              >
                View Full Ledger →
              </button>
            </div>

            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No payment receipts logged yet. Collections recorded in Today's Route or Payments will appear here.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Receipt</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Borrower</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Mode</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 6).map(p => (
                      <tr 
                        key={p.id} 
                        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        onClick={() => onNavigateTo('payments')}
                        title="Click to view in Payments Ledger"
                      >
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#D97706' }}>
                          {p.receiptNo}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.customerName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(p.timestamp).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {p.paymentMode}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Overdue Risk Radar Strip (Clickable to jump directly to Overdue Aging) */}
      <div 
        onClick={() => onNavigateTo('overdue')}
        className="glass-panel" 
        style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}
        title="Click to inspect overdue recovery aging buckets"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <AlertTriangle size={18} color="#DC2626" /> Overdue Aging Risk Radar
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Open Overdue Collections Module <ChevronRight size={12} />
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
          {[
            { bucket: '0-30 Days Due', count: bucket0_30, color: '#D97706', bg: '#FFFBEB' },
            { bucket: '31-60 Days Overdue', count: bucket31_60, color: '#DC2626', bg: '#FEF2F2' },
            { bucket: '61-90 Days Overdue', count: bucket61_90, color: '#B91C1C', bg: '#FEE2E2' },
            { bucket: '90+ Days (NPA)', count: bucket90Plus, color: '#7F1D1D', bg: '#FEE2E2' }
          ].map(item => (
            <div 
              key={item.bucket} 
              style={{
                background: item.bg,
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', display: 'block' }}>{item.bucket}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color }}>{item.count} Accounts</span>
              </div>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
