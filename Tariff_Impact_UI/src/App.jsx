import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import AdminLogin from "./pages/ReferenceData/AdminLogin";
import UserLogin from "./pages/ReferenceData/UserLogin";
import Signup from "./pages/ReferenceData/Signup";
import AdminDashboardPage from "./pages/ReferenceData/AdminDashboardPage"; 
import UserDashboard from "./pages/ReferenceData/UserDashboardPage";
import CountryDatabasePage from "./pages/ReferenceData/CountryDatabasePage"; // Import the new page
import "./App.css";

function AuthShell() {
  const [mode, setMode] = useState("auth");
  const [activeTab, setActiveTab] = useState("admin");
  const navigate = useNavigate();

  const handleSignupSuccess = (role) => {
    setMode("auth");
    setActiveTab(role === "admin" ? "admin" : "user");
  };

  const handleUserLoginSuccess = () => {
    navigate("/user-dashboard");
  };

  const handleAdminLoginSuccess = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="app">
      <div className="card">
        <div className="logo">TI</div>
        <h2>{mode === "auth" ? "Tariff Impact Analyzer" : "Create Account"}</h2>
        <p className="subtitle">
          {mode === "auth"
            ? "Trump Tariff Intelligence Platform"
            : "Join Tariff Impact Analyzer"}
        </p>

        {mode === "auth" && (
          <>
            <div className="tabs">
              <button
                className={activeTab === "admin" ? "tab active" : "tab"}
                onClick={() => setActiveTab("admin")}
              >
                Admin Login
              </button>
              <button
                className={activeTab === "user" ? "tab active" : "tab"}
                onClick={() => setActiveTab("user")}
              >
                User Login
              </button>
            </div>

            {activeTab === "admin" ? (
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            ) : (
              <UserLogin onLoginSuccess={handleUserLoginSuccess} />
            )}

            <div className="footer-link">
              Don't have an account?{" "}
              <span onClick={() => setMode("signup")}>Sign Up</span>
            </div>
          </>
        )}

        {mode === "signup" && (
          <>
            <Signup onSignupSuccess={handleSignupSuccess} />
            <div className="footer-link">
              Already have an account?{" "}
              <span onClick={() => setMode("auth")}>Sign In</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login + Signup */}
        <Route path="/" element={<AuthShell />} />
        <Route path="/login" element={<AuthShell />} />

        {/* User Dashboard */}
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Admin Dashboard & Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        
        {/* Country Database Page (Admin only) */}
        <Route path="/admin/countries" element={<CountryDatabasePage />} />

        {/* Fallback */}
        <Route path="*" element={<AuthShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;