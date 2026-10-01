import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ tasks, onSelectTask, onQuickCreateOnDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
  const goToday = () => setCurrentDate(new Date());

  const daysGrid = [];
  // Blank padded slots for days of previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const formatIsoDate = (dayNum) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Calendar Header Controls */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CalendarIcon size={22} color="var(--accent-color)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {monthNames[month]} {year}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={goToday} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>
            Today
          </button>
          <button onClick={prevMonth} className="btn-icon" title="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="btn-icon" title="Next Month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        
        {/* Days of Week Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.8rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} style={{ padding: '0.4rem' }}>{day}</div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {daysGrid.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: '100px', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-sm)' }} />;
            }

            const dateStr = formatIsoDate(dayNum);
            const isToday = dateStr === todayStr;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);

            return (
              <div
                key={`day-${dayNum}`}
                style={{
                  minHeight: '105px',
                  background: isToday ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: isToday ? '1px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Date Number & Plus Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: isToday ? 'var(--accent-color)' : 'var(--text-main)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isToday ? 'var(--accent-glow)' : 'transparent'
                  }}>
                    {dayNum}
                  </span>

                  <button 
                    onClick={() => onQuickCreateOnDate(dateStr)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', opacity: 0.6 }}
                    title="Add task on this day"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Day Tasks List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto' }}>
                  {dayTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.45rem',
                        borderRadius: '4px',
                        background: t.priority === 'Urgent' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(139, 92, 246, 0.25)',
                        borderLeft: `3px solid ${t.priority === 'Urgent' ? '#F43F5E' : 'var(--accent-color)'}`,
                        color: '#FFF',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
