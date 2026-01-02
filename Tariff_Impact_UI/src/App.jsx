import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import AdminLogin from "./pages/ReferenceData/AdminLogin";
import UserLogin from "./pages/ReferenceData/UserLogin";
import Signup from "./pages/ReferenceData/Signup";
import AdminDashboardPage from "./pages/ReferenceData/AdminDashboardPage"; // Admin Dashboard Page
import UserDashboardPage from "./pages/ReferenceData/UserDashboardPage";  // User Dashboard Page

import "./App.css";

/* =========================
   AUTH SHELL
========================= */
function AuthShell() {
  const [mode, setMode] = useState("auth"); // auth | signup
  const [activeTab, setActiveTab] = useState("admin");
  const navigate = useNavigate();

  const handleAdminLoginSuccess = () => {
    navigate("/admin-dashboard");
  };

  const handleUserLoginSuccess = () => {
    navigate("/user-dashboard");
  };

  const handleSignupSuccess = (role) => {
    setMode("auth");
    setActiveTab(role === "admin" ? "admin" : "user");
  };

  return (
    <div className="app">
      <div className="card">
        <div className="logo">TI</div>

        <h2>
          {mode === "auth"
            ? "Tariff Impact Analyzer"
            : "Create Account"}
        </h2>

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

/* =========================
   MAIN APP
========================= */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<AuthShell />} />
        <Route path="/login" element={<AuthShell />} />

        {/* Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />

        {/* Fallback */}
        <Route path="*" element={<AuthShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
