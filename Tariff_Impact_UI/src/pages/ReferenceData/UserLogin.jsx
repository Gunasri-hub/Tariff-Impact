import React, { useState } from 'react';
import { userLogin } from '../../Apis/authApi';  // ✅ FIXED path

const UserLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ FIXED: Use userLogin from authApi
      const res = await userLogin({ email, password });
      localStorage.setItem('userToken', res.token);

      if (onLoginSuccess) onLoginSuccess(res);
      alert('User logged in successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
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
    </form>
  );
};

export default UserLogin;
