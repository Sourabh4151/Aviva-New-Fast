import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const ImagePreviewComponent = ({ field, formData, setFormData }) => {
    const {
        applicationData,
    } = useContext(DataContext);
    const [showPreview, setShowPreview] = useState(false);

    const {
        label: originalLabel,
        input_type: inputType,
        field_name: name,
        error_message,
    } = field;

    let required = field.required;
    let value = formData[name] || "";
    const showPreviewBtn = (inputType === "file" && field.value !== null && field.value !== "" && field.value !== undefined);

    let label = originalLabel;
    const disabled = applicationData.status === "Completed" || applicationData.status === "Selected";
    const readOnly = disabled;

    const [error, setError] = useState("");

    if (showPreviewBtn) {
        console.log("Show preview Button",);

        console.log(field.value !== "", field.value !== undefined);
        required = false;

        value = null;
    }
    const isImageFile = (filename) => {
        return /\.(jpe?g|png|gif|bmp|webp)$/i.test(filename);
    };


    const showImage = () => {
        console.log(field.value);
        setShowPreview(true);
    }

    return (
        <>
            {showPreview &&
                <div className="image-preview-overlay" onClick={() => setShowPreview(false)}>
                    <div className="image-preview-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title">Document Preview</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowPreview(false)}></button>
                        </div>
                        <div className="modal-body text-center">
                            <img
                                src={process.env.REACT_APP_BASE_URL + "/" + field.value + "?token=" + localStorage.getItem("TOKEN")}
                                alt="Document image"
                                className='image-preview-image'
                            />
                        </div>
                        <div className="image-preview-actions">
                            <a
                                href={`${process.env.REACT_APP_BASE_URL}/${field.value}?token=${localStorage.getItem("TOKEN")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                download
                            >
                                <i className="fas fa-download"></i> Download
                            </a>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
                        </div>
                    </div>
                </div>
            }

            <div className="custom-input-group">
                <label className="input-label">
                    {label} {required && <span className="required">*</span>}
                </label>
                {field.value && (isImageFile(field.value) ? (
                    <img
                        src={`${process.env.REACT_APP_BASE_URL}/${field.value}?token=${localStorage.getItem("TOKEN")}`}
                        alt="Document image"
                        className='image-field-image'
                        onClick={() => setShowPreview(true)}
                    />
                ) : (
                    <a
                        href={`${process.env.REACT_APP_BASE_URL}/${field.value}?token=${localStorage.getItem("TOKEN")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='image-preview'
                        download
                    >
                        Preview File
                    </a>
                ))}

                {error && <span className="error-text">{error}</span>}
            </div>
        </>
    );
};