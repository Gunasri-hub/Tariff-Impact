import React, { useState } from 'react';
import { userLogin } from '../../Apis/authApi';

const UserLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await userLogin({ email, password });
      localStorage.setItem('userToken', res.token);
      
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
  background: "rgba(15, 23, 42, 0.6)",   // dark professional overlay
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#ffffff",
  padding: "32px 40px",
  borderRadius: "14px",
  textAlign: "center",
  minWidth: "340px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
};

const okButtonStyle = {
  marginTop: "22px",
  padding: "10px 28px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

  return (

    
    <form className="form" onSubmit={handleSubmit}>
      <label>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@company.com"
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
        Login
      </button>

      {showSuccess && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <h2>Login Successful</h2>
      <p>User logged in successfully</p>
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

export default UserLogin;
