import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertTriangle, Zap, Users } from 'lucide-react';

export default function AnalyticsView({ tasks, teamMembers }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalLoggedHours = tasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
  const totalEstimatedHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const urgentCount = tasks.filter(t => t.priority === 'Urgent').length;
  const highCount = tasks.filter(t => t.priority === 'High').length;
  const mediumCount = tasks.filter(t => t.priority === 'Medium').length;
  const lowCount = tasks.filter(t => t.priority === 'Low').length;

  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewCount = tasks.filter(t => t.status === 'in_review').length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
        
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} color="#10B981" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETION RATE</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{completionRate}%</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{completedTasks} of {totalTasks} tasks done</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="#8B5CF6" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>HOURS LOGGED</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6' }}>{totalLoggedHours.toFixed(1)}h</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>vs {totalEstimatedHours}h estimated</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={24} color="#06B6D4" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE VELOCITY</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06B6D4' }}>{inProgressCount + inReviewCount} active</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{inProgressCount} in progress, {inReviewCount} review</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#F43F5E" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>URGENT ATTENTION</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F43F5E' }}>{urgentCount} tasks</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Requires immediate action</span>
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Status Distribution Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--accent-color)" /> Workflow Status Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Completed', count: completedTasks, color: '#10B981' },
              { label: 'In Review', count: inReviewCount, color: '#F59E0B' },
              { label: 'In Progress', count: inProgressCount, color: '#8B5CF6' },
              { label: 'To Do', count: todoCount, color: '#38BDF8' }
            ].map(item => {
              const pct = totalTasks > 0 ? (item.count / totalTasks) * 100 : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{item.count} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent-color)" /> Priority Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Urgent', count: urgentCount, color: '#F43F5E' },
              { label: 'High', count: highCount, color: '#F59E0B' },
              { label: 'Medium', count: mediumCount, color: '#06B6D4' },
              { label: 'Low', count: lowCount, color: '#64748B' }
            ].map(item => {
              const pct = totalTasks > 0 ? (item.count / totalTasks) * 100 : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{item.count} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--accent-color)" /> Team Member Workload & Logged Hours
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {teamMembers.map(m => {
              const memberTasks = tasks.filter(t => t.assignee?.name === m.name);
              const memberHours = memberTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
              const doneMemberTasks = memberTasks.filter(t => t.status === 'done').length;

              return (
                <div key={m.name} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.color, color: '#FFF', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.avatar}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{m.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{m.role}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Assigned: <strong>{memberTasks.length}</strong></span>
                    <span>Completed: <strong>{doneMemberTasks}</strong></span>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                    Logged: {memberHours.toFixed(1)} hrs
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
