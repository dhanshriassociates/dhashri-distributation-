import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Download, Printer,
  Calendar, Users, Landmark, Receipt, AlertTriangle, CheckCircle2,
  ChevronDown, Filter
} from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';

export default function ReportsView({
  financeAccounts = [],
  payments = [],
  customers = [],
  staffMembers = [],
  overdueFollowups = []
}) {
  const [activeReport, setActiveReport] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Monthly Collections Report
  const monthlyStats = useMemo(() => {
    const [yr, mo] = selectedMonth.split('-').map(Number);
    const monthPayments = payments.filter(p => {
      const d = new Date(p.timestamp);
      return d.getFullYear() === yr && d.getMonth() + 1 === mo;
    });

    const totalCollected = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalPrincipal = monthPayments.reduce((s, p) => s + (p.allocatedPrincipal || 0), 0);
    const totalInterest = monthPayments.reduce((s, p) => s + (p.allocatedInterest || 0), 0);
    const cashCount = monthPayments.filter(p => p.paymentMode === 'Cash').length;
    const upiCount = monthPayments.filter(p => p.paymentMode !== 'Cash').length;

    // Group by day
    const byDay = {};
    monthPayments.forEach(p => {
      const day = new Date(p.timestamp).getDate();
      byDay[day] = (byDay[day] || 0) + (p.amount || 0);
    });
    const maxDay = Math.max(...Object.values(byDay), 1);

    return { monthPayments, totalCollected, totalPrincipal, totalInterest, cashCount, upiCount, byDay, maxDay };
  }, [payments, selectedMonth]);

  // Portfolio Report
  const portfolioStats = useMemo(() => {
    const active = financeAccounts.filter(a => a.status === 'Active' || a.status === 'Overdue');
    const closed = financeAccounts.filter(a => a.status === 'Closed');
    const totalDisbursed = financeAccounts.reduce((s, a) => s + (a.financedAmount || 0), 0);
    const totalRepaid = payments.reduce((s, p) => s + (p.allocatedPrincipal || 0), 0);
    const outstanding = Math.max(0, totalDisbursed - totalRepaid);
    const totalInterestEarned = payments.reduce((s, p) => s + (p.allocatedInterest || 0), 0);

    // By product
    const byProduct = {};
    financeAccounts.forEach(a => {
      const key = a.productName || 'Unknown';
      if (!byProduct[key]) byProduct[key] = { count: 0, amount: 0 };
      byProduct[key].count++;
      byProduct[key].amount += a.financedAmount || 0;
    });

    return { active: active.length, closed: closed.length, totalDisbursed, outstanding, totalInterestEarned, byProduct };
  }, [financeAccounts, payments]);

  // Overdue Recovery Report
  const overdueStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = { b0_30: [], b31_60: [], b61_90: [], b90plus: [] };

    financeAccounts.forEach(acc => {
      const overdueEmis = (acc.emiSchedule || []).filter(e => {
        if (e.status === 'paid') return false;
        return new Date(e.dueDate) < today;
      });
      if (overdueEmis.length > 0) {
        const days = Math.floor((today - new Date(overdueEmis[0].dueDate)) / 86400000);
        const entry = { name: acc.customerName, days, amount: overdueEmis.reduce((s, e) => s + (e.emiAmount || 0), 0), phone: acc.customerPhone };
        if (days <= 30) buckets.b0_30.push(entry);
        else if (days <= 60) buckets.b31_60.push(entry);
        else if (days <= 90) buckets.b61_90.push(entry);
        else buckets.b90plus.push(entry);
      }
    });
    return buckets;
  }, [financeAccounts]);

  const handlePrint = () => window.print();

  const reports = [
    { id: 'monthly', label: 'Monthly Collection Report', icon: Calendar },
    { id: 'portfolio', label: 'Portfolio Summary', icon: Landmark },
    { id: 'overdue', label: 'Overdue Recovery Report', icon: AlertTriangle },
  ];

  const [yr, mo] = selectedMonth.split('-').map(Number);
  const monthLabel = new Date(yr, mo - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px',
        padding: '1.2rem 1.6rem', marginBottom: '1.2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={20} color="#4F46E5" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Reports & Statements</h2>
            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.1rem 0 0 0' }}>Printable financial reports for operations & compliance</p>
          </div>
        </div>
        <button onClick={handlePrint} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 1rem', borderRadius: '8px',
          background: '#0F172A', color: '#FFF', border: 'none',
          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
        }}>
          <Printer size={14} /> Print Report
        </button>
      </div>

      {/* Report Type Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setActiveReport(r.id)} style={{
              padding: '0.5rem 1.1rem', borderRadius: '10px',
              border: `1.5px solid ${activeReport === r.id ? '#4F46E5' : '#E2E8F0'}`,
              background: activeReport === r.id ? '#4F46E5' : '#FFF',
              color: activeReport === r.id ? '#FFF' : '#334155',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}>
              <Icon size={14} /> {r.label}
            </button>
          );
        })}
      </div>

      {/* ===== MONTHLY COLLECTION REPORT ===== */}
      {activeReport === 'monthly' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Select Month:</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', fontWeight: 600 }} />
          </div>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            {[
              { label: 'Total Collected', value: formatCurrency(monthlyStats.totalCollected), color: '#059669', bg: '#ECFDF5' },
              { label: 'Principal Repaid', value: formatCurrency(monthlyStats.totalPrincipal), color: '#4F46E5', bg: '#EEF2FF' },
              { label: 'Interest Earned', value: formatCurrency(monthlyStats.totalInterest), color: '#D97706', bg: '#FFFBEB' },
              { label: 'Total Receipts', value: `${monthlyStats.monthPayments.length}`, color: '#0284C7', bg: '#F0F9FF' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.2rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.3rem 0' }}>{item.label}</p>
                <p style={{ fontSize: '1.45rem', fontWeight: 900, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Daily Bar Chart */}
          <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>Daily Collection — {monthLabel}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', overflowX: 'auto' }}>
              {Array.from({ length: new Date(yr, mo, 0).getDate() }, (_, i) => i + 1).map(day => {
                const amount = monthlyStats.byDay[day] || 0;
                const height = amount > 0 ? Math.max(8, (amount / monthlyStats.maxDay) * 100) : 3;
                return (
                  <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', width: '22px' }} title={`Day ${day}: ${formatCurrency(amount)}`}>
                    <div style={{ width: '16px', height: `${height}px`, background: amount > 0 ? '#4F46E5' : '#F1F5F9', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                    <span style={{ fontSize: '0.55rem', color: '#94A3B8', marginTop: '3px' }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipts Table */}
          <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
              Payment Receipts — {monthLabel} ({monthlyStats.monthPayments.length})
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    {['Receipt No.', 'Borrower', 'Date', 'Mode', 'Principal', 'Interest', 'Total'].map(h => (
                      <th key={h} style={{ padding: '0.65rem 0.9rem', textAlign: h === 'Total' ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.monthPayments.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem' }}>No payments recorded in {monthLabel}</td></tr>
                  ) : (
                    monthlyStats.monthPayments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.7rem 0.9rem', color: '#D97706', fontWeight: 700 }}>{p.receiptNo}</td>
                        <td style={{ padding: '0.7rem 0.9rem', fontWeight: 600, color: '#0F172A' }}>{p.customerName}</td>
                        <td style={{ padding: '0.7rem 0.9rem', color: '#64748B' }}>{new Date(p.timestamp).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '0.7rem 0.9rem' }}>
                          <span style={{ background: p.paymentMode === 'Cash' ? '#ECFDF5' : '#EEF2FF', color: p.paymentMode === 'Cash' ? '#059669' : '#4F46E5', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>{p.paymentMode || 'Cash'}</span>
                        </td>
                        <td style={{ padding: '0.7rem 0.9rem', color: '#0284C7', fontWeight: 600 }}>{formatCurrency(p.allocatedPrincipal || 0)}</td>
                        <td style={{ padding: '0.7rem 0.9rem', color: '#D97706', fontWeight: 600 }}>{formatCurrency(p.allocatedInterest || 0)}</td>
                        <td style={{ padding: '0.7rem 0.9rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>{formatCurrency(p.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {monthlyStats.monthPayments.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#F8FAFC', fontWeight: 800 }}>
                      <td colSpan={4} style={{ padding: '0.7rem 0.9rem', color: '#334155' }}>TOTAL — {monthLabel}</td>
                      <td style={{ padding: '0.7rem 0.9rem', color: '#0284C7' }}>{formatCurrency(monthlyStats.totalPrincipal)}</td>
                      <td style={{ padding: '0.7rem 0.9rem', color: '#D97706' }}>{formatCurrency(monthlyStats.totalInterest)}</td>
                      <td style={{ padding: '0.7rem 0.9rem', textAlign: 'right', color: '#059669' }}>{formatCurrency(monthlyStats.totalCollected)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== PORTFOLIO SUMMARY ===== */}
      {activeReport === 'portfolio' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            {[
              { label: 'Active Accounts', value: portfolioStats.active, color: '#059669', bg: '#ECFDF5' },
              { label: 'Total Disbursed', value: formatCurrency(portfolioStats.totalDisbursed), color: '#4F46E5', bg: '#EEF2FF' },
              { label: 'Outstanding Balance', value: formatCurrency(portfolioStats.outstanding), color: '#D97706', bg: '#FFFBEB' },
              { label: 'Interest Profit Earned', value: formatCurrency(portfolioStats.totalInterestEarned), color: '#DC2626', bg: '#FEF2F2' },
              { label: 'Loans Closed', value: portfolioStats.closed, color: '#0284C7', bg: '#F0F9FF' },
              { label: 'Total Borrowers', value: customers.length, color: '#475569', bg: '#F8FAFC' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.2rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.3rem 0' }}>{item.label}</p>
                <p style={{ fontSize: '1.45rem', fontWeight: 900, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* By Product */}
          <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>Loan Portfolio by Product</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left' }}>Product Name</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>No. of Loans</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(portfolioStats.byProduct).map(([name, data]) => (
                  <tr key={name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F172A' }}>{name}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#4F46E5', fontWeight: 700 }}>{data.count}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>{formatCurrency(data.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== OVERDUE RECOVERY REPORT ===== */}
      {activeReport === 'overdue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'b0_30', label: '0–30 Days Overdue', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { key: 'b31_60', label: '31–60 Days Overdue', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
            { key: 'b61_90', label: '61–90 Days Overdue', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
            { key: 'b90plus', label: '90+ Days (NPA Risk)', color: '#7F1D1D', bg: '#FEE2E2', border: '#EF4444' },
          ].map(bucket => {
            const entries = overdueStats[bucket.key];
            return (
              <div key={bucket.key} style={{ background: '#FFF', border: `1.5px solid ${bucket.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '0.85rem 1.2rem', background: bucket.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: bucket.color, fontSize: '0.88rem' }}>{bucket.label}</span>
                  <span style={{ background: bucket.color, color: '#FFF', padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {entries.length} account{entries.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {entries.length === 0 ? (
                  <p style={{ padding: '0.75rem 1.2rem', color: '#94A3B8', fontSize: '0.82rem', margin: 0 }}>No accounts in this bucket.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>
                        <th style={{ padding: '0.55rem 1rem', textAlign: 'left' }}>Borrower</th>
                        <th style={{ padding: '0.55rem 1rem', textAlign: 'center' }}>Days Overdue</th>
                        <th style={{ padding: '0.55rem 1rem', textAlign: 'right' }}>Overdue Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#0F172A' }}>{e.name}
                            {e.phone && <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>{e.phone}</div>}
                          </td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'center', color: bucket.color, fontWeight: 800 }}>{e.days} days</td>
                          <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 800, color: '#DC2626' }}>{formatCurrency(e.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
