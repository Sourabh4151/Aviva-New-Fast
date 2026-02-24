import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { get_all_district_data } from "../controllers/dataController";

export const CustomFormInput = ({ field, formData, setFormData,currentStep }) => {
    const {
        getApplicationData,
        applicationData,
        setApplicationData,
        updateApplicationData,
        dataLoading,
        setDataError,
        universities,
        districts,
        get_all_district,
        get_all_university
    } = useContext(DataContext);
    const [showPreview, setShowPreview] = useState(false);

    const {
        label: originalLabel,
        input_type: inputType,
        field_name: name,
        max_length,
        max_value,
        min_value,
        pattern,
        options,
        max_size_mb,
        error_message,
    } = field;

    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (name == "district" || name == "state") {
            get_all_district();
        }
        if (name === "ug_university_name" || name === "pg_university_name") {
            get_all_university();
        }
    }, [currentStep,name]);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        onChange(e);  // update form state
        console.log("Districts data ", districts.length);
        if (inputValue.length > 0) {
            let results;
            if (name == "district"||name=="state") {
                if (districts.length > 0) {
                    console.log("field change ",districts.length,formData["district"],formData["state"]);
                    if(name=="state"){
                        const stateSearch = formData["state"].toLowerCase().trim();
                        const uniqueStates = Array.from(
                            new Set(districts.map(d => d["State Name"]))
                        );
                    
                        results = uniqueStates
                            .filter(state => state.toLowerCase().includes(stateSearch))
                             
                    }else{
                        results = districts
                        .filter(d =>
                            d["State Name"].toLowerCase().includes(formData["state"].toLowerCase())
                        )
                        .filter(d =>
                            d["District Name"].toLowerCase().includes(formData["district"].toLowerCase())
                        )
                        
                    }
                }
            } else {
                if (universities.length > 0) {
                    results = universities
                        .filter(d =>
                            d["university"].toLowerCase().includes(inputValue.toLowerCase())
                        )
                        .slice(0, 7);
                }
            }
            console.log("Searching results : ", results);
            setFilteredDistricts(results);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelect = (districtName, stateName) => {
        console.log("Selected dist", districtName, stateName);
        if (name == "district") {
            setFormData((prev) => ({
                ...prev,
                "district": districtName,
                "state": stateName
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: districtName,
            }));
        }

        setShowDropdown(false);
    };

    let required = field.required;
    let value = formData[name] || "";
    const showPreviewBtn = (inputType === "file" && field.value !== null && field.value !== "" && field.value !== undefined);

    let label = originalLabel;
    const disabled = applicationData.status === "Completed" || applicationData.status === "Selected";
    const readOnly = disabled;

    const [error, setError] = useState("");

    function onChange(e) {
        let fieldValue = inputType === "file" ? e.target.files?.[0] : e.target.value;
        if (!fieldValue) {
            if (inputType === "file") {
                console.log("Selected File for:", name, fieldValue);
                setFormData((prev) => ({
                    ...prev,
                    [name]: fieldValue,
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [name]: fieldValue,
                }));
            }
            return;
        }

        if (name == "pan_card_number") {
            fieldValue = fieldValue.toUpperCase();
            console.log("capatilize ", fieldValue);
        }
        if (name == "email") {
            fieldValue = fieldValue.toLowerCase();
            console.log("capatilize ", fieldValue);
        }


        if (pattern && inputType !== "file") {
            const regex = new RegExp(pattern);

            if (!regex.test(fieldValue)) {
                console.log("Patteren error");
                setError(error_message || `Invalid format`);
            } else {
                console.log("Patteren no error");
                setError("");
            }
        }

        
        if (inputType === "file") {
            const file = e.target.files?.[0];
            console.log("Selected File for:", name, file);
            if (file) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: file,
                }));
            }
        } else {
            console.log("Editing Field Name:", name, "Value:", fieldValue);
            setFormData((prev) => ({
                ...prev,
                [name]: fieldValue,
            }));
        }
    }

    // If file already uploaded, show uploaded status
    if (showPreviewBtn) {
        console.log("Show preview Button",field.value);

        console.log(field.value !== "", field.value !== null);
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
                    <div className="image-preview-container">
                        <img
                            src={process.env.REACT_APP_BASE_URL + "/" + field.value + "?token=" + localStorage.getItem("TOKEN")}
                            alt="Document image"
                            className='image-preview-image'
                        />
                    </div>
                </div>
            }

            <div className="custom-input-group">
                <label className="input-label">
                  { inputType=="file" && (!showPreviewBtn) &&(<div className='image-preview-blank'>
                            |
                            </div>)}
                    {label} {required && <span className="required">*</span>}
                    {showPreviewBtn && field.value && (
                        isImageFile(field.value) ? (
                            <div className='image-preview' onClick={() => setShowPreview(true)}>
                               Preview - {field.value?.split('/').at(-1) || ''}
                            </div>
                        ) : (
                           <div> <a

                                href={`${process.env.REACT_APP_BASE_URL}/${field.value}?token=${localStorage.getItem("TOKEN")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='image-preview'
                                download
                            >
                                Download - {field.value?.split('/').at(-1) || ''}
                            </a>
                            </div>
                        )
                    )}
                </label>

                {inputType === "select" ? (
                    <select
                        key={name}
                        name={name}
                        value={value}
                        required={required}
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={onChange}
                        className="input-field"
                    >
                        <option value="">Select {label}</option>
                        {options.map((opt, idx) => (
                            <option key={idx} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                ) : inputType === "year" ? (
                    <DatePicker
                        key={name}
                        selected={value ? new Date(value, 0) : null}
                        onChange={(date) =>
                            onChange({ target: { name, value: date.getFullYear() } })
                        }
                        showYearPicker
                        dateFormat="yyyy"
                        className="input-field"
                        disabled={disabled}
                        readOnly={readOnly}
                        minDate={new Date(2000, 0, 1)}
                        maxDate={new Date(new Date().getFullYear(), 11, 31)}
                    />


                ) : (name == "district" || name == "state" || name == "ug_university_name" || name == "pg_university_name") ? (
                    <>
                        <input
                            key={name}
                            type="text"
                            name={name}
                            value={value}
                            required={required}
                            disabled={disabled}
                            readOnly={readOnly}
                            onChange={handleInputChange}
                            className="input-field"
                            autoComplete="off"
                        />
                        {showDropdown && filteredDistricts.length > 0 && (
                            <ul className="autocomplete-dropdown">
                                {filteredDistricts.map((d, i) => (

                                    name == "district"?
                                        <li key={i} onClick={() => handleSelect(d["District Name"], d["State Name"])}>
                                            {d["District Name"]}
                                        </li> :
                                         name=="state"?<li key={i} onClick={() => handleSelect(d)}>
                                         {d}
                                            </li>: 
                                        <li key={i} onClick={() => handleSelect(d["university"])}>
                                            {d["university"]}
                                        </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <input
                        key={name}
                        type={inputType}
                        name={name}
                        className="input-field"
                        {...(inputType !== "file" ? { value: value || "" } : {})}
                        required={required}
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={onChange}
                        capture="environment"
                        maxLength={max_length}
                    />
                )}

                {error && <span className="error-text">{error}</span>}
            </div>
        </>
    );
};