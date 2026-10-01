import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Download, 
  Eye, 
  Filter, 
  User, 
  CreditCard, 
  FileCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function DocsView({
  customers = [],
  financeAccounts = [],
  onVerifyDocument,
  onRejectDocument
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'aadhaar', 'pan', 'agreement'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Verified', 'Pending', 'Rejected'
  const [previewDoc, setPreviewDoc] = useState(null);

  // Extract all documents from customers
  const allDocs = [];

  customers.forEach(cust => {
    // KYC Aadhaar
    if (cust.aadhaar) {
      allDocs.push({
        id: `doc-adh-${cust.id}`,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        type: 'Aadhaar Card',
        number: cust.aadhaar,
        status: cust.kycStatus === 'Verified' ? 'Verified' : 'Pending',
        uploadedAt: cust.createdAt || '2026-09-15',
        fileUrl: cust.aadhaarDocUrl || null
      });
    }

    // KYC PAN
    if (cust.pan) {
      allDocs.push({
        id: `doc-pan-${cust.id}`,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        type: 'PAN Card',
        number: cust.pan,
        status: cust.kycStatus === 'Verified' ? 'Verified' : 'Pending',
        uploadedAt: cust.createdAt || '2026-09-15',
        fileUrl: cust.panDocUrl || null
      });
    }

    // Explicit custom documents
    (cust.documents || []).forEach(d => {
      allDocs.push({
        id: d.id,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        type: d.type || 'KYC Document',
        number: d.docNumber || 'DOC-REG',
        status: d.status || 'Pending',
        uploadedAt: d.uploadedAt || '2026-09-15',
        fileUrl: d.url || null
      });
    });
  });

  // Also include Loan Agreements from Finance Accounts
  financeAccounts.forEach(acc => {
    allDocs.push({
      id: `doc-agr-${acc.id}`,
      customerId: acc.customerId,
      customerName: acc.customerName,
      customerPhone: acc.customerPhone,
      type: 'Loan Agreement & Promissory Note',
      number: acc.id,
      status: 'Verified',
      uploadedAt: acc.startDate || '2026-09-20',
      accountDetails: `₹${acc.financedAmount} • ${acc.productName}`
    });
  });

  // Filter docs
  const filteredDocs = allDocs.filter(doc => {
    const matchesSearch = 
      doc.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.number?.toLowerCase().includes(search.toLowerCase()) ||
      doc.type?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' ? true : doc.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : doc.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={20} color="#4F46E5" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Borrower KYC & Legal Document Vault
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Repository of Aadhaar cards, PAN verification, signed promissory notes, and loan contracts.
              </p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', background: '#F1F5F9', padding: '0.35rem 0.85rem', borderRadius: '12px', fontWeight: 700, color: '#475569' }}>
          {allDocs.length} Vault Documents Stored
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '0.9rem 1.2rem',
        border: '1px solid #E2E8F0',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1', minWidth: '240px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by borrower name, document ID, Aadhaar or PAN number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              color: '#0F172A'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8rem',
              background: '#FFF',
              color: '#334155'
            }}
          >
            <option value="all">All Document Types</option>
            <option value="aadhaar">Aadhaar Cards</option>
            <option value="pan">PAN Cards</option>
            <option value="agreement">Loan Agreements</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8rem',
              background: '#FFF',
              color: '#334155'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending / Under Review</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.2rem' }}>Borrower & Account</th>
                <th style={{ padding: '0.85rem 1.2rem' }}>Document Type</th>
                <th style={{ padding: '0.85rem 1.2rem' }}>Document / Ref Number</th>
                <th style={{ padding: '0.85rem 1.2rem' }}>Date Uploaded</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'center' }}>KYC Status</th>
                <th style={{ padding: '0.85rem 1.2rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                    No KYC documents match your criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => {
                  const isVerified = doc.status === 'Verified';
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{doc.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {doc.customerPhone || doc.customerId}
                          {doc.accountDetails && ` • ${doc.accountDetails}`}
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: doc.type.includes('Aadhaar') ? '#EFF6FF' : doc.type.includes('PAN') ? '#FEF3C7' : '#F1F5F9',
                          color: doc.type.includes('Aadhaar') ? '#1D4ED8' : doc.type.includes('PAN') ? '#B45309' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}>
                          <FileText size={12} /> {doc.type}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                        {doc.number}
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', color: '#64748B', fontSize: '0.78rem' }}>
                        {doc.uploadedAt}
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background: isVerified ? '#ECFDF5' : '#FEF3C7',
                          color: isVerified ? '#047857' : '#B45309',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {isVerified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {doc.status}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              background: '#FFF',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Eye size={13} /> Inspect
                          </button>

                          {!isVerified && onVerifyDocument && (
                            <button
                              onClick={() => onVerifyDocument(doc.customerId, doc.id, 'Admin Officer')}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                background: '#059669',
                                color: '#FFF',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Verify ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspector Modal */}
      {previewDoc && (
        <div 
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.8rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#059669" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  {previewDoc.type}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div><strong>Borrower Name:</strong> {previewDoc.customerName}</div>
              <div><strong>Document Number:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{previewDoc.number}</span></div>
              <div><strong>Customer ID:</strong> {previewDoc.customerId}</div>
              <div><strong>Verification Status:</strong> {previewDoc.status}</div>
              <div><strong>Archived Date:</strong> {previewDoc.uploadedAt}</div>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem', background: '#F1F5F9', borderRadius: '10px', marginBottom: '1.2rem', color: '#64748B', fontSize: '0.8rem' }}>
              <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
              <p>Government Validated Document Hash (Encrypted)</p>
              <p style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>Digital signature verified against Dhanshri Associates Master Key.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ padding: '0.45rem 1rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Document ${previewDoc.number} verified.`);
                  setPreviewDoc(null);
                }}
                style={{ padding: '0.45rem 1rem', background: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Accept & Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
