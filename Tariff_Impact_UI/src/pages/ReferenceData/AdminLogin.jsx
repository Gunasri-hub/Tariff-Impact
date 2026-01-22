import React, { useState } from 'react';
import { adminLogin } from '../../Apis/authApi';  // ✅ FIXED path

const AdminLogin = ({ onLoginSuccess }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ FIXED: Use adminLogin from authApi
      const res = await adminLogin({ email, password });
      localStorage.setItem('adminToken', res.token);

      
setShowSuccess(true);

      
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "30px 40px",
  borderRadius: "12px",
  textAlign: "center",
  minWidth: "320px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const okButtonStyle = {
  marginTop: "20px",
  padding: "8px 24px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};


  return (

    
    <form className="form" onSubmit={handleSubmit}>
      <label>Company Name</label>
      <input
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Enter company name"
      />

      <label>Admin Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@company.com"
        required
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {error && <p className="error">{error}</p>}

      <button className="primary-btn" type="submit">
        Login as Admin
      </button>

      {showSuccess && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <h2>Login Successful</h2>
      <p>Admin logged in successfully</p>
      <button
  onClick={() => {
    setShowSuccess(false);
    if (onLoginSuccess) onLoginSuccess();
  }}
  style={okButtonStyle}
>
  OK
</button>

    </div>
  </div>
)}

    </form>
  );
};

export default AdminLogin;
