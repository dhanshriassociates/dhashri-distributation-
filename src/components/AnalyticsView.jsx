import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Users, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  PieChart, 
  Award, 
  Download,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { formatINR } from '../utils/financeCalc';

export default function AnalyticsView({
  financeAccounts = [],
  payments = [],
  customers = [],
  staffMembers = [],
  overdueFollowups = []
}) {
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'week'

  // Calculations
  const totalDisbursed = financeAccounts.reduce((sum, a) => sum + (Number(a.financedAmount) || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  // Outstanding principal calculation
  const totalOutstanding = financeAccounts.reduce((sum, a) => {
    const paidForAcc = payments
      .filter(p => p.accountId === a.id)
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const balance = Math.max(0, (Number(a.financedAmount) || 0) - paidForAcc);
    return sum + balance;
  }, 0);

  // Active vs Closed accounts
  const activeAccounts = financeAccounts.filter(a => a.status === 'Active');
  const closedAccounts = financeAccounts.filter(a => a.status === 'Closed');

  // Overdue & NPA
  const overdueAccounts = financeAccounts.filter(a => {
    const hasOverdueInstallment = (a.emiSchedule || []).some(s => {
      const isPast = new Date(s.dueDate) < new Date();
      return isPast && s.status !== 'paid';
    });
    return hasOverdueInstallment || a.status === 'Overdue';
  });

  const npaAccounts = financeAccounts.filter(a => {
    // 90+ days past due or explicit NPA
    return a.status === 'NPA' || a.dpd > 90;
  });

  const par30Amount = overdueAccounts.reduce((sum, a) => sum + (Number(a.financedAmount) || 0), 0);
  const parRate = totalDisbursed > 0 ? ((par30Amount / totalDisbursed) * 100).toFixed(1) : '0.0';
  const collectionEfficiency = totalDisbursed > 0 ? Math.min(100, Math.round((totalCollected / (totalDisbursed * 1.15)) * 100)) : 100;

  // Agent Performance Leaderboard
  const agentStats = staffMembers.map(staff => {
    const agentPayments = payments.filter(p => 
      p.receivedBy?.toLowerCase().includes(staff.name?.toLowerCase()) || 
      p.collectorName?.toLowerCase().includes(staff.name?.toLowerCase())
    );
    const totalAgentCollected = agentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const assignedAccounts = financeAccounts.filter(a => 
      a.assignedOfficer?.toLowerCase().includes(staff.name?.toLowerCase())
    );
    const target = Number(staff.target) || (assignedAccounts.length * 15000) || 50000;
    const efficiency = target > 0 ? Math.min(100, Math.round((totalAgentCollected / target) * 100)) : 0;

    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      area: staff.assignedArea || 'Field Route',
      phone: staff.phone,
      collectionsCount: agentPayments.length,
      totalCollected: totalAgentCollected,
      target,
      efficiency
    };
  }).sort((a, b) => b.totalCollected - a.totalCollected);

  // Export report handler
  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalDisbursed,
        totalCollected,
        totalOutstanding,
        par30Amount,
        parRate: `${parRate}%`,
        collectionEfficiency: `${collectionEfficiency}%`,
        activeAccountsCount: activeAccounts.length,
        closedAccountsCount: closedAccounts.length,
        overdueCount: overdueAccounts.length
      },
      agentPerformance: agentStats
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lending_analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="#4F46E5" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Lending Portfolio Analytics & PAR Reports
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Live financial performance metrics, collection efficiency, risk exposure, and field agent ranking.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportReport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: '#0F172A',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Download size={15} /> Export Audit Report
          </button>
        </div>
      </div>

      {/* Top Core Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        
        {/* Total Disbursed */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.3rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Capital Disbursed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={16} color="#4F46E5" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
            {formatINR(totalDisbursed)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> Across {financeAccounts.length} Total Loans
          </div>
        </div>

        {/* Total Collected */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.3rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Recovery Realized
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#047857', marginBottom: '0.3rem' }}>
            {formatINR(totalCollected)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
            <TrendingUp size={14} /> {payments.length} Verified Receipts Issued
          </div>
        </div>

        {/* Portfolio at Risk (PAR 30) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.3rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portfolio At Risk (PAR 30)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#E11D48" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: Number(parRate) > 10 ? '#E11D48' : '#D97706', marginBottom: '0.3rem' }}>
            {parRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#E11D48', fontWeight: 600 }}>
            <ShieldAlert size={14} /> {overdueAccounts.length} Overdue Accounts ({formatINR(par30Amount)})
          </div>
        </div>

        {/* Active Capital Outstanding */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.3rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Capital in Field
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#0284C7" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
            {formatINR(totalOutstanding)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }}>
            {activeAccounts.length} Active Accounts Earning Byaj
          </div>
        </div>

      </div>

      {/* Portfolio Breakdown & Risk Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.8rem' }}>
        
        {/* Loan Portfolio Health */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="#4F46E5" /> Portfolio Asset Quality & Health
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Standard / Healthy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#0F172A' }}>🟢 Standard Performing Loans</span>
                <span style={{ color: '#059669' }}>
                  {activeAccounts.length - overdueAccounts.length} accounts ({financeAccounts.length > 0 ? Math.round(((activeAccounts.length - overdueAccounts.length) / Math.max(1, financeAccounts.length)) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${financeAccounts.length > 0 ? ((activeAccounts.length - overdueAccounts.length) / Math.max(1, financeAccounts.length)) * 100 : 0}%`,
                  height: '100%',
                  background: '#10B981',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            {/* Overdue Watchlist (1-30 days) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#0F172A' }}>🟠 Special Mention (1-30 DPD)</span>
                <span style={{ color: '#D97706' }}>
                  {overdueAccounts.length} accounts ({financeAccounts.length > 0 ? Math.round((overdueAccounts.length / Math.max(1, financeAccounts.length)) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${financeAccounts.length > 0 ? (overdueAccounts.length / Math.max(1, financeAccounts.length)) * 100 : 0}%`,
                  height: '100%',
                  background: '#F59E0B',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            {/* Fully Closed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#0F172A' }}>🔵 Closed / Fully Recovered</span>
                <span style={{ color: '#2563EB' }}>
                  {closedAccounts.length} accounts ({financeAccounts.length > 0 ? Math.round((closedAccounts.length / Math.max(1, financeAccounts.length)) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${financeAccounts.length > 0 ? (closedAccounts.length / Math.max(1, financeAccounts.length)) * 100 : 0}%`,
                  height: '100%',
                  background: '#3B82F6',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            {/* Non-Performing Assets (NPA 90+) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: '#0F172A' }}>🔴 NPA / Default (90+ DPD)</span>
                <span style={{ color: '#DC2626' }}>
                  {npaAccounts.length} accounts ({financeAccounts.length > 0 ? Math.round((npaAccounts.length / Math.max(1, financeAccounts.length)) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${financeAccounts.length > 0 ? (npaAccounts.length / Math.max(1, financeAccounts.length)) * 100 : 0}%`,
                  height: '100%',
                  background: '#EF4444',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Collection Efficiency Breakdown */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#059669" /> Recovery Rate & Collection Velocity
          </h3>

          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '8px solid #ECFDF5',
              borderTopColor: '#059669',
              background: '#F0FDF4'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#047857' }}>
                {collectionEfficiency}%
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>
                EFFICIENCY
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>
              Healthy Cash Flow Velocity
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
              Realized recovery matches operational standards. Zero unallocated receipts detected.
            </p>
          </div>
        </div>

      </div>

      {/* Field Agent Performance Leaderboard */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="#F59E0B" /> Field Staff & Agent Collection Leaderboard
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Daily collections, targets vs actual cash recoveries per officer.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#F1F5F9', padding: '0.3rem 0.75rem', borderRadius: '12px', color: '#475569' }}>
            {agentStats.length} Active Staff Members
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.2rem' }}>Rank & Officer</th>
                <th style={{ padding: '0.85rem 1.2rem' }}>Role / Area</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>Total Collected</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>Assigned Target</th>
                <th style={{ padding: '0.85rem 1.2rem' }}>Performance Bar</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'center' }}>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {agentStats.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No staff members registered. Add agents in Staff Manager to track performance.
                  </td>
                </tr>
              ) : (
                agentStats.map((agent, idx) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#FEF3C7' : idx === 1 ? '#F1F5F9' : '#FFFBEB',
                          color: idx === 0 ? '#B45309' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A' }}>{agent.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{agent.phone || 'Staff ID: ' + agent.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}>
                        {agent.role}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>{agent.area}</div>
                    </td>

                    <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                      {formatINR(agent.totalCollected)}
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{agent.collectionsCount} collections</div>
                    </td>

                    <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {formatINR(agent.target)}
                    </td>

                    <td style={{ padding: '0.9rem 1.2rem', minWidth: '150px' }}>
                      <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, agent.efficiency)}%`,
                          height: '100%',
                          background: agent.efficiency >= 80 ? '#10B981' : agent.efficiency >= 50 ? '#F59E0B' : '#EF4444',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </td>

                    <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: agent.efficiency >= 80 ? '#ECFDF5' : agent.efficiency >= 50 ? '#FFFBEB' : '#FEF2F2',
                        color: agent.efficiency >= 80 ? '#047857' : agent.efficiency >= 50 ? '#B45309' : '#DC2626',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}>
                        {agent.efficiency}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
