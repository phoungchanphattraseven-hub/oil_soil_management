import React, { useState, useEffect, useCallback } from 'react';
import { Shield, UserPlus, Users, RefreshCw, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import UserManagementModal from '../components/Admin/UserManagementModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

export default function AdminPage({ lang = 'km', userRole = 'user', stations = [] }) {
  const isKm = lang === 'km';

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Keep app_managed_users in sync so LoginPage can verify credentials ──
  const syncLoginStore = (userList) => {
    localStorage.setItem('app_managed_users', JSON.stringify(userList));
  };

  // ── Fetch all users from backend ──────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      if (data.data) {
        setUsers(data.data);
      }
    } catch (err) {
      // Demo/offline fallback — pull from localStorage if populated
      const stored = localStorage.getItem('app_managed_users');
      if (stored) setUsers(JSON.parse(stored));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (userRole === 'admin') fetchUsers();
  }, [userRole, fetchUsers]);

  // ── Create user ────────────────────────────────────────────
  const handleCreateUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (res.ok && data.data) {
        const newUser = data.data[0];
        // Also store locally with password + station so offline login works
        const localCopy = {
          ...newUser,
          password: userData.password,
          assigned_station_id: userData.assigned_station_id || '',
          assigned_station_name: userData.assigned_station_name || ''
        };
        const updated = [...users, localCopy];
        setUsers(updated);
        localStorage.setItem('app_managed_users', JSON.stringify(updated));
        syncLoginStore(updated);
        showToast('success', isKm ? 'បង្កើតអ្នកប្រើប្រាស់បានជោគជ័យ!' : 'User created successfully!');
        return { success: true };
      } else {
        // Demo mode — create locally with a temp ID
        const tempUser = {
          id: `local-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          status: userData.status,
          assigned_station_id: userData.assigned_station_id || '',
          assigned_station_name: userData.assigned_station_name || '',
          created_at: new Date().toISOString()
        };
        const updated = [...users, tempUser];
        setUsers(updated);
        syncLoginStore(updated);
        showToast('success', isKm ? 'បង្កើតអ្នកប្រើប្រាស់បានជោគជ័យ (demo)!' : 'User created (demo mode)!');
        return { success: true };
      }
    } catch (err) {
      // Offline — create locally
      const tempUser = {
        id: `local-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        status: userData.status,
        assigned_station_id: userData.assigned_station_id || '',
        assigned_station_name: userData.assigned_station_name || '',
        created_at: new Date().toISOString()
      };
      const updated = [...users, tempUser];
      setUsers(updated);
      syncLoginStore(updated);
      showToast('success', isKm ? 'បង្កើតអ្នកប្រើប្រាស់ (offline)!' : 'User created offline!');
      return { success: true };
    }
  };

  // ── Update user ────────────────────────────────────────────
  const handleUpdateUser = async (userId, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      // Update locally regardless of backend result
      const updated = users.map(u =>
        u.id === userId ? {
          ...u, ...userData,
          name: userData.name || u.name,
          email: userData.email || u.email,
          assigned_station_id: userData.assigned_station_id ?? u.assigned_station_id ?? '',
          assigned_station_name: userData.assigned_station_name ?? u.assigned_station_name ?? ''
        } : u
      );
      setUsers(updated);
      localStorage.setItem('app_managed_users', JSON.stringify(updated));
      // Also sync to login store
      syncLoginStore(updated);
      showToast('success', isKm ? 'កែប្រែអ្នកប្រើប្រាស់បានជោគជ័យ!' : 'User updated successfully!');
      return { success: true };
    } catch (err) {
      const updated = users.map(u =>
        u.id === userId ? {
          ...u, ...userData,
          assigned_station_id: userData.assigned_station_id ?? u.assigned_station_id ?? '',
          assigned_station_name: userData.assigned_station_name ?? u.assigned_station_name ?? ''
        } : u
      );
      setUsers(updated);
      localStorage.setItem('app_managed_users', JSON.stringify(updated));
      syncLoginStore(updated);
      showToast('success', isKm ? 'កែប្រែអ្នកប្រើប្រាស់ (offline)!' : 'User updated offline!');
      return { success: true };
    }
  };

  // ── Delete user ────────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
    } catch (_) { /* offline — delete locally */ }

    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    syncLoginStore(updated);
    showToast('success', isKm ? 'លុបអ្នកប្រើប្រាស់បានជោគជ័យ!' : 'User deleted successfully!');
    return { success: true };
  };

  // ── Guard — non-admins see nothing ────────────────────────
  if (userRole !== 'admin') {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Shield size={40} style={{ color: 'var(--danger)', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            {isKm ? 'គ្មានការអនុញ្ញាត' : 'Access Denied'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isKm ? 'ទំព័រនេះសម្រាប់តែអ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'This page is for administrators only.'}
          </p>
        </div>
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount  = users.filter(u => u.role === 'user').length;
  const activeCount = users.filter(u => u.status !== 'inactive').length;

  return (
    <div className="page-wrapper">
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 18px',
          background: toast.type === 'success' ? 'var(--success-subtle)' : 'var(--danger-subtle)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {toast.type === 'success'
            ? <CheckCircle2 size={15} color="var(--success)" />
            : <AlertCircle size={15} color="var(--danger)" />}
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: toast.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
            {toast.message}
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span style={{ color: 'var(--primary)', display: 'flex' }}>
              <Shield size={22} />
            </span>
            <span>{isKm ? 'ការគ្រប់គ្រងប្រព័ន្ធ' : 'Admin Panel'}</span>
          </h1>
          <p style={{ fontSize: '0.8125rem' }}>
            {isKm ? 'គ្រប់គ្រងគណនី និងការចូលប្រើរបស់អ្នកប្រើប្រាស់' : 'Manage user accounts and access control'}
          </p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={fetchUsers}
            className="btn btn-secondary"
            disabled={loadingUsers}
            title={isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
          >
            <RefreshCw size={14} style={{ animation: loadingUsers ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>{isKm ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setShowUserModal(true)}
            className="btn btn-primary"
          >
            <UserPlus size={14} />
            <span>{isKm ? 'បន្ថែមអ្នកប្រើប្រាស់' : 'Add User'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isKm ? 'អ្នកប្រើប្រាស់សរុប' : 'Total Users'}
            </span>
            <div style={{ padding: '6px', background: 'rgba(99,102,241,0.1)', borderRadius: '6px', color: 'var(--primary)', display: 'flex' }}>
              <Users size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{users.length}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isKm ? `${activeCount} នាក់សកម្ម` : `${activeCount} active`}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isKm ? 'អ្នកគ្រប់គ្រង' : 'Admins'}
            </span>
            <div style={{ padding: '6px', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', color: 'var(--fuel-accent)', display: 'flex' }}>
              <Shield size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--fuel-accent)' }}>{adminCount}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isKm ? 'ការចូលប្រើពេញលេញ' : 'Full access'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isKm ? 'អ្នករាយការណ៍' : 'Report Users'}
            </span>
            <div style={{ padding: '6px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', color: 'var(--success)', display: 'flex' }}>
              <UserPlus size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>{userCount}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isKm ? 'ការចូលប្រើកត់ត្រាតែប៉ុណ្ណោះ' : 'Reporting access only'}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div className="section-label" style={{ margin: 0 }}>
            <Users size={14} />
            {isKm ? 'បញ្ជីគណនីអ្នកប្រើប្រាស់' : 'User Accounts'}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {users.length} {isKm ? 'គណនី' : 'accounts'}
          </span>
        </div>

        {loadingUsers ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 10px', display: 'block' }} />
            {isKm ? 'កំពុងផ្ទុក...' : 'Loading users...'}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Users size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {isKm ? 'មិនទាន់មានគណនីអ្នកប្រើប្រាស់នៅឡើយ' : 'No user accounts yet.'}
            </p>
            <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
              <UserPlus size={14} />
              <span>{isKm ? 'បង្កើតគណនីដំបូង' : 'Create first account'}</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {[
                    isKm ? 'ឈ្មោះ' : 'Name',
                    isKm ? 'អ៊ីមែល' : 'Email',
                    isKm ? 'ស្ថានីយ៍' : 'Station',
                    isKm ? 'តួនាទី' : 'Role',
                    isKm ? 'ស្ថានភាព' : 'Status',
                    isKm ? 'បង្កើតនៅ' : 'Created'
                  ].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.04em', borderBottom: '1px solid var(--border-subtle)'
                    }}>{h}</th>
                  ))}
                  <th style={{
                    padding: '10px 16px', textAlign: 'right',
                    fontSize: '0.7rem', fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.04em', borderBottom: '1px solid var(--border-subtle)'
                  }}>{isKm ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} style={{
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                  >
                    {/* Name */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                          background: user.role === 'admin'
                            ? 'linear-gradient(135deg, var(--primary), #7c3aed)'
                            : 'linear-gradient(135deg, var(--success), #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 800, color: '#fff'
                        }}>
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {user.name || '—'}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{user.email}</span>
                    </td>
                    {/* Assigned Station */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      {user.assigned_station_name ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--fuel-accent)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <MapPin size={12} />
                          {user.assigned_station_name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {isKm ? 'មិនបានកំណត់' : 'Unassigned'}
                        </span>
                      )}
                    </td>
                    {/* Role */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className={user.role === 'admin' ? 'badge badge-warning' : 'badge badge-success'} style={{ fontSize: '0.65rem' }}>
                        {user.role === 'admin'
                          ? (isKm ? 'អ្នកគ្រប់គ្រង' : 'Admin')
                          : (isKm ? 'អ្នករាយការណ៍' : 'User')}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className={user.status === 'inactive' ? 'badge badge-danger' : 'badge badge-success'} style={{ fontSize: '0.65rem' }}>
                        {user.status === 'inactive'
                          ? (isKm ? 'អសកម្ម' : 'Inactive')
                          : (isKm ? 'សកម្ម' : 'Active')}
                      </span>
                    </td>
                    {/* Created */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    {/* Actions - open modal for edit/delete */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right' }}>
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                      >
                        {isKm ? 'គ្រប់គ្រង' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        users={users}
        stations={stations}
        lang={lang}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
