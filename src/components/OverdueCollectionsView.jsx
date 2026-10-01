import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Receipt, 
  Printer, 
  Search, 
  ShieldAlert, 
  Plus, 
  Clock, 
  X, 
  MessageSquare, 
  FileText 
} from 'lucide-react';
import { formatCurrency, getOverdueBucket } from '../utils/financeEngine';
import confetti from 'canvas-confetti';

export default function OverdueCollectionsView({ 
  financeAccounts = [], 
  overdueFollowups = [], 
  onSaveFollowupNote, 
  onOpenCollectPayment, 
  onOpenPassbook 
}) {
  const [selectedBucketFilter, setSelectedBucketFilter] = useState('ALL'); // ALL, 0-30 Days, 31-60 Days, 61-90 Days, 90+ Days (NPA)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Follow-up Modal State
  const [activeFollowupAccount, setActiveFollowupAccount] = useState(null);
  const [contactMethod, setContactMethod] = useState('Phone Call');
  const [outcome, setOutcome] = useState('Promised to Pay');
  const [promiseDate, setPromiseDate] = useState('');
  const [notesText, setNotesText] = useState('');
  const [agentName, setAgentName] = useState('Recovery Officer');

  // Compute live overdue accounts from financeAccounts
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dynamicOverdueList = [];

  financeAccounts.forEach(acc => {
    // Only examine active or overdue accounts
    if (acc.status === 'Closed') return;

    const overdueEmis = (acc.emiSchedule || []).filter(s => {
      if (s.status === 'overdue') return true;
      if (s.status !== 'paid' && s.dueDate) {
        const d = new Date(s.dueDate);
        return d < today;
      }
      return false;
    });

    if (overdueEmis.length > 0) {
      // Sort to get oldest due date
      const sorted = [...overdueEmis].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      const oldest = sorted[0];
      const oldestDate = new Date(oldest.dueDate);
      const diffTime = Math.max(0, today - oldestDate);
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const agingBucket = getOverdueBucket(oldest.dueDate);
      const totalOverdueAmount = overdueEmis.reduce((sum, s) => sum + (s.emiAmount || 0), 0);

      // Latest follow-up notes for this account
      const pastFollowup = overdueFollowups.find(f => f.accountId === acc.id);

      dynamicOverdueList.push({
        id: `od-${acc.id}`,
        accountId: acc.id,
        customerId: acc.customerId,
        customerName: acc.customerName,
        customerPhone: acc.customerPhone || 'N/A',
        productName: acc.productName,
        agingBucket,
        overdueDays,
        amountDue: totalOverdueAmount,
        overdueCount: overdueEmis.length,
        oldestDueDate: oldest.dueDate,
        assignedAgent: pastFollowup?.assignedAgent || acc.assignedOfficer || 'Recovery Officer',
        lastContactDate: pastFollowup?.lastContactDate || 'Pending Contact',
        outcome: pastFollowup?.outcome || 'Pending Call',
        notes: pastFollowup?.notes || 'Payment overdue. Follow-up call pending.',
        rawAccount: acc
      });
    }
  });

  // Calculate bucket statistics
  const count0_30 = dynamicOverdueList.filter(o => o.agingBucket === '0-30 Days').length;
  const count31_60 = dynamicOverdueList.filter(o => o.agingBucket === '31-60 Days').length;
  const count61_90 = dynamicOverdueList.filter(o => o.agingBucket === '61-90 Days').length;
  const count90Plus = dynamicOverdueList.filter(o => o.agingBucket === '90+ Days (NPA)').length;
  const totalOverdueCapital = dynamicOverdueList.reduce((sum, o) => sum + o.amountDue, 0);

  // Filter list
  const filteredList = dynamicOverdueList.filter(item => {
    if (selectedBucketFilter !== 'ALL' && item.agingBucket !== selectedBucketFilter) {
      return false;
    }
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

  const handleOpenFollowup = (item) => {
    setActiveFollowupAccount(item);
    setAgentName(item.assignedAgent || 'Recovery Officer');
    setContactMethod('Phone Call');
    setOutcome('Promised to Pay');
    setPromiseDate('');
    setNotesText('');
  };

  const handleSaveFollowup = (e) => {
    e.preventDefault();
    if (!activeFollowupAccount) return;

    const newFollowup = {
      id: `FOL-${Date.now()}`,
      accountId: activeFollowupAccount.accountId,
      customerName: activeFollowupAccount.customerName,
      agingBucket: activeFollowupAccount.agingBucket,
      overdueDays: activeFollowupAccount.overdueDays,
      amountDue: activeFollowupAccount.amountDue,
      contactMethod,
      outcome,
      promiseDate: promiseDate || 'None',
      assignedAgent: agentName || 'Recovery Officer',
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: notesText.trim() ? `${contactMethod}: ${outcome}. ${notesText.trim()}${promiseDate ? ` (Promise Date: ${promiseDate})` : ''}` : `${contactMethod}: ${outcome}${promiseDate ? ` (Promise Date: ${promiseDate})` : ''}`
    };

    if (onSaveFollowupNote) {
      onSaveFollowupNote(newFollowup);
    }

    setActiveFollowupAccount(null);
    confetti({ particleCount: 50, spread: 50 });
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={22} color="#DC2626" /> Overdue Collections & Default Risk Radar
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time aging buckets computed from unpaid EMIs: 0-30 days, 31-60 days, 61-90 days, and 90+ days (NPA).
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Overdue Capital at Risk</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: totalOverdueCapital > 0 ? '#DC2626' : '#059669' }}>
            {formatCurrency(totalOverdueCapital)}
          </h3>
        </div>
      </div>

      {/* Aging Bucket Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { title: '0-30 Days Overdue', key: '0-30 Days', color: '#D97706', count: count0_30, badge: 'Mild Overdue' },
          { title: '31-60 Days Overdue', key: '31-60 Days', color: '#EA580C', count: count31_60, badge: 'Elevated Risk' },
          { title: '61-90 Days Overdue', key: '61-90 Days', color: '#DC2626', count: count61_90, badge: 'High Risk' },
          { title: '90+ Days (NPA)', key: '90+ Days (NPA)', color: '#991B1B', count: count90Plus, badge: 'Non-Performing Asset' }
        ].map(b => (
          <div 
            key={b.title} 
            onClick={() => setSelectedBucketFilter(selectedBucketFilter === b.key ? 'ALL' : b.key)}
            className="glass-panel" 
            style={{ 
              padding: '1.1rem', 
              borderLeft: `5px solid ${b.color}`,
              cursor: 'pointer',
              background: selectedBucketFilter === b.key ? '#FEF2F2' : '#FFFFFF',
              boxShadow: selectedBucketFilter === b.key ? '0 0 0 2px var(--accent-indigo)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>{b.title}</span>
              <span style={{ fontSize: '0.68rem', background: 'rgba(0,0,0,0.05)', color: b.color, padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                {b.badge}
              </span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: b.color, marginTop: '0.3rem' }}>
              {b.count} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Accounts</span>
            </h3>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Overdue (${dynamicOverdueList.length})` },
            { id: '0-30 Days', label: `0-30 Days (${count0_30})` },
            { id: '31-60 Days', label: `31-60 Days (${count31_60})` },
            { id: '61-90 Days', label: `61-90 Days (${count61_90})` },
            { id: '90+ Days (NPA)', label: `90+ NPA (${count90Plus})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedBucketFilter(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: selectedBucketFilter === f.id ? 700 : 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedBucketFilter === f.id ? 'var(--accent-indigo)' : '#F1F5F9',
                color: selectedBucketFilter === f.id ? '#FFF' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search overdue borrowers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2rem', width: '220px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Overdue Accounts Table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8FAFC', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Borrower & Account</th>
              <th style={{ padding: '0.85rem 1rem' }}>Aging Bucket</th>
              <th style={{ padding: '0.85rem 1rem' }}>Overdue Days</th>
              <th style={{ padding: '0.85rem 1rem' }}>Defaulted EMIs</th>
              <th style={{ padding: '0.85rem 1rem' }}>Overdue Amount</th>
              <th style={{ padding: '0.85rem 1rem' }}>Latest Follow-up Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dynamicOverdueList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
                    All Loan Accounts are in Good Standing!
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No overdue installments or defaulted accounts detected. All borrowers are paying on time.
                  </p>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                  No overdue accounts match the selected filter.
                </td>
              </tr>
            ) : (
              filteredList.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.customerName}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      {item.accountId} • Phone: {item.customerPhone}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge-status overdue" style={{ fontWeight: 700 }}>
                      {item.agingBucket}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#DC2626' }}>
                    {item.overdueDays} Days
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.overdueCount} installment(s)
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#DC2626' }}>
                    {formatCurrency(item.amountDue)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#1E293B', fontWeight: 600 }}>
                      {item.notes}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      By: {item.assignedAgent} • {item.lastContactDate}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenFollowup(item)}
                        className="btn-indigo"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        title="Log a recovery phone call or field visit note"
                      >
                        <PhoneCall size={12} /> Log Note
                      </button>

                      {onOpenCollectPayment && (
                        <button
                          onClick={() => onOpenCollectPayment(item.rawAccount)}
                          className="btn-emerald"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                          title="Collect overdue payment immediately"
                        >
                          <Receipt size={12} /> Collect
                        </button>
                      )}

                      {onOpenPassbook && (
                        <button
                          onClick={() => onOpenPassbook(item.rawAccount)}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                          title="View complete loan ledger"
                        >
                          <Printer size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log Follow-up Note Modal */}
      {activeFollowupAccount && (
        <div className="modal-overlay" onClick={() => setActiveFollowupAccount(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={20} color="var(--accent-indigo)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Log Recovery Follow-up Action
                </h3>
              </div>
              <button onClick={() => setActiveFollowupAccount(null)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFollowup}>
              
              {/* Account summary box */}
              <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Borrower: <strong>{activeFollowupAccount.customerName}</strong></span>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>Overdue: {formatCurrency(activeFollowupAccount.amountDue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Account: {activeFollowupAccount.accountId}</span>
                  <span style={{ color: 'var(--text-dim)' }}>Aging: {activeFollowupAccount.agingBucket} ({activeFollowupAccount.overdueDays} Days)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Contact Channel *
                  </label>
                  <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} className="form-select">
                    <option value="Phone Call">Phone Call</option>
                    <option value="Field Visit">Field In-Person Visit</option>
                    <option value="WhatsApp Reminder">WhatsApp Message</option>
                    <option value="Formal Legal Notice">Formal Legal Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Call / Visit Outcome *
                  </label>
                  <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="form-select">
                    <option value="Promised to Pay">Promised to Pay on Date</option>
                    <option value="Phone Switched Off">Phone Switched Off / No Answer</option>
                    <option value="Borrower Disputed Amount">Borrower Disputed Amount</option>
                    <option value="Refused to Pay">Refused to Pay (Escalate)</option>
                    <option value="Wrong Number">Wrong / Unreachable Number</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Promise to Pay Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={promiseDate}
                    onChange={(e) => setPromiseDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Logged By (Officer Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Conversation Notes & Details
                </label>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="e.g. Borrower acknowledged overdue installment and promised to clear via UPI by Saturday afternoon..."
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setActiveFollowupAccount(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-indigo">
                  <CheckCircle2 size={16} /> Save Follow-up Record
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
