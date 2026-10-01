import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building, 
  Landmark, 
  AlertTriangle,
  Upload,
  Lock,
  Plus,
  Eye,
  Camera,
  X,
  PlusCircle,
  Printer
} from 'lucide-react';
import { formatCurrency, maskAadhaar, maskBankAccount } from '../utils/financeEngine';

export default function Customer360View({ 
  customers = [], 
  applications = [], 
  financeAccounts = [], 
  payments = [], 
  overdueFollowups = [],
  auditLogs = [],
  onVerifyDocument,
  onRejectDocument,
  onOpenDisburseLoan,
  onNavigateTo,
  onOpenPassbook
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [activeTab, setActiveTab] = useState('profile'); // profile, kyc, accounts, payments, overdue, audit

  // Document Viewer state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedDocForAction, setSelectedDocForAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Zero-State if no customers exist yet
  if (!customers || customers.length === 0) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '720px', margin: '2rem auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#EEF2FF',
            color: '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.2rem auto'
          }}>
            <User size={32} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>
            No Customer Profiles on Record
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            All mock customers have been cleared. Onboard a customer or disburse a new loan with Aadhaar & PAN verification to populate real borrower records.
          </p>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onOpenDisburseLoan} className="btn-emerald" style={{ fontWeight: 700 }}>
              <PlusCircle size={16} /> Disburse Loan & Add Customer
            </button>
            <button onClick={() => onNavigateTo('onboarding')} className="btn-indigo">
              <Plus size={16} /> Customer Onboarding Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  const customer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const custAccounts = financeAccounts.filter(a => a.customerId === customer?.id);
  const custPayments = payments.filter(p => custAccounts.some(acc => acc.id === p.accountId));
  const custFollowups = overdueFollowups.filter(f => custAccounts.some(acc => acc.id === f.accountId));
  const custAudits = auditLogs.filter(l => l.target?.includes(customer?.id) || l.target?.includes(customer?.name));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const custOverdueEmis = custAccounts.flatMap(acc => 
    (acc.emiSchedule || []).filter(s => s.status === 'overdue' || (s.status !== 'paid' && s.dueDate && new Date(s.dueDate) < today))
      .map(s => ({ ...s, accountId: acc.id, productName: acc.productName }))
  );

  const handleVerifyDoc = (docId) => {
    if (onVerifyDocument) {
      onVerifyDocument(customer.id, docId, 'System Admin');
    }
    setSelectedDocForAction(null);
  };

  const handleRejectDoc = (docId) => {
    if (!rejectReason.trim()) return;
    if (onRejectDocument) {
      onRejectDocument(customer.id, docId, rejectReason.trim(), 'System Admin');
    }
    setRejectReason('');
    setSelectedDocForAction(null);
  };

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Customer Selector & Profile Header Card */}
      <div className="glass-panel" style={{
        padding: '1.4rem 1.8rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: customer?.photo ? 'transparent' : 'linear-gradient(135deg, #4F46E5, #059669)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid #E2E8F0'
          }}>
            {customer?.photo ? (
              <img src={customer.photo} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              customer?.name ? customer.name.split(' ').map(n=>n[0]).join('').slice(0, 2) : '?'
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{customer?.name}</h2>
              <span className={`badge-status ${customer?.kycStatus?.toLowerCase().replace(' ', '_') || 'verified'}`}>
                KYC {customer?.kycStatus || 'Active'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ID: {customer?.id} • Phone: {customer?.phone} • Aadhaar: <strong>{customer?.aadhaar || 'N/A'}</strong> • PAN: <strong>{customer?.pan || 'N/A'}</strong>
            </p>
          </div>
        </div>

        {/* Customer Actions & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onOpenDisburseLoan} 
            className="btn-emerald" 
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            + Give Loan to Customer
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Customer:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Customer 360 Tab Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        background: '#F1F5F9',
        padding: '0.3rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'profile', label: '1. Profile & Identity', icon: User },
          { id: 'kyc', label: `2. KYC & Documents (${customer.documents?.length || 0})`, icon: ShieldCheck },
          { id: 'accounts', label: `3. Active Loans (${custAccounts.length})`, icon: Landmark },
          { id: 'payments', label: `4. Payment Ledger (${custPayments.length})`, icon: Receipt },
          { id: 'overdue', label: '5. Overdue Followup', icon: AlertTriangle },
          { id: 'audit', label: '6. Audit Trail', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFF' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-indigo)' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile & Identity */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card A: Identity & Family */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent-indigo)" /> Identity & KYC Numbers
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.86rem' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Full Legal Name: </strong> <span style={{ color: '#0F172A', fontWeight: 700 }}>{customer.name}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Mobile Phone: </strong> <span style={{ color: '#0F172A', fontWeight: 700 }}>{customer.phone}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Father / Spouse: </strong> <span>{customer.fatherSpouseName || 'On Record'}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Aadhaar Number: </strong> <code style={{ color: '#059669', fontWeight: 800 }}>{customer.aadhaar || 'Verified'}</code></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>PAN Number: </strong> <code style={{ color: '#4F46E5', fontWeight: 800 }}>{customer.pan || 'Verified'}</code></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Date of Birth: </strong> <span>{customer.dob || 'N/A'}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Gender: </strong> <span>{customer.gender || 'N/A'}</span></div>
            </div>
          </div>

          {/* Card B: Address & Employment */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="#059669" /> Address & Livelihood
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.86rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Current Address: </strong>
                <span>{customer.addresses?.[0]?.line1}, {customer.addresses?.[0]?.city} {customer.addresses?.[0]?.state} {customer.addresses?.[0]?.pincode}</span>
              </div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Occupation: </strong> <span style={{ fontWeight: 600 }}>{customer.employment?.type}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Business / Org: </strong> <span>{customer.employment?.companyName}</span></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Monthly Income: </strong> <span style={{ color: '#059669', fontWeight: 800 }}>{formatCurrency(customer.employment?.monthlyIncome)}</span></div>

              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.4rem' }}>Bank Disbursal Information:</strong>
                <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', border: '1px solid var(--border-subtle)' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Bank Name: </span> <strong>{customer.bankAccount?.bankName}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Account No: </span> <code>{customer.bankAccount?.accountNumber}</code></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>IFSC Code: </span> <code>{customer.bankAccount?.ifscCode}</code></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: KYC & Document Verification */}
      {activeTab === 'kyc' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#059669" /> KYC Documents & Attached ID Proofs
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Borrower Aadhaar, PAN card, photo and security documents.
              </p>
            </div>

            <span className={`badge-status ${customer.kycStatus?.toLowerCase().replace(' ', '_') || 'verified'}`}>
              Overall Status: {customer.kycStatus}
            </span>
          </div>

          {(!customer.documents || customer.documents.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
              No KYC document files attached yet for this customer.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {customer.documents.map((doc, idx) => (
                <div key={idx} style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>{doc.type}</span>
                      <span className={`badge-status ${doc.status?.toLowerCase() || 'verified'}`}>
                        {doc.status}
                      </span>
                    </div>

                    {doc.docNumber && (
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5', marginBottom: '0.4rem' }}>
                        ID No: {doc.docNumber}
                      </div>
                    )}

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                      Uploaded: {doc.uploadedAt} • By: {doc.verifiedBy || 'Officer'}
                    </div>

                    {/* Image / Thumbnail Preview */}
                    {doc.fileData && (
                      <div style={{
                        height: '110px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        background: '#E2E8F0',
                        marginBottom: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }} onClick={() => setPreviewDoc(doc)}>
                        {doc.fileData.startsWith('data:image') ? (
                          <img src={doc.fileData} alt={doc.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#4F46E5' }}>
                            <FileText size={32} />
                            <span style={{ fontSize: '0.72rem', display: 'block' }}>PDF Document</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #E2E8F0' }}>
                    {doc.fileData ? (
                      <button 
                        onClick={() => setPreviewDoc(doc)} 
                        className="btn-secondary" 
                        style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                      >
                        <Eye size={12} /> View Full
                      </button>
                    ) : <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Number Verified</span>}

                    {doc.status !== 'Verified' && (
                      <button 
                        onClick={() => handleVerifyDoc(doc.id)} 
                        className="btn-emerald" 
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      >
                        <CheckCircle2 size={12} /> Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Active Loans & Accounts */}
      {activeTab === 'accounts' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              Customer Loan Accounts ({custAccounts.length})
            </h3>

            <button onClick={onOpenDisburseLoan} className="btn-emerald" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              + Disburse Loan
            </button>
          </div>

          {custAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
              No active loan accounts found for {customer.name}. Click "+ Disburse Loan" to give capital.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {custAccounts.map(acc => (
                <div key={acc.id} style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{acc.id}</h4>
                      <span className={`badge-status ${acc.status.toLowerCase()}`}>{acc.status}</span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Scheme: {acc.productName} • Disbursed: {acc.startDate}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Disbursed Capital</span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                      {formatCurrency(acc.financedAmount)}
                    </h3>
                  </div>

                  <button
                    onClick={() => onOpenPassbook && onOpenPassbook(acc)}
                    className="btn-indigo"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Printer size={13} /> View Passbook
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Payments */}
      {activeTab === 'payments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.2rem' }}>
            Payment History & Receipts ({custPayments.length})
          </h3>

          {custPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
              No payments collected yet from this borrower.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.7rem 0.9rem' }}>Receipt #</th>
                    <th style={{ padding: '0.7rem 0.9rem' }}>Date</th>
                    <th style={{ padding: '0.7rem 0.9rem' }}>Mode</th>
                    <th style={{ padding: '0.7rem 0.9rem', textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {custPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.7rem 0.9rem', fontWeight: 700, color: '#D97706' }}>{p.receiptNo}</td>
                      <td style={{ padding: '0.7rem 0.9rem', color: 'var(--text-muted)' }}>{new Date(p.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: '0.7rem 0.9rem' }}>{p.paymentMode}</td>
                      <td style={{ padding: '0.7rem 0.9rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Overdue */}
      {activeTab === 'overdue' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.2rem' }}>
            Overdue Status & Followup History
          </h3>

          {/* Overdue EMIs Alert */}
          {custOverdueEmis.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1.1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <AlertTriangle size={18} color="#DC2626" />
                <strong style={{ color: '#991B1B', fontSize: '0.92rem' }}>
                  Attention: {custOverdueEmis.length} Installment(s) Currently Past Due
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem' }}>
                {custOverdueEmis.map((emi, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #FECACA', paddingBottom: '0.3rem' }}>
                    <span>Account: <strong>{emi.accountId}</strong> (Installment #{emi.installmentNo} due on {emi.dueDate})</span>
                    <strong style={{ color: '#DC2626' }}>{formatCurrency(emi.emiAmount)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => onNavigateTo('payments')} className="btn-emerald" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                  <Receipt size={14} /> Collect Overdue Payment
                </button>
              </div>
            </div>
          )}

          {custFollowups.length === 0 && custOverdueEmis.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#059669', fontWeight: 600 }}>
              ✓ Clean record! No overdue installments or recovery follow-up cases active for this customer.
            </div>
          ) : (
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.8rem' }}>
                Recovery Call & Contact Logs ({custFollowups.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {custFollowups.map(f => (
                  <div key={f.id} style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#0F172A' }}>{f.contactMethod || 'Follow-up'}: {f.outcome || 'Note'}</strong>
                      <span className="badge-status overdue">{f.agingBucket} ({f.overdueDays} Days)</span>
                    </div>
                    <p style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.82rem' }}>Amount Due: {formatCurrency(f.amountDue)}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>"{f.notes}"</p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                      Logged by {f.assignedAgent} on {f.lastContactDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.2rem' }}>
            Customer Audit Trail Logs ({custAudits.length})
          </h3>
          {custAudits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
              No specific audit logs for this customer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {custAudits.map(l => (
                <div key={l.id} style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                  <strong>{l.action}</strong> by <span>{l.actor}</span> on {new Date(l.timestamp).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Full-Screen Preview Modal */}
      {previewDoc && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: '700px', width: '100%', maxHeight: '85vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{previewDoc.type} - {previewDoc.fileName}</h3>
              <button onClick={() => setPreviewDoc(null)} className="btn-icon"><X size={16} /></button>
            </div>

            {previewDoc.fileData?.startsWith('data:image') ? (
              <img src={previewDoc.fileData} alt={previewDoc.type} style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <FileText size={48} color="#4F46E5" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 700 }}>{previewDoc.fileName}</p>
                {previewDoc.fileData && (
                  <a href={previewDoc.fileData} download={previewDoc.fileName} className="btn-indigo" style={{ marginTop: '1rem' }}>
                    Download Document
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
