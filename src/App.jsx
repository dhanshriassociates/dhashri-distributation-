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
import DailyCollectionsRouteView from './components/DailyCollectionsRouteView';
import StaffManagerView from './components/StaffManagerView';
import UserManagementView from './components/UserManagementView';
import LoginPage from './components/LoginPage';
import DisburseLoanModal from './components/DisburseLoanModal';
import PassbookModal from './components/PassbookModal';
import CashierDayBookView from './components/CashierDayBookView';
import AnalyticsView from './components/AnalyticsView';
import CalendarView from './components/CalendarView';
import DocsView from './components/DocsView';
import ByajCalculatorView from './components/ByajCalculatorView';
import NotificationsView from './components/NotificationsView';
import ReportsView from './components/ReportsView';

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
import { 
  testSupabaseConnection,
  dbFetchCustomers,
  dbInsertCustomer,
  dbFetchFinanceAccounts,
  dbInsertFinanceAccount,
  dbFetchPayments,
  dbInsertPayment,
  dbFetchApplications,
  dbInsertApplication,
  dbFetchOverdueFollowups,
  dbInsertFollowup,
  dbFetchAuditLogs,
  dbInsertAuditLog,
  dbFetchStaffMembers,
  dbInsertStaffMember,
  dbDeleteStaffMember,
  INITIAL_APP_USERS,
  dbFetchAppUsers,
  dbInsertAppUser,
  dbDeleteAppUser,
  subscribeToAllRealtime,
  mapCustomer,
  mapFinanceAccount,
  mapPayment,
  mapApplication,
  mapFollowup,
  mapAuditLog,
  mapStaff,
  mapAppUser
} from './lib/supabaseClient';

