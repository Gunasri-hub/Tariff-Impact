// src/components/AdminDashboardPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import {
  FiPieChart,
  FiUsers,
  FiFileText,
  FiGlobe,
  FiBox,
  FiBarChart2,
  FiBell,
  FiMessageSquare,
  FiLogOut,
} from "react-icons/fi";
import CountryDatabasePage from "./CountryDatabasePage";
import UserManagementPage from "./UserManagementPage";
import AgreementsManagementPage from "./AgreementsManagementPage";
import ProductLibraryPage from "./ProductLibraryPage";
import BuyerManagementPage from "./BuyerManagementPage";
import SellerManagementPage from "./SellerManagementPage";
import TransactionManagementPage from "./TransactionManagementPage";
import ReportsPage from "./ReportsPage";


function AdminDashboardPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/"); // back to login shell
  };

  // Mock numbers – later replace with real API data
  const totalUsers = 1247;
  const activeSessions = 178;
  const totalQueries = 45892;
  const systemHealth = 98.2;

  // Sidebar menu items
  const menuItems = [
    { id: "dashboard", label: "Admin Dashboard", icon: <FiPieChart /> },
    { id: "users", label: "User Management", icon: <FiUsers /> },
    { id: "buyers", label: "Buyer Management", icon: <FiUsers /> },
    { id: "sellers", label: "Seller Management", icon: <FiUsers /> },
    { id: "agreements", label: "Agreements Management", icon: <FiFileText /> },
    { id: "countries", label: "Country Database", icon: <FiGlobe /> },
    { id: "products", label: "Product Library", icon: <FiBox /> },
    { id: "reports", label: "Reports", icon: <FiBarChart2 /> },
    {id:"Transactions", label: "Transaction Management", icon: <FiBell />},
    
  ];

  // All pages now handled internally - NO external navigation
  const handleMenuClick = (itemId) => {
    setCurrentPage(itemId);
  };

  // ✅ UserManagement Component (INLINE)
  const UserManagement = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>👥 User Management</h1>
        <p>Manage all system users, roles, and permissions</p>
      </section>
      
    </div>
  );

  // ✅ AgreementsManagement Component (INLINE)
  const AgreementsManagement = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>📄 Agreements Management</h1>
        <p>Manage trade agreements, FTAs, and policy updates</p>
      </section>
      
        
    </div>
  );

  // ✅ CountryTable Component (INLINE)
  const CountryTable = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>🌍 Country Database</h1>
        <p>Manage country tariff profiles and regulations</p>
      </section>
      
           
    </div>
  );
  const TransactionManagement = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>👥 Transaction Management</h1>
        <p>Manage all system transactions, roles, and permissions</p>
      </section>
      
    </div>
  );

  // ✅ ProductLibrary Component (INLINE) - NEW!
  const ProductLibrary = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h2>📦 Product Library</h2>
        <p>Maintain HS codes, product categories, and tariff classifications</p>
      </section>
      
           
    </div>
  );

  // ✅ Reports Component (INLINE)
  const Reports = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>📊 Reports</h1>
        <p>System analytics, usage reports, and export tools</p>
      </section>
      
        
      
    </div>
  );

  

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-circle">TI</div>
          <div className="sidebar-title">TariffIntel</div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}

          <button
            className="nav-item logout"
            type="button"
            onClick={handleLogout}
          >
            <span className="nav-icon">
              <FiLogOut />
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content (for /admin internal views) */}
      <main className="admin-main">
        {/* ✅ ALL 6 Internal Pages */}
        {currentPage === "users" && <UserManagementPage />}
        {currentPage === "buyers" && <BuyerManagementPage />}
        {currentPage === "sellers" && <SellerManagementPage />}
        {currentPage === "agreements" && <AgreementsManagementPage />}
        {currentPage === "countries" && <CountryDatabasePage />}
        {currentPage === "products" && <ProductLibraryPage />}
        {currentPage === "Transactions" && <TransactionManagementPage />}
        {currentPage === "reports" && <ReportsPage />}
        

        {/* Dashboard Page - ALL ORIGINAL CONTENT */}
        {currentPage === "dashboard" && (
          <>
            {/* Top blue banner */}
            <section className="admin-hero">
              <div>
                <h1>Administrator Dashboard</h1>
                <p>
                  Manage users, content, and system settings for TariffIntel.
                </p>
              </div>
            </section>

            {/* KPI row */}
            <section className="admin-kpi-row">
              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Total Users</div>
                <div className="admin-kpi-value">
                  {totalUsers.toLocaleString()}
                </div>
                <div className="admin-kpi-sub">+12% this month</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Active Sessions</div>
                <div className="admin-kpi-value">{activeSessions}</div>
                <div className="admin-kpi-sub">+5% from yesterday</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">Total Queries</div>
                <div className="admin-kpi-value">
                  {totalQueries.toLocaleString()}
                </div>
                <div className="admin-kpi-sub">This week</div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-label">System Health</div>
                <div className="admin-kpi-value">{systemHealth}%</div>
                <div className="admin-kpi-sub">All systems operational</div>
              </div>
            </section>

            {/* Admin functions cards - ALL NOW CLICKABLE INTERNALLY */}
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Admin Functions</h2>
              </div>

              <div className="admin-functions-grid">
                <div
                  className="admin-function-card"
                  onClick={() => setCurrentPage("users")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-func-icon user">
                    <span>👥</span>
                  </div>
                  <div className="admin-func-content">
                    <h3>User Management</h3>
                    <p>Manage user accounts, roles, and permissions.</p>
                    <span className="admin-function-meta">127 users</span>
                  </div>
                </div>

                <div
                  className="admin-function-card"
                  onClick={() => setCurrentPage("agreements")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-func-icon agreements">
                    <span>📄</span>
                  </div>
                  <div className="admin-func-content">
                    <h3>Agreements Management</h3>
                    <p>Update trade agreements and policy changes.</p>
                    <span className="admin-function-meta">43 agreements</span>
                  </div>
                </div>

                <div
                  className="admin-function-card"
                  onClick={() => setCurrentPage("countries")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-func-icon country">
                    <span>🌍</span>
                  </div>
                  <div className="admin-func-content">
                    <h3>Country Database</h3>
                    <p>Manage country tariff rates and regulations.</p>
                    <span className="admin-function-meta">195 countries</span>
                  </div>
                </div>

                <div
                  className="admin-function-card"
                  onClick={() => setCurrentPage("products")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-func-icon product">
                    <span>📦</span>
                  </div>
                  <div className="admin-func-content">
                    <h3>Product Library</h3>
                    <p>Maintain HS codes and product categories.</p>
                    <span className="admin-function-meta">8,429 products</span>
                  </div>
                </div>

                <div
                  className="admin-function-card"
                  onClick={() => setCurrentPage("reports")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admin-func-icon reports">
                    <span>📊</span>
                  </div>
                  <div className="admin-func-content">
                    <h3>Reports</h3>
                    <p>Generate system reports and analytics.</p>
                    <span className="admin-function-meta">234 reports</span>
                  </div>
                </div>

                <div
  className="admin-function-card"
  onClick={() => setCurrentPage("buyers")}
  style={{ cursor: "pointer" }}
>
  <div className="admin-func-icon user">
    <span>🧑‍💼</span>
  </div>
  <div className="admin-func-content">
    <h3>Buyer Management</h3>
    <p>Manage buyer profiles, regions, and trade activity.</p>
    <span className="admin-function-meta">312 buyers</span>
  </div>
</div>
<div
  className="admin-function-card"
  onClick={() => setCurrentPage("sellers")}
  style={{ cursor: "pointer" }}
>
  <div className="admin-func-icon product">
    <span>🏭</span>
  </div>
  <div className="admin-func-content">
    <h3>Seller Management</h3>
    <p>Manage sellers, exporters, and compliance details.</p>
    <span className="admin-function-meta">198 sellers</span>
  </div>
</div>
<div
  className="admin-function-card"
  onClick={() => setCurrentPage("Transactions")}
  style={{ cursor: "pointer" }}
>
  <div className="admin-func-icon reports">
    <span>💳</span>
  </div>
  <div className="admin-func-content">
    <h3>Transaction Management</h3>
    <p>View, audit, and manage all trade transactions.</p>
    <span className="admin-function-meta">12,540 transactions</span>
  </div>
</div>

              </div>
            </section>

            {/* System activity (Last 7 Days) */}
            <section className="admin-panel">
              <div className="panel-header">
                <h3>System Activity (Last 7 Days)</h3>
              </div>
              <div className="admin-chart-placeholder">
                <div className="admin-chart-line" />
                <div className="admin-chart-axis-labels">
                  <span>Nov 20</span>
                  <span>Nov 21</span>
                  <span>Nov 22</span>
                  <span>Nov 23</span>
                  <span>Nov 24</span>
                  <span>Nov 25</span>
                  <span>Nov 26</span>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="admin-panel admin-recent-panel">
              <div className="panel-header">
                <h3>Recent Activity</h3>
              </div>
              <ul className="admin-activity-list">
                <li className="admin-activity-item">
                  <span className="admin-activity-icon user">👤</span>
                  <div className="admin-activity-main">
                    <div className="admin-activity-title">
                      New user registered: john@example.com
                    </div>
                    <div className="admin-activity-time">5 minutes ago</div>
                  </div>
                </li>
                <li className="admin-activity-item">
                  <span className="admin-activity-icon green">🔄</span>
                  <div className="admin-activity-main">
                    <div className="admin-activity-title">
                      Tariff rate updated for China - Electronics
                    </div>
                    <div className="admin-activity-time">23 minutes ago</div>
                  </div>
                </li>
                <li className="admin-activity-item">
                  <span className="admin-activity-icon purple">📃</span>
                  <div className="admin-activity-main">
                    <div className="admin-activity-title">
                      New trade agreement added: US–India
                    </div>
                    <div className="admin-activity-time">1 hour ago</div>
                  </div>
                </li>
                <li className="admin-activity-item">
                  <span className="admin-activity-icon orange">📰</span>
                  <div className="admin-activity-main">
                    <div className="admin-activity-title">
                      News article published: Steel Tariff Changes
                    </div>
                    <div className="admin-activity-time">2 hours ago</div>
                  </div>
                </li>
                <li className="admin-activity-item">
                  <span className="admin-activity-icon gray">💾</span>
                  <div className="admin-activity-main">
                    <div className="admin-activity-title">
                      System backup completed successfully
                    </div>
                    <div className="admin-activity-time">4 hours ago</div>
                  </div>
                </li>
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;