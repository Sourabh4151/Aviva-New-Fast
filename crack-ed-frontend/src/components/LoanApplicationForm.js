import React, { useState, useEffect } from "react";
import "../styles/LoanForm.css";
import { useNavigate } from "react-router-dom";
import LoanPlans from "./LoanProviders";

const getFilePreviewUrl = (userId, applicationId, filePath, applicantIdx = 1) => {
  if (!filePath) return null;
  // If filePath is a File object (new upload), use a local URL
  if (typeof filePath === 'object' && filePath instanceof File) {
    return URL.createObjectURL(filePath);
  }
  // Always use the loan_application/applicantX/ subfolder (no fallback)
  const filename = typeof filePath === 'string' ? filePath.split('/').pop() : filePath;
  return `/admin_files/uploads/${userId}/${applicationId}/loan_application/applicant${applicantIdx}/${filename}`;
};

// Helper to get image/PDF/file URL (same as AdminDashboard)
const getImageUrl = (filename) => {
  if (!filename) return '';
  return `${process.env.REACT_APP_BASE_URL || ''}/admin_files/${filename}`;
};

const isPdfFile = (filename) => {
  if (!filename) return false;
  if (typeof filename === 'object' && filename instanceof File) {
    return filename.name.toLowerCase().endsWith('.pdf');
  }
  return filename.toLowerCase().endsWith('.pdf');
};

const isImageFile = (filename) => {
  if (!filename) return false;
  if (typeof filename === 'object' && filename instanceof File) {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(filename.name);
  }
  return /\.(jpe?g|png|gif|bmp|webp)$/i.test(filename);
};

const getFileType = (filename) => {
  if (!filename) return 'unknown';
  if (isPdfFile(filename)) return 'pdf';
  if (isImageFile(filename)) return 'image';
  return 'file';
};

