// src/pages/UserDashboardPage.jsx
import React, { useState } from "react";
import {
  FiHome,
  FiLayers,
  FiBarChart2,
  FiDollarSign,
  FiGlobe,
  FiSettings,
  FiLogOut,
  FiFileText,
} from "react-icons/fi";
import TariffImpactAnalysis from "./TariffImpactAnalysis";
import IndustryExplorerPage from "./IndustryExplorer";
import ForexAnalysis from "./ForexAnalysis";
import TaxationModule from "./TaxationModule";


const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
  { id: "industry", label: "Industry Explorer", icon: <FiLayers /> },
  { id: "tariff", label: "Tariff Impact Analysis", icon: <FiBarChart2 /> },
  { id: "taxation", label: "Taxation Module", icon: <FiFileText /> },
  { id: "forex", label: "Forex Analysis", icon: <FiDollarSign /> },
  { id: "cost", label: "Cost Calculator", icon: <FiGlobe /> },
  { id: "settings", label: "Settings", icon: <FiSettings /> },
];

const UserDashboard = () => {
  const [active, setActive] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.reload();
  };

  

  /* ✅ PLACEHOLDER PAGES */


  

  

  const CostCalculator = () => (
    <div className="page-padding">
      <section className="welcome-strip">
        <h1>🧮 Cost Calculator</h1>
        <p>Calculate landed costs including all charges</p>
      </section>
    </div>
  );

  const Settings = () => (
    <div className="page-padding">
      <section className="welcome-strip">
        <h1>⚙️ Settings</h1>
        <p>Manage account preferences</p>
      </section>
    </div>
  );

  /* ✅ MAIN RENDER SWITCH */
  const renderContent = () => {
    switch (active) {
      case "industry":
        return <IndustryExplorerPage />;

      case "tariff":
        return <TariffImpactAnalysis />;

      case "taxation":
        return <TaxationModule />;

      case "forex":
        return <ForexAnalysis />;

      case "cost":
        return <CostCalculator />;

      case "settings":
        return <Settings />;

      default:
        return (
          <>
            {/* Welcome Banner */}
            <section className="welcome-strip">
              <h2>Welcome to TariffIntel</h2>
              <p>
                Comprehensive analysis tools for understanding global tariff
                impacts and trade dynamics.
              </p>
            </section>

            {/* Quick Actions */}
            <section className="qa-section">
              <h3 className="section-title">Quick Actions</h3>

              <div className="qa-grid">
                <div className="qa-card" onClick={() => setActive("industry")}>
                  <div className="qa-icon qa-blue">
                    <FiLayers />
                  </div>
                  <div className="qa-text">
                    <h4>Industry Explorer</h4>
                    <p>Explore industry-wise trade data</p>
                  </div>
                </div>

                <div className="qa-card" onClick={() => setActive("tariff")}>
                  <div className="qa-icon qa-indigo">
                    <FiBarChart2 />
                  </div>
                  <div className="qa-text">
                    <h4>Tariff Impact Analysis</h4>
                    <p>Visualize tariff impact with charts</p>
                  </div>
                </div>

                <div className="qa-card" onClick={() => setActive("cost")}>
                  <div className="qa-icon qa-green">
                    <FiDollarSign />
                  </div>
                  <div className="qa-text">
                    <h4>Cost Calculator</h4>
                    <p>Calculate landed cost</p>
                  </div>
                </div>

                <div className="qa-card" onClick={() => setActive("forex")}>
                  <div className="qa-icon qa-purple">
                    <FiGlobe />
                  </div>
                  <div className="qa-text">
                    <h4>Forex Analysis</h4>
                    <p>Currency impact analysis</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Dashboard Row: Recent Analyses + Key Insights */}
            <section className="dash-row">
              {/* Recent Analyses */}
              <div className="panel panel-left">
                <h3 className="section-title">Recent Analyses</h3>
                <div className="recent-list">
                  <div className="recent-item">
                    <div>
                      <p className="recent-title">
                        Electronics Import Analysis - China to USA
                      </p>
                      <p className="recent-meta">2 hours ago</p>
                    </div>
                    <span className="status-pill">Completed</span>
                  </div>
                  <div className="recent-item">
                    <div>
                      <p className="recent-title">Automotive Parts Tariff Impact</p>
                      <p className="recent-meta">1 day ago</p>
                    </div>
                    <span className="status-pill">Completed</span>
                  </div>
                  <div className="recent-item">
                    <div>
                      <p className="recent-title">Textile Trade Comparison 2024</p>
                      <p className="recent-meta">3 days ago</p>
                    </div>
                    <span className="status-pill">Completed</span>
                  </div>
                </div>
                <button className="view-all-btn">View All</button>
              </div>

              {/* Key Insights */}
              <div className="panel panel-right">
                <h3 className="section-title">Key Insights</h3>
                <div className="insight-line insight-blue">
                  Average tariff increase on Chinese imports: <strong>18.7%</strong>
                </div>
                <div className="insight-line insight-green">
                  Trade agreements active: <strong>38 countries</strong>
                </div>
                <div className="insight-line insight-red">
                  High-impact industries: <strong>Electronics, Automotive, Steel</strong>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">TI</div>
          <span>TariffIntel</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "sidebar-item active" : "sidebar-item"}
              onClick={() => setActive(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut className="icon" />
          <span className="label">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="main-header">
          <h1>Trump Tariff Impact Analysis</h1>
        </header>

        <section className="main-content">{renderContent()}</section>
      </main>
    </div>
  );
};

export default UserDashboard;
