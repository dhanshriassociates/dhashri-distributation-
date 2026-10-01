import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AVAILABLE_MODULES = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, desc: 'Financial KPI summary, capital charts & metrics' },
  { id: 'dailyRoute', label: "Today's Route (Due Sheet)", icon: CalendarCheck, desc: 'Daily dues, who pays today, 1-click collection & skip' },
  { id: 'customer360', label: 'Borrowers 360 & KYC', icon: Users, desc: 'Customer dossier, loan passbook, Aadhaar/PAN documents' },
  { id: 'staff', label: 'Staff & Team Manager', icon: UserCheck, desc: 'Field agent rosters, recovery targets & route areas' },
  { id: 'onboarding', label: '+ Onboard Borrower', icon: UserPlus, desc: 'Full KYC intake wizard for new borrowers' },
  { id: 'applications', label: 'Loan Applications', icon: FileCheck, desc: 'Underwriting workflow, appraisal & loan approval' },
  { id: 'payments', label: 'Payments Ledger', icon: Receipt, desc: 'Receipt logging, interest/principal split & ledger' },
  { id: 'overdue', label: 'Overdue Collections', icon: AlertTriangle, desc: 'Aging buckets, call notes & recovery promises' },
  { id: 'products', label: 'Finance Products', icon: CreditCard, desc: 'Daily/Monthly byaj rules & interest rates' },
  { id: 'rbac', label: 'RBAC Matrix', icon: Sliders, desc: 'Static security policies & role matrix' },
  { id: 'audit', label: 'Audit Trail', icon: FileText, desc: 'Tamper-evident logs of every transaction & change' },
  { id: 'userManagement', label: 'User Management (Admin)', icon: ShieldCheck, desc: 'Admin control over users & module permissions' }
];

export const ROLE_PRESETS = {
  'Admin': {
    modules: AVAILABLE_MODULES.map(m => m.id),
    permissions: {
      canDisburseLoan: true,
      canCollectPayment: true,
      canApproveLoan: true,
      canDeleteRecords: true,
      canExportReports: true
    }
  },
  'Branch Manager': {
    modules: ['dashboard', 'dailyRoute', 'customer360', 'staff', 'onboarding', 'applications', 'payments', 'overdue', 'products', 'audit'],
    permissions: {
      canDisburseLoan: true,
      canCollectPayment: true,
      canApproveLoan: true,
      canDeleteRecords: false,
      canExportReports: true
    }
  },
  'Field Collection Agent': {
    modules: ['dashboard', 'dailyRoute', 'payments', 'overdue'],
    permissions: {
      canDisburseLoan: false,
      canCollectPayment: true,
      canApproveLoan: false,
      canDeleteRecords: false,
      canExportReports: false
    }
  },
  'Cashier': {
    modules: ['dashboard', 'dailyRoute', 'payments'],
    permissions: {
      canDisburseLoan: false,
      canCollectPayment: true,
      canApproveLoan: false,
      canDeleteRecords: false,
      canExportReports: false
    }
  },
  'Credit Underwriter': {
    modules: ['dashboard', 'customer360', 'onboarding', 'applications'],
    permissions: {
      canDisburseLoan: true,
      canCollectPayment: false,
      canApproveLoan: true,
      canDeleteRecords: false,
      canExportReports: true
    }
  },
  'Auditor / Viewer': {
    modules: ['dashboard', 'customer360', 'payments', 'audit'],
    permissions: {
      canDisburseLoan: false,
      canCollectPayment: false,
      canApproveLoan: false,
      canDeleteRecords: false,
      canExportReports: true
    }
  }
};