export default function App() {
  const [activeRole, setActiveRole] = useState('admin'); // admin, employee
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, customer360, onboarding, applications, payments, overdue, products, rbac, audit
  const [searchQuery, setSearchQuery] = useState('');
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [isDbLoading, setIsDbLoading] = useState(false);

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

  const [staffMembers, setStaffMembers] = useState(() => {
    const saved = localStorage.getItem('prd_staff');
    return saved ? JSON.parse(saved) : [
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
  });

  // System Users & Module Permissions States
  const [appUsers, setAppUsers] = useState(() => {
    const saved = localStorage.getItem('prd_app_users');
    return saved ? JSON.parse(saved) : INITIAL_APP_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('prd_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_APP_USERS[0];
  });

  // Login Session State (Shows LoginPage when null)
  const [sessionUser, setSessionUser] = useState(() => {
    const saved = localStorage.getItem('prd_session_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null; // Prompt login on first visit or after logout
  });

  // Modal States
  const [isDisburseLoanOpen, setIsDisburseLoanOpen] = useState(false);
  const [passbookAccount, setPassbookAccount] = useState(null);

  // Initial Supabase Cloud Database Hydration
  useEffect(() => {
    async function syncFromSupabase() {
      setIsDbLoading(true);
      try {
        const testRes = await testSupabaseConnection();
        setIsDbConnected(testRes.connected);

        const [dbCusts, dbAccs, dbPays, dbApps, dbFols, dbAuds, dbStaff, dbUsers] = await Promise.all([
          dbFetchCustomers(),
          dbFetchFinanceAccounts(),
          dbFetchPayments(),
          dbFetchApplications(),
          dbFetchOverdueFollowups(),
          dbFetchAuditLogs(),
          dbFetchStaffMembers(),
          dbFetchAppUsers()
        ]);

        if (dbCusts && dbCusts.length > 0) setCustomers(dbCusts);
        if (dbAccs && dbAccs.length > 0) setFinanceAccounts(dbAccs);
        if (dbPays && dbPays.length > 0) setPayments(dbPays);
        if (dbApps && dbApps.length > 0) setApplications(dbApps);
        if (dbFols && dbFols.length > 0) setOverdueFollowups(dbFols);
        if (dbAuds && dbAuds.length > 0) setAuditLogs(dbAuds);
        if (dbStaff && dbStaff.length > 0) setStaffMembers(dbStaff);
        if (dbUsers && dbUsers.length > 0) {
          setAppUsers(dbUsers);
          setCurrentUser(prev => dbUsers.find(u => u.id === prev?.id) || dbUsers[0]);
        }
      } catch (err) {
        console.warn('Initial cloud DB sync notice:', err);
      } finally {
        setIsDbLoading(false);
      }
    }

    syncFromSupabase();

    // Live Real-Time Multi-Device Cloud Sync
    const unsubscribe = subscribeToAllRealtime({
      onCustomerChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setCustomers(prev => prev.filter(c => c.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapCustomer(payload.new);
          if (mapped) {
            setCustomers(prev => {
              const idx = prev.findIndex(c => c.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
          }
        }
      },
      onAccountChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setFinanceAccounts(prev => prev.filter(a => a.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapFinanceAccount(payload.new);
          if (mapped) {
            setFinanceAccounts(prev => {
              const idx = prev.findIndex(a => a.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
          }
        }
      },
      onPaymentChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setPayments(prev => prev.filter(p => p.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapPayment(payload.new);
          if (mapped) {
            setPayments(prev => {
              const idx = prev.findIndex(p => p.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
          }
        }
      },
      onApplicationChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setApplications(prev => prev.filter(a => a.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapApplication(payload.new);
          if (mapped) {
            setApplications(prev => {
              const idx = prev.findIndex(a => a.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
          }
        }
      },
      onFollowupChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setOverdueFollowups(prev => prev.filter(f => f.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapFollowup(payload.new);
          if (mapped) {
            setOverdueFollowups(prev => {
              const idx = prev.findIndex(f => f.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
          }
        }
      },
      onAuditChange: (payload) => {
        if (payload.new) {
          const mapped = mapAuditLog(payload.new);
          if (mapped) {
            setAuditLogs(prev => [mapped, ...prev]);
          }
        }
      },
      onStaffChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setStaffMembers(prev => prev.filter(s => s.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapStaff(payload.new);
          if (mapped) {
            setStaffMembers(prev => {
              const idx = prev.findIndex(s => s.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
          }
        }
      },
      onUserChange: (payload) => {
        if (payload.eventType === 'DELETE') {
          setAppUsers(prev => prev.filter(u => u.id !== payload.old?.id));
        } else if (payload.new) {
          const mapped = mapAppUser(payload.new);
          if (mapped) {
            setAppUsers(prev => {
              const idx = prev.findIndex(u => u.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [mapped, ...prev];
            });
            setCurrentUser(prev => prev?.id === mapped.id ? mapped : prev);
          }
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // LocalStorage Cache (Dual resilience & offline safety)
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

  useEffect(() => {
    localStorage.setItem('prd_staff', JSON.stringify(staffMembers));
  }, [staffMembers]);

  useEffect(() => {
    localStorage.setItem('prd_app_users', JSON.stringify(appUsers));
  }, [appUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prd_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // System User Handlers (Save, Delete, Simulate/Switch with Supabase DB sync)
  const handleSaveAppUser = (user) => {
    setAppUsers(prev => {
      const idx = prev.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = user;
        return updated;
      }
      return [user, ...prev];
    });
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
    dbInsertAppUser(user);
    logAuditEvent(currentUser?.name || 'Admin Master', 'USER_PERMISSIONS_SAVED', `User ${user.id} (${user.name}) - Role: ${user.role}, Modules: ${(user.allowedModules || []).join(', ')}`);
  };

  const handleDeleteAppUser = (userId) => {
    const targetUser = appUsers.find(u => u.id === userId);
    setAppUsers(prev => prev.filter(u => u.id !== userId));
    dbDeleteAppUser(userId);
    logAuditEvent(currentUser?.name || 'Admin Master', 'USER_ACCOUNT_REMOVED', `User ${userId} (${targetUser?.name || 'User'})`);
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('prd_current_user', JSON.stringify(user));
    // If target user doesn't have permission for current activeView, route them safely to their first allowed module
    if (user.allowedModules && user.allowedModules.length > 0 && !user.allowedModules.includes(activeView)) {
      setActiveView(user.allowedModules[0]);
    }
    logAuditEvent(user.name, 'USER_SESSION_SIMULATED', `Switched active session to ${user.name} (${user.role})`);
  };

  const handleLoginSuccess = (user) => {
    setSessionUser(user);
    setCurrentUser(user);
    setActiveRole(user.role === 'Admin' ? 'admin' : 'employee');
    localStorage.setItem('prd_session_user', JSON.stringify(user));
    localStorage.setItem('prd_current_user', JSON.stringify(user));
    if (user.allowedModules && user.allowedModules.length > 0 && !user.allowedModules.includes(activeView)) {
      setActiveView(user.allowedModules[0]);
    }
    logAuditEvent(user.name, 'USER_LOGIN_SUCCESS', `User ${user.name} (${user.role}) signed in successfully`);
  };

  const handleLogout = () => {
    logAuditEvent(currentUser?.name || 'User', 'USER_LOGOUT', `User ${currentUser?.name} logged out`);
    setSessionUser(null);
    localStorage.removeItem('prd_session_user');
  };

  // Staff Handlers (Save & Delete with Supabase DB sync)
  const handleSaveStaffMember = (staff) => {
    setStaffMembers(prev => {
      const idx = prev.findIndex(s => s.id === staff.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = staff;
        return updated;
      }
      return [staff, ...prev];
    });
    dbInsertStaffMember(staff);
    logAuditEvent('Admin Officer', 'STAFF_MEMBER_SAVED', `Staff ${staff.id} (${staff.name}) - ${staff.role}`);
  };

  const handleDeleteStaffMember = (staffId) => {
    const staff = staffMembers.find(s => s.id === staffId);
    setStaffMembers(prev => prev.filter(s => s.id !== staffId));
    dbDeleteStaffMember(staffId);
    logAuditEvent('Admin Officer', 'STAFF_MEMBER_REMOVED', `Staff ${staffId} (${staff?.name || 'Staff'})`);
  };

  // Helper to add audit log entry (local + Supabase DB)
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
    dbInsertAuditLog(newLog);
  };

  // Direct Loan Disbursal Handler (Saves customer & finance account to Supabase DB)
  const handleDisburseLoan = ({ isNewCustomer, customer, account }) => {
    if (isNewCustomer && customer) {
      setCustomers(prev => [customer, ...prev]);
      dbInsertCustomer(customer);
      logAuditEvent(account.assignedOfficer || 'System Officer', 'CUSTOMER_ONBOARDED_WITH_KYC', `Customer ${customer.id} (${customer.name}) - Aadhaar: ${customer.aadhaar}, PAN: ${customer.pan}`);
    }

    setFinanceAccounts(prev => [account, ...prev]);
    dbInsertFinanceAccount(account);
    logAuditEvent(account.assignedOfficer || 'System Officer', 'CAPITAL_DISBURSED', `Account ${account.id} - ₹${account.financedAmount} to ${account.customerName}`);

    // Auto open Passbook statement for instant view/print
    setPassbookAccount(account);
  };

  // Onboarding Customer Handler (Saves customer to Supabase DB)
  const handleSaveCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    dbInsertCustomer(newCustomer);
    logAuditEvent('System User', 'CUSTOMER_ONBOARDED', `Customer ${newCustomer.id} (${newCustomer.name})`);
  };

  // Verify Document Handler
  const handleVerifyDocument = (customerId, docId, actorName = 'Admin Officer') => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const updatedDocs = (c.documents || []).map(d => d.id === docId ? { ...d, status: 'Verified', verifiedBy: actorName } : d);
        const allVerified = updatedDocs.every(d => d.status === 'Verified');
        const updated = {
          ...c,
          documents: updatedDocs,
          kycStatus: allVerified ? 'Verified' : 'Under Review'
        };
        dbInsertCustomer(updated);
        return updated;
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
        const updated = {
          ...c,
          documents: updatedDocs,
          kycStatus: 'Rejected'
        };
        dbInsertCustomer(updated);
        return updated;
      }
      return c;
    }));
    logAuditEvent(actorName, 'KYC_DOCUMENT_REJECTED', `Customer ${customerId} Doc ${docId} (Reason: ${reason})`);
  };

  // Application Handlers
  const handleSaveApplication = (newApp) => {
    setApplications(prev => [newApp, ...prev]);
    dbInsertApplication(newApp);
    logAuditEvent('Loan Officer', 'APPLICATION_SUBMITTED', `Application ${newApp.id} for ${newApp.customerName}`);
  };

  const handleApproveApplication = (appId, comment, actorName = 'Admin Officer') => {
    const updatedApps = applications.map(a => a.id === appId ? { ...a, status: 'Disbursed', reviewerComment: comment, reviewedBy: actorName } : a);
    setApplications(updatedApps);

    const app = applications.find(a => a.id === appId);
    if (app) {
      dbInsertApplication({ ...app, status: 'Disbursed', reviewerComment: comment, reviewedBy: actorName });
      const cust = customers.find(c => c.id === app.customerId);
      const newAcc = {
        id: `ACC-FIN-${Math.floor(100 + Math.random() * 900)}`,
        applicationId: app.id,
        customerId: app.customerId,
        customerName: app.customerName,
        customerPhone: cust?.phone || 'N/A',
        customerAadhaar: cust?.aadhaar || 'N/A',
        customerPan: cust?.pan || 'N/A',
        customerPhoto: cust?.photo || null,
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
      dbInsertFinanceAccount(newAcc);
      logAuditEvent(actorName, 'APPLICATION_APPROVED_AND_DISBURSED', `Application ${appId} -> Account ${newAcc.id}`);
    }
  };

  const handleRejectApplication = (appId, comment, actorName = 'Admin Officer') => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Rejected', reviewerComment: comment, reviewedBy: actorName } : a));
    const app = applications.find(a => a.id === appId);
    if (app) {
      dbInsertApplication({ ...app, status: 'Rejected', reviewerComment: comment, reviewedBy: actorName });
    }
    logAuditEvent(actorName, 'APPLICATION_REJECTED', `Application ${appId} (Reason: ${comment})`);
  };

  // Save Followup Note Handler (Saves to Supabase DB)
  const handleSaveFollowupNote = (newFollowup) => {
    setOverdueFollowups(prev => {
      const existingIdx = prev.findIndex(f => f.accountId === newFollowup.accountId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newFollowup;
        return updated;
      }
      return [newFollowup, ...prev];
    });
    dbInsertFollowup(newFollowup);
    logAuditEvent(newFollowup.assignedAgent || 'Recovery Officer', 'FOLLOWUP_NOTE_LOGGED', `Account ${newFollowup.accountId} (${newFollowup.customerName}) - ${newFollowup.outcome}`);
  };

  // Save Payment Handler (Saves payment & updates account in Supabase DB)
  const handleSavePayment = (newPayment) => {
    setPayments(prev => [newPayment, ...prev]);
    dbInsertPayment(newPayment);

    // Update account EMI schedule status in state & Supabase DB
    setFinanceAccounts(prev => prev.map(acc => {
      if (acc.id === newPayment.accountId) {
        const updatedSchedule = (acc.emiSchedule || []).map(s => {
          if (s.installmentNo === newPayment.installmentNo) {
            return { ...s, status: 'paid' };
          }
          return s;
        });
        const allPaid = updatedSchedule.length > 0 && updatedSchedule.every(s => s.status === 'paid');
        const updatedAcc = {
          ...acc,
          emiSchedule: updatedSchedule,
          status: allPaid ? 'Closed' : acc.status
        };
        dbInsertFinanceAccount(updatedAcc);
        return updatedAcc;
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

  // If not logged in, render LoginPage
  if (!sessionUser) {
    return (
      <LoginPage
        appUsers={appUsers}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

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
        isDbConnected={isDbConnected}
        isDbLoading={isDbLoading}
        currentUser={currentUser}
        appUsers={appUsers}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
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
            currentUser={currentUser}
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
            financeAccounts={financeAccounts}
            overdueFollowups={overdueFollowups}
            onSaveFollowupNote={handleSaveFollowupNote}
            onOpenCollectPayment={() => setActiveView('payments')}
            onOpenPassbook={(acc) => setPassbookAccount(acc)}
          />
        )}

        {activeView === 'dailyRoute' && (
          <DailyCollectionsRouteView
            financeAccounts={financeAccounts}
            staffMembers={staffMembers}
            payments={payments}
            onSavePayment={handleSavePayment}
            onSaveFollowupNote={handleSaveFollowupNote}
            onOpenPassbook={(acc) => setPassbookAccount(acc)}
          />
        )}

        {activeView === 'dayBook' && (
          <CashierDayBookView
            payments={payments}
            financeAccounts={financeAccounts}
            staffMembers={staffMembers}
            currentUser={currentUser}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            financeAccounts={financeAccounts}
            payments={payments}
            customers={customers}
            staffMembers={staffMembers}
            overdueFollowups={overdueFollowups}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            financeAccounts={financeAccounts}
            payments={payments}
            onOpenCollectPayment={() => setActiveView('payments')}
            onOpenPassbook={(acc) => setPassbookAccount(acc)}
          />
        )}

        {activeView === 'docsVault' && (
          <DocsView
            customers={customers}
            financeAccounts={financeAccounts}
            onVerifyDocument={handleVerifyDocument}
            onRejectDocument={handleRejectDocument}
          />
        )}

        {activeView === 'byajCalc' && (
          <ByajCalculatorView
            onOpenDisburseLoan={() => setIsDisburseLoanOpen(true)}
          />
        )}

        {activeView === 'notifications' && (
          <NotificationsView
            financeAccounts={financeAccounts}
            customers={customers}
            payments={payments}
            applications={applications}
            onNavigateTo={setActiveView}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            financeAccounts={financeAccounts}
            payments={payments}
            customers={customers}
            staffMembers={staffMembers}
            overdueFollowups={overdueFollowups}
          />
        )}

        {activeView === 'staff' && (
          <StaffManagerView
            staffMembers={staffMembers}
            financeAccounts={financeAccounts}
            payments={payments}
            onSaveStaffMember={handleSaveStaffMember}
            onDeleteStaffMember={handleDeleteStaffMember}
          />
        )}

        {activeView === 'userManagement' && (
          <UserManagementView
            appUsers={appUsers}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onSaveUser={handleSaveAppUser}
            onDeleteUser={handleDeleteAppUser}
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
        staffMembers={staffMembers}
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
