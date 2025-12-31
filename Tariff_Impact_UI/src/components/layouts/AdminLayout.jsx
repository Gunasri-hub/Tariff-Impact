import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPieChart, FiUsers, FiFileText, FiGlobe, FiBox, FiBarChart2, FiMessageSquare, FiLogOut } from 'react-icons/fi';

const AdminLayout = ({ children, activePage = "dashboard" }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Admin Dashboard", icon: <FiPieChart />, path: "/admin/dashboard" },
    { id: "users", label: "User Management", icon: <FiUsers />, path: "/admin/users" },
    { id: "agreements", label: "Agreements Management", icon: <FiFileText />, path: "/admin/agreements" },
    { id: "countries", label: "Country Database", icon: <FiGlobe />, path: "/admin/countries" },
    { id: "products", label: "Product Library", icon: <FiBox />, path: "/admin/products" },
    { id: "reports", label: "Reports", icon: <FiBarChart2 />, path: "/admin/reports" },
    { id: "feedback", label: "Feedback Inbox", icon: <FiMessageSquare />, path: "/admin/feedback" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="admin-layout">
      {/* ADMIN SIDEBAR */}
      <aside className="sidebar admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-circle">TI</div>
          <div className="sidebar-title">TariffIntel</div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          <button className="nav-item logout" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
