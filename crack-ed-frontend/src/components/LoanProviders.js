import React, { useState, useEffect } from "react";
import "../styles/Loanproviders.css";
import { useNavigate } from "react-router-dom";
import PortalHeader from "./PortalHeader";

const LoanProviders = () => {
  const [loanProviders, setLoanProviders] = useState([]);
  const [amount, setAmount] = useState();
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [agree, setAgree] = useState(false);
  const [tenures, setTenures] = useState({});
  const [chosenProviderNames, setChosenProviderNames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-providers`)
      .then(res => res.json())
      .then(data => {
        setLoanProviders(data);
        // Set default tenures for each provider
        const defaultTenures = {};
        data.forEach(p => {
          defaultTenures[p.id] = p.tenures && p.tenures.length > 0 ? p.tenures[0] : 12;
        });
        setTenures(defaultTenures);
      });
    // Fetch chosen providers for this user
    const application_id = localStorage.getItem('application_id');
    if (application_id) {
      fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-provider-selections?application_id=${application_id}`)
        .then(res => res.json())
        .then(data => {
          setChosenProviderNames((data.providers || []).map(p => p.loan_provider_name));
        });
    }
  }, []);

  const handlePlanToggle = (planId) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleSubmit = async () => {
    if (!agree || selectedPlans.length === 0) return alert("Please agree to the terms and select at least one plan.");
    const application_id = localStorage.getItem('application_id');
    for (const planId of selectedPlans) {
      const plan = loanProviders.find(p => p.id === planId);
      const tenure = tenures[planId] || (plan.tenures && plan.tenures[0]) || 12;
      await fetch(`${process.env.REACT_APP_BASE_URL}/api/loan-provider-selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id,
          loan_provider_name: plan.name,
          loan_amount: amount,
          loan_tenure: tenure
        })
      });
    }
    navigate("/portal/loan-thankyou", {
      state: { providerName: selectedPlans.map(id => loanProviders.find(p => p.id === id).name).join(', '), amount },
    });
  };

  return (
    <>
      <PortalHeader>
        <nav className="nav-links">
          <a href="/portal" className="nav-link">Home</a>
        </nav>
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          window.location.href = '/portal/login';
        }}>
          Logout
        </button>
      </PortalHeader>

      <div className="loan-plans-container">
        <h2>Payment</h2>
        <p className="payment-desc">Enter your loan amount and choose your preferred tenure for bank. You can proceed with one, two, or all providers based on your preference.</p>

        <label>Enter loan amount:</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <div className="plans-grid">
          {loanProviders.map((plan) => {
            const tenureOptions = plan.tenures || [12];
            const tenure = tenures[plan.id] || tenureOptions[0];
            const isSelected = selectedPlans.includes(plan.id);
            const isChosen = chosenProviderNames.includes(plan.name);
            // Calculate EMI
            let emi = 0;
            if (amount && plan.base_interest_rate && tenure) {
              const interest = amount * (plan.base_interest_rate / 100) * (tenure / 12);
              emi = ((amount + interest) / tenure).toFixed(2);
            }
            return (
              <div key={plan.id} className={`plan-card${isSelected ? " selected" : ""}${isChosen ? " disabled" : ""}`} style={isChosen ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                <div className="header">
                  {plan.logo && <img src={plan.logo} alt={plan.name} className="logo" />}
                  <span className="title">{plan.name}</span>
                </div>
                <div className="meta" style={{alignItems: 'flex-end', display: 'flex', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <label>Estimated EMI</label>
                      <div className="value" style={{fontWeight:600, fontSize:'20px'}}>Rs {emi}/month</div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '1.5rem'}}>
                      <label style={{marginBottom: '4px'}}>Tenure</label>
                      <select
                        value={tenure}
                        onChange={e => setTenures(t => ({...t, [plan.id]: Number(e.target.value)}))}
                        className="tenure-dropdown"
                        disabled={isChosen}
                      >
                        {tenureOptions.map(val => (
                          <option key={val} value={val}>{val} months</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="eligibility">
                  <div style={{display:'flex',alignItems:'center',marginBottom:'6px'}}>
                    <span style={{color:'#1976d2',fontSize:'18px',marginRight:'8px'}}>&#10004;</span>
                    <span className="feature-label">Interest Rate:</span>&nbsp;
                    <span style={{color:'#545454'}}>{plan.base_interest_rate} % per annum</span>
                  </div>
                  {plan.description && (
                    <div style={{display:'flex',alignItems:'center'}}>
                      <span style={{color:'#1976d2',fontSize:'18px',marginRight:'8px'}}>&#10004;</span>
                      <span className="feature-label">Description:</span>&nbsp;<span style={{color:'#545454'}}>{plan.description}</span>
                    </div>
                  )}
                  {plan.cibil_score && (
                    <div style={{display:'flex',alignItems:'center'}}>
                      <span style={{color:'#1976d2',fontSize:'18px',marginRight:'8px'}}>&#10004;</span>
                      <span className="feature-label">Minimum CIBIL Score Required:</span>&nbsp;<span style={{color:'#545454'}}>{plan.cibil_score}</span>
                    </div>
                  )}
                </div>
                <button
                  className={`choose-btn${isSelected ? ' selected' : ''}`}
                  onClick={() => handlePlanToggle(plan.id)}
                  disabled={isChosen}
                >
                  {isChosen ? 'Already Chosen' : (isSelected ? 'Selected' : 'Choose this plan')}
                </button>
              </div>
            );
          })}
        </div>

        <div className="disclaimer">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
          />
          <span>I agree to the terms and conditions.</span>
        </div>
        <button className="submit-btn" onClick={handleSubmit} style={{marginTop: 24}}>Submit</button>
      </div>
    </>
  );
};

export default LoanProviders;