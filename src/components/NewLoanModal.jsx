import React, { useState } from 'react';
import { X, PlusCircle, Landmark, ShieldCheck, User, Calendar, Lock } from 'lucide-react';
import { formatINR } from '../utils/financeCalc';

export default function NewLoanModal({ customers, teamMembers, activeRole, onClose, onSaveLoan }) {
  const [customerName, setCustomerName] = useState(customers[0]?.name || 'Rajesh Kumar');
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [byajType, setByajType] = useState('Monthly % Byaj');
  const [monthlyRatePct, setMonthlyRatePct] = useState(2.0);
  const [dailyRateRupees, setDailyRateRupees] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [agentName, setAgentName] = useState(teamMembers[0]?.name || 'Ramesh Verma');

  const [collateralType, setCollateralType] = useState('Gold Jewellery');
  const [collateralDetails, setCollateralDetails] = useState('50g 22K Gold Ornaments');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!principalAmount || principalAmount <= 0) return;

    const matchedCustomer = customers.find(c => c.name === customerName) || customers[0];
    const matchedAgent = teamMembers.find(a => a.name === agentName) || teamMembers[0];

    // Calculate next due date (1 month from start date)
    const nextDue = new Date(startDate);
    nextDue.setMonth(nextDue.getMonth() + 1);

    // If agent submits, status is 'pending_approval' (or active if admin)
    const status = activeRole === 'admin' ? 'active' : 'pending_approval';

    const newLoan = {
      id: `LN-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      customerId: matchedCustomer.id,
      customerName: matchedCustomer.name,
      agentId: matchedAgent.id,
      agentName: matchedAgent.name,
      principalAmount: parseFloat(principalAmount),
      byajType,
      monthlyRatePct: parseFloat(monthlyRatePct),
      dailyRateRupees: parseFloat(dailyRateRupees),
      startDate,
      nextDueDate: nextDue.toISOString().split('T')[0],
      status,
      collateralType,
      collateralDetails,
      totalByajCollected: 0,
      totalPrincipalRepaid: 0,
      notes: `Disbursed by ${matchedAgent.name} on ${startDate}`
    };

    onSaveLoan(newLoan);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Landmark size={22} color="#F59E0B" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Disburse New Money Loan</h3>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Customer Selection */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Debtor Customer Profile
            </label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.95rem', fontWeight: 600 }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.name}>
                  👤 {c.name} ({c.city}) • Rating: {c.rating}
                </option>
              ))}
            </select>
          </div>

          {/* Principal & Byaj Type Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Principal Loan Amount (₹)
              </label>
              <input
                type="number"
                required
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FBBF24' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Interest Mode
              </label>
              <select value={byajType} onChange={(e) => setByajType(e.target.value)} className="form-select">
                <option value="Monthly % Byaj">Monthly % Interest Rate</option>
                <option value="Daily Roj Byaj">Daily Fixed Interest (₹/day)</option>
              </select>
            </div>

          </div>

          {/* Rate & Start Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
            
            {byajType === 'Monthly % Byaj' ? (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Monthly Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={monthlyRatePct}
                  onChange={(e) => setMonthlyRatePct(e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: '0.72rem', color: '#10B981' }}>
                  Yield: {formatINR((principalAmount * monthlyRatePct) / 100)} / month
                </span>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Daily Interest Rate (₹ / Day)
                </label>
                <input
                  type="number"
                  value={dailyRateRupees}
                  onChange={(e) => setDailyRateRupees(e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: '0.72rem', color: '#10B981' }}>
                  Yield: {formatINR(dailyRateRupees * 30)} / month
                </span>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Disbursal Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>

          </div>

          {/* Collateral Asset Vault Section */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.2rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={15} color="#F59E0B" /> Collateral Security Asset Vault
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  Asset Type
                </label>
                <select value={collateralType} onChange={(e) => setCollateralType(e.target.value)} className="form-select" style={{ fontSize: '0.82rem' }}>
                  <option value="Gold Jewellery">Gold Jewellery / Ornaments</option>
                  <option value="Post Dated Cheques">Post Dated Blank Cheques</option>
                  <option value="Vehicle RC">Vehicle Original RC & Key</option>
                  <option value="Property Registry">Property Registry Paper</option>
                  <option value="Promissory Note">Promissory Note & Affidavit</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  Assigned Recovery Agent
                </label>
                <select value={agentName} onChange={(e) => setAgentName(e.target.value)} className="form-select" style={{ fontSize: '0.82rem' }}>
                  {teamMembers.map(a => (
                    <option key={a.id} value={a.name}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Asset Description & Valuation
              </label>
              <input
                type="text"
                value={collateralDetails}
                onChange={(e) => setCollateralDetails(e.target.value)}
                placeholder="e.g. 100g 22k Gold, Bank Cheque Nos #40129"
                className="form-input"
                style={{ fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
              {activeRole === 'admin' ? 'Disburse Capital Now' : 'Submit for Owner Approval'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
