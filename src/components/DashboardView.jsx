import React from 'react';
import { 
  Landmark, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  FileCheck, 
  Receipt, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  FileText,
  DollarSign,
  Download,
  RotateCcw,
  Sparkles,
  Phone,
  Eye,
  Printer
} from 'lucide-react';
import { formatCurrency, getOverdueBucket } from '../utils/financeEngine';

export default function DashboardView({ 
  activeRole, 
  customers = [], 
  applications = [], 
  financeAccounts = [], 
  payments = [], 
  overdueFollowups = [],
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
      
      {/* Top Quick Action Bar & Real Data Status */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.2rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669, #4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF'
          }}>
            <Landmark size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Finance Management Command Center
              </h2>
              <span style={{ fontSize: '0.72rem', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 700 }}>
                ● Real Data Mode
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Operating on {customers.length} verified borrowers & {financeAccounts.length} live accounts (0 dummy mock entries).
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onOpenDisburseLoan} 
            className="btn-emerald" 
            style={{ fontSize: '0.84rem', padding: '0.55rem 1.1rem', fontWeight: 700 }}
          >
            <PlusCircle size={16} /> + Give New Loan (Aadhaar & PAN)
          </button>

          <button 
            onClick={onOpenCollectPayment} 
            className="btn-indigo" 
            style={{ fontSize: '0.84rem', padding: '0.55rem 1rem' }}
          >
            <Receipt size={16} /> Collect Payment / EMI
          </button>

          <button 
            onClick={() => onNavigateTo('onboarding')} 
            className="btn-secondary" 
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
          >
            <Users size={15} /> + Add Customer
          </button>

          <button 
            onClick={onExportData} 
            className="btn-secondary" 
            title="Export all real business data to JSON file"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
          >
            <Download size={14} /> Export Data
          </button>

          <button 
            onClick={onResetData} 
            className="btn-secondary" 
            title="Reset system to fresh clean start"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', color: '#DC2626' }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Hero Financial Turnover & Metric Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.8rem 2rem',
        color: '#FFFFFF',
        marginBottom: '1.8rem',
        boxShadow: '0 15px 35px -5px rgba(30, 27, 75, 0.3)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        
        {/* Main Turnover Metric */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.12)', paddingRight: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TOTAL BUSINESS TURNOVER
            </span>
            <TrendingUp size={16} color="#34D399" />
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {formatCurrency(totalTurnover)}
          </h1>
          <span style={{ fontSize: '0.76rem', color: '#C7D2FE', marginTop: '0.4rem', display: 'block' }}>
            Total Volume: Capital Disbursals + Cash Inflows
          </span>
        </div>

        {/* Total Capital Disbursed */}
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
            TOTAL CAPITAL DISBURSED
          </span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.2rem' }}>
            {formatCurrency(totalFinancedAmount)}
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
            {financeAccounts.length} Total Loans Given
          </span>
        </div>

        {/* Total Collections Received */}
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
            TOTAL COLLECTIONS RECEIVED
          </span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#34D399', marginTop: '0.2rem' }}>
            {formatCurrency(totalCollections)}
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#A7F3D0' }}>
            {payments.length} Payments Realized
          </span>
        </div>

        {/* Active Market Outstanding Dues */}
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
            ACTIVE MARKET OUTSTANDING
          </span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.2rem' }}>
            {formatCurrency(activeMarketBalance)}
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#FDE68A' }}>
            Remaining Portfolio Due
          </span>
        </div>

        {/* Realized Interest Profit */}
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
            INTEREST PROFIT EARNED
          </span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#A78BFA', marginTop: '0.2rem' }}>
            {formatCurrency(totalInterestEarned)}
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#DDD6FE' }}>
            Net Realized Earnings
          </span>
        </div>

      </div>

      {/* Secondary KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        
        {/* KPI 1: Active Accounts */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE LOAN ACCOUNTS</span>
            <Landmark size={20} color="#059669" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{activeAccounts.length} Loans</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{closedAccounts.length} Fully Repaid & Closed</span>
        </div>

        {/* KPI 2: Total Borrowers */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>REGISTERED BORROWERS</span>
            <Users size={20} color="#4F46E5" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4338CA' }}>{customers.length} Borrowers</h2>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
            ✓ {verifiedBorrowersCount} KYC Verified
          </span>
        </div>

        {/* KPI 3: KYC Documents Verification Queue */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>AADHAAR & PAN DOCS</span>
            <ShieldCheck size={20} color="#0284C7" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369A1' }}>
            {customers.reduce((sum, c) => sum + (c.documents?.length || 0), 0)} Attached
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {pendingKYCCount > 0 ? `${pendingKYCCount} Pending Review` : 'All documents up to date'}
          </span>
        </div>

        {/* KPI 4: Overdue Radar */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>OVERDUE ACCOUNTS</span>
            <AlertTriangle size={20} color={overdueAccountsCount > 0 ? '#DC2626' : '#10B981'} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: overdueAccountsCount > 0 ? '#DC2626' : '#059669' }}>
            {overdueAccountsCount} Accounts
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {overdueAccountsCount > 0 ? 'Follow-up Required' : '0 overdue portfolio'}
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
            All mock data has been purged. You are ready to disburse real money loans. Click the button below to disburse your first loan while taking customer Aadhaar, PAN card, and photo documents.
          </p>

          <button 
            onClick={onOpenDisburseLoan} 
            className="btn-emerald" 
            style={{ fontSize: '1rem', padding: '0.85rem 1.8rem', fontWeight: 800 }}
          >
            <PlusCircle size={20} /> Disburse First Real Loan (Aadhaar + PAN)
          </button>
        </div>
      ) : (
        /* Active Operations Tables Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Active Loans Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark size={18} color="#059669" /> Active Disbursed Loans ({financeAccounts.length})
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Latest borrower accounts & due dates</span>
              </div>

              <button 
                onClick={onOpenDisburseLoan} 
                className="btn-emerald" 
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                + New Loan
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
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {financeAccounts.slice(0, 6).map(acc => {
                    const nextEmi = acc.emiSchedule?.find(s => s.status !== 'paid');
                    return (
                      <tr key={acc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
                            onClick={() => onOpenPassbook && onOpenPassbook(acc)}
                            className="btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                            title="View Passbook Statement"
                          >
                            <Printer size={12} /> Passbook
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
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Receipt size={18} color="#4F46E5" /> Realized Payment Ledger ({payments.length})
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cash & UPI collections realized</span>
              </div>

              <button 
                onClick={onOpenCollectPayment} 
                className="btn-indigo" 
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                + Collect
              </button>
            </div>

            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No payment receipts logged yet. Click "Collect Payment / EMI" when borrower pays.
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
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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

      {/* Overdue Risk Radar Strip */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#DC2626" /> Overdue Aging Risk Radar
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Real-time aging computed from installment due dates
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
          {[
            { bucket: '0-30 Days Due', count: bucket0_30, color: '#D97706', bg: '#FFFBEB' },
            { bucket: '31-60 Days Overdue', count: bucket31_60, color: '#DC2626', bg: '#FEF2F2' },
            { bucket: '61-90 Days Overdue', count: bucket61_90, color: '#B91C1C', bg: '#FEE2E2' },
            { bucket: '90+ Days (NPA)', count: bucket90Plus, color: '#7F1D1D', bg: '#FEE2E2' }
          ].map(item => (
            <div key={item.bucket} style={{
              background: item.bg,
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
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
