import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/admin-dashboard.css';
import varthanalogo from '../assets/varthanalogo.png';
import finzlogo from '../assets/finzlogo.png';
import aksharlogo from '../assets/aksharlogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileZipper } from '@fortawesome/free-solid-svg-icons';
import AdminLoanProviders from '../components/AdminLoanProviders';
import adminlogo from '../assets/logo_admin.png'; // Ensure you have the correct path to your logo

const PAGE_SIZE = 50;

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

// FilePreview component for image/pdf
const FilePreview = ({ url }) => {
  if (!url) return null;
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);
  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src="/pdf-icon.png" alt="PDF" style={{ width: 32, height: 32 }} />
        <span>View PDF</span>
      </a>
    );
  }
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt="Preview" style={{ width: 32, height: 32, objectFit: 'cover' }} />
      </a>
    );
  }
  return <a href={url} target="_blank" rel="noopener noreferrer">Download</a>;
};

function ProviderEditModal({ show, row, onClose, onSave }) {
  const [form, setForm] = React.useState(row || {});
  React.useEffect(() => { setForm(row || {}); }, [row]);
  if (!show || !row) return null;
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
      <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Edit Provider Row</h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-control" name="status" value={form.status || ''} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Disbursal Date</label>
                <input type="date" className="form-control" name="disbursal_date" value={form.disbursal_date ? form.disbursal_date.substring(0, 10) : ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Disbursed Amount</label>
                <input type="number" className="form-control" name="disbursed_amount" value={form.disbursed_amount || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Final Interest Rate</label>
                <input type="number" className="form-control" name="final_interest_rate" value={form.final_interest_rate || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Loan Processed By</label>
                <input type="text" className="form-control" name="loan_processed_by" value={form.loan_processed_by || ''} onChange={handleChange} />
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

// Helper to get image URL (robust, matches LoanApplicationForm.js)
const getImageUrl = (filename) => {
  if (!filename) return '';
  return `${process.env.REACT_APP_BASE_URL || ''}/admin_files/${filename}`;
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

// Helper to generate preview URL for applicant documents (copied from LoanApplicationForm.js)
const getFilePreviewUrl = (userId, applicationId, filePath, applicantIdx = 1) => {
  if (!filePath) return null;
  if (typeof filePath === 'object' && filePath instanceof File) {
    return URL.createObjectURL(filePath);
  }
  const filename = typeof filePath === 'string' ? filePath.split('/').pop() : filePath;
  return `/admin_files/uploads/${userId}/${applicationId}/loan_application/applicant${applicantIdx}/${filename}`;
};

// Helper to extract just the filename from a path
const getFilename = (path) => path ? path.split('/').pop() : '';

// Helper to strip leading 'uploads/' from DB path
const stripUploads = (path) => path && path.startsWith('uploads/') ? path.slice(8) : path;

const LoanHistory = () => {
  const [loans, setLoans] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('admin_role') || 'admin');
  const [filter, setFilter] = useState({ start_date: '', end_date: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [providerRows, setProviderRows] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [providerEditModal, setProviderEditModal] = useState({ show: false, row: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('admin_sidebar_collapsed');
    return stored === 'true';
  });

  const loanProviders = [
    { id: 1, name: 'Varthana Finance', provlogo: varthanalogo, baseRate: 0.06, eligibility: ['CIBIL score of 700', 'CIBIL score of'] },
    { id: 2, name: 'Finz Payments', provlogo: finzlogo, baseRate: 0.08, eligibility: ['CIBIL score of 650', 'CIBIL score of'] },
    { id: 3, name: 'Akshar Fees', provlogo: aksharlogo, baseRate: 0.07, eligibility: ['CIBIL score of 600', 'CIBIL score of'] },
  ];

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line
  }, [page, search, filter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 15,
        search,
        ...filter,
      };
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/loan-applications`, { params, headers });
      setLoans((res.data.loans || []).reverse());
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      setError('Failed to fetch loan applications');
    }
    setLoading(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(loans.map((l) => l.id));
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
      title: `Delete ${selectedRows.length} selected loan records?`,
      icon: 'warning',
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/loan-applications/bulk-delete`, { ids: selectedRows });
      Swal.fire('Deleted!', '', 'success');
      fetchLoans();
      setSelectedRows([]);
    } catch (err) {
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const handleDownload = async () => {
    if (selectedRows.length === 0) return;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/loan-applications/bulk-download`,
        { ids: selectedRows },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'loan_history.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire('Error', 'Failed to download', 'error');
    }
  };

  const handleEdit = (loan) => {
    setEditingId(loan.id);
    setEditData({ ...loan });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put(`${process.env.REACT_APP_BASE_URL}/api/loan-applications/${editingId}`, editData)
      .then(() => {
        setLoans(loans.map(l => (l.id === editingId ? { ...l, ...editData } : l)));
        setEditingId(null);
        setEditData({});
      })
      .catch(() => setError('Failed to update loan application'));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_username');
    navigate('/admin-login');
  };

  const isMobile = window.innerWidth < 1000;

  const fetchProviderRows = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/loan-provider-selections?application_id=${applicationId}`);
      setProviderRows(res.data.providers || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch provider rows', 'error');
    }
  };

  const loanFields = [
    'id',
    'application_id',
    'user_id',
    'candidate_name',
    'program',
    'applicant1_name',
    'applicant1_relationship',
    'applicant1_pan',
    'applicant1_aadhar_front',
    'applicant1_aadhar_back',
    'applicant1_bank_statement',
    'applicant1_salary_slip',
    'applicant2_name',
    'applicant2_relationship',
    'applicant2_pan',
    'applicant2_aadhar_front',
    'applicant2_aadhar_back',
    'applicant2_bank_statement',
    'applicant2_salary_slip',
    'applicant3_name',
    'applicant3_relationship',
    'applicant3_pan',
    'applicant3_aadhar_front',
    'applicant3_aadhar_back',
    'applicant3_bank_statement',
    'applicant3_salary_slip',
    'created_at',
    'updated_at',
    // Add any new fields here
  ];
  const providerFields = [
    'id',
    'application_id',
    'loan_provider_name',
    'loan_amount',
    'loan_tenure',
    'loan_interest',
    'emi',
    'status',
    'disbursal_date',
    'disbursed_amount',
    'final_interest_rate',
    'loan_processed_by',
    'created_at',
    'updated_at',
    // Add any new fields here
  ];

  const handleDownloadZip = async (application_id, loan_id) => {
    if (!loan_id) {
      Swal.fire('Error', 'Loan record not found for this application', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/loan-applications/${loan_id}/download-documents`, { responseType: 'blob', headers });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `loan_documents_${application_id}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire('Error', 'Failed to download applicant documents zip', 'error');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      localStorage.setItem('admin_sidebar_collapsed', !prev);
      return !prev;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
          <div className={`sidebar${isSidebarCollapsed ? ' collapsed' : ''}`}>
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
                  <h3 className="mb-0"><i className="fas fa-university"></i> Loan History</h3>
                </div>
                <div className="card-body">
                  {/* Filter Row */}
                  <form className="row g-2 mb-3" onSubmit={e => { e.preventDefault(); fetchLoans(); }}>
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
                      <button type="button" className="btn btn-success w-100" onClick={fetchLoans}><i className="fas fa-sync-alt"></i> Refresh</button>
                    </div>
                  </form>
                  {/* Search Row */}
                  <form className="mb-3" onSubmit={e => { e.preventDefault(); setPage(1); fetchLoans(); }}>
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
                          <th><input type="checkbox" checked={selectedRows.length === loans.length && loans.length > 0} onChange={handleSelectAll} /> All</th>
                          {/* <th>ID</th> */}
                          <th>Application ID</th>
                          <th>Candidate Name</th>
                          <th>Program</th>
                          <th>Applicant 1 Name</th>
                          <th>Applicant 1 Relationship</th>
                          {/* <th>Applicant 1 PAN</th>
                          <th>Applicant 1 Aadhaar Front</th>
                          <th>Applicant 1 Aadhaar Back</th>
                          <th>Applicant 1 Bank Statement</th>
                          <th>Applicant 1 Salary Slip</th> */}
                          <th>Applicant 2 Name</th>
                          <th>Applicant 2 Relationship</th>
                          {/* <th>Applicant 2 PAN</th>
                          <th>Applicant 2 Aadhaar Front</th>
                          <th>Applicant 2 Aadhaar Back</th>
                          <th>Applicant 2 Bank Statement</th>
                          <th>Applicant 2 Salary Slip</th> */}
                          <th>Applicant 3 Name</th>
                          <th>Applicant 3 Relationship</th>
                          {/* <th>Applicant 3 PAN</th>
                          <th>Applicant 3 Aadhaar Front</th>
                          <th>Applicant 3 Aadhaar Back</th>
                          <th>Applicant 3 Bank Statement</th>
                          <th>Applicant 3 Salary Slip</th> */}
                          <th>Created At</th>
                          <th>Updated At</th>
                          <th>Download Zip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map(loan => (
                          <tr key={loan.id}>
                            <td><input type="checkbox" checked={selectedRows.includes(loan.id)} onChange={() => handleSelectRow(loan.id)} /></td>
                            {/* <td>{loan.id}</td> */}
                            <td>{loan.application_id}</td>
                            <td>{loan.candidate_name}</td>
                            <td>{loan.program}</td>
                            <td>{loan.applicant1_name}</td>
                            <td>{loan.applicant1_relationship}</td>
                            {/* <td>
                              {loan.applicant1_pan ? (
                                getFileType(loan.applicant1_pan) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_pan))); setPreviewLabel('Applicant 1 PAN'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant1_pan) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant1_pan))} alt="Applicant 1 PAN" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_pan))); setPreviewLabel('Applicant 1 PAN'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant1_aadhar_front ? (
                                getFileType(loan.applicant1_aadhar_front) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_aadhar_front))); setPreviewLabel('Applicant 1 Aadhaar Front'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant1_aadhar_front) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant1_aadhar_front))} alt="Applicant 1 Aadhaar Front" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_aadhar_front))); setPreviewLabel('Applicant 1 Aadhaar Front'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant1_aadhar_back ? (
                                getFileType(loan.applicant1_aadhar_back) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_aadhar_back))); setPreviewLabel('Applicant 1 Aadhaar Back'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant1_aadhar_back) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant1_aadhar_back))} alt="Applicant 1 Aadhaar Back" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_aadhar_back))); setPreviewLabel('Applicant 1 Aadhaar Back'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant1_bank_statement ? (
                                getFileType(loan.applicant1_bank_statement) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_bank_statement))); setPreviewLabel('Applicant 1 Bank Statement'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant1_bank_statement) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant1_bank_statement))} alt="Applicant 1 Bank Statement" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_bank_statement))); setPreviewLabel('Applicant 1 Bank Statement'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant1_salary_slip ? (
                                getFileType(loan.applicant1_salary_slip) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_salary_slip))); setPreviewLabel('Applicant 1 Salary Slip'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant1_salary_slip) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant1_salary_slip))} alt="Applicant 1 Salary Slip" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant1_salary_slip))); setPreviewLabel('Applicant 1 Salary Slip'); }} />
                                ) : null
                              ) : '-' }
                            </td> */}
                            <td>{loan.applicant2_name}</td>
                            <td>{loan.applicant2_relationship}</td>
                            {/* <td>
                              {loan.applicant2_pan ? (
                                getFileType(loan.applicant2_pan) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_pan))); setPreviewLabel('Applicant 2 PAN'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant2_pan) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant2_pan))} alt="Applicant 2 PAN" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_pan))); setPreviewLabel('Applicant 2 PAN'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant2_aadhar_front ? (
                                getFileType(loan.applicant2_aadhar_front) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_aadhar_front))); setPreviewLabel('Applicant 2 Aadhaar Front'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant2_aadhar_front) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant2_aadhar_front))} alt="Applicant 2 Aadhaar Front" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_aadhar_front))); setPreviewLabel('Applicant 2 Aadhaar Front'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant2_aadhar_back ? (
                                getFileType(loan.applicant2_aadhar_back) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_aadhar_back))); setPreviewLabel('Applicant 2 Aadhaar Back'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant2_aadhar_back) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant2_aadhar_back))} alt="Applicant 2 Aadhaar Back" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_aadhar_back))); setPreviewLabel('Applicant 2 Aadhaar Back'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant2_bank_statement ? (
                                getFileType(loan.applicant2_bank_statement) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_bank_statement))); setPreviewLabel('Applicant 2 Bank Statement'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant2_bank_statement) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant2_bank_statement))} alt="Applicant 2 Bank Statement" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_bank_statement))); setPreviewLabel('Applicant 2 Bank Statement'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant2_salary_slip ? (
                                getFileType(loan.applicant2_salary_slip) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_salary_slip))); setPreviewLabel('Applicant 2 Salary Slip'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant2_salary_slip) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant2_salary_slip))} alt="Applicant 2 Salary Slip" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant2_salary_slip))); setPreviewLabel('Applicant 2 Salary Slip'); }} />
                                ) : null
                              ) : '-' }
                            </td> */}
                            <td>{loan.applicant3_name}</td>
                            <td>{loan.applicant3_relationship}</td>
                            {/* <td>
                              {loan.applicant3_pan ? (
                                getFileType(loan.applicant3_pan) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_pan))); setPreviewLabel('Applicant 3 PAN'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant3_pan) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant3_pan))} alt="Applicant 3 PAN" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_pan))); setPreviewLabel('Applicant 3 PAN'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant3_aadhar_front ? (
                                getFileType(loan.applicant3_aadhar_front) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_aadhar_front))); setPreviewLabel('Applicant 3 Aadhaar Front'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant3_aadhar_front) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant3_aadhar_front))} alt="Applicant 3 Aadhaar Front" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_aadhar_front))); setPreviewLabel('Applicant 3 Aadhaar Front'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant3_aadhar_back ? (
                                getFileType(loan.applicant3_aadhar_back) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_aadhar_back))); setPreviewLabel('Applicant 3 Aadhaar Back'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant3_aadhar_back) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant3_aadhar_back))} alt="Applicant 3 Aadhaar Back" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_aadhar_back))); setPreviewLabel('Applicant 3 Aadhaar Back'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant3_bank_statement ? (
                                getFileType(loan.applicant3_bank_statement) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_bank_statement))); setPreviewLabel('Applicant 3 Bank Statement'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant3_bank_statement) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant3_bank_statement))} alt="Applicant 3 Bank Statement" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_bank_statement))); setPreviewLabel('Applicant 3 Bank Statement'); }} />
                                ) : null
                              ) : '-' }
                            </td>
                            <td>
                              {loan.applicant3_salary_slip ? (
                                getFileType(loan.applicant3_salary_slip) === 'pdf' ? (
                                  <div className="pdf-thumbnail" onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_salary_slip))); setPreviewLabel('Applicant 3 Salary Slip'); }} title="Click to preview PDF">PDF</div>
                                ) : getFileType(loan.applicant3_salary_slip) === 'image' ? (
                                  <img src={getImageUrl(stripUploads(loan.applicant3_salary_slip))} alt="Applicant 3 Salary Slip" className="img-thumbnail" style={{ cursor: 'pointer' }} onClick={() => { setPreviewImage(getImageUrl(stripUploads(loan.applicant3_salary_slip))); setPreviewLabel('Applicant 3 Salary Slip'); }} />
                                ) : null
                              ) : '-' }
                            </td> */}
                            <td>{loan.created_at}</td>
                            <td>{loan.updated_at}</td>
                            <td>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-warning" 
                                onClick={() => handleDownloadZip(loan.application_id, loan.id)}
                                title="Download Applicant Documents Zip"
                                style={{ marginLeft: '4px' }}
                              >
                                <FontAwesomeIcon icon={faFileZipper} size="lg" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="d-flex align-items-center justify-content-between">
                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                    {!isMobile && (
                      <button className="btn btn-success ms-3" onClick={handleDownload} disabled={selectedRows.length === 0}><i className="fas fa-download"></i> Download</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card mt-4">
            <div className="card-header">
              <h4>Loan Provider Selections (by Application ID)</h4>
              <div className="input-group mb-2" style={{ maxWidth: 400 }}>
                <input type="text" className="form-control" placeholder="Enter Application ID" value={selectedAppId} onChange={e => setSelectedAppId(e.target.value)} />
                <button className="btn btn-primary" onClick={() => fetchProviderRows(selectedAppId)}>Fetch Providers</button>
              </div>
            </div>
            <div className="card-body">
              {providerRows.length === 0 ? (
                <div className="text-muted">No provider rows found for this application.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>Provider Name</th>
                        <th>Loan Amount</th>
                        <th>Tenure (months)</th>
                        <th>Interest (%)</th>
                        <th>EMI</th>
                        <th>Status</th>
                        <th>Disbursal Date</th>
                        <th>Disbursed Amount</th>
                        <th>Final Interest Rate</th>
                        <th>Loan Processed By</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerRows.map(row => (
                        <tr key={row.id}>
                          <td>{row.loan_provider_name}</td>
                          <td>{row.loan_amount}</td>
                          <td>{row.loan_tenure}</td>
                          <td>{row.loan_interest}</td>
                          <td>{row.emi}</td>
                          <td>{row.status}</td>
                          <td>{row.disbursal_date || '-'}</td>
                          <td>{row.disbursed_amount || '-'}</td>
                          <td>{row.final_interest_rate || '-'}</td>
                          <td>{row.loan_processed_by || '-'}</td>
                          <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                          <td>{row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'}</td>
                          <td>
                            <button className="btn btn-sm btn-info" style={{ marginLeft: '4px' }} title="Edit" onClick={() => setProviderEditModal({ show: true, row })}>
                              <i className="fas fa-edit"></i> Edit
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
      {providerEditModal.show && (
        <ProviderEditModal
          show={providerEditModal.show}
          row={providerEditModal.row}
          onClose={() => setProviderEditModal({ show: false, row: null })}
          onSave={async (form) => {
            try {
              await axios.put(`${process.env.REACT_APP_BASE_URL}/api/loan-provider-selections/${form.id}`, form);
              setProviderEditModal({ show: false, row: null });
              fetchProviderRows(selectedAppId);
            } catch {
              Swal.fire('Error', 'Failed to update provider row', 'error');
            }
          }}
        />
      )}
      {/* Preview Modal */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">{previewLabel} Preview</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewImage(null)}></button>
            </div>
            <div className="modal-body text-center">
              {getFileType(previewImage.split('/').pop()) === 'pdf' ? (
                <iframe src={previewImage} title={`${previewLabel} PDF Preview`} style={{ width: '100%', height: '70vh' }} />
              ) : getFileType(previewImage.split('/').pop()) === 'image' ? (
                <img src={previewImage} alt={previewLabel} className="image-preview-image" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
              ) : (
                <div className="file-preview-placeholder">
                  <i className="fas fa-file"></i>
                  <p>File Preview Not Available</p>
                  <p className="small">Click Download to view the file</p>
                </div>
              )}
            </div>
            <div className="image-preview-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewImage(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Download button for mobile/tablet view remains at the bottom */}
      {isMobile && (
        <div className="action-buttons">
          <button className="btn btn-success" onClick={handleDownload} disabled={selectedRows.length === 0}><i className="fas fa-download"></i> Download</button>
        </div>
      )}
    </div>
  );
};

export default LoanHistory; 