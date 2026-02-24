import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/admin-dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileZipper } from '@fortawesome/free-solid-svg-icons';
import AdminLoanProviders from '../components/AdminLoanProviders';
import adminlogo from '../assets/logo_admin.png';

const PAGE_SIZE = 50;

const roleLabels = {
  admin: 'Admin',
  ops: 'Operations',
  sales: 'Sales',
};

const loanFields = [
  'application_id',
  'first_name',
  'middle_name', 
  'last_name',
  'mobile_number',
  'email',
  'date_of_birth',
  'gender',
  'pan_card_number',
  'family_income',
  'address',
  'state',
  'district',
  'city',
  'pincode',
  'ug_university_name',
  'ug_degree',
  'ug_year_graduated',
  'pg_university_name',
  'pg_degree',
  'pg_year_graduated',
  'current_job_title',
  'company_name',
  'job_type',
  'location',
  'exp_current_company',
  'total_experience',
  'status',
  'razorpay_order_id',
  'razorpay_payment_id', 
  'razorpay_payment_status',
  'razorpay_payment_amount',
  'razorpay_payment_method',
  'razorpay_payment_timestamp',
  'program_total_fee'
];

function Pagination({ page, totalPages, setPage }) {
  const safeTotalPages = Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mt-3">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(1)}>First</button>
        </li>
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
        </li>
        {[...Array(safeTotalPages)].map((_, i) => (
          <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
          </li>
        ))}
        <li className={`page-item ${page === safeTotalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
        </li>
        <li className={`page-item ${page === safeTotalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(safeTotalPages)}>Last</button>
        </li>
      </ul>
    </nav>
  );
}

