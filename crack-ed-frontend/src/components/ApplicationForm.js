import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import "../styles/application_form.css";
import ConfirmPaymentPopup from "./ConfirmPaymentPopup";
import { LoadingComponent } from "./LoadingComponent";
import { CustomFormInput } from "./CustomFormInput";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { getApplicationData, applicationData, setApplicationData, updateApplicationData, dataLoading, setDataError } = useContext(DataContext);
  const [currentStepData, setCurrentStepData] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [formData, setFormData] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [showPaymentPopup, setPaymentPopup] = useState(false);

  useEffect(() => {
    if (applicationData !== null) {
      if (applicationData.current_application_step === 3) {
        let stepData = { sections: [] };
        for (let step of applicationData.steps) {
          for (let section of step.sections) {
            stepData.sections.push(section);
          }
        }
        setCurrentStepData(stepData);
      } else {
        const step = applicationData.steps.find(step => step.step === applicationData.current_application_step);
        setCurrentStepData(step);
      }
      if (applicationData.status === "Completed") setAgreed(true);
    }
  }, [applicationData]);

  useEffect(() => {
    if (currentStepData) {
      const newFormData = {};
      currentStepData.sections.forEach(section => {
        section.fields.forEach(field => {
          newFormData[field.field_name] = field.value || "";
        });
      });
      setFormData(newFormData);
    }
  }, [currentStepData]);

  useEffect(() => {
    getApplicationData();
  }, []);

  const handleBackStep = () => {
    const updatedStep = applicationData.current_application_step - 1;
    setCurrentStep(updatedStep);
    setApplicationData(prev => ({ ...prev, current_application_step: updatedStep }));
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!agreed) {
      setDataError({ type: "error", message: "Please confirm the disclaimer" });
      return;
    }
    setPaymentPopup(true);
  };

  const handleOnPayment = async (e) => {
    e.preventDefault();
    setPaymentPopup(false);
    formData.status = "Completed";
    await updateApplicationData({ data: formData });
    navigate("/portal/application-success");
  };

  const handleOnNext = async (e) => {
    e.preventDefault();
    let totalMissingFields = 0;

    if (applicationData.current_application_step === 3) {
      for (let step of applicationData.steps) {
        for (let section of step.sections) {
          for (let field of section.fields) {
            const value = formData[field.field_name];
            if (field.required && !value?.toString().trim()) {
              setDataError({ type: "error", message: `Please fill ${field.label}` });
              totalMissingFields++;
            }
          }
        }
      }
      if (totalMissingFields === 0) {
        setPaymentPopup(true);
      }
      return;
    }

    for (let section of currentStepData.sections) {
      for (let field of section.fields) {
        const value = formData[field.field_name];
        if (field.required && !value?.toString().trim()) {
          setDataError({ type: "error", message: `Please fill ${field.label}` });
          totalMissingFields++;
          continue;
        }
        if (value && field.pattern && !new RegExp(field.pattern).test(value)) {
          setDataError({ type: "error", message: field.error_message || `Invalid format for ${field.label}` });
          totalMissingFields++;
        }
        if (field.input_type === "year" && (parseInt(value) < field.min_value || parseInt(value) > field.max_value)) {
          setDataError({ type: "error", message: "Enter a valid year" });
          totalMissingFields++;
        }
      }
    }

    if (totalMissingFields > 0) return;

    const updatedStep = applicationData.current_application_step + 1;
    formData.current_application_step = updatedStep;
    formData.status = "In Progress";
    await updateApplicationData({ data: formData });

    setCurrentStep(updatedStep);
    setApplicationData(prev => ({ ...prev, current_application_step: updatedStep }));
  };

  if (!applicationData) return <LoadingComponent />;

  return (
    <div className="application-form-container">
      <div className="application-header">
        <p><span>Candidate Name:</span> {applicationData.name}</p>
        <p><span className="label-bold">Application Number:</span> {applicationData.application_id}</p>
      </div>

      {dataLoading && <LoadingComponent />}

      <div className="application-tabs">
        <div className="nav-tabs">
          {applicationData.steps.map((step) => (
            <div
              key={step.step}
              className={step.step === applicationData.current_application_step
                ? "tab-active"
                : (applicationData.status === "Completed" && step.step < 3) ? "tab-inactive" : "tab"}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      <form className={`form-section ${(applicationData.status === "Completed" || applicationData.status === "Selected") ? "readonly" : ""}`}>
        {currentStepData?.sections?.map((section, idx) => (
          <div className="section-box" key={idx}>
            <div className="section-title">{section.section}</div>
            <div className="grid-container">
              {section.fields.map((field, fieldIdx) => (
                <CustomFormInput
                  key={fieldIdx}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                  currentStep={currentStep}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="form-footer">
          {(applicationData.current_application_step > 0 && applicationData.status !== "Completed" && applicationData.status !== "Selected") && (
            <button type="button" className="back-button" onClick={handleBackStep}>Back</button>
          )}
          {/* Hide submit button if:
              1. Application is completed/selected and on step 3 (preview page)
              2. Application is completed/selected regardless of step
              3. Application has been submitted successfully */}
          {!(applicationData.status === "Completed" || applicationData.status === "Selected") && (
            <button type="submit" className="submit-button" onClick={handleOnNext}>
              {applicationData.current_application_step === 3 
                ? "Submit Application" 
                : "Next"}
            </button>
          )}
        </div>
      </form>

      {showPaymentPopup && applicationData.current_application_step === 3 && (
        <ConfirmPaymentPopup onClose={() => setPaymentPopup(false)} onConfirm={handleOnPayment} />
      )}
    </div>
  );
};

export default ApplicationForm;