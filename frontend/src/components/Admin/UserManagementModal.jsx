import React, { useState } from 'react';
import { User, Mail, Key, Eye, EyeOff, Shield, X, Plus, Trash2, Edit3, UserPlus, MapPin } from 'lucide-react';
import { translations } from '../../data/translations';

export default function UserManagementModal({ 
  open, 
  onClose, 
  onCreateUser, 
  onUpdateUser, 
  onDeleteUser, 
  users = [],
  stations = [],
  lang = 'km' 
}) {
  const isKm = lang === 'km';
  const t = translations[lang] || translations.km;

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    assigned_station_id: '',
    assigned_station_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  // Generate secure random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const symbols = '!@#$%&*';
    let password = '';
    
    // Ensure at least one uppercase, lowercase, number, and symbol
    password += chars.charAt(Math.floor(Math.random() * 26)); // uppercase
    password += chars.charAt(Math.floor(Math.random() * 26) + 26); // lowercase  
    password += chars.charAt(Math.floor(Math.random() * 10) + 52); // number
    password += symbols.charAt(Math.floor(Math.random() * symbols.length)); // symbol
    
    // Fill remaining 4 characters
    for (let i = 4; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(isKm ? 'សូមបញ្ចូលឈ្មោះ' : 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError(isKm ? 'សូមបញ្ចូលអ៊ីមែល' : 'Email is required');
      return false;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError(isKm ? 'អ៊ីមែលមិនត្រឹមត្រូវ' : 'Invalid email format');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError(isKm ? 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៦ តួអក្សរ' : 'Password must be at least 6 characters');
      return false;
    }
    // Check for duplicate email
    if (users.some(u => u.email === formData.email && u.id !== editingUser?.id)) {
      setError(isKm ? 'អ៊ីមែលនេះមានរួចហើយ' : 'Email already exists');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingUser) {
        await onUpdateUser({ ...editingUser, ...formData });
      } else {
        await onCreateUser(formData);
      }
      
      // Reset form
      setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
      setEditingUser(null);
      setActiveTab('list');
      setError('');
    } catch (err) {
      setError(err.message || (isKm ? 'មានបញ្ហាកើតឡើង' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      assigned_station_id: user.assigned_station_id || '',
      assigned_station_name: user.assigned_station_name || ''
    });
    setActiveTab('create');
  };

  const handleDelete = async (user) => {
    if (window.confirm(isKm ? `តើអ្នកពិតជាចង់លុប ${user.name} មែនទេ?` : `Are you sure you want to delete ${user.name}?`)) {
      try {
        await onDeleteUser(user.id);
      } catch (err) {
        setError(err.message || (isKm ? 'មិនអាចលុបបានទេ' : 'Could not delete user'));
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'user', status: 'active', assigned_station_id: '', assigned_station_name: '' });
    setEditingUser(null);
    setError('');
    setActiveTab('list');
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '700px', maxHeight: '85vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon" style={{ background: 'var(--primary-subtle)' }}>
              <UserPlus size={18} color="var(--primary)" />
            </div>
            <div>
              <h3>{isKm ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់' : 'User Management'}</h3>
              <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>
                {isKm ? 'បង្កើត និង គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់' : 'Create and manage user accounts'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <button
            onClick={() => { resetForm(); setActiveTab('list'); }}
            style={{
              flex: 1, padding: '12px 16px', border: 'none', background: 'transparent',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            <User size={16} />
            <span>{isKm ? 'បញ្ជីអ្នកប្រើ' : 'User List'} ({users.length})</span>
          </button>

          <button
            onClick={() => { resetForm(); setActiveTab('create'); }}
            style={{
              flex: 1, padding: '12px 16px', border: 'none', background: 'transparent',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: activeTab === 'create' ? 'var(--success)' : 'var(--text-muted)',
              borderBottom: activeTab === 'create' ? '2px solid var(--success)' : '2px solid transparent'
            }}
          >
            <Plus size={16} />
            <span>{editingUser ? (isKm ? 'កែប្រែអ្នកប្រើ' : 'Edit User') : (isKm ? 'បង្កើតអ្នកប្រើ' : 'Create User')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {activeTab === 'list' && (
            <div>
              {users.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  color: 'var(--text-muted)' 
                }}>
                  <UserPlus size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p>{isKm ? 'មិនទាន់មានអ្នកប្រើប្រាស់នៅឡើយ' : 'No users created yet'}</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    <Plus size={14} />
                    {isKm ? 'បង្កើតអ្នកប្រើដំបូង' : 'Create First User'}
                  </button>
                </div>
              ) : (
                <div>
                  {/* Users List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {users.map(user => (
                      <div
                        key={user.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: 'var(--surface-subtle)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--r-sm)'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <strong>{user.name}</strong>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: user.role === 'admin' ? 'var(--danger-subtle)' : 'var(--primary-subtle)',
                              color: user.role === 'admin' ? 'var(--danger)' : 'var(--primary)',
                              textTransform: 'uppercase',
                              fontWeight: 700
                            }}>
                              {user.role}
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: user.status === 'active' ? 'var(--success-subtle)' : 'var(--warning-subtle)',
                              color: user.status === 'active' ? 'var(--success)' : 'var(--warning)',
                              textTransform: 'uppercase',
                              fontWeight: 700
                            }}>
                              {user.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {user.email}
                            {user.assigned_station_name && (
                              <span style={{ marginLeft: '8px', color: 'var(--fuel-accent)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin size={10} />
                                {user.assigned_station_name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn btn-ghost btn-sm"
                            title={isKm ? 'កែប្រែ' : 'Edit'}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="btn btn-ghost btn-sm"
                            title={isKm ? 'លុប' : 'Delete'}
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '12px',
                  background: 'var(--danger-subtle)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Name */}
                <div className="form-group">
                  <label className="form-label">
                    <User size={14} color="var(--primary)" />
                    {isKm ? 'ឈ្មោះពេញ' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={isKm ? 'ឧ. សុខ វណ្ណា' : 'e.g. John Doe'}
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} color="var(--primary)" />
                    {isKm ? 'អ៊ីមែល' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder={isKm ? 'ឧ. user@company.com' : 'e.g. user@company.com'}
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">
                    <Key size={14} color="var(--primary)" />
                    {isKm ? 'ពាក្យសម្ងាត់' : 'Password'} *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder={isKm ? 'យ៉ាងតិច ៦ តួអក្សរ' : 'At least 6 characters'}
                        value={formData.password}
                        onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      <Key size={14} />
                      {isKm ? 'បង្កើត' : 'Generate'}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div className="form-group">
                  <label className="form-label">
                    <Shield size={14} color="var(--primary)" />
                    {isKm ? 'តួនាទី' : 'Role'}
                  </label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="user">{isKm ? 'អ្នកប្រើប្រាស់ (របាយការណ៍តែប៉ុណ្ណោះ)' : 'User (Reporting Only)'}</option>
                    <option value="admin">{isKm ? 'អ្នកគ្រប់គ្រង (ពេញសិទ្ធិ)' : 'Admin (Full Access)'}</option>
                  </select>
                </div>

                {/* Status */}
                <div className="form-group">
                  <label className="form-label">
                    {isKm ? 'ស្ថានភាព' : 'Status'}
                  </label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">{isKm ? 'សកម្ម' : 'Active'}</option>
                    <option value="inactive">{isKm ? 'អសកម្ម' : 'Inactive'}</option>
                  </select>
                </div>

                {/* Assigned Station — only relevant for 'user' role */}
                {formData.role === 'user' && (
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={14} color="var(--fuel-accent)" />
                      {isKm ? 'ស្ថានីយ៍ដែលបានកំណត់' : 'Assigned Station'}
                    </label>
                    {stations.length === 0 ? (
                      <div style={{
                        padding: '10px 12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--r-sm)',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                      }}>
                        {isKm ? 'មិនទាន់មានស្ថានីយ៍នៅឡើយ — បង្កើតស្ថានីយ៍ជាមុនសិន' : 'No stations yet — create a station first'}
                      </div>
                    ) : (
                      <select
                        className="form-control"
                        value={formData.assigned_station_id}
                        onChange={e => {
                          const selected = stations.find(s => s.id === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            assigned_station_id: e.target.value,
                            assigned_station_name: selected ? selected.name : ''
                          }));
                        }}
                      >
                        <option value="">{isKm ? '— មិនកំណត់ (ជ្រើសក្នុងពេលរាយការណ៍) —' : '— Unassigned (pick when reporting) —'}</option>
                        {stations.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                    {formData.assigned_station_id && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} />
                        {isKm ? 'អ្នកប្រើនេះនឹងរាយការណ៍ទៅ: ' : 'This user will report to: '}
                        <strong>{formData.assigned_station_name}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'create' && (
          <div className="modal-footer">
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
            >
              {isKm ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span>{isKm ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>{editingUser ? (isKm ? 'កែប្រែអ្នកប្រើ' : 'Update User') : (isKm ? 'បង្កើតអ្នកប្រើ' : 'Create User')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}