import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/admin-dashboard.css';
import adminlogo from '../assets/logo_admin.png';

const roleLabels = {
  admin: 'Admin',
  ops: 'Operations',
  sales: 'Sales',
};

function AdminSettingsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'ops', mobile_number: '' });
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', password: '' });
  const [role, setRole] = useState(localStorage.getItem('admin_role') || 'admin');
  const username = localStorage.getItem('admin_username') || '';
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('admin_sidebar_collapsed');
    return stored === 'true';
  });
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (role === 'admin') fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/users`, { headers });
      setUsers(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch users', 'error');
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/admin/users`, newUser, { headers });
      Swal.fire('User added!', '', 'success');
      setShowAdd(false);
      setNewUser({ username: '', password: '', role: 'ops', mobile_number: '' });
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to add user', 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setEditForm({ role: user.role, password: '' });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/admin/users/${editUser.id}`, editForm, { headers });
      Swal.fire('User updated!', '', 'success');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirm = await Swal.fire({
      title: `Delete user ${user.username}?`,
      icon: 'warning',
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/${user.id}`, { headers });
      Swal.fire('User deleted!', '', 'success');
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const handleToggleUserStatus = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    const confirmMessage = user.is_active 
      ? `Are you sure you want to deactivate user "${user.username}"? This user will not be able to log in until reactivated.`
      : `Are you sure you want to activate user "${user.username}"? This user will be able to log in immediately.`;
    
    const confirm = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      text: confirmMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelButtonText: 'Cancel',
      confirmButtonColor: user.is_active ? '#dc3545' : '#28a745'
    });
    
    if (!confirm.isConfirmed) return;
    
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/users/${user.id}/toggle-status`, {}, { headers });
      Swal.fire('Success!', res.data.message, 'success');
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Failed to update user status', 'error');
    }
  };

  const handleResetOwnPassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Reset Password',
      html:
        '<input id="swal-old-password" class="swal2-input" type="password" placeholder="Old Password">' +
        '<input id="swal-new-password" class="swal2-input" type="password" placeholder="New Password">',
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-old-password').value,
          document.getElementById('swal-new-password').value
        ];
      }
    });
    if (formValues) {
      try {
        await axios.post('/api/admin/reset-password', {
          old_password: formValues[0],
          new_password: formValues[1],
        });
        Swal.fire('Password updated!', '', 'success');
      } catch (err) {
        Swal.fire('Error', err.response?.data?.error || 'Failed to reset password', 'error');
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_username');
    navigate('/admin-login');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      localStorage.setItem('admin_sidebar_collapsed', !prev);
      return !prev;
    });
  };

  return (
    <div className='admin_portal'>
      {/* Top Navigation for mobile */}
      {window.innerWidth < 1000 ? (
        <nav className="topnav d-flex align-items-center justify-content-between px-2">
          <div className="d-flex align-items-center">
            <img className="logo" alt="Logo" src={adminlogo} style={{ width: 36, height: 36, marginRight: 8 }} />
          </div>
          <ul className="nav flex-row" style={{ marginLeft: 'auto' }}>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link${location.pathname === '/admin-dashboard' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-dashboard'); }}
              >Dashboard</a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link${location.pathname === '/admin-payment-history' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-payment-history'); }}
              >Payment History</a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link${location.pathname === '/admin-loan-providers' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-loan-providers'); }}
              >Loan Providers</a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link${location.pathname === '/admin-loan-dashboard' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-loan-dashboard'); }}
              >Loan History</a>
            </li>
            {(role === 'admin' || role === 'ops') && (
              <li className="nav-item">
                <a
                  href="#"
                  className={`nav-link${location.pathname === '/admin-settings' ? ' active' : ''}`}
                  onClick={e => { e.preventDefault(); navigate('/admin-settings'); }}
                >Settings</a>
              </li>
            )}
            <li className="nav-item">
              <a href="#" className="nav-link" onClick={e => { e.preventDefault(); handleLogout(); }}>Logout</a>
            </li>
          </ul>
        </nav>
      ) : (
        <>
          {/* Sidebar for desktop */}
          <div className={`sidebar${isSidebarCollapsed ? ' collapsed' : ''}`} style={{ position: 'fixed', zIndex: 1100 }}>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <i className={`fas fa-${isSidebarCollapsed ? 'angle-right' : 'angle-left'}`}></i>
            </button>
            <img className="logo" alt="Logo" src={adminlogo} style={isSidebarCollapsed ? { display: 'none' } : {}} />
            <h3 className="sidebar-title" style={isSidebarCollapsed ? { display: 'none' } : {}}>Admin Panel</h3>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link
                  to="/admin-dashboard"
                  className={`nav-link${location.pathname.includes('/admin-dashboard') ? ' active' : ''}`}
                >
                  <i className="fas fa-tachometer-alt"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/admin-payment-history"
                  className={`nav-link${location.pathname.includes('/admin-payment-history') ? ' active' : ''}`}
                >
                  <i className="fas fa-history"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Payment History</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/admin-loan-providers"
                  className={`nav-link${location.pathname.includes('/admin-loan-providers') ? ' active' : ''}`}
                >
                  <i className="fas fa-building"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Loan Providers</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/admin-loan-dashboard"
                  className={`nav-link${location.pathname.includes('/admin-loan-dashboard') ? ' active' : ''}`}
                >
                  <i className="fas fa-university"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Loan History</span>
                </Link>
              </li>
              {(role === 'admin' || role === 'ops') && (
                <li className="nav-item">
                  <Link
                    to="/admin-settings"
                    className={`nav-link${location.pathname.includes('/admin-settings') ? ' active' : ''}`}
                  >
                    <i className="fas fa-cogs"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Settings</span>
                  </Link>
                </li>
              )}
              <li className="nav-item mt-auto">
                <a href="#" className="nav-link" onClick={e => { e.preventDefault(); handleLogout(); }}>
                  <i className="fas fa-sign-out-alt"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Logout</span>
                </a>
              </li>
            </ul>
          </div>
          {/* Top Bar for desktop */}
          <div className="top-bar">
            <div className="user-info">
              <span className="badge">
                <i className="fas fa-user-circle me-1"></i>
                {localStorage.getItem('admin_username') || roleLabels[role]}
              </span>
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </>
      )}
      {/* Main Content */}
      <div className="content">
        <div className="container-fluid py-4">
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header">
                  <h3 className="mb-0"><i className="fas fa-cogs"></i> Admin Settings</h3>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <button className="btn btn-secondary me-2" onClick={handleResetOwnPassword}>
                      <i className="fas fa-key me-1"></i> Reset My Password
                    </button>
                    {role === 'admin' && (
                      <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                        <i className="fas fa-user-plus me-1"></i> Add User
                      </button>
                    )}
                  </div>
                  {role === 'admin' && (
                    <div className="table-container" style={{ width: '100%' }}>
                      <table className="table table-striped table-hover w-100">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Mobile Number</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id}>
                              <td>{user.username}</td>
                              <td>{roleLabels[user.role]}</td>
                              <td>{user.mobile_number || '-'}</td>
                              <td>
                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                              <td>
                                <button 
                                  className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'} me-2`} 
                                  onClick={() => handleToggleUserStatus(user)}
                                  title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                >
                                  <i className={`fas ${user.is_active ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                                </button>
                                <button className="btn btn-sm btn-primary edit-btn me-2" onClick={() => handleEditUser(user)}>
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user)}>
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add User Modal */}
      {showAdd && (
        <div className="edit-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Add User</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowAdd(false)}></button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mobile Number</label>
                  <input type="text" className="form-control" value={newUser.mobile_number} onChange={e => setNewUser(u => ({ ...u, mobile_number: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))} required>
                    <option value="admin">Admin</option>
                    <option value="ops">Operations</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editUser && (
        <div className="edit-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit User</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setEditUser(null)}></button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} required>
                    <option value="admin">Admin</option>
                    <option value="ops">Operations</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password (leave blank to keep unchanged)</label>
                  <input type="password" className="form-control" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>Close</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettingsPage; 