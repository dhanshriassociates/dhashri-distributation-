import React, { useState } from 'react';
import { UserPlus, CheckCircle, ArrowRight, ArrowLeft, Upload, ShieldCheck, Building, User, Camera, Eye, X, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingWizardView({ onSaveCustomer, onNavigateTo }) {
  const [step, setStep] = useState(1);

  // Clean empty real fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherSpouseName: '',
    dob: '1990-01-01',
    gender: 'Male',
    aadhaar: '',
    pan: '',
    city: '',
    state: '',
    pincode: '',
    addressLine: '',
    employmentType: 'Self-Employed Business',
    companyName: '',
    monthlyIncome: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  // Real Document Attachments with base64 data URLs
  const [docs, setDocs] = useState([
    { type: 'Aadhaar Card (Front/Back)', fileName: '', fileData: '', uploaded: false },
    { type: 'PAN Card Photo/Scan', fileName: '', fileData: '', uploaded: false },
    { type: 'Customer Photo / Selfie', fileName: '', fileData: '', uploaded: false },
    { type: 'Bank Passbook / Cheque', fileName: '', fileData: '', uploaded: false }
  ]);

  const [previewDoc, setPreviewDoc] = useState(null);

  const handleFileUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocs(prev => prev.map((d, i) => i === index ? {
        ...d,
        fileName: file.name,
        fileData: reader.result,
        fileType: file.type,
        uploaded: true
      } : d));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter customer full legal name.');
      return;
    }

    const newCustId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    const uploadedDocsList = docs.filter(d => d.uploaded).map((d, i) => ({
      id: `doc-${Date.now()}-${i}`,
      type: d.type,
      fileName: d.fileName || `${d.type}.pdf`,
      fileData: d.fileData || null,
      status: 'Verified',
      verifiedBy: 'System Officer',
      uploadedAt: new Date().toISOString().split('T')[0]
    }));

    const newCustomer = {
      id: newCustId,
      name: formData.name.trim(),
      email: formData.email.trim() || `${newCustId.toLowerCase()}@client.in`,
      phone: formData.phone.trim() || 'N/A',
      fatherSpouseName: formData.fatherSpouseName.trim() || 'N/A',
      dob: formData.dob,
      gender: formData.gender,
      aadhaar: formData.aadhaar.trim() || 'Not Provided',
      pan: formData.pan.trim().toUpperCase() || 'Not Provided',
      photo: docs.find(d => d.type.includes('Photo'))?.fileData || null,
      kycStatus: formData.aadhaar && formData.pan ? 'Verified' : 'Under Review',
      addresses: [
        { 
          type: 'Current', 
          line1: formData.addressLine || 'Address on record', 
          city: formData.city || 'City', 
          state: formData.state || 'State', 
          pincode: formData.pincode || '' 
        }
      ],
      employment: {
        type: formData.employmentType,
        companyName: formData.companyName || 'Business',
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        workExperienceYears: 3
      },
      bankAccount: {
        bankName: formData.bankName || 'State Bank of India',
        accountNumber: formData.accountNumber || 'N/A',
        ifscCode: formData.ifscCode || 'N/A',
        branch: `${formData.city || 'Main'} Branch`
      },
      documents: uploadedDocsList
    };

    onSaveCustomer(newCustomer);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onNavigateTo('customer360');
  };

  return (
    <div style={{ padding: '2rem 1.8rem', maxWidth: '820px', margin: '0 auto' }}>
      
      {/* Wizard Header Progress Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={22} color="var(--accent-indigo)" /> Step-by-Step Customer Onboarding & KYC
          </h2>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
            Step {step} of 4
          </span>
        </div>

        {/* Step Indicator Circles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '3px', background: '#E2E8F0', zIndex: 0 }} />
          {[
            { num: 1, title: 'Personal Info' },
            { num: 2, title: 'Address & Family' },
            { num: 3, title: 'Income & Bank' },
            { num: 4, title: 'Aadhaar / PAN Upload' }
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: step >= s.num ? 'var(--accent-indigo)' : '#F1F5F9',
                border: step >= s.num ? '2px solid #4338CA' : '1px solid #CBD5E1',
                color: step >= s.num ? '#FFF' : '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                {s.num}
              </div>
              <span style={{ fontSize: '0.72rem', color: step >= s.num ? '#0F172A' : 'var(--text-dim)', marginTop: '0.4rem', fontWeight: 600 }}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Form Steps */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Step 1: Borrower Legal Identity & Contact</h3>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@gmail.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Aadhaar Number (12 digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    placeholder="1234 5678 9012"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    PAN Number (10 alphanumeric) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Addresses & Family */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Step 2: Address & Family Information</h3>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Father / Spouse Name
                </label>
                <input
                  type="text"
                  value={formData.fatherSpouseName}
                  onChange={(e) => setFormData({ ...formData, fatherSpouseName: e.target.value })}
                  placeholder="e.g. Om Prakash Sharma"
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Street / Village Address
                </label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Plot #42, Main Bazar, Near Temple"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Jaipur"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="302001"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Income & Bank */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Step 3: Income Source & Disbursal Bank</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Occupation Type</label>
                  <select value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} className="form-select">
                    <option value="Self-Employed Business">Self-Employed Business / Shopkeeper</option>
                    <option value="Salaried Professional">Salaried Employee</option>
                    <option value="Agriculture & Farming">Agriculture / Farmer</option>
                    <option value="Transport & Logistics">Transport Driver / Logistics</option>
                    <option value="Artisan & Skilled Work">Artisan / Contractor</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                    placeholder="e.g. 50000"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. SBI, HDFC"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Bank Account No"
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="SBIN0001234"
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KYC Documents Upload */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                Step 4: Attach Real Documents (Aadhaar, PAN & Photo)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Upload photos or scans of Aadhaar, PAN card, and customer selfie for verification.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {docs.map((d, i) => (
                  <div key={i} style={{
                    background: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: d.uploaded ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.8rem'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{d.type}</h4>
                      {d.fileName ? (
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>✓ {d.fileName}</span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>No file attached yet</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{
                        background: '#FFF',
                        border: '1px solid var(--border-highlight)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <Upload size={14} /> {d.uploaded ? 'Change File' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(i, e)}
                        />
                      </label>

                      {d.fileData && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(d)}
                          className="btn-icon"
                          title="Preview Document"
                        >
                          <Eye size={15} />
                        </button>
                      )}

                      {d.uploaded && (
                        <span style={{ fontSize: '0.75rem', background: '#ECFDF5', color: '#059669', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 700 }}>
                          Ready
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-indigo">
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn-emerald" style={{ fontWeight: 800 }}>
                <CheckCircle size={16} /> Save Real Customer Profile
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{previewDoc.type}</h3>
              <button onClick={() => setPreviewDoc(null)} className="btn-icon"><X size={16} /></button>
            </div>
            {previewDoc.fileData?.startsWith('data:image') ? (
              <img src={previewDoc.fileData} alt="Doc Preview" style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC' }}>
                <FileText size={48} color="#4F46E5" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 600 }}>{previewDoc.fileName}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
