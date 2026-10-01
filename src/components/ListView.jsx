import React, { useState } from 'react';
import { ArrowUpDown, CheckCircle, Clock, MoreVertical, Edit2, Trash2, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ListView({ tasks, updateTaskStatus, onSelectTask, onDeleteTask }) {
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (sortField === 'assignee') {
      valA = a.assignee?.name || '';
      valB = b.assignee?.name || '';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t.id));
    }
  };

  const toggleSelectTask = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(i => i !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const bulkUpdateStatus = (newStatus) => {
    selectedTaskIds.forEach(id => updateTaskStatus(id, newStatus));
    if (newStatus === 'done') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    setSelectedTaskIds([]);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem' }}>
      
      {/* Bulk Actions Header */}
      {selectedTaskIds.length > 0 && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.2rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#A78BFA' }}>
            {selectedTaskIds.length} tasks selected
          </span>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={() => bulkUpdateStatus('done')} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              Mark as Done
            </button>
            <button onClick={() => bulkUpdateStatus('in_progress')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              Set In Progress
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1.2rem', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedTaskIds.length === tasks.length && tasks.length > 0}
                  onChange={toggleSelectAll}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => toggleSort('title')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Task Title <ArrowUpDown size={14} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => toggleSort('status')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Status <ArrowUpDown size={14} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => toggleSort('priority')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Priority <ArrowUpDown size={14} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => toggleSort('assignee')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Assignee <ArrowUpDown size={14} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => toggleSort('dueDate')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Due Date <ArrowUpDown size={14} />
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem' }}>Hours (Logged / Est)</th>
              <th style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map(task => {
              const isSelected = selectedTaskIds.includes(task.id);
              return (
                <tr 
                  key={task.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '0.85rem 1.2rem' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelectTask(task.id)}
                      style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                    />
                  </td>

                  {/* Title & Tags */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => onSelectTask(task)}>
                      {task.title}
                    </div>
                    {task.tags && task.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.25rem' }}>
                        {task.tags.map((tag, i) => (
                          <span key={i} className="badge-tag" style={{ fontSize: '0.7rem' }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status Inline Dropdown */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="form-select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                    </select>
                  </td>

                  {/* Priority Badge */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {task.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: task.assignee.color || 'var(--accent-color)', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {task.assignee.avatar}
                        </div>
                        <span style={{ fontSize: '0.82rem' }}>{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {task.dueDate}
                  </td>

                  {/* Logged / Est Hours */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {task.loggedHours || 0}h / {task.estimatedHours || 0}h
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button onClick={() => onSelectTask(task)} className="btn-icon" style={{ width: '28px', height: '28px' }} title="Edit Task">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => onDeleteTask(task.id)} className="btn-icon" style={{ width: '28px', height: '28px', color: '#F43F5E' }} title="Delete Task">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
