// src/pages/UserDashboardPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import {
  FiHome,
  FiLayers,
  FiBarChart2,
  FiDollarSign,
  FiGlobe,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiUsers,
} from "react-icons/fi";

import TariffImpactAnalysis from "./TariffImpactAnalysis";
import IndustryExplorerPage from "./IndustryExplorer";
import ForexAnalysis from "./ForexAnalysis";
import TaxationModule from "./TaxationModule";
import BuyerPage from "./BuyerPage";
import SellerPage from "./SellerPage"; 
import CostCalculatorWizard from "./CostCalculatorWizard";
import UserTransactionData from "./UserTransactionData";



const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
  { id: "industry", label: "Industry Explorer", icon: <FiLayers /> },
  { id: "tariff", label: "Tariff Impact Analysis", icon: <FiBarChart2 /> },
  { id: "taxation", label: "Taxation Module", icon: <FiFileText /> },
  { id: "forex", label: "Forex Analysis", icon: <FiDollarSign /> },
  { id: "cost", label: "Cost Calculator", icon: <FiGlobe /> },
  {id: "transactions", label: "Transaction Data", icon: <FiFileText />},
];

const UserDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [openBuyerSeller, setOpenBuyerSeller] = useState(false);
  const navigate = useNavigate();   // ✅ ADD THIS

  const handleLogout = () => {
  localStorage.removeItem("userToken");
  navigate("/");
};


  

  const CostCalculator = () => (
    <div className="page-padding">
      <section className="welcome-strip">
        <h1>Cost Calculator</h1>
        <p>Calculate landed costs including all charges</p>
      </section>
    </div>
  );

  const TransactionData = () => (
    <div className="page-padding">
      <section className="welcome-strip">
        <h1>🧮 Transaction Data</h1>
        <p>Comprehensive multi-country trade transaction tracking and analytics</p>
      </section>
    </div>
  );

  const Settings = () => (
    <div className="page-padding">
      <section className="welcome-strip">
        <h1>Settings</h1>
        <p>Manage account preferences</p>
      </section>
    </div>
  );

  /* ================= MAIN RENDER ================= */

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
        return <CostCalculatorWizard />;


      case "buyer":
        return <BuyerPage />;

            case "seller":
        return <SellerPage />;
        
      case "transactions":
        return <UserTransactionData />;

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
      {/* Quick Actions */}
<section className="admin-section">
  <div className="admin-section-header">
    <h2>Quick Actions</h2>
  </div>

  <div className="admin-functions-grid">

    {/* Industry */}
    <div className="admin-function-card" onClick={() => setActive("industry")}>
      <div className="admin-func-icon product">
        📊
      </div>
      <div className="admin-func-content">
        <h3>Industry Explorer</h3>
        <p>Explore industry-wise trade data</p>
      </div>
    </div>

    {/* Tariff */}
    <div className="admin-function-card" onClick={() => setActive("tariff")}>
      <div className="admin-func-icon agreements">
        📈
      </div>
      <div className="admin-func-content">
        <h3>Tariff Impact Analysis</h3>
        <p>Visualize tariff impact with charts</p>
      </div>
    </div>

    {/* Cost */}
    <div className="admin-function-card" onClick={() => setActive("cost")}>
      <div className="admin-func-icon country">
        💲
      </div>
      <div className="admin-func-content">
        <h3>Cost Calculator</h3>
        <p>Calculate landed cost</p>
      </div>
    </div>

    {/* Forex */}
    <div className="admin-function-card" onClick={() => setActive("forex")}>
      <div className="admin-func-icon reports">
        🌍
      </div>
      <div className="admin-func-content">
        <h3>Forex Analysis</h3>
        <p>Currency impact analysis</p>
      </div>
    </div>

    {/* Taxation */}
    <div className="admin-function-card" onClick={() => setActive("taxation")}>
      <div className="admin-func-icon agreements">
        📄
      </div>
      <div className="admin-func-content">
        <h3>Taxation Module</h3>
        <p>View and manage applicable taxes & duties</p>
      </div>
    </div>

    {/* Transactions */}
    <div className="admin-function-card" onClick={() => setActive("transactions")}>
      <div className="admin-func-icon reports">
        📦
      </div>
      <div className="admin-func-content">
        <h3>Transaction Data</h3>
        <p>Track and analyze trade transactions</p>
      </div>
    </div>

    {/* Buyer */}
    <div className="admin-function-card" onClick={() => setActive("buyer")}>
      <div className="admin-func-icon user">
        🧑‍💼
      </div>
      <div className="admin-func-content">
        <h3>Buyer Information</h3>
        <p>View buyer profiles and trade activity</p>
      </div>
    </div>

    {/* Seller */}
    <div className="admin-function-card" onClick={() => setActive("seller")}>
      <div className="admin-func-icon product">
        🏭
      </div>
      <div className="admin-func-content">
        <h3>Seller Information</h3>
        <p>Manage sellers and export data</p>
      </div>
    </div>

  </div>
</section>


            











      {/* Dashboard Bottom Section */}
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
                <p className="recent-title">
                  Automotive Parts Tariff Impact
                </p>
                <p className="recent-meta">1 day ago</p>
              </div>
              <span className="status-pill">Completed</span>
            </div>

            <div className="recent-item">
              <div>
                <p className="recent-title">
                  Textile Trade Comparison 2024
                </p>
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
            Average tariff increase on Chinese imports:
            <strong> 18.7%</strong>
          </div>

          <div className="insight-line insight-green">
            Trade agreements active:
            <strong> 38 countries</strong>
          </div>

          <div className="insight-line insight-red">
            High-impact industries:
            <strong> Electronics, Automotive, Steel</strong>
          </div>
        </div>
      </section>
    </>
  );

    }
  };

  return (
    <div className="layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">TI</div>
          <span>TariffIntel</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={
                active === item.id ? "sidebar-item active" : "sidebar-item"
              }
              onClick={() => setActive(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
          ))}

          {/* ===== BUYER / SELLER ===== */}
          <button
            className="sidebar-item"
            onClick={() => setOpenBuyerSeller(!openBuyerSeller)}
          >
            <span className="icon">
              <FiUsers />
            </span>
            <span className="label">Buyer / Seller</span>
          </button>

          {/* ===== SUB ITEMS (STACKED EXACTLY) ===== */}
          {openBuyerSeller && (
            <>
              <button
                className={
                  active === "buyer"
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => setActive("buyer")}
                style={{ paddingLeft: "48px" }}
              >
                Buyer
              </button>

              <button
                className={
                  active === "seller"
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => setActive("seller")}
                style={{ paddingLeft: "48px" }}
              >
                Seller
              </button>
            </>
          )}

          {/* ===== SETTINGS ===== */}
          <button
            className={
              active === "settings"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActive("settings")}
          >
            <span className="icon">
              <FiSettings />
            </span>
            <span className="label">Settings</span>
          </button>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut className="icon" />
          <span className="label">Logout</span>
        </button>
      </aside>

      {/* ================= MAIN ================= */}
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