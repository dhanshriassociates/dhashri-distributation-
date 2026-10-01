import React, { useState } from 'react';
import { 
  X, 
  Landmark, 
  User, 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Lock, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Camera,
  Eye,
  FileCheck,
  Sun,
  Repeat,
  Layers,
  HelpCircle
} from 'lucide-react';
import { formatCurrency, generateEmiSchedule, generateFixRepaymentSchedule, addMonths, addDays } from '../utils/financeEngine';
import confetti from 'canvas-confetti';

export default function DisburseLoanModal({
  isOpen,
  onClose,
  customers = [],
  financeProducts = [],
  staffMembers = [],
  onDisburseLoan
}) {
  if (!isOpen) return null;

  // Borrower Selection Mode
  const [borrowerMode, setBorrowerMode] = useState(customers.length > 0 ? 'existing' : 'new');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');

  // New Borrower Details
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    fatherSpouseName: '',
    dob: '1990-01-01',
    gender: 'Male',
    aadhaarNumber: '',
    panNumber: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    occupation: '',
    monthlyIncome: ''
  });

  // Uploaded Document States (Data URLs for true browser persistence & preview)
  const [aadhaarDoc, setAadhaarDoc] = useState({ fileName: '', fileData: '', uploadedAt: null });
  const [panDoc, setPanDoc] = useState({ fileName: '', fileData: '', uploadedAt: null });
  const [customerPhoto, setCustomerPhoto] = useState({ fileName: '', fileData: '', uploadedAt: null });
  const [collateralDoc, setCollateralDoc] = useState({ fileName: '', fileData: '', uploadedAt: null });

  // Loan Financial Terms
  const [loanAmount, setLoanAmount] = useState(50000);
  const [interestScheme, setInterestScheme] = useState('fix_total'); // fix_total, monthly_percent, daily_fixed, reducing_emi, flat_emi
  
  // Fix Total Repayment Scheme Specific States
  const [totalReturnTarget, setTotalReturnTarget] = useState(60000);
  const [fixFrequency, setFixFrequency] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [fixKistMode, setFixKistMode] = useState('by_amount'); // 'by_amount' or 'by_count'
  const [fixInstallmentAmount, setFixInstallmentAmount] = useState(1000);
  const [fixTotalCount, setFixTotalCount] = useState(60);

  // Standard Interest Schemes States
  const [monthlyInterestRate, setMonthlyInterestRate] = useState(2.0); // 2% per month
  const [dailyRateRupees, setDailyRateRupees] = useState(50); // ₹50/day
  const [annualRatePct, setAnnualRatePct] = useState(18.0);
  const [tenureMonths, setTenureMonths] = useState(6);
  const [disbursalDate, setDisbursalDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Security & Disbursal Channel
  const [collateralType, setCollateralType] = useState('None');
  const [collateralDetails, setCollateralDetails] = useState('');
  const [disbursalMode, setDisbursalMode] = useState('Cash');
  const [disbursalRef, setDisbursalRef] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('Ramesh Verma');
  const [notes, setNotes] = useState('');

  // Document Viewer preview modal inside Disburse
  const [previewDoc, setPreviewDoc] = useState(null);

  // File Upload Handlers (converts to base64 DataURL for offline preview & persistence)
  const handleFileUpload = (e, setDocState) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocState({
        fileName: file.name,
        fileData: reader.result,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.readAsDataURL(file);
  };

  // Calculations for live breakdown
  const principal = parseFloat(loanAmount) || 0;
  let estimatedMonthlyYield = 0;
  let estimatedTotalInterest = 0;
  let estimatedEmi = 0;
  let estimatedTotalReturn = 0;
  let fixCalculatedDays = 0;
  let fixCalculatedInstallment = 0;
  let fixEndDateStr = '';

  if (interestScheme === 'fix_total') {
    const target = Math.max(principal, parseFloat(totalReturnTarget) || principal);
    estimatedTotalInterest = Math.max(0, target - principal);
    estimatedTotalReturn = target;

    if (fixKistMode === 'by_amount') {
      const instAmt = parseFloat(fixInstallmentAmount) || 1000;
      fixCalculatedInstallment = instAmt;
      fixCalculatedDays = instAmt > 0 ? Math.ceil(target / instAmt) : 1;
    } else {
      const count = parseInt(fixTotalCount) || 100;
      fixCalculatedDays = count;
      fixCalculatedInstallment = count > 0 ? Math.round(target / count) : target;
    }

    estimatedEmi = fixCalculatedInstallment;
    estimatedMonthlyYield = fixFrequency === 'daily' 
      ? (fixCalculatedInstallment * 30 * (estimatedTotalInterest / (target || 1))) 
      : fixFrequency === 'weekly' 
      ? (estimatedTotalInterest / (fixCalculatedDays / 4.33 || 1))
      : (estimatedTotalInterest / (fixCalculatedDays || 1));

    const sDate = new Date(disbursalDate);
    if (fixFrequency === 'daily') {
      sDate.setDate(sDate.getDate() + fixCalculatedDays);
    } else if (fixFrequency === 'weekly') {
      sDate.setDate(sDate.getDate() + (fixCalculatedDays * 7));
    } else {
      sDate.setMonth(sDate.getMonth() + fixCalculatedDays);
    }
    fixEndDateStr = sDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } else if (interestScheme === 'monthly_percent') {
    estimatedMonthlyYield = (principal * (parseFloat(monthlyInterestRate) || 0)) / 100;
    estimatedTotalInterest = estimatedMonthlyYield * (parseInt(tenureMonths) || 1);
    estimatedEmi = (principal / (parseInt(tenureMonths) || 1)) + estimatedMonthlyYield;
    estimatedTotalReturn = principal + estimatedTotalInterest;
  } else if (interestScheme === 'daily_fixed') {
    const daily = parseFloat(dailyRateRupees) || 0;
    estimatedMonthlyYield = daily * 30;
    estimatedTotalInterest = daily * (parseInt(tenureMonths) || 1) * 30;
    estimatedEmi = (principal / (parseInt(tenureMonths) || 1)) + estimatedMonthlyYield;
    estimatedTotalReturn = principal + estimatedTotalInterest;
  } else if (interestScheme === 'reducing_emi') {
    const rate = parseFloat(annualRatePct) || 12;
    const months = parseInt(tenureMonths) || 1;
    const schedule = generateEmiSchedule(principal, rate, months, disbursalDate, 'reducing');
    estimatedEmi = schedule[0]?.emiAmount || 0;
    estimatedTotalInterest = schedule.reduce((sum, s) => sum + s.interestComponent, 0);
    estimatedMonthlyYield = estimatedTotalInterest / months;
    estimatedTotalReturn = principal + estimatedTotalInterest;
  } else {
    // flat_emi
    const rate = parseFloat(annualRatePct) || 12;
    const months = parseInt(tenureMonths) || 1;
    const schedule = generateEmiSchedule(principal, rate, months, disbursalDate, 'flat');
    estimatedEmi = schedule[0]?.emiAmount || 0;
    estimatedTotalInterest = schedule.reduce((sum, s) => sum + s.interestComponent, 0);
    estimatedMonthlyYield = estimatedTotalInterest / months;
    estimatedTotalReturn = principal + estimatedTotalInterest;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loanAmount || loanAmount <= 0) {
      alert('Please enter a valid loan amount');
      return;
    }

    let customerToUse = null;

    if (borrowerMode === 'existing') {
      customerToUse = customers.find(c => c.id === selectedCustomerId);
      if (!customerToUse) {
        alert('Please select a valid customer or switch to "New Customer"');
        return;
      }
    } else {
      // Validate customer name and phone
      if (!customerForm.name.trim()) {
        alert('Customer Full Name is required.');
        return;
      }

      const newCustId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
      const docList = [];

      if (aadhaarDoc.fileData || customerForm.aadhaarNumber) {
        docList.push({
          id: `doc-adh-${Date.now()}`,
          type: 'Aadhaar Card',
          docNumber: customerForm.aadhaarNumber,
          fileName: aadhaarDoc.fileName || 'Aadhaar_Document',
          fileData: aadhaarDoc.fileData || null,
          status: 'Verified',
          verifiedBy: assignedOfficer,
          uploadedAt: disbursalDate
        });
      }

      if (panDoc.fileData || customerForm.panNumber) {
        docList.push({
          id: `doc-pan-${Date.now()}`,
          type: 'PAN Card',
          docNumber: customerForm.panNumber.toUpperCase(),
          fileName: panDoc.fileName || 'PAN_Document',
          fileData: panDoc.fileData || null,
          status: 'Verified',
          verifiedBy: assignedOfficer,
          uploadedAt: disbursalDate
        });
      }

      if (customerPhoto.fileData) {
        docList.push({
          id: `doc-pic-${Date.now()}`,
          type: 'Customer Photo',
          docNumber: '',
          fileName: customerPhoto.fileName || 'Customer_Photo.jpg',
          fileData: customerPhoto.fileData,
          status: 'Verified',
          verifiedBy: assignedOfficer,
          uploadedAt: disbursalDate
        });
      }

      if (collateralDoc.fileData) {
        docList.push({
          id: `doc-col-${Date.now()}`,
          type: collateralType !== 'None' ? collateralType : 'Security Document',
          docNumber: '',
          fileName: collateralDoc.fileName || 'Security_Deed',
          fileData: collateralDoc.fileData,
          status: 'Verified',
          verifiedBy: assignedOfficer,
          uploadedAt: disbursalDate
        });
      }

      customerToUse = {
        id: newCustId,
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || 'N/A',
        fatherSpouseName: customerForm.fatherSpouseName.trim() || 'N/A',
        dob: customerForm.dob,
        gender: customerForm.gender,
        aadhaar: customerForm.aadhaarNumber.trim() || 'Not Provided',
        pan: customerForm.panNumber.trim().toUpperCase() || 'Not Provided',
        photo: customerPhoto.fileData || null,
        kycStatus: (customerForm.aadhaarNumber || aadhaarDoc.fileData) && (customerForm.panNumber || panDoc.fileData) ? 'Verified' : 'Under Review',
        addresses: [
          {
            type: 'Current',
            line1: customerForm.addressLine || 'Address on record',
            city: customerForm.city || 'City',
            state: customerForm.state || 'State',
            pincode: customerForm.pincode || ''
          }
        ],
        employment: {
          type: customerForm.occupation || 'Self-Employed',
          companyName: customerForm.occupation || 'Local Business',
          monthlyIncome: parseFloat(customerForm.monthlyIncome) || 0,
          workExperienceYears: 3
        },
        bankAccount: {
          bankName: 'Cash Disbursal / Primary Account',
          accountNumber: 'N/A',
          ifscCode: 'N/A',
          branch: customerForm.city || 'Main Branch'
        },
        documents: docList
      };
    }

    // Generate schedule
    let emiSchedule = [];
    const months = parseInt(tenureMonths) || 6;
    
    if (interestScheme === 'fix_total') {
      const target = Math.max(principal, parseFloat(totalReturnTarget) || principal);
      emiSchedule = generateFixRepaymentSchedule({
        principal,
        totalRepayment: target,
        frequency: fixFrequency,
        installmentAmount: fixKistMode === 'by_amount' ? fixInstallmentAmount : 0,
        totalInstallments: fixKistMode === 'by_count' ? fixTotalCount : 0,
        startDateStr: disbursalDate
      });
    } else if (interestScheme === 'reducing_emi') {
      emiSchedule = generateEmiSchedule(principal, parseFloat(annualRatePct) || 14.5, months, disbursalDate, 'reducing');
    } else if (interestScheme === 'flat_emi') {
      emiSchedule = generateEmiSchedule(principal, parseFloat(annualRatePct) || 18, months, disbursalDate, 'flat');
    } else {
      // Monthly / Daily Byaj Schedule
      const monthlyRate = interestScheme === 'monthly_percent' ? parseFloat(monthlyInterestRate) : (parseFloat(dailyRateRupees) * 30 / principal * 100);
      const principalPerMonth = Math.round(principal / months);
      let balance = principal;

      for (let i = 1; i <= months; i++) {
        const dueDate = addMonths(disbursalDate, i);

        const interestPart = Math.round((balance * monthlyRate) / 100);
        const isLast = i === months;
        const pPart = isLast ? balance : principalPerMonth;
        balance = Math.max(0, balance - pPart);

        emiSchedule.push({
          installmentNo: i,
          dueDate: dueDate.toISOString().split('T')[0],
          emiAmount: pPart + interestPart,
          principalComponent: pPart,
          interestComponent: interestPart,
          remainingBalance: balance,
          status: i === 1 ? 'due' : 'upcoming'
        });
      }
    }

    const newAccountId = `ACC-FIN-${Math.floor(100 + Math.random() * 900)}`;

    const targetReturnVal = interestScheme === 'fix_total' ? (parseFloat(totalReturnTarget) || principal) : (principal + estimatedTotalInterest);
    const freqLabel = fixFrequency === 'daily' ? 'day' : fixFrequency === 'weekly' ? 'wk' : 'mo';

    const newFinanceAccount = {
      id: newAccountId,
      applicationId: `APP-DIR-${Date.now().toString().slice(-6)}`,
      customerId: customerToUse.id,
      customerName: customerToUse.name,
      customerPhone: customerToUse.phone,
      customerAadhaar: customerToUse.aadhaar,
      customerPan: customerToUse.pan,
      customerPhoto: customerToUse.photo,
      productName: interestScheme === 'fix_total'
        ? `Fixed Return (₹${principal.toLocaleString('en-IN')} Disbursed ➔ ₹${targetReturnVal.toLocaleString('en-IN')} Target | ₹${Math.round(estimatedEmi).toLocaleString('en-IN')}/${freqLabel})`
        : interestScheme === 'monthly_percent' 
        ? `Monthly Interest (${monthlyInterestRate}% / mo)` 
        : interestScheme === 'daily_fixed' 
        ? `Daily Fixed Interest (₹${dailyRateRupees}/day)` 
        : interestScheme === 'reducing_emi' 
        ? `Reducing EMI (${annualRatePct}% p.a.)` 
        : `Flat EMI (${annualRatePct}% p.a.)`,
      schemeType: interestScheme,
      financedAmount: principal,
      totalRepaymentTarget: targetReturnVal,
      installmentFrequency: interestScheme === 'fix_total' ? fixFrequency : (interestScheme === 'daily_fixed' ? 'daily' : 'monthly'),
      installmentAmount: Math.round(estimatedEmi),
      totalInstallments: emiSchedule.length,
      annualRatePct: interestScheme === 'monthly_percent' 
        ? parseFloat(monthlyInterestRate) * 12 
        : interestScheme === 'fix_total' 
        ? principal > 0 ? parseFloat((((targetReturnVal - principal) / principal) * 100).toFixed(2)) : 0
        : parseFloat(annualRatePct) || 18,
      monthlyRatePct: interestScheme === 'monthly_percent' ? parseFloat(monthlyInterestRate) : null,
      dailyRateRupees: interestScheme === 'daily_fixed' ? parseFloat(dailyRateRupees) : null,
      tenureMonths: interestScheme === 'fix_total' ? Math.max(1, Math.ceil(emiSchedule.length / (fixFrequency === 'daily' ? 30 : fixFrequency === 'weekly' ? 4 : 1))) : months,
      startDate: disbursalDate,
      status: 'Active',
      collateralType,
      collateralDetails,
      disbursalMode,
      disbursalRef,
      assignedOfficer,
      notes,
      emiSchedule
    };

    onDisburseLoan({
      isNewCustomer: borrowerMode === 'new',
      customer: customerToUse,
      account: newFinanceAccount
    });

    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '880px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669, #4F46E5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}>
              <Landmark size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Disburse Real Money Loan <span style={{ fontSize: '0.75rem', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>Live Capital</span>
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Collect customer KYC (Aadhaar, PAN & Photo), configure Interest / EMI terms, and disburse capital immediately.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Section 1: Borrower Type Selection */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.2rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
              Step 1: Borrower Profile Selection
            </label>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setBorrowerMode('new')}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: borrowerMode === 'new' ? '2px solid var(--accent-indigo)' : '1px solid var(--border-highlight)',
                  background: borrowerMode === 'new' ? '#EEF2FF' : '#FFF',
                  color: borrowerMode === 'new' ? '#312E81' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={16} color={borrowerMode === 'new' ? '#4F46E5' : '#64748B'} />
                + New Borrower (Enter Aadhaar & PAN)
              </button>

              <button
                type="button"
                onClick={() => setBorrowerMode('existing')}
                disabled={customers.length === 0}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: borrowerMode === 'existing' ? '2px solid var(--accent-indigo)' : '1px solid var(--border-highlight)',
                  background: borrowerMode === 'existing' ? '#EEF2FF' : '#FFF',
                  color: borrowerMode === 'existing' ? '#312E81' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: customers.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: customers.length === 0 ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldCheck size={16} color={borrowerMode === 'existing' ? '#4F46E5' : '#64748B'} />
                Select Existing Customer ({customers.length})
              </button>
            </div>

            {borrowerMode === 'existing' && customers.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Choose Verified Borrower
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="form-select"
                  style={{ fontWeight: 600 }}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name} • Aadhaar: {c.aadhaar || 'N/A'} • PAN: {c.pan || 'N/A'} • Phone: {c.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 2: If New Customer, Full Customer & KYC Intake */}
          {borrowerMode === 'new' && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--accent-indigo)" />
                Borrower Identification & Mandatory Documents (Aadhaar / PAN / Photo)
              </h3>

              {/* Personal Details Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Sharma"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Father / Spouse Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Om Prakash Sharma"
                    value={customerForm.fatherSpouseName}
                    onChange={(e) => setCustomerForm({ ...customerForm, fatherSpouseName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Address & Work Details Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="House/Plot No, Street, Landmark"
                    value={customerForm.addressLine}
                    onChange={(e) => setCustomerForm({ ...customerForm, addressLine: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    City / District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 302001"
                    value={customerForm.pincode}
                    onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Document Cards Grid (Aadhaar, PAN, Customer Photo) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                
                {/* 1. Aadhaar Card */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={16} color="#059669" /> Aadhaar Card *
                    </span>
                    {aadhaarDoc.fileData && (
                      <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#059669', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        Attached
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    maxLength={14}
                    placeholder="Aadhaar 12-digit (XXXX-XXXX-XXXX)"
                    value={customerForm.aadhaarNumber}
                    onChange={(e) => setCustomerForm({ ...customerForm, aadhaarNumber: e.target.value })}
                    className="form-input"
                    style={{ marginBottom: '0.6rem', fontSize: '0.84rem' }}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{
                      flex: 1,
                      background: '#FFF',
                      border: '1px dashed #94A3B8',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}>
                      <Upload size={13} /> Upload Aadhaar Scan
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleFileUpload(e, setAadhaarDoc)} 
                      />
                    </label>

                    {aadhaarDoc.fileData && (
                      <button 
                        type="button" 
                        onClick={() => setPreviewDoc({ title: 'Aadhaar Card', ...aadhaarDoc })} 
                        className="btn-icon" 
                        title="View Aadhaar"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>

                  {aadhaarDoc.fileName && (
                    <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.4rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      ✓ {aadhaarDoc.fileName}
                    </div>
                  )}
                </div>

                {/* 2. PAN Card */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileCheck size={16} color="#4F46E5" /> PAN Card *
                    </span>
                    {panDoc.fileData && (
                      <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#059669', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        Attached
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    maxLength={10}
                    placeholder="PAN No. (e.g. ABCDE1234F)"
                    value={customerForm.panNumber}
                    onChange={(e) => setCustomerForm({ ...customerForm, panNumber: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ marginBottom: '0.6rem', fontSize: '0.84rem', textTransform: 'uppercase' }}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{
                      flex: 1,
                      background: '#FFF',
                      border: '1px dashed #94A3B8',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}>
                      <Upload size={13} /> Upload PAN Photo
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleFileUpload(e, setPanDoc)} 
                      />
                    </label>

                    {panDoc.fileData && (
                      <button 
                        type="button" 
                        onClick={() => setPreviewDoc({ title: 'PAN Card', ...panDoc })} 
                        className="btn-icon" 
                        title="View PAN"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>

                  {panDoc.fileName && (
                    <div style={{ fontSize: '0.7rem', color: '#4F46E5', marginTop: '0.4rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      ✓ {panDoc.fileName}
                    </div>
                  )}
                </div>

                {/* 3. Customer Photo / Selfie */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Camera size={16} color="#D97706" /> Customer Photo / Selfie
                    </span>
                    {customerPhoto.fileData && (
                      <span style={{ fontSize: '0.68rem', background: '#ECFDF5', color: '#059669', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        Attached
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#E2E8F0',
                      border: '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {customerPhoto.fileData ? (
                        <img src={customerPhoto.fileData} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={22} color="#94A3B8" />
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        background: '#FFF',
                        border: '1px dashed #94A3B8',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}>
                        Upload Photo / Camera
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="user"
                          style={{ display: 'none' }} 
                          onChange={(e) => handleFileUpload(e, setCustomerPhoto)} 
                        />
                      </label>
                    </div>
                  </div>

                  {customerPhoto.fileName && (
                    <div style={{ fontSize: '0.7rem', color: '#D97706', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      ✓ {customerPhoto.fileName}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Section 3: Loan Financial Terms & Interest Calculation */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#059669" />
              Loan Terms, Interest Scheme & Disbursal Amount
            </h3>

            {/* Unified Loan Terms Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Principal Loan Amount (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>₹</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Interest Calculation Scheme *
                </label>
                <select
                  value={interestScheme}
                  onChange={(e) => setInterestScheme(e.target.value)}
                  className="form-select"
                  style={{ fontWeight: 600, color: '#0F172A' }}
                >
                  <option value="fix_total">Fixed Total Return Scheme</option>
                  <option value="monthly_percent">Monthly % Interest Rate</option>
                  <option value="daily_fixed">Daily Fixed Interest (₹ / day)</option>
                  <option value="reducing_emi">Reducing Balance Bank EMI</option>
                  <option value="flat_emi">Flat Rate EMI</option>
                </select>
              </div>

              {/* Scheme-Specific Fields seamlessly integrated in the exact same grid */}
              {interestScheme === 'fix_total' ? (
                <>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Target Repayment Amount (₹) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>₹</span>
                      <input
                        type="number"
                        required
                        min={principal}
                        step={500}
                        value={totalReturnTarget}
                        onChange={(e) => setTotalReturnTarget(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '2rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Payment Frequency *
                    </label>
                    <select
                      value={fixFrequency}
                      onChange={(e) => setFixFrequency(e.target.value)}
                      className="form-select"
                      style={{ fontWeight: 600 }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Calculation Method *
                    </label>
                    <select
                      value={fixKistMode}
                      onChange={(e) => setFixKistMode(e.target.value)}
                      className="form-select"
                      style={{ fontWeight: 600 }}
                    >
                      <option value="by_amount">Set Installment Amount (₹ / installment)</option>
                      <option value="by_count">Set Total Number of Installments</option>
                    </select>
                  </div>

                  {fixKistMode === 'by_amount' ? (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Installment Amount (₹ / {fixFrequency === 'daily' ? 'day' : fixFrequency === 'weekly' ? 'week' : 'month'}) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#4F46E5', fontSize: '1.1rem' }}>₹</span>
                        <input
                          type="number"
                          min={1}
                          step={100}
                          value={fixInstallmentAmount}
                          onChange={(e) => setFixInstallmentAmount(e.target.value)}
                          className="form-input"
                          style={{ paddingLeft: '2rem', fontWeight: 700, fontSize: '1.1rem', color: '#0F172A' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Total Number of Installments *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={fixTotalCount}
                        onChange={(e) => setFixTotalCount(e.target.value)}
                        className="form-input"
                        style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0F172A' }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Disbursal Date
                    </label>
                    <input
                      type="date"
                      value={disbursalDate}
                      onChange={(e) => setDisbursalDate(e.target.value)}
                      className="form-input"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {interestScheme === 'monthly_percent' && (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Monthly Interest Rate (% per month)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={monthlyInterestRate}
                        onChange={(e) => setMonthlyInterestRate(e.target.value)}
                        className="form-input"
                        style={{ fontWeight: 700, color: '#0F172A' }}
                      />
                    </div>
                  )}

                  {interestScheme === 'daily_fixed' && (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Daily Interest Rate (₹ / day)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={dailyRateRupees}
                        onChange={(e) => setDailyRateRupees(e.target.value)}
                        className="form-input"
                        style={{ fontWeight: 700, color: '#0F172A' }}
                      />
                    </div>
                  )}

                  {(interestScheme === 'reducing_emi' || interestScheme === 'flat_emi') && (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Annual Interest Rate (% p.a.)
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="1"
                        value={annualRatePct}
                        onChange={(e) => setAnnualRatePct(e.target.value)}
                        className="form-input"
                        style={{ fontWeight: 700, color: '#0F172A' }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Tenure Duration (Months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(e.target.value)}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      Disbursal Date
                    </label>
                    <input
                      type="date"
                      value={disbursalDate}
                      onChange={(e) => setDisbursalDate(e.target.value)}
                      className="form-input"
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Live Financial Breakdown Box */}
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.8rem',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Principal Disbursed</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D' }}>{formatCurrency(principal)}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
                  {interestScheme === 'fix_total' ? 'Installment Amount' : 'Monthly Installment / EMI'}
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803D' }}>
                  {formatCurrency(estimatedEmi)} {interestScheme === 'fix_total' ? `/${fixFrequency === 'daily' ? 'day' : fixFrequency === 'weekly' ? 'week' : 'mo'}` : ''}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
                  {interestScheme === 'fix_total' ? 'Total Installments' : 'Total Months'}
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>
                  {interestScheme === 'fix_total' ? `${fixCalculatedDays} ${fixFrequency === 'daily' ? 'Days' : fixFrequency === 'weekly' ? 'Weeks' : 'Installments'}` : `${tenureMonths} Months`}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Total Expected Yield / Profit</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#B45309' }}>{formatCurrency(estimatedTotalInterest)}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Total Target Return</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>{formatCurrency(estimatedTotalReturn)}</div>
              </div>
            </div>

            {/* Collateral & Payment Mode Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Pledged Collateral Asset
                </label>
                <select
                  value={collateralType}
                  onChange={(e) => setCollateralType(e.target.value)}
                  className="form-select"
                >
                  <option value="None">None (Unsecured Personal Faith)</option>
                  <option value="Gold Jewellery">Gold Jewellery / Ornaments</option>
                  <option value="Post Dated Cheques">Blank Security Cheques</option>
                  <option value="Vehicle RC">Vehicle Original RC & Key</option>
                  <option value="Property Registry">Property Registry Paper</option>
                  <option value="Promissory Note">Promissory Note & Affidavit</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Collateral Details / Valuation
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50g 22k Gold, Chq #90112"
                  value={collateralDetails}
                  onChange={(e) => setCollateralDetails(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Disbursal Mode
                </label>
                <select
                  value={disbursalMode}
                  onChange={(e) => setDisbursalMode(e.target.value)}
                  className="form-select"
                >
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank NEFT/RTGS">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Disbursal Date
                </label>
                <input
                  type="date"
                  value={disbursalDate}
                  onChange={(e) => setDisbursalDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Assigned Recovery Officer / Staff
                </label>
                <select
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="form-select"
                >
                  {staffMembers.length > 0 ? (
                    staffMembers.map(s => (
                      <option key={s.id} value={s.name}>👤 {s.name} ({s.role})</option>
                    ))
                  ) : (
                    <>
                      <option value="Ramesh Verma">Ramesh Verma (Field Agent)</option>
                      <option value="Suresh Kumar">Suresh Kumar (Recovery Officer)</option>
                      <option value="Admin Officer">Admin Officer</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.2rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              🔒 Loan will be activated with immediate repayment schedule & debtor ledger.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-emerald"
                style={{ fontSize: '0.92rem', padding: '0.75rem 1.5rem' }}
              >
                <CheckCircle2 size={18} />
                Disburse {formatCurrency(principal)} Now
              </button>
            </div>
          </div>

        </form>

        {/* In-Modal Document Preview Overlay */}
        {previewDoc && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setPreviewDoc(null)}
          >
            <div 
              style={{
                background: '#FFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                maxWidth: '650px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{previewDoc.title}</h3>
                <button onClick={() => setPreviewDoc(null)} className="btn-icon"><X size={16} /></button>
              </div>

              {previewDoc.fileData ? (
                previewDoc.fileType?.includes('pdf') || previewDoc.fileName?.endsWith('.pdf') ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                    <FileText size={48} color="#4F46E5" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 600 }}>{previewDoc.fileName}</p>
                    <a href={previewDoc.fileData} download={previewDoc.fileName} className="btn-indigo" style={{ marginTop: '1rem' }}>
                      Download PDF
                    </a>
                  </div>
                ) : (
                  <img 
                    src={previewDoc.fileData} 
                    alt={previewDoc.title} 
                    style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }} 
                  />
                )
              ) : (
                <p style={{ textAlign: 'center', color: '#64748B' }}>No file preview available.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