function EditModal({ show, app, onClose, onSave, columns }) {
  const [form, setForm] = React.useState(app || {});
  React.useEffect(() => { setForm(app || {}); }, [app]);
  if (!show || !app) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Edit Application</h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="row g-3">
              {/* Cheque/Cash Payment Mode */}
              <div className="col-md-6">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-control"
                  name="cheque_cash_payment_mode"
                  value={form.cheque_cash_payment_mode || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              {/* Payment Timestamp */}
              <div className="col-md-6">
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="payment_timestamp"
                  value={form.payment_timestamp ? form.payment_timestamp.slice(0, 10) : ''}
                  onChange={handleChange}
                />
              </div>
              {/* Cheque/Cash Amount */}
              <div className="col-md-6">
                <label className="form-label">Cheque/Cash Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="cheque_cash_payemnt_amount"
                  value={form.cheque_cash_payemnt_amount || ''}
                  onChange={handleChange}
                />
              </div>
              {/* Payment Comment */}
              <div className="col-md-6">
                <label className="form-label">Payment Comment</label>
                <input
                  type="text"
                  className="form-control"
                  name="payment_comment"
                  value={form.payment_comment || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  console.log('AdminDashboard component rendering...');
  console.log('localStorage admin_role:', localStorage.getItem('admin_role'));
  console.log('localStorage admin_token:', localStorage.getItem('admin_token'));
  
  const [applications, setApplications] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, app: null });
  const [role, setRole] = useState(localStorage.getItem('admin_role') || 'admin');
  const [filter, setFilter] = useState({ start_date: '', end_date: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('admin_sidebar_collapsed');
    return stored === 'true';
  });

  console.log('AdminDashboard state initialized, role:', role);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    console.log('AdminDashboard useEffect triggered, fetching applications...');
    fetchApplications();
  }, [page, search, filter]);

  const fetchApplications = async () => {
    console.log('fetchApplications called with params:', { page, per_page: PAGE_SIZE, search, ...filter });
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = { page, per_page: PAGE_SIZE, search, ...filter };
      console.log('Making API call to /api/applications with params:', params);
      const res = await axios.get(`${BASE_URL}/api/applications`, { params, headers });
      console.log('API response received:', res.data);
      setApplications(res.data.applications || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching applications:', err);
      Swal.fire('Error', 'Failed to fetch applications', 'error');
      setApplications([]);
    }
    setLoading(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(applications.map((a) => a.id));
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
      title: `Delete ${selectedRows.length} selected?`,
      icon: 'warning',
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${BASE_URL}/api/applications/bulk-delete`, { ids: selectedRows }, { headers });
      Swal.fire('Deleted!', '', 'success');
      fetchApplications();
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
        `${BASE_URL}/api/applications/bulk-download`,
        { ids: selectedRows },
        { responseType: 'blob', headers }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire('Error', 'Failed to download', 'error');
    }
  };

  const openEditModal = (app) => setEditModal({ show: true, app });
  const closeEditModal = () => setEditModal({ show: false, app: null });

  const handleEditSave = async (updatedApp) => {
    // Defensive: ensure payment_timestamp is in YYYY-MM-DD or null
    let payload = { ...updatedApp };
    if (payload.payment_timestamp) {
      // If it's a Date object, convert to string
      if (payload.payment_timestamp instanceof Date) {
        payload.payment_timestamp = payload.payment_timestamp.toISOString().slice(0, 10);
      } else if (typeof payload.payment_timestamp === 'string' && payload.payment_timestamp.length > 10) {
        // If it's a long string (e.g., locale string), try to parse and reformat
        const d = new Date(payload.payment_timestamp);
        if (!isNaN(d)) {
          payload.payment_timestamp = d.toISOString().slice(0, 10);
        } else {
          payload.payment_timestamp = null;
        }
      }
    }
    if (payload.payment_timestamp === '') payload.payment_timestamp = null;

    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${BASE_URL}/api/applications/${updatedApp.id}`, payload, { headers });
      Swal.fire('Updated!', '', 'success');
      closeEditModal();
      fetchApplications();
    } catch (err) {
      Swal.fire('Error', 'Failed to update', 'error');
    }
  };

  const handleImageDownload = (src, alt) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get image URL (always use Flask backend URL)
  const getImageUrl = (filename) => {
    if (!filename) return '';
    
    return `${BASE_URL}/admin_files/${filename}`;
  };

  // Helper to check if file is PDF
  const isPdfFile = (filename) => {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
  };

  // Helper to check if file is image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Helper to get file type
  const getFileType = (filename) => {
    if (!filename) return 'unknown';
    if (isPdfFile(filename)) return 'pdf';
    if (isImageFile(filename)) return 'image';
    return 'file';
  };

  // Table columns to display (adjust as needed)
  const columns = [
    { key: 'application_id', label: 'Reg No' },
    { key: 'first_name', label: 'First Name' },
    { key: 'middle_name', label: 'Middle Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'mobile_number', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'date_of_birth', label: 'DOB' },
    { key: 'gender', label: 'Gender' },
    { key: 'pan_card_number', label: 'PAN' },
    { key: 'family_income', label: 'Family Income' },
    { key: 'address', label: 'Address' },
    { key: 'state', label: 'State' },
    { key: 'district', label: 'District' },
    { key: 'city', label: 'City' },
    { key: 'pincode', label: 'Pincode' },
    // { key: 'ug_university_name', label: 'UG University' },
    // { key: 'ug_degree', label: 'UG Degree' },
    // { key: 'ug_year_graduated', label: 'UG Year' },
    // { key: 'pg_university_name', label: 'PG University' },
    // { key: 'pg_degree', label: 'PG Degree' },
    // { key: 'pg_year_graduated', label: 'PG Year' },
    // { key: 'current_job_title', label: 'Job Title' },
    // { key: 'company_name', label: 'Company' },
    // { key: 'job_type', label: 'Job Type' },
    // { key: 'location', label: 'Location' },
    // { key: 'exp_current_company', label: 'Exp (Current)' },
    // { key: 'total_experience', label: 'Total Exp' },
    // { key: 'passport_photo', label: 'Passport Photo', isImage: true },
    // { key: 'aadhar_front', label: 'Aadhar Front', isImage: true },
    // { key: 'aadhar_back', label: 'Aadhar Back', isImage: true },
    // { key: 'pan_card', label: 'PAN Photo', isImage: true },
    // { key: 'ug_certificate', label: 'UG Certificate', isImage: true },
    // { key: 'pg_certificate', label: 'PG Certificate', isImage: true },
    // { key: 'resume', label: 'Resume', isImage: true },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Reg Date' },
    { key: 'updated_at', label: 'Updated At' },
    { key: 'razorpay_order_id', label: 'Order ID' },
    { key: 'razorpay_payment_id', label: 'Payment ID' },
    { key: 'razorpay_payment_status', label: 'Payment Status' },
    { key: 'razorpay_payment_amount', label: 'Amount' },
    { key: 'razorpay_payment_method', label: 'Method' },
    { key: 'razorpay_payment_timestamp', label: 'Payment Time' },
    { key: 'program_total_fee', label: 'Program Fee' },
    { key: 'approved_loan_amount', label: 'Approved Loan' },    
    { key: 'razorpay_paid', label: 'Razorpay Paid' },
    { key: 'cheque_cash_payment_mode', label: 'Cheque/Cash Mode' },
    { key: 'payment_timestamp', label: 'Payment Timestamp' },
    { key: 'payment_comment', label: 'Payment ID' },
    { key: 'cheque_cash_payemnt_amount', label: 'Cheque/Cash Amount' },
    { key: 'total_amount_paid', label: 'Total Paid' },
    { key: 'remaining_amount', label: 'Remaining Amount' },
  ];

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_username');
    navigate('/admin-login');
  };

  // Responsive top nav for mobile
  const isMobile = window.innerWidth < 1000;

  const handleBlobDownload = async (url, filename) => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, { credentials: 'include', headers });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download file.');
    }
  };

  const handleDownloadReceipt = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${BASE_URL}/api/download-payment-receipt/${id}`, { responseType: 'blob', headers });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Receipt_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire('Error', 'Failed to download receipt', 'error');
    }
  };

  const handleDownloadCandidateZip = async (application) => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${BASE_URL}/api/applications/${application.application_id}/download-documents`, { responseType: 'blob', headers });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `candidate_documents_${application.application_id}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire('Error', 'Failed to download candidate documents zip', 'error');
    }
  };

  const handleDownloadLoanZip = async (application) => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Fetch loan_id for this application_id
      const resLoan = await axios.get(`${BASE_URL}/api/loan-applications?application_id=${application.application_id}`, { headers });
      const loan = resLoan.data.loans && resLoan.data.loans[0];
      if (!loan) throw new Error('Loan record not found');
      const res = await axios.get(`${BASE_URL}/api/loan-applications/${loan.id}/download-documents`, { responseType: 'blob', headers });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `loan_documents_${application.application_id}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire('Error', 'Failed to download loan documents zip', 'error');
    }
  };

  // Defensive check for columns and applications
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  if (!Array.isArray(columns)) console.error('Columns is not an array:', columns);
  if (!Array.isArray(applications)) console.error('Applications is not an array:', applications);

  console.log('columns:', columns);
  console.log('safeColumns:', safeColumns);
  console.log('applications:', applications);
  console.log('safeApplications:', safeApplications);

  // Defensive check for totalPages
  const safeTotalPages = Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;

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
              <Link
                to="/admin-dashboard"
                className={`nav-link${location.pathname === '/admin-dashboard' ? ' active' : ''}`}
              >Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin-payment-history"
                className={`nav-link${location.pathname === '/admin-payment-history' ? ' active' : ''}`}
              >Payment History</Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin-loan-dashboard"
                className={`nav-link${location.pathname === '/admin-loan-dashboard' ? ' active' : ''}`}
              >Loan Dashboard</Link>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link${location.pathname === '/admin-loan-providers' ? ' active' : ''}`}
                onClick={e => { e.preventDefault(); navigate('/admin-loan-providers'); }}
              >Loan Providers</a>
            </li>
            {(role === 'admin' || role === 'ops') && (
              <li className="nav-item">
                <Link
                  to="/admin-settings"
                  className={`nav-link${location.pathname === '/admin-settings' ? ' active' : ''}`}
                >Settings</Link>
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
                  <h3 className="mb-0"><i className="fas fa-users-cog"></i> Admin Dashboard</h3>
                </div>
                <div className="card-body">
                  {/* Filter Row */}
                  <form className="row g-2 mb-3" onSubmit={e => { e.preventDefault(); fetchApplications(); }}>
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
                      <button type="button" className="btn btn-success w-100" onClick={fetchApplications}><i className="fas fa-sync-alt"></i> Refresh</button>
                    </div>
                  </form>
                  {/* Search Row */}
                  <form className="mb-3" onSubmit={e => { e.preventDefault(); setPage(1); fetchApplications(); }}>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder="Search across all fields…" value={search} onChange={e => setSearch(e.target.value)} />
                      <button className="btn btn-primary" type="submit"><i className="fas fa-search"></i></button>
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>Clear</button>
                    </div>
                  </form>
                  {/* Table */}
                  <div className="table-container mt-3">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th width="50px"><input type="checkbox" checked={selectedRows.length === safeApplications.length && safeApplications.length > 0} onChange={handleSelectAll} /> All</th>
                          {safeColumns.map(col => <th key={col.key}>{col.label}</th>)}
                          <th>Document Download</th>
                          <th>Loan Document Download</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeApplications.length === 0 ? (
                          <tr><td colSpan={safeColumns.length + 4}>No applications found or data error.</td></tr>
                        ) : (
                          safeApplications.map((row, idx) => {
                            // Calculate Razorpay Paid
                            let razorpayPaid = 0;
                            if (Array.isArray(row.payment_history)) {
                              razorpayPaid = row.payment_history
                                .filter(p => p.razorpay_payment_status === 'captured')
                                .reduce((sum, p) => sum + (p.razorpay_payment_amount || 0), 0);
                            }
                            // Calculate Remaining Amount
                            const totalPaid = row.total_amount_paid || 0;
                            const programFee = row.program_total_fee || 0;
                            const remainingAmount = Math.max(programFee - totalPaid, 0);
                            return (
                              <tr key={row.id}>
                                <td><input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleSelectRow(row.id)} /></td>
                                {safeColumns.map(col => {
                                  if (col.key === 'razorpay_paid') {
                                    return <td key={col.key}>{razorpayPaid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>;
                                  }
                                  if (col.key === 'remaining_amount') {
                                    return <td key={col.key}>{remainingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>;
                                  }
                                  return col.isImage ? (
                                    <td key={col.key}>
                                      {row[col.key] ? (
                                        getFileType(row[col.key]) === 'pdf' ? (
                                          // PDF thumbnail
                                          <div
                                            className="pdf-thumbnail"
                                            onClick={() => {
                                              setPreviewImage(getImageUrl(row[col.key]));
                                              setPreviewLabel(col.label);
                                            }}
                                            title={`${col.label} - Click to preview PDF`}
                                          >
                                            PDF
                                          </div>
                                        ) : getFileType(row[col.key]) === 'image' ? (
                                          // Image thumbnail
                                          <img
                                            src={getImageUrl(row[col.key])}
                                            alt={col.label}
                                            className="img-thumbnail"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                              setPreviewImage(getImageUrl(row[col.key]));
                                              setPreviewLabel(col.label);
                                            }}
                                          />
                                        ) : (
                                          // Generic file thumbnail
                                          <div
                                            className="file-thumbnail"
                                            onClick={() => {
                                              setPreviewImage(getImageUrl(row[col.key]));
                                              setPreviewLabel(col.label);
                                            }}
                                            title={`${col.label} - Click to preview file`}
                                          >
                                            FILE
                                          </div>
                                        )
                                      ) : '-'}
                                    </td>
                                  ) : (
                                    <td key={col.key}>{typeof row[col.key] === 'boolean' ? (row[col.key] ? 'Yes' : 'No') : row[col.key] || '-'}</td>
                                  )
                                })}
                                <td>
                                  <button type="button" className="btn btn-sm btn-warning" onClick={() => handleDownloadCandidateZip(row)} title="Download Candidate Documents Zip">
                                    <FontAwesomeIcon icon={faFileZipper} size="lg" />
                                  </button>
                                </td>
                                <td>
                                  <button type="button" className="btn btn-sm btn-warning" onClick={() => handleDownloadLoanZip(row)} title="Download Loan Documents Zip">
                                    <FontAwesomeIcon icon={faFileZipper} size="lg" />
                                  </button>
                                </td>
                                <td>
                                  {(role === 'admin' || role === 'ops') && (
                                    <button type="button" className="btn btn-sm btn-primary edit-btn" onClick={() => openEditModal(row)}>
                                      <i className="fas fa-edit"></i>
                                    </button>
                                  )}
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-success" 
                                    onClick={() => handleDownloadReceipt(row.id)}
                                    title="Download Payment Receipt"
                                    style={{ marginLeft: '4px' }}
                                  >
                                    <i className="fas fa-file-pdf"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <Pagination page={page} totalPages={safeTotalPages} setPage={setPage} />
                  {/* Action Buttons */}
                  <div className="action-buttons">
                    {role === 'admin' && (
                      <button className="btn btn-danger" onClick={handleDelete}><i className="fas fa-trash"></i> Delete Selected</button>
                    )}
                    {(role === 'admin' || role === 'ops' || role === 'sales') && (
                      <button className="btn btn-success" onClick={handleDownload}><i className="fas fa-download"></i> Download Selected</button>
                    )}
                  </div>
                  {/* Edit Modal */}
                  <EditModal show={editModal.show} app={editModal.app} onClose={closeEditModal} onSave={handleEditSave} columns={safeColumns} />
                  {/* Document Preview Modal */}
                  {previewImage && (
                    <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
                      <div className="image-preview-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                          <h5 className="modal-title">{previewLabel} Preview</h5>
                          <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewImage(null)}></button>
                        </div>
                        <div className="modal-body text-center">
                          {getFileType(previewImage.split('/').pop()) === 'pdf' ? (
                            // PDF Preview
                            <iframe
                              src={previewImage}
                              title={`${previewLabel} PDF Preview`}
                            />
                          ) : getFileType(previewImage.split('/').pop()) === 'image' ? (
                            // Image Preview
                            <img src={previewImage} alt={previewLabel} className="image-preview-image" />
                          ) : (
                            // Generic file preview
                            <div className="file-preview-placeholder">
                              <i className="fas fa-file"></i>
                              <p>File Preview Not Available</p>
                              <p className="small">Click Download to view the file</p>
                            </div>
                          )}
                        </div>
                        <div className="image-preview-actions">
                          {(() => {
                            const downloadName = previewImage.split('/').pop().split('?')[0];
                            return (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleBlobDownload(previewImage, downloadName)}
                              >
                                <i className="fas fa-download"></i> Download
                              </button>
                            );
                          })()}
                          <button type="button" className="btn btn-secondary" onClick={() => setPreviewImage(null)}>Close</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 