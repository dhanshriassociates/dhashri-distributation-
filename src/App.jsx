import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import Customer360View from './components/Customer360View';
import OnboardingWizardView from './components/OnboardingWizardView';
import ApplicationsWorkflowView from './components/ApplicationsWorkflowView';
import FinanceProductsView from './components/FinanceProductsView';
import PaymentsLedgerView from './components/PaymentsLedgerView';
import OverdueCollectionsView from './components/OverdueCollectionsView';
import RbacPermissionsView from './components/RbacPermissionsView';
import AuditLogsView from './components/AuditLogsView';
import DisburseLoanModal from './components/DisburseLoanModal';
import PassbookModal from './components/PassbookModal';

import { 
  INITIAL_ROLES, 
  INITIAL_PERMISSIONS_MATRIX, 
  INITIAL_FINANCE_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_APPLICATIONS, 
  INITIAL_FINANCE_ACCOUNTS, 
  INITIAL_PAYMENT_LEDGER, 
  INITIAL_OVERDUE_FOLLOWUPS, 
  INITIAL_AUDIT_LOGS 
} from './data/prdDataset';

import { generateEmiSchedule } from './utils/financeEngine';

export default function App() {
  const [activeRole, setActiveRole] = useState('admin'); // admin, employee
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, customer360, onboarding, applications, payments, overdue, products, rbac, audit
  const [searchQuery, setSearchQuery] = useState('');

  // Clean Real-Data Purge Flag (Removes old mock items from localStorage)
  useEffect(() => {
    const isCleaned = localStorage.getItem('fms_real_data_clean_v2');
    if (!isCleaned) {
      // Clear legacy dummy mock keys
      localStorage.removeItem('prd_customers');
      localStorage.removeItem('prd_applications');
      localStorage.removeItem('prd_accounts');
      localStorage.removeItem('prd_payments');
      localStorage.removeItem('prd_overdue');
      localStorage.setItem('fms_real_data_clean_v2', 'true');
    }
  }, []);

  // Persistent States
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('prd_customers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If parsed contains legacy mock customer, discard
        if (parsed.some && parsed.some(c => c.id === 'CUST-8001')) return [];
        return parsed;
      } catch {
        return [];
      }
    }
    return INITIAL_CUSTOMERS;
  });

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('prd_applications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some && parsed.some(a => a.id === 'APP-2026-101')) return [];
        return parsed;
      } catch {
        return [];
      }
    }
    return INITIAL_APPLICATIONS;
  });

  const [financeAccounts, setFinanceAccounts] = useState(() => {
    const saved = localStorage.getItem('prd_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some && parsed.some(a => a.id === 'ACC-FIN-901')) return [];
        return parsed;
      } catch {
        return [];
      }
    }
    return INITIAL_FINANCE_ACCOUNTS;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('prd_payments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some && parsed.some(p => p.id === 'PAY-7001')) return [];
        return parsed;
      } catch {
        return [];
      }
    }
    return INITIAL_PAYMENT_LEDGER;
  });

  const [overdueFollowups, setOverdueFollowups] = useState(() => {
    const saved = localStorage.getItem('prd_overdue');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some && parsed.some(f => f.id === 'FOL-501')) return [];
        return parsed;
      } catch {
        return [];
      }
    }
    return INITIAL_OVERDUE_FOLLOWUPS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('prd_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Modal States
  const [isDisburseLoanOpen, setIsDisburseLoanOpen] = useState(false);
  const [passbookAccount, setPassbookAccount] = useState(null);

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem('prd_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('prd_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('prd_accounts', JSON.stringify(financeAccounts));
  }, [financeAccounts]);

  useEffect(() => {
    localStorage.setItem('prd_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('prd_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to add audit log entry
  const logAuditEvent = (actor, action, target) => {
    const newLog = {
      id: `aud-${Date.now()}`,
      actor,
      action,
      target,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Direct Loan Disbursal Handler (Fast Track with Aadhaar & PAN Intake)
  const handleDisburseLoan = ({ isNewCustomer, customer, account }) => {
    if (isNewCustomer && customer) {
      setCustomers(prev => [customer, ...prev]);
      logAuditEvent(account.assignedOfficer || 'System Officer', 'CUSTOMER_ONBOARDED_WITH_KYC', `Customer ${customer.id} (${customer.name}) - Aadhaar: ${customer.aadhaar}, PAN: ${customer.pan}`);
    }

    setFinanceAccounts(prev => [account, ...prev]);
    logAuditEvent(account.assignedOfficer || 'System Officer', 'CAPITAL_DISBURSED', `Account ${account.id} - ₹${account.financedAmount} to ${account.customerName}`);

    // Auto open Passbook statement for instant view/print
    setPassbookAccount(account);
  };

  // Onboarding Customer Handler
  const handleSaveCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    logAuditEvent('System User', 'CUSTOMER_ONBOARDED', `Customer ${newCustomer.id} (${newCustomer.name})`);
  };

  // Verify Document Handler
  const handleVerifyDocument = (customerId, docId, actorName = 'Admin Officer') => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const updatedDocs = (c.documents || []).map(d => d.id === docId ? { ...d, status: 'Verified', verifiedBy: actorName } : d);
        const allVerified = updatedDocs.every(d => d.status === 'Verified');
        return {
          ...c,
          documents: updatedDocs,
          kycStatus: allVerified ? 'Verified' : 'Under Review'
        };
      }
      return c;
    }));
    logAuditEvent(actorName, 'KYC_DOCUMENT_VERIFIED', `Customer ${customerId} Doc ${docId}`);
  };

  // Reject Document Handler
  const handleRejectDocument = (customerId, docId, reason, actorName = 'Admin Officer') => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const updatedDocs = (c.documents || []).map(d => d.id === docId ? { ...d, status: 'Rejected', rejectionReason: reason, verifiedBy: actorName } : d);
        return {
          ...c,
          documents: updatedDocs,
          kycStatus: 'Rejected'
        };
      }
      return c;
    }));
    logAuditEvent(actorName, 'KYC_DOCUMENT_REJECTED', `Customer ${customerId} Doc ${docId} (Reason: ${reason})`);
  };

  // Application Handlers
  const handleSaveApplication = (newApp) => {
    setApplications(prev => [newApp, ...prev]);
    logAuditEvent('Loan Officer', 'APPLICATION_SUBMITTED', `Application ${newApp.id} for ${newApp.customerName}`);
  };

  const handleApproveApplication = (appId, comment, actorName = 'Admin Officer') => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Disbursed', reviewerComment: comment, reviewedBy: actorName } : a));

    const app = applications.find(a => a.id === appId);
    if (app) {
      const newAcc = {
        id: `ACC-FIN-${Math.floor(100 + Math.random() * 900)}`,
        applicationId: app.id,
        customerId: app.customerId,
        customerName: app.customerName,
        productName: app.productName,
        financedAmount: app.requestedAmount,
        annualRatePct: app.annualRatePct,
        tenureMonths: app.tenureMonths,
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        assignedOfficer: actorName,
        emiSchedule: generateEmiSchedule(app.requestedAmount, app.annualRatePct, app.tenureMonths, new Date().toISOString().split('T')[0], 'reducing')
      };
      setFinanceAccounts(prev => [newAcc, ...prev]);
      logAuditEvent(actorName, 'APPLICATION_APPROVED_AND_DISBURSED', `Application ${appId} -> Account ${newAcc.id}`);
    }
  };

  const handleRejectApplication = (appId, comment, actorName = 'Admin Officer') => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Rejected', reviewerComment: comment, reviewedBy: actorName } : a));
    logAuditEvent(actorName, 'APPLICATION_REJECTED', `Application ${appId} (Reason: ${comment})`);
  };

  // Save Payment Handler
  const handleSavePayment = (newPayment) => {
    setPayments(prev => [newPayment, ...prev]);

    // Update account EMI schedule status
    setFinanceAccounts(prev => prev.map(acc => {
      if (acc.id === newPayment.accountId) {
        const updatedSchedule = (acc.emiSchedule || []).map(s => {
          if (s.installmentNo === newPayment.installmentNo) {
            return { ...s, status: 'paid' };
          }
          return s;
        });
        const allPaid = updatedSchedule.length > 0 && updatedSchedule.every(s => s.status === 'paid');
        return {
          ...acc,
          emiSchedule: updatedSchedule,
          status: allPaid ? 'Closed' : acc.status
        };
      }
      return acc;
    }));

    logAuditEvent(newPayment.receivedBy || 'Cashier', 'PAYMENT_COLLECTED', `Payment ${newPayment.id} (₹${newPayment.amount}) for Account ${newPayment.accountId}`);
  };

  // Reset to Clean Data (Zero Dummy Entries)
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data and start completely fresh? All entries will be cleared.')) {
      setCustomers([]);
      setApplications([]);
      setFinanceAccounts([]);
      setPayments([]);
      setOverdueFollowups([]);
      setAuditLogs([
        {
          id: `aud-reset-${Date.now()}`,
          actor: 'System Admin',
          action: 'SYSTEM_RESET_CLEAN',
          target: 'Database reset to 0 entries (Clean Real Data Mode)',
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1'
        }
      ]);
      localStorage.clear();
      localStorage.setItem('fms_real_data_clean_v2', 'true');
    }
  };

  // Export Real Data Backup (JSON download)
  const handleExportData = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      version: '1.0',
      customers,
      financeAccounts,
      applications,
      payments,
      auditLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `finplatform_real_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      
      {/* Persistent Header */}
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        auditCount={auditLogs.length}
        onOpenDisburseLoan={() => setIsDisburseLoanOpen(true)}
      />

      {/* Main Container */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeView === 'dashboard' && (
          <DashboardView
            activeRole={activeRole}
            customers={customers}
            applications={applications}
            financeAccounts={financeAccounts}
            payments={payments}
            overdueFollowups={overdueFollowups}
            onNavigateTo={setActiveView}
            onOpenDisburseLoan={() => setIsDisburseLoanOpen(true)}
            onOpenCollectPayment={() => setActiveView('payments')}
            onOpenPassbook={(acc) => setPassbookAccount(acc)}
            onResetData={handleResetData}
            onExportData={handleExportData}
          />
        )}

        {activeView === 'customer360' && (
          <Customer360View
            customers={customers}
            applications={applications}
            financeAccounts={financeAccounts}
            payments={payments}
            overdueFollowups={overdueFollowups}
            auditLogs={auditLogs}
            onVerifyDocument={handleVerifyDocument}
            onRejectDocument={handleRejectDocument}
            onOpenDisburseLoan={() => setIsDisburseLoanOpen(true)}
            onOpenPassbook={(acc) => setPassbookAccount(acc)}
            onNavigateTo={setActiveView}
          />
        )}

        {activeView === 'onboarding' && (
          <OnboardingWizardView
            onSaveCustomer={handleSaveCustomer}
            onNavigateTo={setActiveView}
          />
        )}

        {activeView === 'applications' && (
          <ApplicationsWorkflowView
            applications={applications}
            customers={customers}
            financeProducts={INITIAL_FINANCE_PRODUCTS}
            onSaveApplication={handleSaveApplication}
            onApproveApplication={handleApproveApplication}
            onRejectApplication={handleRejectApplication}
            onOpenDisburseLoan={() => setIsDisburseLoanOpen(true)}
          />
        )}

        {activeView === 'products' && (
          <FinanceProductsView
            financeProducts={INITIAL_FINANCE_PRODUCTS}
          />
        )}

        {activeView === 'payments' && (
          <PaymentsLedgerView
            payments={payments}
            financeAccounts={financeAccounts}
            onSavePayment={handleSavePayment}
            onOpenDisburseLoan={() => setIsDisburseLoanOpen(true)}
          />
        )}

        {activeView === 'overdue' && (
          <OverdueCollectionsView
            overdueFollowups={overdueFollowups}
          />
        )}

        {activeView === 'rbac' && (
          <RbacPermissionsView
            roles={INITIAL_ROLES}
            permissionMatrix={INITIAL_PERMISSIONS_MATRIX}
          />
        )}

        {activeView === 'audit' && (
          <AuditLogsView
            auditLogs={auditLogs}
          />
        )}
      </main>

      {/* Global Real Loan Disbursal Modal (Aadhaar & PAN Intake) */}
      <DisburseLoanModal
        isOpen={isDisburseLoanOpen}
        onClose={() => setIsDisburseLoanOpen(false)}
        customers={customers}
        financeProducts={INITIAL_FINANCE_PRODUCTS}
        onDisburseLoan={handleDisburseLoan}
      />

      {/* Global Passbook Statement Modal */}
      {passbookAccount && (
        <PassbookModal
          account={passbookAccount}
          payments={payments}
          onClose={() => setPassbookAccount(null)}
        />
      )}

    </div>
  );
}
