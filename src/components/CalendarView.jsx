import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  Receipt,
  User
} from 'lucide-react';
import { formatINR } from '../utils/financeCalc';

export default function CalendarView({
  financeAccounts = [],
  payments = [],
  onOpenCollectPayment,
  onOpenPassbook
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(() => new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDayStr(now.toISOString().split('T')[0]);
  };

  const daysGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const formatIsoDate = (dayNum) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Map all installments by date
  const installmentsByDate = {};
  financeAccounts.forEach(acc => {
    (acc.emiSchedule || []).forEach(inst => {
      if (!inst.dueDate) return;
      const d = inst.dueDate.split('T')[0];
      if (!installmentsByDate[d]) {
        installmentsByDate[d] = [];
      }
      installmentsByDate[d].push({
        account: acc,
        installment: inst
      });
    });
  });

  const selectedDayItems = installmentsByDate[selectedDayStr] || [];
  const selectedDayTotalDue = selectedDayItems.reduce((sum, item) => sum + (Number(item.installment.emiAmount) || 0), 0);
  const selectedDayCollected = selectedDayItems.filter(item => item.installment.status === 'paid').length;

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={20} color="#4F46E5" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Installments & Due Date Calendar
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Schedule of all daily and monthly installment dues, repayment dates, and borrower follow-ups.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button 
            onClick={goToday}
            style={{ padding: '0.45rem 0.9rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
          >
            Today
          </button>
          <button 
            onClick={prevMonth}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', minWidth: '140px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={nextMonth}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Left, Selected Day Details Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Calendar Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          {/* Day of Week Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.6rem 0', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#E2E8F0' }}>
            {daysGrid.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} style={{ background: '#FAFAFA', minHeight: '85px' }} />;
              }

              const dateStr = formatIsoDate(dayNum);
              const items = installmentsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDayStr;
              const totalDue = items.reduce((sum, i) => sum + (Number(i.installment.emiAmount) || 0), 0);
              const allPaid = items.length > 0 && items.every(i => i.installment.status === 'paid');

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayStr(dateStr)}
                  style={{
                    background: isSelected ? '#EFF6FF' : isToday ? '#F0FDF4' : '#FFFFFF',
                    minHeight: '85px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '2px solid #3B82F6' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: isToday || isSelected ? 800 : 600,
                      color: isToday ? '#059669' : isSelected ? '#1D4ED8' : '#334155',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isToday ? '#DCFCE7' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {dayNum}
                    </span>
                    {items.length > 0 && (
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '10px',
                        background: allPaid ? '#ECFDF5' : '#FEF3C7',
                        color: allPaid ? '#047857' : '#B45309'
                      }}>
                        {items.length} due
                      </span>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div style={{ marginTop: '0.3rem' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: allPaid ? '#059669' : '#0F172A' }}>
                        {formatINR(totalDue)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: allPaid ? '#059669' : '#64748B' }}>
                        {allPaid ? '✓ All Collected' : `${items.filter(i => i.installment.status === 'paid').length}/${items.length} paid`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Drawer */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '1.4rem'
        }}>
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Selected Date Due Register
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
              {selectedDayStr === todayStr ? `Today (${selectedDayStr})` : selectedDayStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>Total Scheduled Due:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                {formatINR(selectedDayTotalDue)}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
              {selectedDayCollected} of {selectedDayItems.length} Installments Collected
            </div>
          </div>

          {/* List of Borrowers Due on Selected Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '550px', overflowY: 'auto' }}>
            {selectedDayItems.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
                <Clock size={32} style={{ margin: '0 auto 0.6rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No installments scheduled on this date.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Select another date from the calendar to inspect dues.</p>
              </div>
            ) : (
              selectedDayItems.map(({ account, installment }, idx) => {
                const isPaid = installment.status === 'paid';
                return (
                  <div
                    key={`${account.id}-${installment.installmentNo}-${idx}`}
                    style={{
                      background: isPaid ? '#F0FDF4' : '#F8FAFC',
                      border: `1px solid ${isPaid ? '#BBF7D0' : '#E2E8F0'}`,
                      borderRadius: '10px',
                      padding: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                          {account.customerName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Acc: {account.id} • Inst #{installment.installmentNo}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isPaid ? '#047857' : '#0F172A' }}>
                          {formatINR(installment.emiAmount)}
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '8px',
                          background: isPaid ? '#DCFCE7' : '#FEF3C7',
                          color: isPaid ? '#047857' : '#B45309'
                        }}>
                          {isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      {account.customerPhone && (
                        <>
                          <a
                            href={`tel:${account.customerPhone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              background: '#FFF',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={12} /> Call
                          </a>
                          <a
                            href={`https://wa.me/91${account.customerPhone}?text=${encodeURIComponent(`Namaste ${account.customerName}, Dhanshri Associates reminder: your installment of ₹${installment.emiAmount} is scheduled for ${selectedDayStr}. Please keep it ready. Dhanyawad!`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              background: '#ECFDF5',
                              border: '1px solid #A7F3D0',
                              color: '#047857',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <MessageSquare size={12} /> WhatsApp
                          </a>
                        </>
                      )}

                      {!isPaid && onOpenCollectPayment && (
                        <button
                          onClick={() => onOpenCollectPayment(account)}
                          style={{
                            marginLeft: 'auto',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            background: '#059669',
                            color: '#FFF',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Collect ₹
                        </button>
                      )}

                      {onOpenPassbook && (
                        <button
                          onClick={() => onOpenPassbook(account)}
                          style={{
                            marginLeft: isPaid ? 'auto' : '0',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            background: '#FFF',
                            border: '1px solid #CBD5E1',
                            color: '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Passbook
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
