import React from 'react';
import AdminLoanProviders from '../components/AdminLoanProviders';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/admin-dashboard.css';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import adminlogo from '../assets/logo_admin.png'; // Ensure you have the correct path to your logo

const roleLabels = {
  admin: 'Admin',
  ops: 'Operations',
  sales: 'Sales',
};

function AdminLoanProvidersDashboard() {
  const role = localStorage.getItem('admin_role') || 'admin';
  const username = localStorage.getItem('admin_username') || '';
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    const stored = localStorage.getItem('admin_sidebar_collapsed');
    return stored === 'true';
  });

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
              <a href="#" className={`nav-link${location.pathname === '/admin-dashboard' ? ' active' : ''}`} onClick={e => { e.preventDefault(); navigate('/admin-dashboard'); }}>Dashboard</a>
            </li>
            <li className="nav-item">
              <a href="#" className={`nav-link${location.pathname === '/admin-payment-history' ? ' active' : ''}`} onClick={e => { e.preventDefault(); navigate('/admin-payment-history'); }}>Payment History</a>
            </li>
            <li className="nav-item">
              <a href="#" className={`nav-link${location.pathname === '/admin-loan-dashboard' ? ' active' : ''}`} onClick={e => { e.preventDefault(); navigate('/admin-loan-dashboard'); }}>Loan History</a>
            </li>
            <li className="nav-item">
              <a href="#" className={`nav-link${location.pathname === '/admin-loan-providers' ? ' active' : ''}`} onClick={e => { e.preventDefault(); navigate('/admin-loan-providers'); }}>Loan Providers</a>
            </li>
            {(role === 'admin' || role === 'ops') && (
              <li className="nav-item">
                <a href="#" className={`nav-link${location.pathname === '/admin-settings' ? ' active' : ''}`} onClick={e => { e.preventDefault(); navigate('/admin-settings'); }}>Settings</a>
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
                <Link to="/admin-dashboard" className={`nav-link${location.pathname.includes('/admin-dashboard') ? ' active' : ''}`}>
                  <i className="fas fa-tachometer-alt"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin-payment-history" className={`nav-link${location.pathname.includes('/admin-payment-history') ? ' active' : ''}`}>
                  <i className="fas fa-history"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Payment History</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin-loan-dashboard" className={`nav-link${location.pathname.includes('/admin-loan-dashboard') ? ' active' : ''}`}>
                  <i className="fas fa-university"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Loan History</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin-loan-providers" className={`nav-link${location.pathname.includes('/admin-loan-providers') ? ' active' : ''}`}>
                  <i className="fas fa-building"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Loan Providers</span>
                </Link>
              </li>
              {(role === 'admin' || role === 'ops') && (
                <li className="nav-item">
                  <Link to="/admin-settings" className={`nav-link${location.pathname.includes('/admin-settings') ? ' active' : ''}`}>
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
                  <h3 className="mb-0"><i className="fas fa-building"></i> Loan Providers Management</h3>
                </div>
                <div className="card-body">
                  <AdminLoanProviders />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoanProvidersDashboard; 