const LoanApplicationForm = () => {
  // Only primary applicant by default
  const [coApplicants, setCoApplicants] = useState([
    { name: '', relationship: '', pan: null, aadharFront: null, aadharBack: null, bankStatement: null, salarySlip: null }
  ]);
  const [formErrors, setFormErrors] = useState([]);
  const [primaryFilled, setPrimaryFilled] = useState(false);
  const [coFilled, setCoFilled] = useState([false, false]);
  const [prefill, setPrefill] = useState(null);
  const [userId, setUserId] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLabel, setPreviewLabel] = useState("");

  useEffect(() => {
    // Fetch existing loan application data by application_id
    const application_id = localStorage.getItem('application_id');
    const token = localStorage.getItem('TOKEN');
    if (!application_id || !token) return;
    fetch(`/api/user/loan-application?application_id=${application_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.loan) {
          const loan = data.loan;
          setUserId(loan.user_id);
          setApplicationId(loan.application_id);
          // Prefill all 3 applicants
          let applicants = [
            {
              name: loan.applicant1_name || '',
              relationship: loan.applicant1_relationship || 'Self',
              pan: loan.applicant1_pan || null,
              aadharFront: loan.applicant1_aadhar_front || null,
              aadharBack: loan.applicant1_aadhar_back || null,
              bankStatement: loan.applicant1_bank_statement || null,
              salarySlip: loan.applicant1_salary_slip || null
            }
          ];
          // Only add co-applicant 1 if any field is filled
          if (
            loan.applicant2_name || loan.applicant2_relationship || loan.applicant2_pan ||
            loan.applicant2_aadhar_front || loan.applicant2_aadhar_back || loan.applicant2_bank_statement || loan.applicant2_salary_slip
          ) {
            applicants.push({
              name: loan.applicant2_name || '',
              relationship: loan.applicant2_relationship || '',
              pan: loan.applicant2_pan || null,
              aadharFront: loan.applicant2_aadhar_front || null,
              aadharBack: loan.applicant2_aadhar_back || null,
              bankStatement: loan.applicant2_bank_statement || null,
              salarySlip: loan.applicant2_salary_slip || null
            });
          }
          // Only add co-applicant 2 if any field is filled
          if (
            loan.applicant3_name || loan.applicant3_relationship || loan.applicant3_pan ||
            loan.applicant3_aadhar_front || loan.applicant3_aadhar_back || loan.applicant3_bank_statement || loan.applicant3_salary_slip
          ) {
            // Ensure co-applicant 1 exists
            if (applicants.length === 1) applicants.push({ name: '', relationship: '', pan: null, aadharFront: null, aadharBack: null, bankStatement: null, salarySlip: null });
            applicants.push({
              name: loan.applicant3_name || '',
              relationship: loan.applicant3_relationship || '',
              pan: loan.applicant3_pan || null,
              aadharFront: loan.applicant3_aadhar_front || null,
              aadharBack: loan.applicant3_aadhar_back || null,
              bankStatement: loan.applicant3_bank_statement || null,
              salarySlip: loan.applicant3_salary_slip || null
            });
          }
          setCoApplicants(applicants);
          setPrimaryFilled(!!loan.applicant1_name && !!loan.applicant1_pan && !!loan.applicant1_aadhar_front && !!loan.applicant1_aadhar_back && !!loan.applicant1_bank_statement);
          setCoFilled([
            !!loan.applicant2_name && !!loan.applicant2_pan && !!loan.applicant2_aadhar_front && !!loan.applicant2_aadhar_back && !!loan.applicant2_bank_statement,
            !!loan.applicant3_name && !!loan.applicant3_pan && !!loan.applicant3_aadhar_front && !!loan.applicant3_aadhar_back && !!loan.applicant3_bank_statement
          ]);
          setPrefill(loan);
        }
      });
  }, []);

  const addCoApplicant = () => {
    if (coApplicants.length < 3) {
      setCoApplicants([
        ...coApplicants,
        { name: '', relationship: '', pan: null, aadharFront: null, aadharBack: null, bankStatement: null, salarySlip: null },
      ]);
      setCoFilled([...coFilled, false]);
    }
  };

  const removeCoApplicant = (index) => {
    const updated = [...coApplicants];
    updated.splice(index, 1);
    setCoApplicants(updated);
    const updatedFilled = [...coFilled];
    updatedFilled.splice(index - 1, 1);
    setCoFilled(updatedFilled);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...coApplicants];
    updated[index][field] = value;
    setCoApplicants(updated);
  };

  const validateForm = () => {
    const errors = [];
    if (!primaryFilled) {
      const primary = coApplicants[0];
      if (!primary.name || !primary.pan || !primary.aadharFront || !primary.aadharBack || !primary.bankStatement) {
        errors.push(`Primary applicant has missing required fields.`);
      }
    }
    coApplicants.slice(1).forEach((app, index) => {
      if (!coFilled[index] && (!app.name || !app.relationship || !app.pan || !app.aadharFront || !app.aadharBack || !app.bankStatement)) {
        errors.push(`The co-applicant ${index + 1} has missing required fields.`);
      }
    });
    setFormErrors(errors);
    return errors.length === 0;
  };

  const navigate = useNavigate();
  const handleNext = async () => {
    if (validateForm()) {
      const application_id = localStorage.getItem('application_id');
      // Map each slot to applicant1/applicant2/applicant3 fields
      const data = {
        application_id,
        registered_user_name: localStorage.getItem('user_name') || '',
        applicant1_name: coApplicants[0]?.name || '',
        applicant1_relationship: coApplicants[0]?.relationship || 'Self',
        applicant2_name: coApplicants[1]?.name || '',
        applicant2_relationship: coApplicants[1]?.relationship || '',
        applicant3_name: coApplicants[2]?.name || '',
        applicant3_relationship: coApplicants[2]?.relationship || '',
      };
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      // File fields for each applicant
      const fileFields = [
        ['pan', 'aadharFront', 'aadharBack', 'bankStatement', 'salarySlip'],
        ['pan', 'aadharFront', 'aadharBack', 'bankStatement', 'salarySlip'],
        ['pan', 'aadharFront', 'aadharBack', 'bankStatement', 'salarySlip']
      ];
      coApplicants.forEach((app, idx) => {
        fileFields[idx].forEach(field => {
          if (app[field]) {
            formData.append(`applicant${idx+1}_${field === 'aadharFront' ? 'aadhar_front' : field === 'aadharBack' ? 'aadhar_back' : field.replace(/([A-Z])/g, '_$1').toLowerCase()}`, app[field]);
          }
        });
      });
      // Debug logs
      console.log('Submitting loan application:', data);
      console.log('FormData:', Array.from(formData.entries()));
      try {
        const res = await fetch('/api/loan-applications', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) {
          const err = await res.json();
          alert('Error: ' + (err.error || 'Failed to submit loan application.'));
          return;
        }
        navigate('/portal/loan-options');
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  };

  return (
    <div className="loan-container">
      <h3>Primary Applicant Documents</h3>

      {formErrors.length > 0 && (
        <div className="form-errors">
          {formErrors.map((error, idx) => (
            <p key={idx} className="error-text">{error}</p>
          ))}
        </div>
      )}

      {coApplicants.map((applicant, index) => {
        const sectionFilled = (index === 0 && primaryFilled) || (index > 0 && coFilled[index - 1]);
        return (
          <div className="coapplicant-box" key={index}>
            <div className="input-grid">
              <div className="form-group">
                <label className="required">Applicant name</label>
                <input
                  type="text"
                  value={applicant.name}
                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                  disabled={sectionFilled}
                />
              </div>
              <div className="form-group">
                <label className="required">Relationship with applicant</label>
                <input
                  type="text"
                  value={applicant.relationship}
                  onChange={(e) => handleInputChange(index, "relationship", e.target.value)}
                  disabled={sectionFilled}
                />
              </div>
              <div className="form-group">
                <label className="required">PAN Card</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleInputChange(index, "pan", e.target.files[0])}
                  disabled={sectionFilled}
                />
                {(applicant.pan && userId && applicationId) && (
                  <button type="button" className="btn btn-link p-0" onClick={() => {
                    setPreviewUrl(applicant.pan);
                    setPreviewLabel("PAN Card");
                  }}>View</button>
                )}
              </div>
              <div className="form-group">
                <label className="required">Aadhar Card (Front)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleInputChange(index, "aadharFront", e.target.files[0])}
                  disabled={sectionFilled}
                />
                {(applicant.aadharFront && userId && applicationId) && (
                  <button type="button" className="btn btn-link p-0" onClick={() => {
                    setPreviewUrl(applicant.aadharFront);
                    setPreviewLabel("Aadhar Card (Front)");
                  }}>View</button>
                )}
              </div>
              <div className="form-group">
                <label className="required">Aadhar Card (Back)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleInputChange(index, "aadharBack", e.target.files[0])}
                  disabled={sectionFilled}
                />
                {(applicant.aadharBack && userId && applicationId) && (
                  <button type="button" className="btn btn-link p-0" onClick={() => {
                    setPreviewUrl(applicant.aadharBack);
                    setPreviewLabel("Aadhar Card (Back)");
                  }}>View</button>
                )}
              </div>
              <div className="form-group">
                <label className="required">Bank Statement</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleInputChange(index, "bankStatement", e.target.files[0])}
                  disabled={sectionFilled}
                />
                {(applicant.bankStatement && userId && applicationId) && (
                  <button type="button" className="btn btn-link p-0" onClick={() => {
                    setPreviewUrl(applicant.bankStatement);
                    setPreviewLabel("Bank Statement");
                  }}>View</button>
                )}
              </div>
              <div className="form-group">
                <label>Salary Slip</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleInputChange(index, "salarySlip", e.target.files[0])}
                  disabled={sectionFilled}
                />
                {(applicant.salarySlip && userId && applicationId) && (
                  <button type="button" className="btn btn-link p-0" onClick={() => {
                    setPreviewUrl(applicant.salarySlip);
                    setPreviewLabel("Salary Slip");
                  }}>View</button>
                )}
              </div>
            </div>
            {index > 0 && !coFilled[index - 1] && (
              <div className="remove-btn" onClick={() => removeCoApplicant(index)}>
                Remove Co-Applicant
              </div>
            )}
          </div>
        );
      })}

      {coApplicants.length < 3 && (
        <div className="add-applicant" onClick={addCoApplicant}>
          + Add New Co-Applicant
        </div>
      )}

      <button className="next-btn" onClick={handleNext}>Next</button>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="image-preview-overlay" onClick={() => {
          if (typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}>
          <div className="image-preview-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">{previewLabel} Preview</h5>
              <button type="button" className="btn btn-close btn-close-white" onClick={() => {
                if (typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}></button>
            </div>
            <div className="modal-body text-center">
              {getFileType(previewUrl) === 'pdf' ? (
                <iframe src={typeof previewUrl === 'object' && previewUrl instanceof File ? URL.createObjectURL(previewUrl) : getImageUrl(previewUrl)} title={`${previewLabel} PDF Preview`} style={{ width: '100%', height: '60vh' }} />
              ) : getFileType(previewUrl) === 'image' ? (
                <img src={typeof previewUrl === 'object' && previewUrl instanceof File ? URL.createObjectURL(previewUrl) : getImageUrl(previewUrl)} alt={previewLabel} className="image-preview-image" />
              ) : (
                <div className="file-preview-placeholder">
                  <i className="fas fa-file"></i>
                  <p>File Preview Not Available</p>
                  <p className="small">Click Download to view the file</p>
                </div>
              )}
            </div>
            <div className="image-preview-actions">
              <a className="btn btn-primary" href={typeof previewUrl === 'object' && previewUrl instanceof File ? URL.createObjectURL(previewUrl) : getImageUrl(previewUrl)} download target="_blank" rel="noopener noreferrer">
                <i className="fas fa-download"></i> Download
              </a>
              <button type="button" className="btn btn-secondary" onClick={() => {
                if (typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicationForm;