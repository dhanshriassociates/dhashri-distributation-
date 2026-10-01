import { createClient } from '@supabase/supabase-js';

// Resolve configuration from Vite or Next.js environment variables, or fallback to provided live keys
export const SUPABASE_URL = 
  import.meta.env?.VITE_SUPABASE_URL || 
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || 
  'https://rbgaitetaugbarzczlot.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_4-2ACPg2f7dHOlfnHzWEIg_rwUP_uRS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper to check DB connection status
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

// ==========================================
// 1. CUSTOMERS SERVICE
// ==========================================
export async function dbFetchCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data) return [];

    return data.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone || 'N/A',
      email: c.email || '',
      fatherSpouseName: c.father_spouse_name || '',
      dob: c.dob || '1990-01-01',
      gender: c.gender || 'Male',
      aadhaar: c.aadhaar || '',
      pan: c.pan || '',
      photo: c.photo || null,
      kycStatus: c.kyc_status || 'Under Review',
      addresses: c.addresses || [],
      employment: c.employment || {},
      bankAccount: c.bank_account || {},
      documents: c.documents || [],
      createdAt: c.created_at
    }));
  } catch (err) {
    console.warn('[Supabase] dbFetchCustomers fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_customers');
    return local ? JSON.parse(local) : [];
  }
}

export async function dbInsertCustomer(customer) {
  try {
    const row = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      father_spouse_name: customer.fatherSpouseName,
      dob: customer.dob,
      gender: customer.gender,
      aadhaar: customer.aadhaar,
      pan: customer.pan,
      photo: customer.photo,
      kyc_status: customer.kycStatus,
      addresses: customer.addresses,
      employment: customer.employment,
      bank_account: customer.bankAccount,
      documents: customer.documents
    };

    const { error } = await supabase.from('customers').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertCustomer warning:', err.message);
  }
}

// ==========================================
// 2. FINANCE ACCOUNTS SERVICE
// ==========================================
export async function dbFetchFinanceAccounts() {
  try {
    const { data, error } = await supabase
      .from('finance_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data) return [];

    return data.map(a => ({
      id: a.id,
      applicationId: a.application_id,
      customerId: a.customer_id,
      customerName: a.customer_name,
      customerPhone: a.customer_phone,
      customerAadhaar: a.customer_aadhaar,
      customerPan: a.customer_pan,
      customerPhoto: a.customer_photo,
      productName: a.product_name,
      financedAmount: parseFloat(a.financed_amount) || 0,
      annualRatePct: parseFloat(a.annual_rate_pct) || 0,
      monthlyRatePct: a.monthly_rate_pct ? parseFloat(a.monthly_rate_pct) : null,
      dailyRateRupees: a.daily_rate_rupees ? parseFloat(a.daily_rate_rupees) : null,
      tenureMonths: parseInt(a.tenure_months) || 1,
      startDate: a.start_date,
      status: a.status || 'Active',
      collateralType: a.collateral_type || 'None',
      collateralDetails: a.collateral_details || '',
      disbursalMode: a.disbursal_mode || 'Cash',
      disbursalRef: a.disbursal_ref || '',
      assignedOfficer: a.assigned_officer || 'Officer',
      notes: a.notes || '',
      emiSchedule: a.emi_schedule || [],
      createdAt: a.created_at
    }));
  } catch (err) {
    console.warn('[Supabase] dbFetchFinanceAccounts fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_accounts');
    return local ? JSON.parse(local) : [];
  }
}

export async function dbInsertFinanceAccount(account) {
  try {
    const row = {
      id: account.id,
      application_id: account.applicationId,
      customer_id: account.customerId,
      customer_name: account.customerName,
      customer_phone: account.customerPhone,
      customer_aadhaar: account.customerAadhaar,
      customer_pan: account.customerPan,
      customer_photo: account.customerPhoto,
      product_name: account.productName,
      financed_amount: account.financedAmount,
      annual_rate_pct: account.annualRatePct,
      monthly_rate_pct: account.monthlyRatePct,
      daily_rate_rupees: account.dailyRateRupees,
      tenure_months: account.tenureMonths,
      start_date: account.startDate,
      status: account.status,
      collateral_type: account.collateralType,
      collateral_details: account.collateralDetails,
      disbursal_mode: account.disbursalMode,
      disbursal_ref: account.disbursalRef,
      assigned_officer: account.assignedOfficer,
      notes: account.notes,
      emi_schedule: account.emiSchedule
    };

    const { error } = await supabase.from('finance_accounts').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertFinanceAccount warning:', err.message);
  }
}

// ==========================================
// 3. PAYMENTS SERVICE
// ==========================================
export async function dbFetchPayments() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    if (!data) return [];

    return data.map(p => ({
      id: p.id,
      accountId: p.account_id,
      customerName: p.customer_name,
      amount: parseFloat(p.amount) || 0,
      paymentMode: p.payment_mode || 'Cash',
      referenceNo: p.reference_no || '',
      installmentNo: parseInt(p.installment_no) || 1,
      allocatedPrincipal: parseFloat(p.allocated_principal) || 0,
      allocatedInterest: parseFloat(p.allocated_interest) || 0,
      receivedBy: p.received_by || 'Cashier',
      receiptNo: p.receipt_no || '',
      timestamp: p.timestamp
    }));
  } catch (err) {
    console.warn('[Supabase] dbFetchPayments fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_payments');
    return local ? JSON.parse(local) : [];
  }
}

