import React, { useState } from 'react';
import API from '../../Apis/ApiConfig';  // ✅ FIXED path

const Signup = ({ onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ FIXED: Use your backend signup endpoint
      const res = await API.post('/signup', { name, email, password, role });
      if (onSignupSuccess) onSignupSuccess(res.data.role);
      alert('Signup successful! Please login.');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
      />

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />

      <label>Role</label>
      <select
        className="input"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        minLength="6"
      />

      {error && <p className="error">{error}</p>}

      <button className="primary-btn" type="submit">
        Sign Up
      </button>
    </form>
  );
};

export default Signup;
