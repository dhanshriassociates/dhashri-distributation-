import React, { useState } from 'react';
import { Sparkles, X, Check, Calendar, Tag, User, AlertCircle, Plus } from 'lucide-react';
import { parseNaturalLanguageTask } from '../utils/nlpParser';

export default function SmartTaskParserModal({ teamMembers, onClose, onCreateParsedTask }) {
  const [inputCommand, setInputCommand] = useState('Build payment gateway integration tomorrow #backend @marcus !urgent');

  const parsedResult = parseNaturalLanguageTask(inputCommand, teamMembers);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parsedResult.title.trim()) return;

    onCreateParsedTask({
      id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: parsedResult.title,
      description: `Created via AI Command Line Parser: "${inputCommand}"`,
      status: 'todo',
      priority: parsedResult.priority,
      tags: parsedResult.tags.length > 0 ? parsedResult.tags : ['Task'],
      assignee: parsedResult.assignee,
      dueDate: parsedResult.dueDate,
      estimatedHours: 4,
      loggedHours: 0,
      subtasks: [],
      notes: '',
      createdAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="#A78BFA" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>
              AI Natural Language Task Parser
            </h3>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close Modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Type command (Use #tag, @assignee, !urgent, tomorrow/today)
            </label>
            <input
              type="text"
              autoFocus
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              placeholder="e.g. Redesign mobile navbar tomorrow #frontend @elena !urgent"
              className="form-input"
              style={{ fontSize: '0.98rem', padding: '0.85rem 1rem' }}
            />
          </div>

          {/* Quick Syntax Hint */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>Tags: <code style={{ color: '#A78BFA' }}>#frontend</code></span>
            <span>Assignee: <code style={{ color: '#06B6D4' }}>@marcus</code></span>
            <span>Priority: <code style={{ color: '#F43F5E' }}>!urgent</code></span>
            <span>Date: <code style={{ color: '#10B981' }}>tomorrow</code></span>
          </div>

          {/* Live Parsed Preview Box */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px dashed rgba(139, 92, 246, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>
              ⚡ Live Extracted Task Attributes
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Title: </strong>
                <span style={{ color: '#FFF', fontWeight: 600 }}>{parsedResult.title || '(Empty title)'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={15} color="var(--text-dim)" />
                  <span style={{ color: 'var(--text-muted)' }}>Priority:</span>
                  <span className={`badge-priority ${parsedResult.priority.toLowerCase()}`}>{parsedResult.priority}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="var(--text-dim)" />
                  <span style={{ color: 'var(--text-muted)' }}>Due:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{parsedResult.dueDate}</span>
                </div>
              </div>

              {parsedResult.assignee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={15} color="var(--text-dim)" />
                  <span style={{ color: 'var(--text-muted)' }}>Assignee:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{parsedResult.assignee.name}</span>
                </div>
              )}

              {parsedResult.tags.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={15} color="var(--text-dim)" />
                  <span style={{ color: 'var(--text-muted)' }}>Tags:</span>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {parsedResult.tags.map((t, i) => (
                      <span key={i} className="badge-tag">#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Create Task
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
