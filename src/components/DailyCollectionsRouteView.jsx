import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  DollarSign, 
  Receipt, 
  AlertCircle, 
  Search, 
  MessageSquare, 
  X, 
  TrendingUp, 
  Send, 
  Filter,
  UserCheck,
  ChevronRight,
  Printer
} from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';
import confetti from 'canvas-confetti';

export default function DailyCollectionsRouteView({ 
  financeAccounts = [], 
  staffMembers = [], 
  payments = [], 
  onSavePayment, 
  onSaveFollowupNote, 
  onOpenPassbook 
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedOfficer, setSelectedOfficer] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, pending, collected, skipped
  const [searchQuery, setSearchQuery] = useState('');

  // Collect Modal State
  const [collectTarget, setCollectTarget] = useState(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [collectMode, setCollectMode] = useState('Cash');
  const [collectRef, setCollectRef] = useState('');

  // Skip / Reschedule Modal State
  const [skipTarget, setSkipTarget] = useState(null);
  const [skipReason, setSkipReason] = useState('Borrower requested 1-2 days extension');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [skipNotes, setSkipNotes] = useState('');

  // State to track locally skipped accounts during current session
  const [skippedAccountIds, setSkippedAccountIds] = useState({});

  // Compile daily due sheet from finance accounts' emiSchedule
  const dueItems = [];

  financeAccounts.forEach(acc => {
    if (acc.status === 'Closed') return;

    (acc.emiSchedule || []).forEach(s => {
      // Check if installment matches selected date, or if overdue up to selected date
      const isDueOnDate = s.dueDate === selectedDate;
      const isPastOverdue = s.dueDate < selectedDate && s.status !== 'paid';

      if (isDueOnDate || (selectedDate === todayStr && isPastOverdue)) {
        // Check if payment was logged today for this account
        const isPaidToday = payments.some(p => 
          p.accountId === acc.id && 
          p.installmentNo === s.installmentNo &&
          p.timestamp?.startsWith(selectedDate)
        ) || s.status === 'paid';

        const isSkipped = !!skippedAccountIds[acc.id];

        let collectionStatus = 'pending';
        if (isPaidToday) collectionStatus = 'collected';
        else if (isSkipped) collectionStatus = 'skipped';

        dueItems.push({
          id: `${acc.id}-${s.installmentNo}`,
          accountId: acc.id,
          customerId: acc.customerId,
          customerName: acc.customerName,
          customerPhone: acc.customerPhone || 'N/A',
          customerAddress: acc.customerAddress || 'Address on record',
          productName: acc.productName,
          installmentNo: s.installmentNo,
          dueDate: s.dueDate,
          emiAmount: s.emiAmount,
          principalComponent: s.principalComponent,
          interestComponent: s.interestComponent,
          assignedOfficer: acc.assignedOfficer || 'General Staff',
          collectionStatus,
          isOverdue: s.dueDate < selectedDate,
          rawAccount: acc,
          rawEmi: s
        });
      }
    });
  });

  // Calculate Daily Totals
  const totalTargetAmount = dueItems.reduce((sum, item) => sum + item.emiAmount, 0);
  const totalCollectedAmount = dueItems.filter(i => i.collectionStatus === 'collected').reduce((sum, item) => sum + item.emiAmount, 0);
  const totalPendingAmount = Math.max(0, totalTargetAmount - totalCollectedAmount);
  const collectionEfficiency = totalTargetAmount > 0 ? Math.min(100, Math.round((totalCollectedAmount / totalTargetAmount) * 100)) : 100;

  // Filter items
  const filteredDues = dueItems.filter(item => {
    if (selectedOfficer !== 'ALL' && item.assignedOfficer !== selectedOfficer) return false;
    if (statusFilter !== 'ALL' && item.collectionStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.customerName.toLowerCase().includes(q) ||
        item.accountId.toLowerCase().includes(q) ||
        item.customerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Quick Collect Money
  const handleOpenCollect = (item) => {
    setCollectTarget(item);
    setCollectAmount(item.emiAmount);
    setCollectMode('Cash');
    setCollectRef(`COL-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmCollect = (e) => {
    e.preventDefault();
    if (!collectTarget) return;

    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      id: `PAY-${Date.now()}`,
      accountId: collectTarget.accountId,
      customerName: collectTarget.customerName,
      amount: parseFloat(collectAmount),
      paymentMode: collectMode,
      referenceNo: collectRef || `REF-${Date.now()}`,
      installmentNo: collectTarget.installmentNo,
      allocatedPrincipal: collectTarget.principalComponent,
      allocatedInterest: collectTarget.interestComponent,
      receivedBy: collectTarget.assignedOfficer || 'Staff Cashier',
      timestamp: new Date().toISOString(),
      receiptNo
    };

    onSavePayment(newPayment);
    confetti({ particleCount: 70, spread: 60 });
    setCollectTarget(null);
  };

  // Handle Skip / Reschedule
  const handleOpenSkip = (item) => {
    setSkipTarget(item);
    setSkipReason('Borrower requested 1-2 days extension');
    setRescheduleDate('');
    setSkipNotes('');
  };

  const handleConfirmSkip = (e) => {
    e.preventDefault();
    if (!skipTarget) return;

    setSkippedAccountIds(prev => ({
      ...prev,
      [skipTarget.accountId]: {
        reason: skipReason,
        rescheduleDate,
        notes: skipNotes
      }
    }));

    if (onSaveFollowupNote) {
      onSaveFollowupNote({
        id: `FOL-${Date.now()}`,
        accountId: skipTarget.accountId,
        customerName: skipTarget.customerName,
        agingBucket: skipTarget.isOverdue ? '0-30 Days' : 'Due Today Followup',
        overdueDays: 1,
        amountDue: skipTarget.emiAmount,
        contactMethod: 'Field Visit',
        outcome: skipReason,
        promiseDate: rescheduleDate || 'Pending',
        assignedAgent: skipTarget.assignedOfficer,
        lastContactDate: selectedDate,
        notes: `Skipped collection on ${selectedDate}. Reason: ${skipReason}. ${skipNotes ? `Notes: ${skipNotes}` : ''}`
      });
    }

    setSkipTarget(null);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="var(--accent-indigo)" /> Today's Collection Sheet & Staff Route Planner
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Track who to collect money from today, assign routes to staff, and mark payments or skip notes with 1 click.
          </p>
        </div>

        {/* Date Selector Quick Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedDate(todayStr)} 
            className={selectedDate === todayStr ? 'btn-indigo' : 'btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            Today ({todayStr})
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}
          />
        </div>
      </div>

      {/* Target & Collection KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.1rem', borderLeft: '5px solid var(--accent-indigo)' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Due on {selectedDate}</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
            {formatCurrency(totalTargetAmount)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{dueItems.length} Installments scheduled</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem', borderLeft: '5px solid #059669' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Collected Today</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
            {formatCurrency(totalCollectedAmount)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
            {dueItems.filter(i => i.collectionStatus === 'collected').length} Borrowers paid
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem', borderLeft: '5px solid #DC2626' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Collection</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: totalPendingAmount > 0 ? '#DC2626' : '#059669', marginTop: '0.2rem' }}>
            {formatCurrency(totalPendingAmount)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {dueItems.filter(i => i.collectionStatus === 'pending').length} Borrowers pending
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem', borderLeft: '5px solid #D97706' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Collection Progress</span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
            {collectionEfficiency}%
          </h3>
          <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
            <div style={{ width: `${collectionEfficiency}%`, height: '100%', background: collectionEfficiency >= 80 ? '#059669' : '#D97706', borderRadius: '3px' }} />
          </div>
        </div>
      </div>

      {/* Filter and Staff Selector Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Dues (${dueItems.length})` },
            { id: 'pending', label: `Pending (${dueItems.filter(i => i.collectionStatus === 'pending').length})` },
            { id: 'collected', label: `Collected Today (${dueItems.filter(i => i.collectionStatus === 'collected').length})` },
            { id: 'skipped', label: `Skipped / Rescheduled (${dueItems.filter(i => i.collectionStatus === 'skipped').length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: statusFilter === f.id ? 700 : 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: statusFilter === f.id ? 'var(--accent-indigo)' : '#F1F5F9',
                color: statusFilter === f.id ? '#FFF' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Staff / Officer Dropdown & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Staff:</span>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            >
              <option value="ALL">All Officers / Staff</option>
              {staffMembers.map(s => (
                <option key={s.id} value={s.name}>👤 {s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search borrower or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', width: '200px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

      </div>

      {/* Due Sheet Route Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Borrower & Contact</th>
              <th style={{ padding: '0.85rem 1rem' }}>Loan Scheme</th>
              <th style={{ padding: '0.85rem 1rem' }}>Due Date</th>
              <th style={{ padding: '0.85rem 1rem' }}>Assigned Officer</th>
              <th style={{ padding: '0.85rem 1rem' }}>Amount Due Today</th>
              <th style={{ padding: '0.85rem 1rem' }}>Collection Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDues.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
                    No Pending Dues for Selected Date & Filter
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    All collections for this day are either completed or no installments are scheduled.
                  </p>
                </td>
              </tr>
            ) : (
              filteredDues.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: item.collectionStatus === 'collected' ? '#F0FDF4' : 'transparent' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.customerName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <Phone size={12} color="#059669" />
                      <a href={`tel:${item.customerPhone}`} style={{ color: 'var(--accent-indigo)', textDecoration: 'none', fontWeight: 600 }}>
                        {item.customerPhone}
                      </a>
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.84rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Account: {item.accountId}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: item.isOverdue ? '#DC2626' : '#0F172A' }}>
                      {item.dueDate}
                    </span>
                    {item.isOverdue && (
                      <span style={{ fontSize: '0.68rem', display: 'block', color: '#DC2626', fontWeight: 700 }}>
                        Past Overdue!
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    👤 {item.assignedOfficer}
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: item.collectionStatus === 'collected' ? '#059669' : '#0F172A' }}>
                      {formatCurrency(item.emiAmount)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      Principal: {formatCurrency(item.principalComponent)} | Int: {formatCurrency(item.interestComponent)}
                    </div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    {item.collectionStatus === 'collected' ? (
                      <span style={{ fontSize: '0.74rem', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '0.2rem 0.55rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={13} /> Paid Today
                      </span>
                    ) : item.collectionStatus === 'skipped' ? (
                      <span style={{ fontSize: '0.74rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '0.2rem 0.55rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> Skipped / Extension
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '0.2rem 0.55rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertCircle size={13} /> Pending Collection
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      
                      {item.collectionStatus !== 'collected' && (
                        <button
                          onClick={() => handleOpenCollect(item)}
                          className="btn-emerald"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', fontWeight: 700 }}
                          title="Collect payment now"
                        >
                          <Receipt size={13} /> Collect ₹
                        </button>
                      )}

                      {item.collectionStatus === 'pending' && (
                        <button
                          onClick={() => handleOpenSkip(item)}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#B45309' }}
                          title="Mark as skipped / extension requested"
                        >
                          Skip / Later
                        </button>
                      )}

                      <button
                        onClick={() => onOpenPassbook && onOpenPassbook(item.rawAccount)}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
                        title="View Account Passbook"
                      >
                        <Printer size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Collect Modal */}
      {collectTarget && (
        <div className="modal-overlay" onClick={() => setCollectTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Collect Payment: {collectTarget.customerName}
                </h3>
              </div>
              <button onClick={() => setCollectTarget(null)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmCollect}>
              <div style={{ background: '#F8FAFC', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Account: <strong>{collectTarget.accountId}</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Installment #{collectTarget.installmentNo} Due</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Borrower: {collectTarget.customerName}</span>
                  <span>Officer: {collectTarget.assignedOfficer}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Payment Mode
                  </label>
                  <select value={collectMode} onChange={(e) => setCollectMode(e.target.value)} className="form-select">
                    <option value="Cash">Cash Handover</option>
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Reference / UTR / Note
                  </label>
                  <input
                    type="text"
                    value={collectRef}
                    onChange={(e) => setCollectRef(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Amount Received (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#059669' }}>₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2rem', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setCollectTarget(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-emerald">
                  <CheckCircle2 size={16} /> Confirm Collection & Issue Receipt
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Skip / Reschedule Modal */}
      {skipTarget && (
        <div className="modal-overlay" onClick={() => setSkipTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="#D97706" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Record Extension / Skip Collection
                </h3>
              </div>
              <button onClick={() => setSkipTarget(null)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmSkip}>
              <div style={{ background: '#FEF3C7', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <span style={{ color: '#92400E', fontWeight: 700 }}>
                  Borrower {skipTarget.customerName} is not paying today ({formatCurrency(skipTarget.emiAmount)} due).
                </span>
                <p style={{ color: '#78350F', fontSize: '0.74rem', marginTop: '0.2rem' }}>
                  Logging a reason ensures staff accountability and creates a dated follow-up entry in the recovery records.
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Primary Reason for Non-Payment *
                </label>
                <select value={skipReason} onChange={(e) => setSkipReason(e.target.value)} className="form-select">
                  <option value="Borrower requested 1-2 days extension">Borrower requested 1-2 days extension</option>
                  <option value="Borrower shop / business closed today">Borrower shop / business closed today</option>
                  <option value="Borrower out of town / travel">Borrower out of town / travel</option>
                  <option value="Phone not reachable / switched off">Phone not reachable / switched off</option>
                  <option value="Borrower refused to pay / dispute">Borrower refused to pay / dispute</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Promised Repayment Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Field Agent Notes & Remarks
                </label>
                <textarea
                  rows={2}
                  value={skipNotes}
                  onChange={(e) => setSkipNotes(e.target.value)}
                  placeholder="e.g. Spoke to borrower's brother, promised payment tomorrow at 11 AM..."
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setSkipTarget(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-indigo">
                  Save Extension Record
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
