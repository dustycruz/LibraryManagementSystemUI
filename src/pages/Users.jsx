import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getUsers, deactivateUser, getRoles, updateUser } from '../api/usersApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/helpers';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) pages.push(i);
    }
    const withEllipsis = [];
    let prev = null;
    for (const page of pages) {
      if (prev !== null && page - prev > 1) withEllipsis.push('...');
      withEllipsis.push(page);
      prev = page;
    }
    return withEllipsis;
  };

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '36px', height: '36px', padding: '0 10px', borderRadius: '8px',
    border: '1px solid #e0e4ea', backgroundColor: '#fff', color: '#374151',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.15s ease', lineHeight: 1, userSelect: 'none',
  };
  const activeBtnStyle = {
    ...btnBase, backgroundColor: '#003f7f', borderColor: '#003f7f', color: '#fff',
    boxShadow: '0 2px 6px rgba(0, 63, 127, 0.3)', cursor: 'default',
  };
  const disabledBtnStyle = { ...btnBase, opacity: 0.4, cursor: 'not-allowed' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '13px', color: '#6c757d' }}>
        Page <strong style={{ color: '#003f7f' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
          aria-label="Previous page"
        >‹</button>
        {getPages().map((page, idx) =>
          page === '...'
            ? <span key={`e-${idx}`} style={{ ...btnBase, border: 'none', backgroundColor: 'transparent', cursor: 'default', color: '#9ca3af' }}>…</span>
            : <button
                key={page}
                onClick={() => page !== currentPage && onPageChange(page)}
                style={page === currentPage ? activeBtnStyle : btnBase}
                onMouseEnter={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
                onMouseLeave={e => { if (page !== currentPage) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
                aria-current={page === currentPage ? 'page' : undefined}
              >{page}</button>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.borderColor = '#c0c8d8'; }}}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e4ea'; }}}
          aria-label="Next page"
        >›</button>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

const inputStyle = {
  padding: '9px 12px', fontSize: '14px', border: '1px solid #e0e4ea',
  borderRadius: '8px', outline: 'none', backgroundColor: '#fff',
  color: '#374151', transition: 'border-color 0.15s',
};
const selectStyle = {
  ...inputStyle, cursor: 'pointer', paddingRight: '32px',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
};

const actionButtonStyle = (bgColor, textColor) => ({
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: bgColor,
  color: textColor,
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
});

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', isActive: true, roleIds: [] });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
        if (!cancelled) {
          setUsers(usersRes.data.data);
          setRoles(rolesRes.data.data);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(id);
      toast.success('User deactivated.');
      setRefreshKey(k => k + 1);
    } catch {
      toast.error('Failed to deactivate user.');
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roleIds: roles.filter(r => user.roles.includes(r.roleName)).map(r => r.roleId),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(editUser.userId, editForm);
      toast.success('User updated.');
      setEditUser(null);
      setRefreshKey(k => k + 1);
    } catch {
      toast.error('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleId) => {
    setEditForm(f => ({
      ...f,
      roleIds: f.roleIds.includes(roleId)
        ? f.roleIds.filter(r => r !== roleId)
        : [...f.roleIds, roleId],
    }));
  };

  if (loading) return <LoadingSpinner />;

  // Filter
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchesRole =
      roleFilter === 'all' || u.roles.includes(roleFilter);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleRoleFilter = (val) => { setRoleFilter(val); setPage(1); };
  const handleStatusFilter = (val) => { setStatusFilter(val); setPage(1); };

  // Unique role names for the filter dropdown
  const allRoleNames = [...new Set(users.flatMap(u => u.roles))].sort();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003f7f', marginBottom: '8px' }}>
          User Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
          Manage library system users and their permissions
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
        marginBottom: '20px', boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
<input
  type="text"
  value={search}
  onChange={e => handleSearch(e.target.value)}
  placeholder="Search by name or email..."
  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
  onFocus={e => (e.target.style.borderColor = '#003f7f')}
  onBlur={e => (e.target.style.borderColor = '#e0e4ea')}
/>
          </div>
          <select value={roleFilter} onChange={e => handleRoleFilter(e.target.value)} style={{ ...selectStyle, minWidth: '150px' }}
            onFocus={e => (e.target.style.borderColor = '#003f7f')}
            onBlur={e => (e.target.style.borderColor = '#e0e4ea')}
          >
            <option value="all">All Roles</option>
            {allRoleNames.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={e => handleStatusFilter(e.target.value)} style={{ ...selectStyle, minWidth: '150px' }}
            onFocus={e => (e.target.style.borderColor = '#003f7f')}
            onBlur={e => (e.target.style.borderColor = '#e0e4ea')}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 63, 127, 0.12)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e8eaed',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#003f7f', margin: 0 }}>Users</h2>
          <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: '600' }}>{filtered.length} records</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafb' }}>
                {['Name', 'Email', 'Roles', 'Status', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '14px 16px', textAlign: i === 3 || i === 5 ? 'center' : 'left',
                    fontSize: '13px', fontWeight: '700', color: '#003f7f', borderBottom: '2px solid #e8eaed',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
                    No users match your search.
                  </td>
                </tr>
              ) : paginatedUsers.map(u => (
                <tr
                  key={u.userId}
                  style={{ borderBottom: '1px solid #e8eaed', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0, 63, 127, 0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>{u.fullName}</td>
                  <td style={{ padding: '14px 16px', color: '#6c757d', fontSize: '14px' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {u.roles.map(r => (
                        <span key={r} style={{
                          display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: '700', color: '#fff',
                          backgroundColor: r === 'Admin' ? '#8b5cf6' : r === 'Librarian' ? '#06b6d4' : '#10b981',
                        }}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: '600', color: '#fff',
                      backgroundColor: u.isActive ? '#10b981' : '#6c757d',
                    }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6c757d', fontSize: '14px' }}>{formatDate(u.createdAt)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEdit(u)}
                        style={actionButtonStyle('#003F7F', '#fff')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#002d5c';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 63, 127, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#003F7F';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Edit
                      </button>
                      {u.isActive && (
                        <button
                          onClick={() => handleDeactivate(u.userId)}
                          style={actionButtonStyle('#d32f2f', '#fff')}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#b71c1c';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(211, 47, 47, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#d32f2f';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #e8eaed', backgroundColor: '#fafbfc' }}>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
          onClick={() => setEditUser(null)}
        >
          <div
            style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,63,127,0.15)', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#003f7f', margin: 0 }}>Edit User: {editUser.email}</h2>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#6c757d', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '24px' }}>
              {[['First Name', 'firstName'], ['Last Name', 'lastName']].map(([label, field]) => (
                <div key={field} style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#003f7f', marginBottom: '8px' }}>{label}</label>
                  <input
                    type="text"
                    value={editForm[field]}
                    onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #e8eaed', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#003f7f')}
                    onBlur={e => (e.target.style.borderColor = '#e8eaed')}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#003f7f', marginBottom: '12px' }}>Roles</label>
                {roles.map(r => (
                  <div key={r.roleId} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id={`role-${r.roleId}`} checked={editForm.roleIds.includes(r.roleId)} onChange={() => toggleRole(r.roleId)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#003f7f' }} />
                    <label htmlFor={`role-${r.roleId}`} style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', cursor: 'pointer' }}>{r.roleName}</label>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#003f7f' }} />
                <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '600', color: '#003f7f', cursor: 'pointer' }}>Active User</label>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e8eaed', backgroundColor: '#fafbfc', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditUser(null)}
                style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #e8eaed', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f8fafb'; e.currentTarget.style.borderColor = '#6c757d'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#e8eaed'; }}
              >Cancel</button>
              <button
                onClick={handleSave} disabled={saving}
                style={{ padding: '8px 16px', backgroundColor: '#003f7f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.15s' }}
                onMouseEnter={e => !saving && (e.currentTarget.style.backgroundColor = '#0052a3')}
                onMouseLeave={e => !saving && (e.currentTarget.style.backgroundColor = '#003f7f')}
              >{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}