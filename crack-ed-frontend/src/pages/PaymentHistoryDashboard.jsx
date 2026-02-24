import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/admin-dashboard.css';
import adminlogo from '../assets/logo_admin.png';

const PAGE_SIZE = 50;
const BASE_URL = process.env.REACT_APP_BASE_URL;

const roleLabels = {
  admin: 'Admin',
  ops: 'Operations',
  sales: 'Sales',
};

const paymentFields = [
  'id',
  'application_id',
  'candidate_name',
  'email',
  'mobile',
  'program',
  'razorpay_order_id',
  'razorpay_payment_id',
  'razorpay_payment_status',
  'razorpay_payment_amount',
  'razorpay_payment_method',
  'razorpay_payment_timestamp',
  'payment_type',
  'installment_number',
  'created_at',
  'total_amount_paid',
  // Add any new fields here
];

function Pagination({ page, totalPages, setPage }) {
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mt-3">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(1)}>First</button>
        </li>
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
        </li>
        {[...Array(totalPages)].map((_, i) => (
          <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
        </li>
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(totalPages)}>Last</button>
        </li>
      </ul>
    </nav>
  );
}

function PaymentHistoryDashboard() {
  const [payments, setPayments] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('admin_role') || 'admin');
  const [filter, setFilter] = useState({ start_date: '', end_date: '' });
  const [providerRows, setProviderRows] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('admin_sidebar_collapsed');
    return stored === 'true';
  });

  useEffect(() => {
    fetchPayments();
    fetchApplications();
  }, [page, search, filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {
        page,
        per_page: PAGE_SIZE,
        search,
        ...filter,
      };
      const res = await axios.get(`${BASE_URL}/api/payment-history`, { params, headers });
      setPayments(res.data.payments);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch payment history', 'error');
    }
    setLoading(false);
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${BASE_URL}/api/applications`, { params: { page: 1, per_page: 1000 }, headers });
      setApplications(res.data.applications || []);
    } catch (err) {
      setApplications([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(payments.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    const confirm = await Swal.fire({
      title: `Delete ${selectedRows.length} selected payment records?`,
      icon: 'warning',
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${BASE_URL}/api/payment-history/bulk-delete`, { ids: selectedRows }, { headers });
      Swal.fire('Deleted!', '', 'success');
      fetchPayments();
      setSelectedRows([]);
    } catch (err) {
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) return;
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${BASE_URL}/api/payment-history/bulk-download`,
        { ids: selectedRows },
        { responseType: 'blob', headers }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment_history.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire('Error', 'Failed to download', 'error');
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        Swal.fire('Error', 'Payment record not found', 'error');
        return;
      }
      const res = await axios.get(`${BASE_URL}/api/download-payment-receipt-by-payment/${payment.id}`, { responseType: 'blob', headers });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Receipt_${payment.application_id}_${payment.razorpay_payment_id || payment.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire('Error', 'Failed to download receipt', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    navigate('/admin/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'captured': 'success',
      'failed': 'danger',
      'pending': 'warning',
      'refunded': 'info'
    };
    return (
      <span className={`badge bg-${statusColors[status] || 'secondary'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const fetchProviderRows = async (applicationId) => {
    if (!applicationId) return;
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${BASE_URL}/api/loan-provider-selections?application_id=${applicationId}`, { headers });
      setProviderRows(res.data.providers || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch provider rows', 'error');
    }
  };

  // Responsive top nav for mobile
  const isMobile = window.innerWidth < 1000;

  // Build a map from application_id to total_amount_paid
  const appTotalPaidMap = {};
  applications.forEach(app => {
    appTotalPaidMap[app.application_id] = app.total_amount_paid || 0;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      localStorage.setItem('admin_sidebar_collapsed', !prev);
      return !prev;
    });
  };

  return (
    <div className='admin_portal'>
      {/* Top Navigation for mobile */}
      {isMobile ? (
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
                className={`nav-link${location.pathname === '/admin-loan-dashboard' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-loan-dashboard'); }}
              >Loan History</a>
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
                className={`nav-link${location.pathname === '/admin-settings' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-settings'); }}
              >Settings</a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link" onClick={e => { e.preventDefault(); handleLogout(); }}>Logout</a>
            </li>
          </ul>
        </nav>
      ) : (
        <>
          {/* Sidebar for desktop */}
          <div className={`sidebar${isSidebarCollapsed ? ' collapsed' : ''}`} style={{zIndex: 1102, position: 'fixed'}}>
            <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <i className={`fas fa-${isSidebarCollapsed ? 'angle-right' : 'angle-left'}`}></i>
            </button>
            <img className="logo" alt="Logo" src={adminlogo} />
            <h3 className="sidebar-title">Admin Panel</h3>
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
                  to="/admin-loan-dashboard"
                  className={`nav-link${location.pathname.includes('/admin-loan-dashboard') ? ' active' : ''}`}
                >
                  <i className="fas fa-university"></i> <span className={isSidebarCollapsed ? 'd-none' : ''}>Loan History</span>
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
                {localStorage.getItem('admin_username') || role.charAt(0).toUpperCase() + role.slice(1)}
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
                  <h3 className="mb-0"><i className="fas fa-history"></i> Payment History Dashboard</h3>
                </div>
                <div className="card-body">
                  {/* Filter Row */}
                  <form className="row g-2 mb-3" onSubmit={e => { e.preventDefault(); fetchPayments(); }}>
                    <div className="col-md-3">
                      <input type="date" className="form-control" value={filter.start_date} onChange={e => setFilter(f => ({ ...f, start_date: e.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <input type="date" className="form-control" value={filter.end_date} onChange={e => setFilter(f => ({ ...f, end_date: e.target.value }))} />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-primary w-100"><i className="fas fa-filter"></i> Filter</button>
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-warning w-100" onClick={() => setFilter({ start_date: '', end_date: '' })}><i className="fas fa-times"></i> Clear</button>
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-success w-100" onClick={fetchPayments}><i className="fas fa-sync-alt"></i> Refresh</button>
                    </div>
                  </form>
                  {/* Search Row */}
                  <form className="mb-3" onSubmit={e => { e.preventDefault(); setPage(1); fetchPayments(); }}>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder="Search by name, email, mobile, application ID, or payment ID…" value={search} onChange={e => setSearch(e.target.value)} />
                      <button className="btn btn-primary" type="submit"><i className="fas fa-search"></i></button>
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>Clear</button>
                    </div>
                  </form>
                  {/* Table */}
                  <div className="table-container mt-3">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th width="50px"><input type="checkbox" checked={selectedRows.length === payments.length && payments.length > 0} onChange={handleSelectAll} /> All</th>
                          <th>Application ID</th>
                          <th>Candidate Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Program</th>
                          <th>Payment ID</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Method</th>
                          <th>Payment Type</th>
                          {/* <th>Installment #</th> */}
                          <th>Payment Date</th>
                          {/* <th>App Status</th> */}
                          <th>Total Paid</th>
                          {/* <th>Record Created</th> */}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={17} className="text-center">
                              <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </td>
                          </tr>
                        ) : payments.length === 0 ? (
                          <tr>
                            <td colSpan={17} className="text-center">
                              No payment records found
                            </td>
                          </tr>
                        ) : (
                          [...payments].reverse().map((payment) => (
                            <tr key={payment.id}>
                              <td><input type="checkbox" checked={selectedRows.includes(payment.id)} onChange={() => handleSelectRow(payment.id)} /></td>
                              <td>{payment.application_id}</td>
                              <td>{payment.candidate_name}</td>
                              <td>{payment.email}</td>
                              <td>{payment.mobile}</td>
                              <td>{payment.program}</td>
                              <td>{payment.razorpay_payment_id}</td>
                              <td>{formatCurrency(payment.razorpay_payment_amount)}</td>
                              <td>{getStatusBadge(payment.razorpay_payment_status)}</td>
                              <td>{payment.razorpay_payment_method || '-'}</td>
                              <td>{payment.payment_type || '-'}</td>
                              {/* <td>{payment.installment_number || '-'}</td> */}
                              <td>{formatDate(payment.razorpay_payment_timestamp)}</td>
                              {/* <td>{payment.application_status}</td> */}
                              <td>{formatCurrency(appTotalPaidMap[payment.application_id] || 0)}</td>
                              {/* <td>{formatDate(payment.created_at)}</td> */}
                              <td>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-success" 
                                  onClick={() => handleDownloadReceipt(payment.id)}
                                  title="Download Payment Receipt (Admin)"
                                >
                                  <i className="fas fa-file-pdf"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-info"
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('admin_token');
                                      const headers = token ? { Authorization: `Bearer ${token}` } : {};
                                      const res = await axios.get(`${BASE_URL}/api/user/download-payment-receipt?application_id=${payment.application_id}`, { responseType: 'blob', headers });
                                      const url = window.URL.createObjectURL(new Blob([res.data]));
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `User_Payment_Receipt_${payment.application_id}.pdf`;
                                      document.body.appendChild(link);
                                      link.click();
                                      link.remove();
                                      window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                      Swal.fire('Error', 'Failed to download user receipt', 'error');
                                    }
                                  }}
                                  title="Download User Payment Receipt"
                                  style={{ marginLeft: '4px' }}
                                >
                                  <i className="fas fa-user"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                  {/* Action Buttons */}
                  <div className="action-buttons">
                    {(role === 'admin' || role === 'ops' || role === 'sales') && (
                      <button className="btn btn-success" onClick={handleDownload}><i className="fas fa-download"></i> Download Selected</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentHistoryDashboard; 