import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Mail, 
  Phone, 
  Key, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Sliders, 
  LogIn, 
  ShieldAlert, 
  LayoutDashboard, 
  CalendarCheck, 
  UserCheck, 
  FileCheck, 
  Receipt, 
  AlertTriangle, 
  CreditCard, 
  FileText,
  Save,
  RotateCcw,
  Shield,
  Layers,
  CheckSquare,
  Square,
  Wallet,
  BarChart3,
  Calendar,
  Calculator,
  FolderCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AVAILABLE_MODULES = [
  { id: 'dashboard', label: 'Dashboard Overview', desc: 'Financial KPI summary, capital charts & portfolio analytics', icon: LayoutDashboard },
  { id: 'dailyRoute', label: "Today's Route (Due Sheet)", desc: 'Daily dues, who pays today, 1-click collection & skip', icon: CalendarCheck },
  { id: 'customer360', label: 'Borrowers 360 & KYC', desc: 'Borrower dossier, loan passbook, Aadhaar/PAN documents', icon: Users },
  { id: 'staff', label: 'Staff & Team Manager', desc: 'Field agent rosters, recovery targets & route territory assignments', icon: UserCheck },
  { id: 'dayBook', label: 'Cashier Day-Book & Handover', desc: 'Daily cash drawer balance, agent cash handover & evening tally', icon: Wallet },
  { id: 'analytics', label: 'Portfolio Analytics & PAR', desc: 'PAR 30/60/90, collection efficiency, agent performance leaderboard', icon: BarChart3 },
  { id: 'calendar', label: 'Installment Due Calendar', desc: 'Day-wise due dates, scheduled repayments & WhatsApp reminders', icon: Calendar },
  { id: 'onboarding', label: '+ Onboard Borrower', desc: 'Full KYC intake wizard for new borrower registrations', icon: UserPlus },
  { id: 'applications', label: 'Loan Applications & LOS', desc: 'Credit underwriting workflow, appraisal & loan approval', icon: FileCheck },
  { id: 'payments', label: 'Payments Ledger', desc: 'Receipt logging, interest/principal split & ledger transactions', icon: Receipt },
  { id: 'overdue', label: 'Overdue Collections & NPA', desc: 'Aging buckets, call notes & recovery promises to pay', icon: AlertTriangle },
  { id: 'byajCalc', label: 'Byaj & EMI Calculator', desc: 'Daily 100-day scheme, monthly flat byaj & reducing EMI quotation', icon: Calculator },
  { id: 'docsVault', label: 'KYC & Legal Document Vault', desc: 'Aadhaar cards, PAN verification, signed promissory notes', icon: FolderCheck },
  { id: 'products', label: 'Finance Products', desc: 'Daily/Monthly byaj rules & interest rate configurations', icon: CreditCard },
  { id: 'userManagement', label: 'Admin Panel & Access', desc: 'User management, module permissions and access control', icon: ShieldCheck },
  { id: 'rbac', label: 'RBAC Matrix', desc: 'Static security policies & role matrix overview', icon: Sliders },
  { id: 'audit', label: 'Audit Trail', desc: 'Tamper-evident logs of every transaction & system change', icon: FileText }
];

// Helper to construct full modulePermissions object for a user
export function buildUserModulePermissions(user) {
  const allowed = Array.isArray(user?.allowedModules) ? user.allowedModules : ['dashboard'];
  const base = {};

  AVAILABLE_MODULES.forEach(m => {
    const isAllowed = allowed.includes(m.id);
    const existing = user?.modulePermissions?.[m.id];
    if (existing) {
      base[m.id] = {
        view: existing.view ?? isAllowed,
        modify: existing.modify ?? (isAllowed && user.role === 'Admin'),
        delete: existing.delete ?? (isAllowed && user.role === 'Admin')
      };
    } else {
      base[m.id] = {
        view: isAllowed,
        modify: isAllowed && (user.role === 'Admin' || user.role === 'Branch Manager'),
        delete: isAllowed && user.role === 'Admin'
      };
    }
  });

  return base;
}

