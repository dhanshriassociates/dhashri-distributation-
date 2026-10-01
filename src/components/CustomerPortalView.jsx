import React, { useState } from 'react';
import { User, Landmark, Lock, Receipt, Calendar, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { formatINR } from '../utils/financeCalc';

export default function CustomerPortalView({ customers, loans, collections, onOpenNewLoan }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const customerLoans = loans.filter(l => l.customerId === activeCustomer?.id || l.customerName === activeCustomer?.name);

  const totalBorrowed = customerLoans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalInterestPaid = collections
    .filter(c => customerLoans.some(l => l.id === c.loanId))
    .reduce((acc, c) => acc + c.amountPaid, 0);

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Customer Switcher Banner */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #10B981)', color: '#FFF', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeCustomer?.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Welcome, {activeCustomer?.name}</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeCustomer?.city} • Phone: {activeCustomer?.phone} • Credit Rating: <strong style={{ color: '#10B981' }}>{activeCustomer?.rating}</strong>
            </p>
          </div>
        </div>

        {/* Switch Customer Dropdown for demo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select Customer:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Customer Financial Overview KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MY ACTIVE LOANS</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.3rem' }}>
            {customerLoans.length} Loans
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Borrowed: {formatINR(totalBorrowed)}</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INTEREST PAID</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '0.3rem' }}>
            {formatINR(totalInterestPaid)}
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Realized collections</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button onClick={onOpenNewLoan} className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
            <PlusCircle size={16} /> Request Loan Top-Up
          </button>
        </div>

      </div>

      {/* Customer Loan Accounts List */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Landmark size={18} color="#3B82F6" /> My Active Loan Accounts & Pledged Collaterals
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {customerLoans.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No active loan accounts found for this customer profile.
          </div>
        ) : (
          customerLoans.map(loan => (
            <div key={loan.id} className="glass-panel" style={{ padding: '1.4rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>Loan Account {loan.id}</h4>
                    <span className={`status-badge ${loan.status}`}>{loan.status}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Disbursed on {loan.startDate} • Assigned Agent: <strong style={{ color: '#60A5FA' }}>{loan.agentName}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Principal Amount</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24' }}>{formatINR(loan.principalAmount)}</h3>
                </div>
              </div>

              {/* Detail Chips Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Interest Rate</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10B981' }}>
                    {loan.byajType === 'Monthly % Byaj' ? `${loan.monthlyRatePct}% / mo` : `₹${loan.dailyRateRupees} / day`}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Next Due Date</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>{loan.nextDueDate}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Pledged Collateral</span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Lock size={12} /> {loan.collateralType}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Interest Paid</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38BDF8' }}>{formatINR(loan.totalByajCollected || 0)}</div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
