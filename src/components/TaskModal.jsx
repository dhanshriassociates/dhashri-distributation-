import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Plus, Trash2, CheckCircle, Clock, User, Tag, Calendar, AlertCircle } from 'lucide-react';

export default function TaskModal({ task, projects, teamMembers, onClose, onSaveTask, onDeleteTask }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'todo',
    priority: 'Medium',
    tagsStr: '',
    assigneeName: '',
    dueDate: '',
    estimatedHours: 4,
    loggedHours: 0,
    subtasks: [],
    notes: ''
  });

  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || (projects[0]?.id || ''),
        status: task.status || 'todo',
        priority: task.priority || 'Medium',
        tagsStr: task.tags ? task.tags.join(', ') : '',
        assigneeName: task.assignee?.name || '',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        estimatedHours: task.estimatedHours || 4,
        loggedHours: task.loggedHours || 0,
        subtasks: task.subtasks || [],
        notes: task.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: projects[0]?.id || '',
        status: 'todo',
        priority: 'Medium',
        tagsStr: 'Frontend',
        assigneeName: teamMembers[0]?.name || '',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        estimatedHours: 4,
        loggedHours: 0,
        subtasks: [],
        notes: ''
      });
    }
  }, [task, projects, teamMembers]);

  // Stopwatch interval for task time tracking
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const matchedAssignee = teamMembers.find(m => m.name === formData.assigneeName) || null;
    const tagsArray = formData.tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    // Convert accumulated stopwatch seconds to logged hours (rounded to 2 decimals)
    const extraHours = parseFloat((timerSeconds / 3600).toFixed(2));

    const updatedTask = {
      ...(task || {}),
      id: task?.id || `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      description: formData.description,
      projectId: formData.projectId,
      status: formData.status,
      priority: formData.priority,
      tags: tagsArray,
      assignee: matchedAssignee,
      dueDate: formData.dueDate,
      estimatedHours: parseFloat(formData.estimatedHours) || 0,
      loggedHours: parseFloat((parseFloat(formData.loggedHours) + extraHours).toFixed(2)),
      subtasks: formData.subtasks,
      notes: formData.notes,
      updatedAt: new Date().toISOString()
    };

    onSaveTask(updatedTask);
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: `st-${Date.now()}`, text: newSubtaskText.trim(), completed: false }]
    }));
    setNewSubtaskText('');
  };

  const toggleSubtask = (stId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === stId ? { ...s, completed: !s.completed } : s)
    }));
  };

  const removeSubtask = (stId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== stId)
    }));
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              {task ? `EDIT ${task.id}` : 'CREATE NEW TASK'}
            </span>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Task Title
            </label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Architect API gateway endpoints"
              className="form-input"
              style={{ fontSize: '1.05rem', fontWeight: 600 }}
            />
          </div>

          {/* Grid Metadata Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            
            {/* Status */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Priority
              </label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-select"
              >
                <option value="Urgent">🚨 Urgent</option>
                <option value="High">🔥 High</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Low">🌱 Low</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Assignee
              </label>
              <select 
                value={formData.assigneeName}
                onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(m => (
                  <option key={m.name} value={m.name}>{m.name} ({m.avatar})</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Due Date
              </label>
              <input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="form-input"
              />
            </div>

          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Description & Context
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed task description..."
              className="form-textarea"
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tagsStr}
              onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
              placeholder="Frontend, API, UX, Performance"
              className="form-input"
            />
          </div>

          {/* Subtasks Checklist Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.2rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
              Subtasks & Action Items ({formData.subtasks.filter(s => s.completed).length}/{formData.subtasks.length})
            </h4>

            {/* Add Subtask Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <input
                type="text"
                placeholder="Add subtask item..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                className="form-input"
                style={{ fontSize: '0.84rem' }}
              />
              <button type="button" onClick={addSubtask} className="btn-secondary">
                <Plus size={15} /> Add
              </button>
            </div>

            {/* Subtask List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {formData.subtasks.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', cursor: 'pointer', textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? 'var(--text-dim)' : 'var(--text-main)' }}>
                    <input 
                      type="checkbox" 
                      checked={s.completed} 
                      onChange={() => toggleSubtask(s.id)}
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    {s.text}
                  </label>

                  <button type="button" onClick={() => removeSubtask(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Time Tracking Widget */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Clock size={20} color="var(--accent-color)" />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Time Tracking & Stopwatch
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Logged: {formData.loggedHours}h | Est: {formData.estimatedHours}h
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-color)' }}>
                {formatTimer(timerSeconds)}
              </span>

              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="btn-secondary"
                style={{ background: isTimerRunning ? '#F43F5E' : 'var(--accent-color)', color: '#FFF' }}
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                {isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            {task ? (
              <button 
                type="button" 
                onClick={() => { onDeleteTask(task.id); onClose(); }} 
                className="btn-secondary" 
                style={{ color: '#F43F5E', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              >
                <Trash2 size={16} /> Delete Task
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Task
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
