import { generateEmiSchedule } from '../utils/financeEngine';

export const INITIAL_ROLES = [
  { id: 'admin', name: '👑 Admin (Owner)', scope: 'Organization-wide Full Control', description: 'Complete system authority, loan disbursal, credit limits, interest configuration & finance analytics' },
  { id: 'employee', name: '👔 Employee / Loan Officer', scope: 'Field Operations & Disbursals', description: 'Customer onboarding, KYC document collection, loan initiation, and payment receipts recording' }
];

export const INITIAL_PERMISSIONS_MATRIX = [
  { module: 'Borrowers & KYC Documents', employee: 'View / Onboard / Upload', admin: 'Full Control & Verify' },
  { module: 'Loan Disbursals & Capital', employee: 'Initiate Disbursal', admin: 'Full Disbursal & Approvals' },
  { module: 'Payments & Receipts Ledger', employee: 'Collect Payment / Print', admin: 'Full Audit & Ledger Control' },
  { module: 'Turnover & Business Analytics', employee: 'Daily Collection Feed', admin: 'Organization-wide Turnover & PnL' },
  { module: 'System Backup & Data Reset', employee: 'Restricted', admin: 'Full Backup Export & Reset' }
];

export const INITIAL_FINANCE_PRODUCTS = [
  {
    id: 'prod-101',
    name: 'Personal Credit Finance',
    code: 'PCF-01',
    minAmount: 50000,
    maxAmount: 500000,
    annualRatePct: 14.5,
    minTenureMonths: 6,
    maxTenureMonths: 36,
    calcMode: 'reducing',
    processingFeePct: 1.5,
    requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Bank Statement 6M', 'Salary Slip / Income Proof']
  },
  {
    id: 'prod-102',
    name: 'Gold Secured Loan',
    code: 'GSL-02',
    minAmount: 25000,
    maxAmount: 1500000,
    annualRatePct: 12.0,
    minTenureMonths: 3,
    maxTenureMonths: 24,
    calcMode: 'flat',
    processingFeePct: 0.75,
    requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Gold Valuation Report', 'Ornaments Receipt']
  },
  {
    id: 'prod-103',
    name: 'Micro Business Growth Loan',
    code: 'MBF-03',
    minAmount: 30000,
    maxAmount: 300000,
    annualRatePct: 24.0, // 2% per month
    minTenureMonths: 3,
    maxTenureMonths: 18,
    calcMode: 'flat',
    processingFeePct: 2.0,
    requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Business Trade License', 'Post Dated Cheques']
  }
];

export const INITIAL_USERS = [
  { id: 'usr-1', name: 'Vikramaditya Rao', email: 'admin@finplatform.com', role: 'super_admin', branch: 'Headquarters', status: 'Active' },
  { id: 'usr-2', name: 'Sanjay Deshmukh', email: 'sanjay.m@finplatform.com', role: 'manager', branch: 'Jaipur Main Branch', status: 'Active' },
  { id: 'usr-3', name: 'Ramesh Verma', email: 'ramesh.v@finplatform.com', role: 'employee', branch: 'Jaipur Main Branch', status: 'Active' },
  { id: 'usr-4', name: 'Priya Sharma', email: 'priya.s@finplatform.com', role: 'employee', branch: 'Ahmedabad Branch', status: 'Active' }
];

// PRODUCTION INITIAL DATASETS: Clean Real-Data Mode (0 Dummy Entries)
export const INITIAL_CUSTOMERS = [];

export const INITIAL_APPLICATIONS = [];

export const INITIAL_FINANCE_ACCOUNTS = [];

export const INITIAL_PAYMENT_LEDGER = [];

export const INITIAL_OVERDUE_FOLLOWUPS = [];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-init-01',
    actor: 'System Admin',
    action: 'SYSTEM_INITIALIZED',
    target: 'Real-Time Enterprise Finance Engine v1.0 (Production Live)',
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1'
  }
];