export default function UserManagementView({
  appUsers = [],
  currentUser,
  onSwitchUser,
  onSaveUser,
  onDeleteUser
}) {
  // Top Active Tab: 'permissions' (the exact table view requested) or 'users' or 'modules'
  const [activeTab, setActiveTab] = useState('permissions');

  // Selected User for Permissions Matrix
  const [selectedUserId, setSelectedUserId] = useState(() => appUsers[0]?.id || 'USR-001');
  const selectedUser = appUsers.find(u => u.id === selectedUserId) || appUsers[0] || {};

  // Local state for the selected user's module permissions table
  const [localPermissions, setLocalPermissions] = useState(() => buildUserModulePermissions(selectedUser));
  const [moduleSearch, setModuleSearch] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Synchronize local permissions when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setLocalPermissions(buildUserModulePermissions(selectedUser));
      setSaveSuccessMsg('');
    }
  }, [selectedUserId, appUsers]);

  // Modal State for Adding/Editing User Profile
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Field Collection Agent',
    passcode: '1234',
    status: 'Active'
  });

  // Toggle single cell
  const handleToggleCell = (moduleId, type) => {
    setLocalPermissions(prev => {
      const current = prev[moduleId] || { view: false, modify: false, delete: false };
      const nextVal = !current[type];

      // If modify or delete is turned on, auto-enable view
      let nextView = current.view;
      if ((type === 'modify' || type === 'delete') && nextVal) {
        nextView = true;
      }
      // If view is turned off, auto-disable modify and delete
      let nextModify = current.modify;
      let nextDelete = current.delete;
      if (type === 'view' && !nextVal) {
        nextModify = false;
        nextDelete = false;
      }

      return {
        ...prev,
        [moduleId]: {
          view: type === 'view' ? nextVal : nextView,
          modify: type === 'modify' ? nextVal : nextModify,
          delete: type === 'delete' ? nextVal : nextDelete
        }
      };
    });
  };

  // Quick Set: Full Access for a module
  const handleQuickSetFull = (moduleId) => {
    setLocalPermissions(prev => ({
      ...prev,
      [moduleId]: { view: true, modify: true, delete: true }
    }));
  };

  // Quick Set: None (revoke) for a module
  const handleQuickSetNone = (moduleId) => {
    setLocalPermissions(prev => ({
      ...prev,
      [moduleId]: { view: false, modify: false, delete: false }
    }));
  };

  // Grant All Modules
  const handleGrantAll = () => {
    const updated = {};
    AVAILABLE_MODULES.forEach(m => {
      updated[m.id] = { view: true, modify: true, delete: selectedUser.role === 'Admin' };
    });
    setLocalPermissions(updated);
  };

  // Revoke All Modules (keeps dashboard view only)
  const handleRevokeAll = () => {
    const updated = {};
    AVAILABLE_MODULES.forEach(m => {
      updated[m.id] = { view: m.id === 'dashboard', modify: false, delete: false };
    });
    setLocalPermissions(updated);
  };

  // Save Permissions to Supabase
  const handleSavePermissions = () => {
    const allowedModules = Object.keys(localPermissions).filter(m => localPermissions[m].view);

    const updatedUser = {
      ...selectedUser,
      allowedModules: allowedModules.length > 0 ? allowedModules : ['dashboard'],
      modulePermissions: localPermissions,
      permissions: {
        canDisburseLoan: Boolean(localPermissions.onboarding?.modify || localPermissions.applications?.modify),
        canCollectPayment: Boolean(localPermissions.dailyRoute?.modify || localPermissions.payments?.modify),
        canApproveLoan: Boolean(localPermissions.applications?.modify),
        canDeleteRecords: Boolean(localPermissions.payments?.delete || localPermissions.customer360?.delete),
        canExportReports: Boolean(localPermissions.dashboard?.view)
      }
    };

    onSaveUser(updatedUser);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
    setSaveSuccessMsg(`Permissions saved successfully for ${selectedUser.name}!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Handle Save User Modal
  const handleSaveUserModalSubmit = (e) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      alert('Please fill out Name and Email.');
      return;
    }

    const payload = {
      id: editingUserId || `USR-${Date.now().toString().slice(-4)}`,
      name: userFormData.name.trim(),
      email: userFormData.email.trim().toLowerCase(),
      phone: userFormData.phone.trim(),
      role: userFormData.role,
      passcode: userFormData.passcode.trim() || '1234',
      status: userFormData.status,
      allowedModules: editingUserId ? (selectedUser.allowedModules || ['dashboard']) : ['dashboard', 'dailyRoute', 'payments'],
      modulePermissions: editingUserId ? (selectedUser.modulePermissions || {}) : {},
      permissions: {
        canDisburseLoan: userFormData.role === 'Admin',
        canCollectPayment: true,
        canApproveLoan: userFormData.role === 'Admin' || userFormData.role === 'Credit Underwriter',
        canDeleteRecords: userFormData.role === 'Admin',
        canExportReports: userFormData.role === 'Admin'
      },
      createdAt: new Date().toISOString()
    };

    onSaveUser(payload);
    setIsUserModalOpen(false);
    setSelectedUserId(payload.id);
  };

  // Calculated Stats for Table Summary Bar
  const modulesGrantedCount = Object.values(localPermissions).filter(p => p.view).length;
  const viewCount = Object.values(localPermissions).filter(p => p.view).length;
  const modCount = Object.values(localPermissions).filter(p => p.modify).length;
  const delCount = Object.values(localPermissions).filter(p => p.delete).length;

  // Filter modules by search
  const filteredModules = AVAILABLE_MODULES.filter(m => {
    if (!moduleSearch.trim()) return true;
    const q = moduleSearch.toLowerCase();
    return m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.8rem 2rem' }}>
      
      {/* Top Breadcrumb & Header Title (Matching Image 2) */}
      <div style={{ marginBottom: '1.4rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#059669',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '0.25rem'
        }}>
          <Shield size={13} /> ADMIN PANEL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              User management & access control
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
              Manage users, module permissions, and employee mappings.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingUserId(null);
              setUserFormData({
                name: '',
                email: '',
                phone: '',
                role: 'Field Collection Agent',
                passcode: '1234',
                status: 'Active'
              });
              setIsUserModalOpen(true);
            }}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700
            }}
          >
            <UserPlus size={15} /> + Add New User
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Users, Permissions, Modules - Matching Image 2) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '1.6rem'
      }}>
        <button
          onClick={() => setActiveTab('permissions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 0.2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'permissions' ? '2.5px solid #059669' : '2.5px solid transparent',
            color: activeTab === 'permissions' ? '#059669' : '#64748B',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'permissions' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={16} /> Permissions
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 0.2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2.5px solid #059669' : '2.5px solid transparent',
            color: activeTab === 'users' ? '#059669' : '#64748B',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'users' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          <Users size={16} /> Users <span style={{ fontSize: '0.74rem', background: '#F1F5F9', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>{appUsers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 0.2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'modules' ? '2.5px solid #059669' : '2.5px solid transparent',
            color: activeTab === 'modules' ? '#059669' : '#64748B',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'modules' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          <Layers size={16} /> Modules <span style={{ fontSize: '0.74rem', background: '#F1F5F9', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>{AVAILABLE_MODULES.length}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PERMISSIONS MATRIX (Exact Replica of Image 2) */}
      {/* ========================================================= */}
      {activeTab === 'permissions' && (
        <div>
          {/* Action & Control Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Left Controls: Select User & Search Modules */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
              
              {/* Select User Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Select user:</span>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    padding: '0.48rem 0.85rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1.5px solid #059669',
                    background: '#FFF',
                    color: '#0F172A',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {appUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Modules Input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Modules Granted Indicator & Bulk Set */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                  {modulesGrantedCount}/{AVAILABLE_MODULES.length} Modules Granted
                </span>

                <button
                  type="button"
                  onClick={handleGrantAll}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Grant all
                </button>

                <button
                  type="button"
                  onClick={handleRevokeAll}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Revoke all
                </button>
              </div>
            </div>

            {/* Right: Save Permissions Button (Teal / Emerald) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {saveSuccessMsg && (
                <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                  ✓ {saveSuccessMsg}
                </span>
              )}
              <button
                type="button"
                onClick={handleSavePermissions}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.3rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFF',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Check size={16} /> Save permissions
              </button>
            </div>
          </div>

          {/* Effective Access Summary Banner (Matching Image 2) */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            marginBottom: '1.2rem',
            fontSize: '0.76rem',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            flexWrap: 'wrap'
          }}>
            <ShieldCheck size={15} color="#059669" />
            <strong style={{ color: '#0F172A' }}>Effective Access Summary:</strong>
            <span>Platform role: <strong>{selectedUser.role?.toLowerCase() || 'staff'}</strong></span>
            <span>|</span>
            <span>Account Status: <strong>{selectedUser.status || 'Active'}</strong></span>
            <span>|</span>
            <span>Assigned Officer Scope: <code style={{ background: '#E2E8F0', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#0F172A' }}>{selectedUser.id}</code></span>
            <span>|</span>
            <span>Modules (view/modify/delete): <strong style={{ color: '#059669' }}>{viewCount}</strong> / <strong style={{ color: '#2563EB' }}>{modCount}</strong> / <strong style={{ color: '#DC2626' }}>{delCount}</strong></span>
          </div>

          {/* Granular Permissions Table (Exact Columns: MODULE, VIEW, MODIFY, DELETE, QUICK SET) */}
          <div style={{
            background: '#FFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1.4rem', width: '45%' }}>MODULE</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '12%' }}>VIEW</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '12%' }}>MODIFY</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '12%' }}>DELETE</th>
                  <th style={{ padding: '0.85rem 1.4rem', textAlign: 'center', width: '19%' }}>QUICK SET</th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.map(module => {
                  const perm = localPermissions[module.id] || { view: false, modify: false, delete: false };
                  const Icon = module.icon;

                  return (
                    <tr 
                      key={module.id} 
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: perm.view ? '#FFF' : '#FCFDFD',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Module Info */}
                      <td style={{ padding: '0.9rem 1.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: perm.view ? '#ECFDF5' : '#F1F5F9',
                            color: perm.view ? '#059669' : '#94A3B8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: perm.view ? '#0F172A' : '#64748B' }}>
                              {module.label}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.1rem' }}>
                              {module.desc}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VIEW Checkbox */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={perm.view}
                          onChange={() => handleToggleCell(module.id, 'view')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#059669'
                          }}
                          title={`Allow ${selectedUser.name} to view/see ${module.label}`}
                        />
                      </td>

                      {/* MODIFY Checkbox */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={perm.modify}
                          onChange={() => handleToggleCell(module.id, 'modify')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#2563EB'
                          }}
                          title={`Allow ${selectedUser.name} to create/modify records in ${module.label}`}
                        />
                      </td>

                      {/* DELETE Checkbox */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={perm.delete}
                          onChange={() => handleToggleCell(module.id, 'delete')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#DC2626'
                          }}
                          title={`Allow ${selectedUser.name} to delete/cancel records in ${module.label}`}
                        />
                      </td>

                      {/* QUICK SET Buttons (Full | None) */}
                      <td style={{ padding: '0.9rem 1.4rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleQuickSetFull(module.id)}
                            style={{
                              padding: '0.25rem 0.7rem',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFF',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            Full
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickSetNone(module.id)}
                            style={{
                              padding: '0.25rem 0.7rem',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#FFF',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            None
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: USERS ROSTER */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.4rem' }}>
          {appUsers.map(user => {
            const isCurrent = currentUser?.id === user.id;
            const allowedCount = (user.allowedModules || []).length;
            const isSuspended = user.status === 'Suspended';

            return (
              <div 
                key={user.id} 
                style={{
                  background: '#FFF',
                  padding: '1.4rem',
                  borderRadius: '14px',
                  border: isCurrent ? '2px solid #059669' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: user.role === 'Admin' ? 'linear-gradient(135deg, #059669, #10B981)' : '#F1F5F9',
                        color: user.role === 'Admin' ? '#FFF' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {user.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                            {user.role}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '10px',
                            background: isSuspended ? '#FEF2F2' : '#ECFDF5',
                            color: isSuspended ? '#DC2626' : '#059669'
                          }}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>{user.id}</span>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '0.85rem', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Email: <strong>{user.email}</strong></div>
                    <div>Passcode PIN: <strong>•••• ({user.passcode || '1234'})</strong></div>
                    <div>Access: <strong style={{ color: '#059669' }}>{allowedCount} of {AVAILABLE_MODULES.length} Modules Allowed</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setActiveTab('permissions');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: '8px',
                      border: '1px solid #059669',
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Edit Module Permissions →
                  </button>

                  <button
                    type="button"
                    onClick={() => onSwitchUser(user)}
                    disabled={isCurrent}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: isCurrent ? '#F1F5F9' : '#FFF',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: isCurrent ? 'default' : 'pointer'
                    }}
                  >
                    {isCurrent ? 'Current' : 'Simulate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SYSTEM MODULES OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'modules' && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                System Module Catalog
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                All {AVAILABLE_MODULES.length} modules available in this platform and how many users have access.
              </p>
            </div>
            <span style={{ background: '#F1F5F9', padding: '0.3rem 0.75rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              {AVAILABLE_MODULES.length} Modules Total
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.8rem 1.2rem' }}>#</th>
                  <th style={{ padding: '0.8rem 1.2rem' }}>Module Name</th>
                  <th style={{ padding: '0.8rem 1.2rem' }}>Description</th>
                  <th style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>Users with Access</th>
                  <th style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>Access Rate</th>
                  <th style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {AVAILABLE_MODULES.map((m, idx) => {
                  const Icon = m.icon;
                  const usersWithAccess = appUsers.filter(u => (u.allowedModules || []).includes(m.id)).length;
                  const accessRate = appUsers.length > 0 ? Math.round((usersWithAccess / appUsers.length) * 100) : 0;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.9rem 1.2rem', color: '#94A3B8', fontWeight: 700, fontSize: '0.76rem' }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: '#ECFDF5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={16} color="#059669" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>{m.label}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>ID: {m.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', color: '#475569', fontSize: '0.8rem', maxWidth: '340px' }}>
                        {m.desc}
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: usersWithAccess > 0 ? '#047857' : '#94A3B8'
                        }}>
                          {usersWithAccess}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}> / {appUsers.length}</span>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                          <div style={{ height: '6px', width: '80px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${accessRate}%`,
                              height: '100%',
                              background: accessRate >= 75 ? '#10B981' : accessRate >= 40 ? '#F59E0B' : '#E2E8F0',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>{accessRate}%</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('permissions');
                          }}
                          style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: '#FFF',
                            color: '#334155',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Manage Access →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT USER PROFILE */}
      {/* ========================================================= */}
      {isUserModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.8rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0' }}>
              {editingUserId ? 'Edit User' : 'Create New User Account'}
            </h2>

            <form onSubmit={handleSaveUserModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ajay Sharma"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Login Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ajay.sharma@dhanshri.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Passcode PIN
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={userFormData.passcode}
                    onChange={(e) => setUserFormData({ ...userFormData, passcode: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Role
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Field Collection Agent">Field Collection Agent</option>
                    <option value="Branch Cashier">Branch Cashier</option>
                    <option value="Credit Underwriter">Credit Underwriter</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Status
                  </label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#FFF', fontWeight: 700 }}
                >
                  Save & Configure Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