export default function UserManagementView({
  appUsers = [],
  currentUser,
  onSwitchUser,
  onSaveUser,
  onDeleteUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Field Collection Agent',
    passcode: '1234',
    status: 'Active',
    allowedModules: ['dashboard', 'dailyRoute', 'payments', 'overdue'],
    permissions: {
      canDisburseLoan: false,
      canCollectPayment: true,
      canApproveLoan: false,
      canDeleteRecords: false,
      canExportReports: false
    }
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Field Collection Agent',
      passcode: '1234',
      status: 'Active',
      allowedModules: ['dashboard', 'dailyRoute', 'payments', 'overdue'],
      permissions: {
        canDisburseLoan: false,
        canCollectPayment: true,
        canApproveLoan: false,
        canDeleteRecords: false,
        canExportReports: false
      }
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'Custom',
      passcode: user.passcode || '1234',
      status: user.status || 'Active',
      allowedModules: Array.isArray(user.allowedModules) ? user.allowedModules : ['dashboard'],
      permissions: {
        canDisburseLoan: !!user.permissions?.canDisburseLoan,
        canCollectPayment: !!user.permissions?.canCollectPayment,
        canApproveLoan: !!user.permissions?.canApproveLoan,
        canDeleteRecords: !!user.permissions?.canDeleteRecords,
        canExportReports: !!user.permissions?.canExportReports
      }
    });
    setIsModalOpen(true);
  };

  // Apply Role Preset
  const handleRoleChange = (role) => {
    const preset = ROLE_PRESETS[role];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        role,
        allowedModules: [...preset.modules],
        permissions: { ...preset.permissions }
      }));
    } else {
      setFormData(prev => ({ ...prev, role }));
    }
  };

  // Toggle Module
  const handleToggleModule = (moduleId) => {
    setFormData(prev => {
      const exists = prev.allowedModules.includes(moduleId);
      const updated = exists 
        ? prev.allowedModules.filter(m => m !== moduleId)
        : [...prev.allowedModules, moduleId];
      return { ...prev, allowedModules: updated };
    });
  };

  // Toggle Action Permission
  const handleTogglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // Select / Deselect All Modules
  const handleSelectAllModules = () => {
    setFormData(prev => ({
      ...prev,
      allowedModules: AVAILABLE_MODULES.map(m => m.id)
    }));
  };

  const handleClearAllModules = () => {
    setFormData(prev => ({
      ...prev,
      allowedModules: ['dashboard']
    }));
  };

  // Submit Save
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill out Name and Email.');
      return;
    }

    const payload = {
      id: editingUserId || `USR-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      role: formData.role,
      passcode: formData.passcode.trim() || '1234',
      status: formData.status,
      allowedModules: formData.allowedModules.length > 0 ? formData.allowedModules : ['dashboard'],
      permissions: formData.permissions,
      createdAt: new Date().toISOString()
    };

    onSaveUser(payload);
    setIsModalOpen(false);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
  };

  // Toggle User Status
  const handleToggleUserStatus = (user) => {
    const updatedStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    onSaveUser({
      ...user,
      status: updatedStatus
    });
  };

  // Filter Users
  const filteredUsers = appUsers.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchRole) return false;
    }
    return true;
  });

  const totalUsers = appUsers.length;
  const activeCount = appUsers.filter(u => u.status === 'Active').length;
  const suspendedCount = appUsers.filter(u => u.status === 'Suspended').length;
  const adminCount = appUsers.filter(u => u.role === 'Admin').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.8rem 2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.6rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                User Management & Access Control
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Admin console to add system users, set login PINs, and grant granular module access permissions
              </p>
            </div>
          </div>
        </div>

        {/* Add User Action Button */}
        <button
          onClick={handleOpenCreate}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)'
          }}
        >
          <UserPlus size={16} /> + Add New User
        </button>
      </div>

      {/* Current Active User Simulation Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        border: '1px solid #C7D2FE',
        borderRadius: '14px',
        padding: '1rem 1.4rem',
        marginBottom: '1.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--accent-indigo)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.05rem',
            boxShadow: '0 3px 10px rgba(79, 70, 229, 0.35)'
          }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4338CA', fontWeight: 700 }}>
                Currently Active Session
              </span>
              <span style={{
                fontSize: '0.7rem',
                background: '#4338CA',
                color: '#FFF',
                padding: '0.1rem 0.5rem',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                {currentUser?.role || 'Admin'}
              </span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E1B4B' }}>
              {currentUser?.name || 'Admin Master'} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#4B5563' }}>({currentUser?.email || 'admin@dhanshri.com'})</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '0.1rem' }}>
              Allowed Modules: <strong>{(currentUser?.allowedModules || []).length} / {AVAILABLE_MODULES.length}</strong> active. The top navigation bar only renders what this user is authorized to see.
            </div>
          </div>
        </div>

        {/* Quick User Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Simulate User:</span>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = appUsers.find(u => u.id === e.target.value);
              if (selected) onSwitchUser(selected);
            }}
            className="form-input"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, background: '#FFF', borderColor: '#A5B4FC' }}
          >
            {appUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role} ({u.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.2rem',
        marginBottom: '1.8rem'
      }}>
        <div className="card" style={{ padding: '1.2rem', background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Users</span>
            <Users size={18} color="var(--accent-indigo)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A' }}>{totalUsers}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Configured system accounts</span>
        </div>

        <div className="card" style={{ padding: '1.2rem', background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Logins</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669' }}>{activeCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#059669' }}>Enabled for operational access</span>
        </div>

        <div className="card" style={{ padding: '1.2rem', background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suspended Accounts</span>
            <XCircle size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#DC2626' }}>{suspendedCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#DC2626' }}>Temporarily locked from login</span>
        </div>

        <div className="card" style={{ padding: '1.2rem', background: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Master Admins</span>
            <ShieldCheck size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7C3AED' }}>{adminCount}</div>
          <span style={{ fontSize: '0.72rem', color: '#7C3AED' }}>Full root access controllers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#FFF',
        padding: '1rem 1.4rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            >
              <option value="ALL">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Field Collection Agent">Field Collection Agent</option>
              <option value="Cashier">Cashier</option>
              <option value="Credit Underwriter">Credit Underwriter</option>
              <option value="Auditor / Viewer">Auditor / Viewer</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Roster Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.4rem' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3.5rem', textAlign: 'center', background: '#FFF', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <ShieldAlert size={42} color="var(--text-dim)" style={{ margin: '0 auto 0.8rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>No Users Found</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const isCurrent = currentUser?.id === user.id;
            const allowedCount = (user.allowedModules || []).length;
            const isSuspended = user.status === 'Suspended';

            return (
              <div 
                key={user.id} 
                className="card" 
                style={{
                  background: '#FFF',
                  padding: '1.4rem',
                  borderRadius: '14px',
                  border: isCurrent ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  boxShadow: isCurrent ? '0 6px 20px rgba(79, 70, 229, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '18px',
                    background: 'var(--accent-indigo)',
                    color: '#FFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)'
                  }}>
                    ACTIVE LOGGED IN
                  </div>
                )}

                <div>
                  {/* Card Header: Avatar & Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: user.role === 'Admin' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F1F5F9',
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
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.5rem',
                            borderRadius: '6px',
                            background: user.role === 'Admin' ? '#EEF2FF' : '#F8FAFC',
                            color: user.role === 'Admin' ? '#4F46E5' : '#475569',
                            border: `1px solid ${user.role === 'Admin' ? '#C7D2FE' : '#E2E8F0'}`
                          }}>
                            {user.role}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '10px',
                            background: isSuspended ? '#FEF2F2' : '#ECFDF5',
                            color: isSuspended ? '#DC2626' : '#059669',
                            border: `1px solid ${isSuspended ? '#FECACA' : '#A7F3D0'}`
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSuspended ? '#DC2626' : '#10B981' }} />
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>User ID</span>
                      <strong style={{ fontSize: '0.75rem', color: '#64748B' }}>{user.id}</strong>
                    </div>
                  </div>

                  {/* Contact & Credentials info */}
                  <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                      <Mail size={13} color="var(--text-dim)" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                        <Phone size={13} color="var(--text-dim)" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                      <Key size={13} color="var(--text-dim)" />
                      <span>Passcode PIN: <strong>•••• ({user.passcode || '1234'})</strong></span>
                    </div>
                  </div>

                  {/* Module Access Summary */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                        Authorized Modules:
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                        {allowedCount} of {AVAILABLE_MODULES.length} Allowed
                      </span>
                    </div>

                    {/* Module Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {AVAILABLE_MODULES.map(m => {
                        const isAllowed = (user.allowedModules || []).includes(m.id);
                        return (
                          <span
                            key={m.id}
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: isAllowed ? '#F0FDF4' : '#F1F5F9',
                              color: isAllowed ? '#166534' : '#94A3B8',
                              border: `1px solid ${isAllowed ? '#BBF7D0' : '#E2E8F0'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                            title={isAllowed ? `Allowed: ${m.desc}` : `Restricted: No access to ${m.label}`}
                          >
                            {isAllowed ? <Check size={10} color="#166534" /> : <Lock size={9} color="#94A3B8" />}
                            {m.label.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Permissions Summary */}
                  <div style={{ marginBottom: '1.2rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                      Operational Permissions:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {user.permissions?.canDisburseLoan && (
                        <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                          ✓ Disburse Loans
                        </span>
                      )}
                      {user.permissions?.canCollectPayment && (
                        <span style={{ fontSize: '0.65rem', background: '#ECFDF5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                          ✓ Collect Payments
                        </span>
                      )}
                      {user.permissions?.canApproveLoan && (
                        <span style={{ fontSize: '0.65rem', background: '#EEF2FF', color: '#4338CA', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #C7D2FE', fontWeight: 600 }}>
                          ✓ Approve Underwriting
                        </span>
                      )}
                      {user.permissions?.canExportReports && (
                        <span style={{ fontSize: '0.65rem', background: '#FFFBEB', color: '#B45309', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                          ✓ Export Data
                        </span>
                      )}
                      {user.permissions?.canDeleteRecords && (
                        <span style={{ fontSize: '0.65rem', background: '#FEF2F2', color: '#B91C1C', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #FECACA', fontWeight: 600 }}>
                          ✓ Delete Records
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {/* Simulate Switch */}
                  <button
                    onClick={() => onSwitchUser(user)}
                    disabled={isCurrent}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: isCurrent ? '#EEF2FF' : '#FFF',
                      color: isCurrent ? 'var(--accent-indigo)' : '#334155',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: isCurrent ? 'default' : 'pointer'
                    }}
                    title="Simulate this user's view in the application"
                  >
                    <LogIn size={13} /> {isCurrent ? 'Current' : 'Simulate View'}
                  </button>

                  {/* Edit Permissions */}
                  <button
                    onClick={() => handleOpenEdit(user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: '#FFF',
                      color: '#0F172A',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="Edit user details and change module permissions"
                  >
                    <Edit3 size={13} /> Edit
                  </button>

                  {/* Toggle Status */}
                  <button
                    onClick={() => handleToggleUserStatus(user)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: isSuspended ? '#ECFDF5' : '#FEF2F2',
                      color: isSuspended ? '#059669' : '#DC2626',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title={isSuspended ? 'Reactivate this user' : 'Suspend user login'}
                  >
                    {isSuspended ? 'Activate' : 'Suspend'}
                  </button>

                  {/* Delete (Cannot delete USR-001 root admin) */}
                  {user.id !== 'USR-001' && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete user ${user.name}? This will revoke their access completely.`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      style={{
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #FECACA',
                        background: '#FFF',
                        color: '#DC2626',
                        cursor: 'pointer'
                      }}
                      title="Permanently remove user"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT USER & MODULE ACCESS CONTROL MODAL */}
      {/* ========================================================= */}
      {isModalOpen && (
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
            maxWidth: '780px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.2rem 1.6rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {editingUserId ? 'Edit User & Module Access' : 'Create New User & Grant Permissions'}
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Control exactly which modules and operations this user can access
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '8px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '1.6rem' }}>
              
              {/* Profile Details Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Login Email / Username *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.field@dhanshri.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Login PIN / Passcode
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={formData.passcode}
                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Role / Position (Auto-presets modules)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.84rem', fontWeight: 600 }}
                  >
                    <option value="Admin">Admin (Full Access to Everything)</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Field Collection Agent">Field Collection Agent (Route & Collections)</option>
                    <option value="Cashier">Cashier (Payments & Receipts)</option>
                    <option value="Credit Underwriter">Credit Underwriter (Appraisal & Approvals)</option>
                    <option value="Auditor / Viewer">Auditor / Viewer (Read-only)</option>
                    <option value="Custom">Custom (Manual Selection)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                    style={{ fontSize: '0.84rem', fontWeight: 600 }}
                  >
                    <option value="Active">Active (Allowed to Log In)</option>
                    <option value="Suspended">Suspended (Access Temporarily Blocked)</option>
                  </select>
                </div>
              </div>

              {/* SECTION: MODULE ACCESS PERMISSIONS */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.2rem',
                marginBottom: '1.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Module Permissions Checklist
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
                      Check the boxes for modules this user is authorized to view in the navigation menu
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#EEF2FF',
                        color: 'var(--accent-indigo)',
                        border: '1px solid #C7D2FE',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllModules}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#FFF',
                        color: '#64748B',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Modules Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
                  {AVAILABLE_MODULES.map(m => {
                    const isChecked = formData.allowedModules.includes(m.id);
                    const Icon = m.icon;

                    return (
                      <label
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid #A5B4FC' : '1px solid #E2E8F0',
                          background: isChecked ? '#EEF2FF' : '#FFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleModule(m.id)}
                          style={{ marginTop: '0.2rem', accentColor: 'var(--accent-indigo)' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: isChecked ? '#312E81' : '#334155' }}>
                            <Icon size={14} color={isChecked ? 'var(--accent-indigo)' : '#64748B'} />
                            {m.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.15rem', lineHeight: '1.2' }}>
                            {m.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: OPERATIONAL ACTION PERMISSIONS */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.2rem',
                marginBottom: '1.6rem'
              }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.2rem 0' }}>
                  Operational Action Permissions
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0' }}>
                  Grant specific execution rights (disbursing capital, approving loans, taking payments)
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.65rem' }}>
                  {[
                    { key: 'canDisburseLoan', label: 'Disburse Money & Loans', desc: 'Can give real cash/bank loans to customers' },
                    { key: 'canCollectPayment', label: 'Collect Cash & Receipts', desc: 'Can record collections & generate receipts' },
                    { key: 'canApproveLoan', label: 'Approve Loan Applications', desc: 'Can accept/reject credit underwriting' },
                    { key: 'canExportReports', label: 'Export Ledgers & Reports', desc: 'Can download financial CSV data' },
                    { key: 'canDeleteRecords', label: 'Delete / Purge Records', desc: 'Can cancel or remove accounts/records' }
                  ].map(act => {
                    const isChecked = !!formData.permissions[act.key];
                    return (
                      <label
                        key={act.key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                          background: isChecked ? '#F0FDF4' : '#FFF',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(act.key)}
                          style={{ marginTop: '0.2rem', accentColor: '#16A34A' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isChecked ? '#14532D' : '#334155' }}>
                            {act.label}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.15rem' }}>
                            {act.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: '#FFF',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.4rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  <Check size={16} /> Save User Permissions
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