export async function dbInsertPayment(payment) {
  try {
    const row = {
      id: payment.id,
      account_id: payment.accountId,
      customer_name: payment.customerName,
      amount: payment.amount,
      payment_mode: payment.paymentMode,
      reference_no: payment.referenceNo,
      installment_no: payment.installmentNo,
      allocated_principal: payment.allocatedPrincipal,
      allocated_interest: payment.allocatedInterest,
      received_by: payment.receivedBy,
      receipt_no: payment.receiptNo,
      timestamp: payment.timestamp || new Date().toISOString()
    };

    const { error } = await supabase.from('payments').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertPayment warning:', err.message);
  }
}

// ==========================================
// 4. APPLICATIONS SERVICE
// ==========================================
export async function dbFetchApplications() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data) return [];

    return data.map(a => ({
      id: a.id,
      customerId: a.customer_id,
      customerName: a.customer_name,
      productId: a.product_id,
      productName: a.product_name,
      requestedAmount: parseFloat(a.requested_amount) || 0,
      tenureMonths: parseInt(a.tenure_months) || 12,
      annualRatePct: parseFloat(a.annual_rate_pct) || 0,
      calculatedEmi: parseFloat(a.calculated_emi) || 0,
      status: a.status || 'Under Review',
      reviewerComment: a.reviewer_comment || '',
      reviewedBy: a.reviewed_by || null,
      createdAt: a.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  } catch (err) {
    console.warn('[Supabase] dbFetchApplications fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_applications');
    return local ? JSON.parse(local) : [];
  }
}

export async function dbInsertApplication(app) {
  try {
    const row = {
      id: app.id,
      customer_id: app.customerId,
      customer_name: app.customerName,
      product_id: app.productId,
      product_name: app.productName,
      requested_amount: app.requestedAmount,
      tenure_months: app.tenureMonths,
      annual_rate_pct: app.annualRatePct,
      calculated_emi: app.calculatedEmi,
      status: app.status,
      reviewer_comment: app.reviewerComment,
      reviewed_by: app.reviewedBy
    };

    const { error } = await supabase.from('applications').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertApplication warning:', err.message);
  }
}

// ==========================================
// 5. OVERDUE FOLLOWUPS SERVICE
// ==========================================
export async function dbFetchOverdueFollowups() {
  try {
    const { data, error } = await supabase
      .from('overdue_followups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data) return [];

    return data.map(f => ({
      id: f.id,
      accountId: f.account_id,
      customerName: f.customer_name,
      agingBucket: f.aging_bucket,
      overdueDays: parseInt(f.overdue_days) || 0,
      amountDue: parseFloat(f.amount_due) || 0,
      contactMethod: f.contact_method,
      outcome: f.outcome,
      promiseDate: f.promise_date,
      assignedAgent: f.assigned_agent,
      lastContactDate: f.last_contact_date,
      notes: f.notes
    }));
  } catch (err) {
    console.warn('[Supabase] dbFetchOverdueFollowups fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_overdue');
    return local ? JSON.parse(local) : [];
  }
}

export async function dbInsertFollowup(followup) {
  try {
    const row = {
      id: followup.id,
      account_id: followup.accountId,
      customer_name: followup.customerName,
      aging_bucket: followup.agingBucket,
      overdue_days: followup.overdueDays,
      amount_due: followup.amountDue,
      contact_method: followup.contactMethod,
      outcome: followup.outcome,
      promise_date: followup.promiseDate,
      assigned_agent: followup.assignedAgent,
      last_contact_date: followup.lastContactDate,
      notes: followup.notes
    };

    const { error } = await supabase.from('overdue_followups').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertFollowup warning:', err.message);
  }
}

// ==========================================
// 6. AUDIT LOGS SERVICE
// ==========================================
export async function dbFetchAuditLogs() {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    if (!data) return [];

    return data.map(l => ({
      id: l.id,
      actor: l.actor,
      action: l.action,
      target: l.target,
      timestamp: l.timestamp,
      ip: l.ip || '127.0.0.1'
    }));
  } catch (err) {
    console.warn('[Supabase] dbFetchAuditLogs fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_audit_logs');
    return local ? JSON.parse(local) : [];
  }
}

export async function dbInsertAuditLog(log) {
  try {
    const row = {
      id: log.id,
      actor: log.actor,
      action: log.action,
      target: log.target,
      timestamp: log.timestamp || new Date().toISOString(),
      ip: log.ip || '127.0.0.1'
    };

    const { error } = await supabase.from('audit_logs').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertAuditLog warning:', err.message);
  }
}

// ==========================================
// 7. STAFF MEMBERS SERVICE
// ==========================================
export async function dbFetchStaffMembers() {
  try {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data) return [];

    return data.map(s => mapStaff(s));
  } catch (err) {
    console.warn('[Supabase] dbFetchStaffMembers fallback to local cache:', err.message);
    const local = localStorage.getItem('prd_staff');
    return local ? JSON.parse(local) : [
      {
        id: 'STAFF-101',
        name: 'Ramesh Verma',
        phone: '+91 98765 11001',
        email: 'ramesh.verma@finance.in',
        role: 'Field Collection Agent',
        routeArea: 'Sector 1-5 Market Route',
        monthlyTarget: 100000,
        status: 'Active',
        permissions: { canDisburse: true, canCollect: true, canReviewApps: false }
      },
      {
        id: 'STAFF-102',
        name: 'Suresh Kumar',
        phone: '+91 98765 22002',
        email: 'suresh.kumar@finance.in',
        role: 'Recovery Officer',
        routeArea: 'Industrial Area Route',
        monthlyTarget: 150000,
        status: 'Active',
        permissions: { canDisburse: false, canCollect: true, canReviewApps: false }
      }
    ];
  }
}

