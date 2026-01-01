// src/pages/ReferenceData/AdminDashboardPage.jsx
import React, { useState, useEffect } from "react";
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
import { countryApi } from "../../Apis/countryApi";
import "./CountryDatabasePage.css";

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
    { id: "agreements", label: "Agreements Management", icon: <FiFileText /> },
    { id: "countries", label: "Country Database", icon: <FiGlobe /> },
    { id: "products", label: "Product Library", icon: <FiBox /> },
    { id: "reports", label: "Reports", icon: <FiBarChart2 /> },
    { id: "feedback", label: "Feedback Inbox", icon: <FiMessageSquare /> },
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

  // ✅ CountryTable Component (INLINE) - UPDATED WITH FULL FUNCTIONALITY
  const CountryTable = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState("All");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [form, setForm] = useState({
      country_name: "",
      iso_code: "",
      currency: "",
      region: "",
      column2_status: "Not Applied",
      fta_eligibility: "",
      tariff_data_status: "Incomplete",
    });

    // Fetch countries from API
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const result = await countryApi.getAllCountries();
        
        if (result.success) {
          // Filter based on search and region
          let filteredData = result.data || [];
          
          if (search) {
            const searchLower = search.toLowerCase();
            filteredData = filteredData.filter(country =>
              country.country_name?.toLowerCase().includes(searchLower) ||
              country.iso_code?.toLowerCase().includes(searchLower) ||
              country.currency?.toLowerCase().includes(searchLower) ||
              country.region?.toLowerCase().includes(searchLower)
            );
          }
          
          if (region && region !== "All") {
            filteredData = filteredData.filter(country => 
              country.region === region
            );
          }
          
          setCountries(filteredData);
        } else {
          console.error("API returned error:", result.error);
          setCountries([]);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchCountries();
    }, []); // Fetch once on mount

    useEffect(() => {
      // Trigger filtering when search or region changes
      const timeoutId = setTimeout(() => {
        fetchCountries();
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }, [search, region]);

    // Form helpers
    const resetForm = () => {
      setForm({
        country_name: "",
        iso_code: "",
        currency: "",
        region: "",
        column2_status: "Not Applied",
        fta_eligibility: "",
        tariff_data_status: "Incomplete",
      });
    };

    const startAdd = () => {
      setEditingId(null);
      resetForm();
      setModalOpen(true);
    };

    const startEdit = (country) => {
      setEditingId(country.id);
      setForm({
        country_name: country.country_name || "",
        iso_code: country.iso_code || "",
        currency: country.currency || "",
        region: country.region || "",
        column2_status: country.column2_status || "Not Applied",
        fta_eligibility: country.fta_eligibility || "",
        tariff_data_status: country.tariff_data_status || "Incomplete",
      });
      setModalOpen(true);
    };

    const closeModal = () => {
      setModalOpen(false);
      setEditingId(null);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveCountry = async () => {
      try {
        // Validate required fields
        if (!form.country_name || !form.iso_code || !form.currency || !form.region) {
          alert("Please fill all required fields (*)");
          return;
        }

        console.log("Saving country with data:", form);
        console.log("Editing ID:", editingId);
        
        let result;
        
        if (editingId) {
          result = await countryApi.updateCountry(editingId, form);
        } else {
          result = await countryApi.createCountry(form);
        }

        console.log("API Response:", result);

        if (result.success) {
          alert(editingId ? "Country updated successfully!" : "Country added successfully!");
          closeModal();
          await fetchCountries(); // Refresh the list
        } else {
          throw new Error(result.error || 'Failed to save country');
        }
      } catch (error) {
        console.error("Error saving country:", error);
        console.error("Error details:", error.message);
        
        // Check if backend is running
        try {
          const testResponse = await fetch('http://localhost:8080/api/countries');
          console.log("Backend test response status:", testResponse.status);
        } catch (backendError) {
          console.error("Backend connection error:", backendError);
          alert("Cannot connect to backend server. Make sure it's running on port 8080.");
        }
        
        alert(`Error saving country: ${error.message}`);
      }
    };

    const deleteCountry = async (id) => {
      if (!window.confirm("Are you sure you want to delete this country?")) return;
      
      try {
        const result = await countryApi.deleteCountry(id);
        
        if (result.success) {
          await fetchCountries(); // Refresh the list
        } else {
          throw new Error(result.error || 'Failed to delete country');
        }
      } catch (error) {
        console.error("Error deleting country:", error);
        alert(`Error deleting country: ${error.message}`);
      }
    };

    return (
      <div style={{ padding: "20px 0" }}>
        <section className="admin-hero">
          <h1>🌍 Country Database</h1>
          <p>Manage country tariff profiles and regulations</p>
        </section>
        
        {/* Enhanced Filters and Actions Bar */}
        <div className="country-controls-bar">
          <div className="search-wrapper">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="country-search-input"
                placeholder="Search by country name, ISO code, or currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="filter-badges">
              {region !== "All" && (
                <span className="filter-badge">
                  Region: {region}
                  <button onClick={() => setRegion("All")}>✕</button>
                </span>
              )}
              {search && (
                <span className="filter-badge">
                  Search: "{search}"
                  <button onClick={() => setSearch("")}>✕</button>
                </span>
              )}
            </div>
          </div>

          <div className="country-filters-container">
            <div className="filter-select-wrapper">
              <span className="filter-icon">🌍</span>
              <select
                className="country-region-filter"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="All">All Regions</option>
                <option value="Africa">Africa</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Oceania">Oceania</option>
                <option value="Middle East">Middle East</option>
              </select>
            </div>

            <button className="country-add-btn" onClick={startAdd}>
              <span className="btn-icon">+</span> Add New Country
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="country-table-container">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading countries...</p>
            </div>
          ) : countries.length === 0 ? (
            <div className="empty-state">
              <p>No countries found{search ? ` for "${search}"` : ""}</p>
              <button className="btn-secondary" onClick={startAdd}>
                Add First Country
              </button>
            </div>
          ) : (
            <table className="countries-table">
              <thead>
                <tr>
                  <th>Country Name</th>
                  <th>ISO Code</th>
                  <th>Currency</th>
                  <th>Region</th>
                  <th>Column 2 Status</th>
                  <th>FTA Eligibility</th>
                  <th>Tariff Data Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr key={country.id}>
                    <td className="country-name">{country.country_name}</td>
                    <td className="iso-code">
                      <span className="code-badge">{country.iso_code}</span>
                    </td>
                    <td>{country.currency}</td>
                    <td>
                      <span className={`region-badge ${country.region?.toLowerCase().replace(" ", "-")}`}>
                        {country.region}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${country.column2_status?.toLowerCase().replace(" ", "-")}`}>
                        {country.column2_status}
                      </span>
                    </td>
                    <td className="fta-eligibility">
                      {country.fta_eligibility || "—"}
                    </td>
                    <td>
                      <span className={`tariff-status ${country.tariff_data_status?.toLowerCase()}`}>
                        {country.tariff_data_status}
                      </span>
                    </td>
                    <td className="country-actions-cell">
                      <button
                        className="country-edit-btn"
                        onClick={() => startEdit(country)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="country-delete-btn"
                        onClick={() => deleteCountry(country.id)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Summary */}
          {!loading && countries.length > 0 && (
            <div className="table-summary">
              <p>Showing {countries.length} countries</p>
            </div>
          )}
        </div>

        {/* Modal for Add/Edit - Only shows when modalOpen is true */}
        {modalOpen && (
          <div className="country-modal-overlay" onClick={closeModal}>
            <div className="country-modal" onClick={(e) => e.stopPropagation()}>
              <div className="country-modal-header">
                <h3>{editingId ? "Edit Country" : "Add New Country"}</h3>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
              
              <div className="country-modal-body">
                <div className="country-form-grid">
                  <div className="form-group">
                    <label>Country Name *</label>
                    <input
                      type="text"
                      name="country_name"
                      value={form.country_name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., United States"
                    />
                  </div>

                  <div className="form-group">
                    <label>ISO Code *</label>
                    <input
                      type="text"
                      name="iso_code"
                      value={form.iso_code}
                      onChange={handleChange}
                      required
                      maxLength="3"
                      placeholder="e.g., USA"
                      className="uppercase-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency *</label>
                    <input
                      type="text"
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      required
                      placeholder="e.g., USD"
                    />
                  </div>

                  <div className="form-group">
                    <label>Region *</label>
                    <select
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Region</option>
                      <option value="Africa">Africa</option>
                      <option value="Asia">Asia</option>
                      <option value="Europe">Europe</option>
                      <option value="North America">North America</option>
                      <option value="South America">South America</option>
                      <option value="Oceania">Oceania</option>
                      <option value="Middle East">Middle East</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Column 2 Status</label>
                    <select
                      name="column2_status"
                      value={form.column2_status}
                      onChange={handleChange}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Not Applied">Not Applied</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tariff Data Status</label>
                    <select
                      name="tariff_data_status"
                      value={form.tariff_data_status}
                      onChange={handleChange}
                    >
                      <option value="Complete">Complete</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>FTA Eligibility</label>
                    <textarea
                      name="fta_eligibility"
                      value={form.fta_eligibility}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Enter FTA, GSP, or Import License eligibility details..."
                    />
                  </div>
                </div>
              </div>

              <div className="country-modal-footer">
                <button className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={saveCountry}>
                  {editingId ? "Update Country" : "Create Country"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ ProductLibrary Component (INLINE) - NEW!
  const ProductLibrary = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>📦 Product Library</h1>
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

  // ✅ FeedbackInbox Component (INLINE)
  const FeedbackInbox = () => (
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>💬 Feedback Inbox</h1>
        <p>User feedback, support tickets, and suggestions</p>
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
        {currentPage === "users" && <UserManagement />}
        {currentPage === "agreements" && <AgreementsManagement />}
        {currentPage === "countries" && <CountryTable />}
        {currentPage === "products" && <ProductLibrary />}
        {currentPage === "reports" && <Reports />}
        {currentPage === "feedback" && <FeedbackInbox />}

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