import React, { useState } from 'react';
import { FileText, Plus, Save, Trash2, Eye, Edit3, Search } from 'lucide-react';

export default function DocsView({ docs, onSaveDoc, onDeleteDoc }) {
  const [selectedDocId, setSelectedDocId] = useState(docs[0]?.id || '');
  const [isEditing, setIsEditing] = useState(true);
  const [docSearch, setDocSearch] = useState('');

  const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0];

  const [title, setTitle] = useState(activeDoc?.title || '');
  const [content, setContent] = useState(activeDoc?.content || '');
  const [category, setCategory] = useState(activeDoc?.category || 'General');

  // Sync state when active document switches
  const selectDoc = (doc) => {
    setSelectedDocId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setCategory(doc.category || 'General');
  };

  const handleCreateNewDoc = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: 'untitled Specification Doc',
      category: 'Spec',
      lastModified: new Date().toISOString(),
      content: `# New Specification Document\n\nWrite your project spec or notes here...`
    };
    onSaveDoc(newDoc);
    selectDoc(newDoc);
  };

  const handleSave = () => {
    if (!activeDoc) return;
    const updatedDoc = {
      ...activeDoc,
      title,
      content,
      category,
      lastModified: new Date().toISOString()
    };
    onSaveDoc(updatedDoc);
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(docSearch.toLowerCase()) || 
    d.category.toLowerCase().includes(docSearch.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem 1.8rem', display: 'flex', gap: '1.5rem', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* Sidebar Doc List */}
      <div className="glass-panel" style={{ width: '280px', padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} color="var(--accent-color)" /> Project Specs
          </h3>
          <button onClick={handleCreateNewDoc} className="btn-icon" title="Create New Document">
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Filter specs..."
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          />
        </div>

        {/* Doc List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filteredDocs.map(d => {
            const isSelected = d.id === selectedDocId;
            return (
              <div
                key={d.id}
                onClick={() => selectDoc(d)}
                style={{
                  padding: '0.65rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid var(--accent-color)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.86rem', color: isSelected ? '#FFF' : 'var(--text-main)', marginBottom: '0.2rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {d.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{d.category}</span>
                  <span>{new Date(d.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Main Spec Editor / Viewer */}
      {activeDoc ? (
        <div className="glass-panel" style={{ flex: 1, padding: '1.8rem', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', gap: '1rem', flexWrap: 'wrap' }}>
            
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 800, flex: 1, background: 'transparent', border: '1px solid var(--border-subtle)' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                {isEditing ? <Eye size={15} /> : <Edit3 size={15} />}
                {isEditing ? 'Preview Mode' : 'Edit Mode'}
              </button>

              <button onClick={handleSave} className="btn-primary" style={{ fontSize: '0.82rem' }}>
                <Save size={15} /> Save Spec
              </button>

              <button onClick={() => onDeleteDoc(activeDoc.id)} className="btn-icon" style={{ color: '#F43F5E' }} title="Delete Doc">
                <Trash2 size={16} />
              </button>

            </div>
          </div>

          {/* Editor vs Preview Body */}
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write markdown specification..."
              className="form-textarea"
              style={{ flex: 1, fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', lineHeight: 1.6, resize: 'none' }}
            />
          ) : (
            <div style={{
              flex: 1,
              padding: '1.2rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              overflowY: 'auto',
              lineHeight: 1.7,
              fontSize: '0.95rem'
            }}>
              <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
          Select or create a spec document
        </div>
      )}

    </div>
  );
}
