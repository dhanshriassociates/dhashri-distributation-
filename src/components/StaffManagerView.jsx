import React, { useState } from 'react';
import { 
  UserCheck, 
  UserPlus, 
  Phone, 
  Mail, 
  Shield, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Search, 
  Award,
  Users,
  Briefcase
} from 'lucide-react';
import { formatCurrency } from '../utils/financeEngine';
import confetti from 'canvas-confetti';

export default function StaffManagerView({ 
  staffMembers = [], 
  financeAccounts = [], 
  payments = [], 
  onSaveStaffMember, 
  onDeleteStaffMember 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Field Collection Agent',
    routeArea: 'Main City Route',
    monthlyTarget: 50000,
    status: 'Active',
    permissions: {
      canDisburse: false,
      canCollect: true,
      canReviewApps: false
    }
  });

  const handleOpenAdd = () => {
    setEditingStaffId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      role: 'Field Collection Agent',
      routeArea: 'Main City Route',
      monthlyTarget: 50000,
      status: 'Active',
      permissions: {
        canDisburse: false,
        canCollect: true,
        canReviewApps: false
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      name: staff.name,
      phone: staff.phone || '',
      email: staff.email || '',
      role: staff.role || 'Field Collection Agent',
      routeArea: staff.routeArea || 'Main City Route',
      monthlyTarget: staff.monthlyTarget || 50000,
      status: staff.status || 'Active',
      permissions: staff.permissions || {
        canDisburse: false,
        canCollect: true,
        canReviewApps: false
      }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Staff Full Name is required.');
      return;
    }

    const staffId = editingStaffId || `STAFF-${Math.floor(100 + Math.random() * 900)}`;

    const newStaff = {
      id: staffId,
      name: formData.name.trim(),
      phone: formData.phone.trim() || 'N/A',
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@finance.in`,
      role: formData.role,
      routeArea: formData.routeArea.trim() || 'General Area',
      monthlyTarget: parseFloat(formData.monthlyTarget) || 0,
      status: formData.status,
      permissions: formData.permissions
    };

    onSaveStaffMember(newStaff);
    confetti({ particleCount: 60, spread: 60 });
    setIsModalOpen(false);
  };

  // Filter staff members
  const filteredStaff = staffMembers.filter(staff => {
    if (roleFilter !== 'ALL' && staff.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        staff.name.toLowerCase().includes(q) ||
        staff.phone?.toLowerCase().includes(q) ||
        staff.routeArea?.toLowerCase().includes(q) ||
        staff.role?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ padding: '1.5rem 1.8rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={22} color="#059669" /> Staff & Field Recovery Team Management
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Manage recovery officers, assigned debtor routes, collection targets, and role permissions.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-emerald">
          <UserPlus size={16} /> + Add Staff Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Staff (${staffMembers.length})` },
            { id: 'Field Collection Agent', label: 'Field Agents' },
            { id: 'Recovery Officer', label: 'Recovery Officers' },
            { id: 'Branch Cashier', label: 'Cashiers' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: roleFilter === f.id ? 700 : 500,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: roleFilter === f.id ? 'var(--accent-indigo)' : '#F1F5F9',
                color: roleFilter === f.id ? '#FFF' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search staff, route or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2rem', width: '240px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Staff Roster Grid */}
      {filteredStaff.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EEF2FF', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.3rem' }}>
            {staffMembers.length === 0 ? 'No Staff Members Registered Yet' : 'No Staff Members Match Filter'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
            Add collection officers to assign them borrower accounts, daily routes, and collection targets.
          </p>
          <button onClick={handleOpenAdd} className="btn-emerald">
            <UserPlus size={15} /> + Add First Staff Member
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {filteredStaff.map(staff => {
            // Dynamic metrics from real accounts and payments
            const assignedAccounts = financeAccounts.filter(a => a.assignedOfficer === staff.name);
            const managedCapital = assignedAccounts.reduce((sum, a) => sum + (a.financedAmount || 0), 0);
            
            // Payments collected by this officer
            const officerPayments = payments.filter(p => p.receivedBy === staff.name);
            const collectionsAchieved = officerPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const targetPct = staff.monthlyTarget > 0 ? Math.min(100, Math.round((collectionsAchieved / staff.monthlyTarget) * 100)) : 0;

            return (
              <div key={staff.id} className="glass-panel" style={{ padding: '1.3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid var(--accent-indigo)' }}>
                
                <div>
                  {/* Staff Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4F46E5, #059669)',
                        color: '#FFF',
                        fontWeight: 800,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                      }}>
                        {staff.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{staff.name}</h3>
                        <span style={{ fontSize: '0.72rem', background: '#EEF2FF', color: 'var(--accent-indigo)', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                          {staff.role}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: staff.status === 'Active' ? '#059669' : '#DC2626', background: staff.status === 'Active' ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${staff.status === 'Active' ? '#A7F3D0' : '#FECACA'}`, padding: '0.15rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                      {staff.status}
                    </span>
                  </div>

                  {/* Route & Contact info */}
                  <div style={{ background: '#F8FAFC', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1E293B', fontWeight: 600 }}>
                      <MapPin size={13} color="#059669" /> Route: <span>{staff.routeArea || 'City Area'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)' }}>
                      <Phone size={13} color="var(--text-dim)" /> <span>{staff.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)' }}>
                      <Mail size={13} color="var(--text-dim)" /> <span>{staff.email}</span>
                    </div>
                  </div>

                  {/* Managed Accounts & Capital */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#FFF', border: '1px solid var(--border-subtle)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Debtors</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                        {assignedAccounts.length} Loans
                      </h4>
                    </div>

                    <div style={{ background: '#FFF', border: '1px solid var(--border-subtle)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Managed Capital</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', marginTop: '0.15rem' }}>
                        {formatCurrency(managedCapital)}
                      </h4>
                    </div>
                  </div>

                  {/* Target & Performance */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target: <strong>{formatCurrency(staff.monthlyTarget)}</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>Achieved: {formatCurrency(collectionsAchieved)} ({targetPct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${targetPct}%`, height: '100%', background: targetPct >= 80 ? '#10B981' : '#F59E0B', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>

                  {/* Permissions Badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: staff.permissions?.canDisburse ? '#ECFDF5' : '#F1F5F9', color: staff.permissions?.canDisburse ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                      {staff.permissions?.canDisburse ? '✓ Disburse Allowed' : '✗ No Disbursal'}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: staff.permissions?.canCollect ? '#ECFDF5' : '#F1F5F9', color: staff.permissions?.canCollect ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                      {staff.permissions?.canCollect ? '✓ Collect Allowed' : '✗ No Collect'}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => handleOpenEdit(staff)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}>
                    <Edit3 size={13} /> Edit Staff
                  </button>
                  {onDeleteStaffMember && (
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove staff member ${staff.name}?`)) {
                          onDeleteStaffMember(staff.id);
                        }
                      }} 
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#DC2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="var(--accent-indigo)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  {editingStaffId ? 'Edit Staff Member Details' : 'Add New Staff / Recovery Officer'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@finance.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Staff Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="Field Collection Agent">Field Collection Agent</option>
                    <option value="Recovery Officer">Recovery Officer</option>
                    <option value="Branch Cashier">Branch Cashier</option>
                    <option value="Loan Underwriter">Loan Underwriter</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Assigned Area / Collection Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mansarovar Sector 1-4"
                    value={formData.routeArea}
                    onChange={(e) => setFormData({ ...formData, routeArea: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Monthly Collection Target (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Status and Permissions */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
                  System Permissions & Access
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.canCollect}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canCollect: e.target.checked }
                      })}
                    />
                    <span>Allow Collecting Payments & Generating Receipts</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.canDisburse}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canDisburse: e.target.checked }
                      })}
                    />
                    <span>Allow Disbursing New Loans to Borrowers</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.canReviewApps}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions, canReviewApps: e.target.checked }
                      })}
                    />
                    <span>Allow Credit Review & Approving Loan Applications</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-emerald">
                  <CheckCircle2 size={16} /> Save Staff Member
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
