import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';
import '../styles/admin-dashboard.css';
import adminlogo from '../assets/logo_admin.png'; // Ensure you have the correct path to your logo

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showGetUsername, setShowGetUsername] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Forgot password states
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  // Get username states
  const [getUsernameMobile, setGetUsernameMobile] = useState('');
  const [getUsernameError, setGetUsernameError] = useState('');
  const [getUsernameSuccess, setGetUsernameSuccess] = useState('');
  const [getUsernameLoading, setGetUsernameLoading] = useState(false);
  const [retrievedUsername, setRetrievedUsername] = useState('');
  
  // Signup states
  const [signupData, setSignupData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    mobile_number: ''
  });
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  
  // Password reset states
  const [resetData, setResetData] = useState({
    username: '',
    mobile_number: '',
    new_password: '',
    confirm_password: ''
  });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  
  const { login } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const loginSuccess = login(data.token, data.user);
        if (loginSuccess) {
          navigate('/admin-dashboard');
        } else {
          setError('Login failed');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_user',
          username: forgotUsername,
          mobile_number: forgotMobile
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotSuccess('User verified successfully! You can now reset your password.');
        setUserVerified(true);
        setResetData({
          ...resetData,
          username: forgotUsername,
          mobile_number: forgotMobile
        });
        setShowForgotPassword(false);
        setShowPasswordReset(true);
      } else {
        setForgotError(data.error || 'Verification failed');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGetUsername = async (e) => {
    e.preventDefault();
    setGetUsernameError('');
    setGetUsernameSuccess('');
    setGetUsernameLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_username_by_mobile',
          mobile_number: getUsernameMobile
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGetUsernameSuccess('Username retrieved successfully!');
        setRetrievedUsername(data.username);
      } else {
        setGetUsernameError(data.error || 'Failed to retrieve username');
      }
    } catch (err) {
      setGetUsernameError('Network error. Please try again.');
    } finally {
      setGetUsernameLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    setSignupLoading(true);

    // Validate required fields
    if (!signupData.username || !signupData.password || !signupData.mobile_number) {
      setSignupError('Username, password, and mobile number are required');
      setSignupLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match');
      setSignupLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admin/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signupData.username,
          password: signupData.password,
          mobile_number: signupData.mobile_number
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSignupSuccess('User created successfully! Please contact admin for activation.');
        setSignupData({
          username: '',
          password: '',
          confirmPassword: '',
          mobile_number: ''
        });
      } else {
        setSignupError(data.error || 'Signup failed');
      }
    } catch (err) {
      setSignupError('Network error. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    if (resetData.new_password !== resetData.confirm_password) {
      setResetError('Passwords do not match');
      setResetLoading(false);
      return;
    }

    if (resetData.new_password.length < 6) {
      setResetError('Password must be at least 6 characters long');
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_password_self',
          username: resetData.username,
          mobile_number: resetData.mobile_number,
          new_password: resetData.new_password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess('Password updated successfully! You can now login with your new password.');
        setResetData({
          username: '',
          mobile_number: '',
          new_password: '',
          confirm_password: ''
        });
        setUserVerified(false);
        setTimeout(() => {
          setShowPasswordReset(false);
        }, 3000);
      } else {
        setResetError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setResetError('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="login-logo">
            <img src={adminlogo} alt="CrackED" className="logo-image" />
          </div>
          <h2>Admin Login</h2>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="admin-login-actions">
          <button 
            type="button" 
            className="action-btn forgot-btn"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>
          <button 
            type="button" 
            className="action-btn get-username-btn"
            onClick={() => setShowGetUsername(true)}
          >
            Get Username
          </button>
          <button 
            type="button" 
            className="action-btn signup-btn"
            onClick={() => setShowSignup(true)}
          >
            Create New User
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content compact-modal">
            <div className="modal-header">
              <h3>Forgot Password</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotError('');
                  setForgotSuccess('');
                  setForgotUsername('');
                  setForgotMobile('');
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleForgotPassword} className="modal-form">
              <div className="form-group">
                <label htmlFor="forgot-username">Username <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="forgot-username"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="forgot-mobile">Mobile Number <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="forgot-mobile"
                  value={forgotMobile}
                  onChange={(e) => setForgotMobile(e.target.value)}
                  required
                  placeholder="Enter your mobile number"
                />
              </div>
              {forgotError && <div className="error-message">{forgotError}</div>}
              {forgotSuccess && <div className="success-message">{forgotSuccess}</div>}
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={forgotLoading}>
                  {forgotLoading ? 'Verifying...' : 'Verify User'}
                </button>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotUsername('');
                    setForgotMobile('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Get Username Modal */}
      {showGetUsername && (
        <div className="modal-overlay">
          <div className="modal-content compact-modal">
            <div className="modal-header">
              <h3>Get Username</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowGetUsername(false);
                  setGetUsernameError('');
                  setGetUsernameSuccess('');
                  setGetUsernameMobile('');
                  setRetrievedUsername('');
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleGetUsername} className="modal-form">
              <div className="form-group">
                <label htmlFor="get-username-mobile">Mobile Number <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="get-username-mobile"
                  value={getUsernameMobile}
                  onChange={(e) => setGetUsernameMobile(e.target.value)}
                  required
                  placeholder="Enter your mobile number"
                />
              </div>
              {getUsernameError && <div className="error-message">{getUsernameError}</div>}
              {getUsernameSuccess && (
                <div className="success-message">
                  {getUsernameSuccess}
                  {retrievedUsername && (
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                      Your username is: <span style={{ color: '#3498db' }}>{retrievedUsername}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={getUsernameLoading}>
                  {getUsernameLoading ? 'Retrieving...' : 'Get Username'}
                </button>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => {
                    setShowGetUsername(false);
                    setGetUsernameError('');
                    setGetUsernameSuccess('');
                    setGetUsernameMobile('');
                    setRetrievedUsername('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="modal-overlay">
          <div className="modal-content compact-modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowSignup(false);
                  setSignupError('');
                  setSignupSuccess('');
                  setSignupData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    mobile_number: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSignup} className="modal-form">
              <div className="form-group">
                <label htmlFor="signup-username">Username <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="signup-username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-mobile">Mobile Number <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="signup-mobile"
                  value={signupData.mobile_number}
                  onChange={(e) => setSignupData({...signupData, mobile_number: e.target.value})}
                  required
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  required
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm-password">Confirm Password <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="password"
                  id="signup-confirm-password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm password"
                />
              </div>
              {signupError && <div className="error-message">{signupError}</div>}
              {signupSuccess && <div className="success-message">{signupSuccess}</div>}
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={signupLoading}>
                  {signupLoading ? 'Creating...' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => {
                    setShowSignup(false);
                    setSignupError('');
                    setSignupSuccess('');
                    setSignupData({
                      username: '',
                      password: '',
                      confirmPassword: '',
                      mobile_number: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="modal-overlay">
          <div className="modal-content compact-modal">
            <div className="modal-header">
              <h3>Set New Password</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowPasswordReset(false);
                  setResetError('');
                  setResetSuccess('');
                  setUserVerified(false);
                  setResetData({
                    username: '',
                    mobile_number: '',
                    new_password: '',
                    confirm_password: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePasswordReset} className="modal-form">
              <div className="form-group">
                <label htmlFor="reset-username">Username <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="reset-username"
                  value={resetData.username}
                  onChange={(e) => setResetData({...resetData, username: e.target.value})}
                  required
                  placeholder="Enter your username"
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-mobile">Mobile Number <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="text"
                  id="reset-mobile"
                  value={resetData.mobile_number}
                  onChange={(e) => setResetData({...resetData, mobile_number: e.target.value})}
                  required
                  placeholder="Enter your mobile number"
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-new-password">New Password <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="password"
                  id="reset-new-password"
                  value={resetData.new_password}
                  onChange={(e) => setResetData({...resetData, new_password: e.target.value})}
                  required
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-confirm-password">Confirm New Password <span style={{color:'#e74c3c'}}>*</span></label>
                <input
                  type="password"
                  id="reset-confirm-password"
                  value={resetData.confirm_password}
                  onChange={(e) => setResetData({...resetData, confirm_password: e.target.value})}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              {resetError && <div className="error-message">{resetError}</div>}
              {resetSuccess && <div className="success-message">{resetSuccess}</div>}
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={resetLoading}>
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setResetError('');
                    setResetSuccess('');
                    setUserVerified(false);
                    setResetData({
                      username: '',
                      mobile_number: '',
                      new_password: '',
                      confirm_password: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginPage; 