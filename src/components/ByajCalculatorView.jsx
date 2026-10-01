import React, { useState } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Clock, 
  Printer, 
  CheckCircle2, 
  Share2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  PieChart,
  Calendar,
  Sparkles,
  Sun,
  Repeat
} from 'lucide-react';
import { formatINR, calculateFixRepayment } from '../utils/financeCalc';
import { formatCurrency } from '../utils/financeEngine';

export default function ByajCalculatorView({ onOpenDisburseLoan }) {
  const [calcType, setCalcType] = useState('fix_total'); // 'fix_total', 'monthly_flat', 'daily_scheme', 'reducing_emi'
  
  // Fix Total Specific State
  const [principal, setPrincipal] = useState(50000);
  const [fixTargetReturn, setFixTargetReturn] = useState(60000);
  const [fixFrequency, setFixFrequency] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [fixKistMode, setFixKistMode] = useState('by_amount'); // 'by_amount', 'by_count'
  const [fixInstallmentAmount, setFixInstallmentAmount] = useState(1000);
  const [fixTotalCount, setFixTotalCount] = useState(60);

  // Standard Interest Schemes State
  const [ratePct, setRatePct] = useState(2.0); // 2% per month
  const [tenure, setTenure] = useState(12); // 12 months or 100 days
  const [processingFeePct, setProcessingFeePct] = useState(0);

  // Calculations
  const p = Math.max(0, Number(principal) || 0);
  const r = Math.max(0, Number(ratePct) || 0);
  const t = Math.max(1, Number(tenure) || 1);
  const pfPct = Math.max(0, Number(processingFeePct) || 0);

  let totalInterest = 0;
  let totalPayable = 0;
  let emiAmount = 0;
  let totalInstallmentCount = 1;
  let installmentFrequency = 'Monthly';

  if (calcType === 'fix_total') {
    const target = Math.max(p, Number(fixTargetReturn) || p);
    totalPayable = target;
    totalInterest = Math.max(0, target - p);

    if (fixKistMode === 'by_amount') {
      const singleKist = Math.max(1, Number(fixInstallmentAmount) || 1000);
      emiAmount = singleKist;
      totalInstallmentCount = Math.ceil(target / singleKist);
    } else {
      const count = Math.max(1, Number(fixTotalCount) || 100);
      totalInstallmentCount = count;
      emiAmount = Math.round(target / count);
    }

    installmentFrequency = fixFrequency === 'daily' ? 'Daily' : fixFrequency === 'weekly' ? 'Weekly' : 'Monthly';
  } else if (calcType === 'monthly_flat') {
    // Flat monthly interest: Interest = P * (rate/100) * months
    totalInterest = Math.round(p * (r / 100) * t);
    totalPayable = p + totalInterest;
    emiAmount = Math.round(totalPayable / t);
    totalInstallmentCount = t;
    installmentFrequency = 'Monthly';
  } else if (calcType === 'daily_scheme') {
    // e.g. 100 days daily scheme: rate is total flat interest % for the tenure
    totalInterest = Math.round(p * (r / 100));
    totalPayable = p + totalInterest;
    emiAmount = Math.round(totalPayable / t);
    totalInstallmentCount = t;
    installmentFrequency = 'Daily';
  } else if (calcType === 'reducing_emi') {
    // Annual rate reducing EMI
    const monthlyRate = (r / 100);
    if (monthlyRate === 0) {
      emiAmount = Math.round(p / t);
      totalPayable = p;
      totalInterest = 0;
    } else {
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, t)) / (Math.pow(1 + monthlyRate, t) - 1);
      emiAmount = Math.round(emi);
      totalPayable = Math.round(emiAmount * t);
      totalInterest = totalPayable - p;
    }
    totalInstallmentCount = t;
    installmentFrequency = 'Monthly';
  }

  const processingFee = Math.round(p * (pfPct / 100));
  const netInHand = p - processingFee;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let text = '';
    if (calcType === 'fix_total') {
      const freqLabel = fixFrequency === 'daily' ? 'Daily' : fixFrequency === 'weekly' ? 'Weekly' : 'Monthly';
      const unitLabel = fixFrequency === 'daily' ? 'Days' : fixFrequency === 'weekly' ? 'Weeks' : 'Months';
      text = `*DHANSHRI ASSOCIATES - LOAN QUOTATION SLIP*\n━━━━━━━━━━━━━━━━━━━━\n📋 *Fixed Total Repayment Scheme*\n💰 Principal Disbursed: ₹${p.toLocaleString('en-IN')}\n🎯 Total Target Repayment: ₹${totalPayable.toLocaleString('en-IN')}\n📈 Total Expected Profit: ₹${totalInterest.toLocaleString('en-IN')}\n\n🗓️ Payment Frequency: ${freqLabel}\n💵 Installment Amount: ₹${emiAmount.toLocaleString('en-IN')} / ${unitLabel.slice(0, -1)}\n🔢 Total Duration: ${totalInstallmentCount} ${unitLabel}\n━━━━━━━━━━━━━━━━━━━━\n✅ *Repayment Summary: ₹${emiAmount.toLocaleString('en-IN')} × ${totalInstallmentCount} = ₹${totalPayable.toLocaleString('en-IN')}*\nThank you - Dhanshri Associates`;
    } else {
      text = `*DHANSHRI ASSOCIATES - LOAN ESTIMATE*\nPrincipal: ₹${p.toLocaleString('en-IN')}\nType: ${calcType === 'daily_scheme' ? 'Daily Collection Scheme' : calcType === 'monthly_flat' ? 'Monthly Flat Byaj' : 'Reducing EMI'}\nDuration: ${t} ${installmentFrequency === 'Daily' ? 'Days' : 'Months'}\nInterest Rate: ${r}% / month\n${installmentFrequency} Installment: ₹${emiAmount.toLocaleString('en-IN')}\nTotal Interest: ₹${totalInterest.toLocaleString('en-IN')}\nNet In Hand: ₹${netInHand.toLocaleString('en-IN')}\nTotal Repayment: ₹${totalPayable.toLocaleString('en-IN')}`;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} color="#D97706" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Interest & EMI Loan Quotation Calculator
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Compare Flat monthly interest, 100-day daily collection schemes, and reducing balance EMI.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleWhatsAppShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.9rem',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#047857',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Share2 size={14} /> Share WhatsApp Estimate
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.9rem',
              background: '#0F172A',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={14} /> Print Quotation
          </button>
        </div>
      </div>

      {/* Grid: Inputs Left, Calculated Result Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left: Input Form Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.2rem' }}>
            1. Select Lending Scheme & Terms
          </h3>

          {/* Scheme Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1.4rem' }}>
            <button
              onClick={() => { setCalcType('fix_total'); setPrincipal(50000); setFixTargetReturn(60000); }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '8px',
                border: calcType === 'fix_total' ? '2px solid #059669' : '1px solid #E2E8F0',
                background: calcType === 'fix_total' ? '#ECFDF5' : '#FFF',
                color: calcType === 'fix_total' ? '#059669' : '#475569',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Fixed Total Return Scheme
            </button>

            <button
              onClick={() => { setCalcType('monthly_flat'); setRatePct(2.0); setTenure(12); }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '8px',
                border: calcType === 'monthly_flat' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                background: calcType === 'monthly_flat' ? '#EEF2FF' : '#FFF',
                color: calcType === 'monthly_flat' ? '#4F46E5' : '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Monthly Flat Interest (% / mo)
            </button>

            <button
              onClick={() => { setCalcType('daily_scheme'); setRatePct(20.0); setTenure(100); }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '8px',
                border: calcType === 'daily_scheme' ? '2px solid #D97706' : '1px solid #E2E8F0',
                background: calcType === 'daily_scheme' ? '#FFFBEB' : '#FFF',
                color: calcType === 'daily_scheme' ? '#D97706' : '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Daily 100-Day Scheme (Market)
            </button>

            <button
              onClick={() => { setCalcType('reducing_emi'); setRatePct(1.5); setTenure(12); }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '8px',
                border: calcType === 'reducing_emi' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                background: calcType === 'reducing_emi' ? '#EFF6FF' : '#FFF',
                color: calcType === 'reducing_emi' ? '#2563EB' : '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Reducing Bank EMI
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Principal */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                {calcType === 'fix_total' ? 'Principal Disbursed (₹)' : 'Principal Amount (₹)'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#059669', fontWeight: 800, fontSize: '1.1rem' }}>₹</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                {[10000, 25000, 50000, 100000, 200000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setPrincipal(amt);
                      if (calcType === 'fix_total') {
                        setFixTargetReturn(Math.round(amt * 1.2));
                      }
                    }}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: '#F1F5F9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                  >
                    ₹{(amt / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* IF FIX TOTAL SCHEME */}
            {calcType === 'fix_total' && (
              <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '10px', border: '1px solid #A7F3D0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Total Target */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065F46', display: 'block', marginBottom: '0.35rem' }}>
                    Total Target Repayment (₹) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#059669', fontWeight: 800, fontSize: '1.1rem' }}>₹</span>
                    <input
                      type="number"
                      value={fixTargetReturn}
                      onChange={(e) => setFixTargetReturn(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2rem', borderRadius: '8px', border: '2px solid #059669', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065F46', display: 'block', marginBottom: '0.35rem' }}>
                    Payment Frequency
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[
                      { id: 'daily', label: '☀️ Daily' },
                      { id: 'weekly', label: '📅 Weekly' },
                      { id: 'monthly', label: '📆 Monthly' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFixFrequency(f.id)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.4rem',
                          borderRadius: '6px',
                          border: fixFrequency === f.id ? '2px solid #059669' : '1px solid #CBD5E1',
                          background: fixFrequency === f.id ? '#059669' : '#FFF',
                          color: fixFrequency === f.id ? '#FFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Switch & Input */}
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setFixKistMode('by_amount')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        border: fixKistMode === 'by_amount' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                        background: fixKistMode === 'by_amount' ? '#EEF2FF' : '#FFF',
                        color: fixKistMode === 'by_amount' ? '#4338CA' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        cursor: 'pointer'
                      }}
                    >
                      ₹ Set Installment Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setFixKistMode('by_count')}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.5rem',
                        borderRadius: '6px',
                        border: fixKistMode === 'by_count' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                        background: fixKistMode === 'by_count' ? '#EEF2FF' : '#FFF',
                        color: fixKistMode === 'by_count' ? '#4338CA' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        cursor: 'pointer'
                      }}
                    >
                      🔢 Set Duration
                    </button>
                  </div>

                  {fixKistMode === 'by_amount' ? (
                    <div>
                      <input
                        type="number"
                        value={fixInstallmentAmount}
                        onChange={(e) => setFixInstallmentAmount(e.target.value)}
                        placeholder="e.g. 1000"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 800, color: '#4F46E5' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                        ➔ Fully settled in {totalInstallmentCount} {fixFrequency === 'daily' ? 'Days' : fixFrequency === 'weekly' ? 'Weeks' : 'Months'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        value={fixTotalCount}
                        onChange={(e) => setFixTotalCount(e.target.value)}
                        placeholder="e.g. 100"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 800, color: '#4F46E5' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                        ➔ Installment amount: ₹{emiAmount.toLocaleString('en-IN')} per {fixFrequency === 'daily' ? 'day' : fixFrequency === 'weekly' ? 'week' : 'month'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STANDARD INTEREST RATE INPUTS */}
            {calcType !== 'fix_total' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                      {calcType === 'daily_scheme' ? 'Total Flat Interest (%)' : 'Monthly Rate (% / Month)'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={ratePct}
                        onChange={(e) => setRatePct(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1.8rem 0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748B', fontWeight: 800, fontSize: '0.8rem' }}>%</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                      {calcType !== 'daily_scheme' && `${(ratePct * 12).toFixed(1)}% annual equivalent`}
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                      Duration ({calcType === 'daily_scheme' ? 'Days' : 'Months'})
                    </label>
                    <input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}
                    />
                  </div>
                </div>

                {/* Processing Fee */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                    Documentation & Processing Fee Deduction (%)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={processingFeePct}
                      onChange={(e) => setProcessingFeePct(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 1.8rem 0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: 700 }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748B', fontWeight: 800, fontSize: '0.8rem' }}>%</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    Deducted upfront: {formatINR(processingFee)}
                  </span>
                </div>
              </>
            )}

            {onOpenDisburseLoan && (
              <button
                type="button"
                onClick={onOpenDisburseLoan}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: '#059669',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Disburse This Loan Now <ArrowRight size={16} />
              </button>
            )}

          </div>
        </div>

        {/* Right: Calculated Loan Estimate Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderRadius: '16px',
          padding: '1.8rem',
          color: '#FFF',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dhanshri Loan Estimate
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                  {calcType === 'fix_total' ? '🌟 Fixed Total Return Plan' : calcType === 'daily_scheme' ? 'Daily Collection Plan' : calcType === 'monthly_flat' ? 'Monthly Flat Interest Plan' : 'Reducing Balance Plan'}
                </h4>
              </div>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#34D399', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                Active Quotation
              </span>
            </div>

            {/* Big Installment Amount */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.4rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                {installmentFrequency} Installment Amount
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34D399', margin: '0.2rem 0' }}>
                {formatINR(emiAmount)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                for {totalInstallmentCount} {calcType === 'fix_total' ? (fixFrequency === 'daily' ? 'Days' : fixFrequency === 'weekly' ? 'Weeks' : 'Months') : (installmentFrequency === 'Daily' ? 'Days' : 'Months')} = Total Repayment of {formatINR(totalPayable)}
              </div>
            </div>

            {/* Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94A3B8' }}>Principal Financed:</span>
                <span style={{ fontWeight: 800, color: '#FFF' }}>{formatINR(p)}</span>
              </div>

              {processingFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#94A3B8' }}>Upfront Processing Fee ({pfPct}%):</span>
                  <span style={{ fontWeight: 700, color: '#F87171' }}>- {formatINR(processingFee)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94A3B8' }}>Expected Net Profit:</span>
                <span style={{ fontWeight: 800, color: '#FBBF24' }}>+ {formatINR(totalInterest)} ({p > 0 ? ((totalInterest / p) * 100).toFixed(1) : 0}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94A3B8' }}>Repayment Terms:</span>
                <span style={{ fontWeight: 800, color: '#38BDF8' }}>₹{emiAmount.toLocaleString('en-IN')} × {totalInstallmentCount} installments</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.3rem' }}>
                <span style={{ color: '#FFF', fontWeight: 800 }}>Total Repayment Target:</span>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#34D399' }}>{formatINR(totalPayable)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Auto-calculated by Dhanshri Associates</span>
            <span>Transparent & simple lending agreement</span>
          </div>
        </div>

      </div>

    </div>
  );
}
