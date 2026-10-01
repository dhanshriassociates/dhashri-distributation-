import React, { useState } from 'react';
import { Plus, CheckSquare, Clock, ArrowRight, ArrowLeft, MoreHorizontal, User } from 'lucide-react';
import confetti from 'canvas-confetti';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#64748B' },
  { id: 'todo', title: 'To Do', color: '#38BDF8' },
  { id: 'in_progress', title: 'In Progress', color: '#8B5CF6' },
  { id: 'in_review', title: 'In Review', color: '#F59E0B' },
  { id: 'done', title: 'Completed', color: '#10B981' }
];

export default function KanbanBoard({ tasks, updateTaskStatus, onSelectTask, onQuickCreateInColumn }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
      if (targetStatus === 'done') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const moveColumn = (taskId, currentStatus, direction) => {
    const colOrder = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
    const idx = colOrder.indexOf(currentStatus);
    const newIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (newIdx >= 0 && newIdx < colOrder.length) {
      const newStatus = colOrder[newIdx];
      updateTaskStatus(taskId, newStatus);
      if (newStatus === 'done') {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1.2rem',
      padding: '1.5rem 1.8rem',
      overflowX: 'auto',
      minHeight: 'calc(100vh - 80px)'
    }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            className="kanban-column"
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{
              borderColor: isOver ? 'var(--accent-color)' : 'var(--border-subtle)',
              boxShadow: isOver ? '0 0 20px var(--accent-glow)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{col.title}</h3>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {colTasks.length}
                </span>
              </div>

              <button 
                onClick={() => onQuickCreateInColumn(col.id)} 
                className="btn-icon" 
                title="Quick Add Task"
                style={{ width: '28px', height: '28px' }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Tasks Container */}
            <div style={{ padding: '0.85rem', flex: 1, overflowY: 'auto' }}>
              {colTasks.length === 0 ? (
                <div style={{
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.82rem'
                }}>
                  No tasks in {col.title}
                </div>
              ) : (
                colTasks.map(task => {
                  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
                  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className="kanban-card"
                    >
                      {/* Priority Tag & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                        <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>

                        <div style={{ display: 'flex', gap: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                          {col.id !== 'backlog' && (
                            <button 
                              onClick={() => moveColumn(task.id, task.status, 'prev')}
                              className="btn-icon"
                              style={{ width: '24px', height: '24px' }}
                              title="Move Left"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button 
                              onClick={() => moveColumn(task.id, task.status, 'next')}
                              className="btn-icon"
                              style={{ width: '24px', height: '24px' }}
                              title="Move Right"
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {task.description}
                        </p>
                      )}

                      {/* Tag Pills */}
                      {task.tags && task.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                          {task.tags.map((tag, idx) => (
                            <span key={idx} className="badge-tag">#{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Subtasks Progress & Time */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.6rem',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          {totalSubtasks > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: completedSubtasks === totalSubtasks ? 'var(--prio-urgent-text)' : 'inherit' }}>
                              <CheckSquare size={13} />
                              {completedSubtasks}/{totalSubtasks}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} />
                            {task.loggedHours || 0}h / {task.estimatedHours || 0}h
                          </span>
                        </div>

                        {/* Assignee Avatar */}
                        {task.assignee ? (
                          <div
                            title={task.assignee.name}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: task.assignee.color || 'var(--accent-color)',
                              color: '#FFF',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 0 8px rgba(0,0,0,0.5)'
                            }}
                          >
                            {task.assignee.avatar}
                          </div>
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={12} color="var(--text-dim)" />
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
