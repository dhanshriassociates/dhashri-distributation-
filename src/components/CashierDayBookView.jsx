import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  IndianRupee, 
  Lock, 
  Unlock,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { formatINR } from '../utils/financeCalc';

export default function CashierDayBookView({
  payments = [],
  financeAccounts = [],
  staffMembers = [],
  currentUser
}) {
  const [openingBalance, setOpeningBalance] = useState(() => {
    return Number(localStorage.getItem('fms_daybook_opening')) || 25000;
  });
  const [isEditingOpening, setIsEditingOpening] = useState(false);
  const [openingInput, setOpeningInput] = useState(openingBalance);

  // Today date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's payments
  const todayPayments = payments.filter(p => {
    const pDate = p.date ? p.date.split('T')[0] : '';
    return pDate === todayStr || !p.date; // include recent if date not formatted
  });

  // Segregate Cash vs UPI/Digital
  const cashPayments = todayPayments.filter(p => p.mode === 'Cash' || !p.mode);
  const digitalPayments = todayPayments.filter(p => p.mode && p.mode !== 'Cash');

  const totalCashCollected = cashPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalDigitalCollected = digitalPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  // Today's Cash Disbursals
  const todayDisbursals = financeAccounts.filter(a => {
    const aDate = a.startDate ? a.startDate.split('T')[0] : '';
    return aDate === todayStr && a.payoutMode === 'Cash';
  });
  const totalCashDisbursed = todayDisbursals.reduce((s, a) => s + (Number(a.financedAmount) || 0), 0);

  // Net Cash in Drawer
  const closingCashInDrawer = openingBalance + totalCashCollected - totalCashDisbursed;

  // Handover state per staff member
  const [handovers, setHandovers] = useState(() => {
    const saved = localStorage.getItem('fms_daybook_handovers_' + todayStr);
    return saved ? JSON.parse(saved) : {};
  });

  const handleUpdateHandover = (staffId, depositedAmount) => {
    const updated = {
      ...handovers,
      [staffId]: {
        deposited: Number(depositedAmount) || 0,
        verified: true,
        verifiedAt: new Date().toLocaleTimeString(),
        verifiedBy: currentUser?.name || 'Cashier'
      }
    };
    setHandovers(updated);
    localStorage.setItem('fms_daybook_handovers_' + todayStr, JSON.stringify(updated));
  };

  const handleSaveOpening = () => {
    const val = Number(openingInput) || 0;
    setOpeningBalance(val);
    localStorage.setItem('fms_daybook_opening', val.toString());
    setIsEditingOpening(false);
  };

  const handlePrintDayBook = () => {
    window.print();
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#059669" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Cashier Day-Book & Agent Cash Handover
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Daily cash drawer reconciliation, field agent collections handover, and evening closing balance.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handlePrintDayBook}
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
              cursor: 'pointer'
            }}
          >
            <Printer size={15} /> Print Daily Day-Book
          </button>
        </div>
      </div>

      {/* Cash Drawer Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
        
        {/* Morning Opening Cash */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.25rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Opening Cash in Drawer
            </span>
            <button
              onClick={() => setIsEditingOpening(!isEditingOpening)}
              style={{ background: 'transparent', border: 'none', color: '#4F46E5', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isEditingOpening ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingOpening ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="number"
                value={openingInput}
                onChange={(e) => setOpeningInput(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}
              />
              <button
                onClick={handleSaveOpening}
                style={{ padding: '0.4rem 0.75rem', background: '#059669', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
                {formatINR(openingBalance)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                Day Start Vault Float
              </div>
            </>
          )}
        </div>

        {/* Total Cash Collected Today */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.25rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              (+) Cash Collections
            </span>
            <ArrowDownCircle size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
            {formatINR(totalCashCollected)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>
            {cashPayments.length} Physical Cash Receipts
          </div>
        </div>

        {/* Cash Disbursed Today */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.25rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              (-) Cash Disbursals
            </span>
            <ArrowUpCircle size={18} color="#E11D48" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E11D48' }}>
            {formatINR(totalCashDisbursed)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#E11D48', marginTop: '0.2rem', fontWeight: 600 }}>
            {todayDisbursals.length} New Loan Payouts
          </div>
        </div>

        {/* Closing Cash in Drawer */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderRadius: '14px',
          padding: '1.25rem',
          color: '#FFF',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
              (=) Closing Cash In Drawer
            </span>
            <Lock size={16} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34D399' }}>
            {formatINR(closingCashInDrawer)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            Physical Cash to be Counted & Tapered
          </div>
        </div>

        {/* Digital / UPI Collections */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '1.25rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Bank / UPI Collections
            </span>
            <CreditCard size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>
            {formatINR(totalDigitalCollected)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
            Direct Bank Credit ({digitalPayments.length} transactions)
          </div>
        </div>

      </div>

      {/* Field Agent Cash Handover Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="#059669" /> Field Agent Evening Cash Handover Register
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Verify physical cash brought by each agent vs receipts logged in the system.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569', background: '#F1F5F9', padding: '0.3rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>
            Date: {todayStr}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.2rem' }}>Field Officer</th>
                <th style={{ padding: '0.85rem 1.2rem' }}>Territory / Area</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>Logged Receipts</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>Cash Deposited (₹)</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'center' }}>Tally Difference</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'center' }}>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No field staff members found.
                  </td>
                </tr>
              ) : (
                staffMembers.map(staff => {
                  const staffCashPayments = cashPayments.filter(p => 
                    p.receivedBy?.toLowerCase().includes(staff.name?.toLowerCase()) || 
                    p.collectorName?.toLowerCase().includes(staff.name?.toLowerCase())
                  );
                  const loggedTotal = staffCashPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
                  const handoverData = handovers[staff.id] || { deposited: loggedTotal, verified: false };
                  const diff = handoverData.deposited - loggedTotal;

                  return (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{staff.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{staff.phone || staff.role}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', color: '#475569', fontWeight: 600 }}>
                        {staff.assignedArea || 'Field Route'}
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                        {formatINR(loggedTotal)}
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                          {staffCashPayments.length} cash receipts
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                        <input
                          type="number"
                          defaultValue={handoverData.deposited}
                          onBlur={(e) => handleUpdateHandover(staff.id, e.target.value)}
                          disabled={handoverData.verified}
                          style={{
                            width: '110px',
                            padding: '0.35rem 0.6rem',
                            textAlign: 'right',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: handoverData.verified ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                            background: handoverData.verified ? '#ECFDF5' : '#FFF',
                            color: '#0F172A'
                          }}
                        />
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                        {diff === 0 ? (
                          <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.76rem', background: '#ECFDF5', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            Matched (₹0)
                          </span>
                        ) : diff > 0 ? (
                          <span style={{ color: '#0284C7', fontWeight: 800, fontSize: '0.76rem', background: '#F0F9FF', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            +₹{diff} (Excess)
                          </span>
                        ) : (
                          <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '0.76rem', background: '#FEF2F2', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            -₹{Math.abs(diff)} (Shortage)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                        {handoverData.verified ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>
                            <CheckCircle2 size={16} /> Verified {handoverData.verifiedAt}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateHandover(staff.id, loggedTotal)}
                            style={{
                              padding: '0.35rem 0.8rem',
                              background: '#059669',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Verify & Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
