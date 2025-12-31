import React, { useState } from 'react';
import { adminLogin } from '../../Apis/authApi';  // ✅ FIXED path

const AdminLogin = ({ onLoginSuccess }) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ FIXED: Use adminLogin from authApi
      const res = await adminLogin({ email, password });
      localStorage.setItem('adminToken', res.token);

      if (onLoginSuccess) onLoginSuccess();
      alert('Admin logged in successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
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
    </form>
  );
};

export default AdminLogin;