export async function dbInsertStaffMember(staff) {
  try {
    const row = {
      id: staff.id,
      name: staff.name,
      phone: staff.phone,
      email: staff.email,
      role: staff.role,
      route_area: staff.routeArea,
      monthly_target: staff.monthlyTarget,
      status: staff.status,
      permissions: staff.permissions
    };

    const { error } = await supabase.from('staff_members').upsert(row);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbInsertStaffMember warning:', err.message);
  }
}

export async function dbDeleteStaffMember(staffId) {
  try {
    const { error } = await supabase.from('staff_members').delete().eq('id', staffId);
    if (error) throw error;
  } catch (err) {
    console.warn('[Supabase] dbDeleteStaffMember warning:', err.message);
  }
}

// ==========================================
// 8. REALTIME ENTITY MAPPERS
// ==========================================
export function mapCustomer(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    phone: c.phone || 'N/A',
    email: c.email || '',
    fatherSpouseName: c.father_spouse_name || '',
    dob: c.dob || '1990-01-01',
    gender: c.gender || 'Male',
    aadhaar: c.aadhaar || '',
    pan: c.pan || '',
    photo: c.photo || null,
    kycStatus: c.kyc_status || 'Under Review',
    addresses: c.addresses || [],
    employment: c.employment || {},
    bankAccount: c.bank_account || {},
    documents: c.documents || [],
    createdAt: c.created_at
  };
}

export function mapFinanceAccount(a) {
  if (!a) return null;
  return {
    id: a.id,
    applicationId: a.application_id,
    customerId: a.customer_id,
    customerName: a.customer_name,
    customerPhone: a.customer_phone,
    customerAadhaar: a.customer_aadhaar,
    customerPan: a.customer_pan,
    customerPhoto: a.customer_photo,
    productName: a.product_name,
    financedAmount: parseFloat(a.financed_amount) || 0,
    annualRatePct: parseFloat(a.annual_rate_pct) || 0,
    monthlyRatePct: a.monthly_rate_pct ? parseFloat(a.monthly_rate_pct) : null,
    dailyRateRupees: a.daily_rate_rupees ? parseFloat(a.daily_rate_rupees) : null,
    tenureMonths: parseInt(a.tenure_months) || 1,
    startDate: a.start_date,
    status: a.status || 'Active',
    collateralType: a.collateral_type || 'None',
    collateralDetails: a.collateral_details || '',
    disbursalMode: a.disbursal_mode || 'Cash',
    disbursalRef: a.disbursal_ref || '',
    assignedOfficer: a.assigned_officer || 'Officer',
    notes: a.notes || '',
    emiSchedule: a.emi_schedule || [],
    createdAt: a.created_at
  };
}

export function mapPayment(p) {
  if (!p) return null;
  return {
    id: p.id,
    accountId: p.account_id,
    customerName: p.customer_name,
    amount: parseFloat(p.amount) || 0,
    paymentMode: p.payment_mode || 'Cash',
    referenceNo: p.reference_no || '',
    installmentNo: parseInt(p.installment_no) || 1,
    allocatedPrincipal: parseFloat(p.allocated_principal) || 0,
    allocatedInterest: parseFloat(p.allocated_interest) || 0,
    receivedBy: p.received_by || 'Cashier',
    receiptNo: p.receipt_no || '',
    timestamp: p.timestamp
  };
}

export function mapApplication(a) {
  if (!a) return null;
  return {
    id: a.id,
    customerId: a.customer_id,
    customerName: a.customer_name,
    productId: a.product_id,
    productName: a.product_name,
    requestedAmount: parseFloat(a.requested_amount) || 0,
    tenureMonths: parseInt(a.tenure_months) || 12,
    annualRatePct: parseFloat(a.annual_rate_pct) || 0,
    calculatedEmi: parseFloat(a.calculated_emi) || 0,
    status: a.status || 'Under Review',
    reviewerComment: a.reviewer_comment || '',
    reviewedBy: a.reviewed_by || null,
    createdAt: a.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  };
}

export function mapFollowup(f) {
  if (!f) return null;
  return {
    id: f.id,
    accountId: f.account_id,
    customerName: f.customer_name,
    agingBucket: f.aging_bucket,
    overdueDays: parseInt(f.overdue_days) || 0,
    amountDue: parseFloat(f.amount_due) || 0,
    contactMethod: f.contact_method,
    outcome: f.outcome,
    promiseDate: f.promise_date,
    assignedAgent: f.assigned_agent,
    lastContactDate: f.last_contact_date,
    notes: f.notes
  };
}

export function mapAuditLog(l) {
  if (!l) return null;
  return {
    id: l.id,
    actor: l.actor,
    action: l.action,
    target: l.target,
    timestamp: l.timestamp,
    ip: l.ip || '127.0.0.1'
  };
}

export function mapStaff(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    phone: s.phone || 'N/A',
    email: s.email || '',
    role: s.role || 'Field Collection Agent',
    routeArea: s.route_area || 'General Area',
    monthlyTarget: parseFloat(s.monthly_target) || 50000,
    status: s.status || 'Active',
    permissions: s.permissions || {
      canDisburse: false,
      canCollect: true,
      canReviewApps: false
    },
    createdAt: s.created_at
  };
}

// ==========================================
// 8. LIVE REALTIME SUBSCRIPTION
// ==========================================
export function subscribeToAllRealtime(callbacks = {}) {
  const channel = supabase
    .channel('fms_global_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload) => {
      if (callbacks.onCustomerChange) callbacks.onCustomerChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_accounts' }, (payload) => {
      if (callbacks.onAccountChange) callbacks.onAccountChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
      if (callbacks.onPaymentChange) callbacks.onPaymentChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, (payload) => {
      if (callbacks.onApplicationChange) callbacks.onApplicationChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'overdue_followups' }, (payload) => {
      if (callbacks.onFollowupChange) callbacks.onFollowupChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, (payload) => {
      if (callbacks.onAuditChange) callbacks.onAuditChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_members' }, (payload) => {
      if (callbacks.onStaffChange) callbacks.onStaffChange(payload);
    })
    .subscribe((status) => {
      if (callbacks.onStatusChange) callbacks.onStatusChange(status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
