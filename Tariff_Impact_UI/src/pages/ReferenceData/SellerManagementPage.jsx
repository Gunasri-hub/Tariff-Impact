// src/pages/Admin/SellerManagementPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller as deleteSellerApi,
} from "../../Apis/authApi";

function SellerManagementPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    type: "FOREIGN_MANUFACTURER",
    phone: "",
    email: "",
    address: "",
  });

  // Fetch sellers function
  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");
      
      const res = await getSellers();
      
      console.log("✅ Seller API Response:", res);
      
      let sellersData = [];
      
      if (res.data && res.data.success && res.data.data) {
        sellersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        sellersData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        sellersData = res.data.data;
      }
      
      console.log("📊 Total sellers fetched:", sellersData.length);
      setSellers(sellersData);
      
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setApiError(err.response?.data?.message || err.response?.data?.error || "Failed to fetch sellers");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search locally
  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
  };

  // Filter sellers based on search term
  const filteredSellers = search.trim() ? sellers.filter(seller => {
    const searchLower = search.toLowerCase().trim();
    
    return (
      (seller.name && seller.name.toLowerCase().includes(searchLower)) ||
      (seller.email && seller.email.toLowerCase().includes(searchLower)) ||
      (seller.phone && seller.phone.includes(search)) ||
      (seller.type && seller.type.toLowerCase().includes(searchLower)) ||
      (seller.address && seller.address.toLowerCase().includes(searchLower)) ||
      (seller.seller_id && seller.seller_id.toLowerCase().includes(searchLower))
    );
  }) : sellers;

  // Initial fetch only
  useEffect(() => {
    console.log("🔄 Initial fetch sellers");
    fetchSellers();
  }, [fetchSellers]);

  // Validate form function
  const validateForm = () => {
    const errors = {};
    
    if (!form.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      errors.phone = "Enter valid 10-digit phone number";
    }
    
    if (form.email?.trim() && !/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!form.type?.trim()) {
      errors.type = "Type is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "FOREIGN_MANUFACTURER",
      phone: "",
      email: "",
      address: "",
    });
    setValidationErrors({});
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const startEdit = (seller) => {
    setEditingId(seller.id);
    setForm({
      name: seller.name || "",
      type: seller.type || "FOREIGN_MANUFACTURER",
      phone: seller.phone || "",
      email: seller.email || "",
      address: seller.address || "",
    });
    setValidationErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const saveSeller = async () => {
    if (!validateForm()) {
      alert("Please fix the validation errors before saving.");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      };

      if (editingId) {
        await updateSeller(editingId, payload);
        alert("✅ Seller updated successfully!");
      } else {
        await createSeller(payload);
        alert("✅ Seller created successfully!");
      }

      closeModal();
      // Refetch data
      fetchSellers();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to save seller");
    }
  };

  const deleteSeller = async (id) => {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;

    try {
      await deleteSellerApi(id);
      alert("✅ Seller deleted successfully!");
      // Refetch data
      fetchSellers();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete seller");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch (e) {
      return '-';
    }
  };

  // Get type badge style
  const getTypeBadgeStyle = (type) => {
    const baseStyle = styles.badge;
    switch (type?.toLowerCase()) {
      case 'foreign_manufacturer':
        return { ...baseStyle, ...styles.badgeForeignManufacturer };
      case 'exporter':
        return { ...baseStyle, ...styles.badgeExporter };
      case 'trading_company':
        return { ...baseStyle, ...styles.badgeTradingCompany };
      case 'oem_supplier':
        return { ...baseStyle, ...styles.badgeOemSupplier };
      case 'raw_material_supplier':
        return { ...baseStyle, ...styles.badgeRawMaterialSupplier };
      default:
        return { ...baseStyle, ...styles.badgeDefault };
    }
  };

  // Format type for display
  const formatType = (type) => {
    if (!type) return 'Unknown';
    
    const typeMap = {
      'FOREIGN_MANUFACTURER': 'Foreign Manufacturer',
      'EXPORTER': 'Exporter',
      'TRADING_COMPANY': 'Trading Company',
      'OEM_SUPPLIER': 'OEM Supplier',
      'RAW_MATERIAL_SUPPLIER': 'Raw Material Supplier'
    };
    
    return typeMap[type] || type.replace(/_/g, ' ');
  };

  const styles = {
    page: {
      padding: "0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    },
    blueHeader: {
      background: "linear-gradient(90deg, #1E51DB 0%, #225CE4 100%)",
      color: "white",
      padding: "20px 0px",
      marginBottom: "0",
      marginTop: "15px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
      borderRadius: "20px",
      position: "relative",
      overflow: "hidden"
    },
    headerContent: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      position: "relative",
      zIndex: "2",
      padding: "0 24px",
    },
    headerIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "60px",
      height: "60px",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: "12px",
      fontSize: "28px"
    },
    headerText: {
      flex: 1
    },
    pageTitle: {
      fontSize: "24px",
      fontWeight: "600",
      color: "white",
      marginBottom: "4px",
      marginTop: "0"
    },
    pageSubtitle: {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.85)",
      marginTop: "0",
      marginBottom: "0",
      fontWeight: "400"
    },
    decorationCircle: {
      position: "absolute",
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.08)",
      right: "-20px",
      top: "-40px",
      zIndex: "1"
    },
    decorationCircle2: {
      position: "absolute",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      right: "60px",
      bottom: "-20px",
      zIndex: "1"
    },
    contentContainer: {
      padding: "24px"
    },
    errorBox: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #f5c6cb"
    },
    // Toolbar
    toolbar: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
      alignItems: "center",
      background: "#fff",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e9ecef"
    },
    search: {
      padding: "8px 12px",
      fontSize: "13px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      flex: 1,
      minWidth: "250px",
      transition: "all 0.2s",
      backgroundColor: "#fff"
    },
    primaryBtn: {
      padding: "8px 16px",
      background: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    // Table
    tableWrapper: {
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflowX: "auto",
      marginTop: "0",
      border: "1px solid #e9ecef"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "12px"
    },
    th: {
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: "600",
      color: "#495057",
      textTransform: "uppercase",
      fontSize: "11px",
      letterSpacing: "0.3px",
      background: "#f8f9fa",
      borderBottom: "1px solid #dee2e6",
      borderRight: "1px solid #e9ecef"
    },
    td: {
      padding: "8px 12px",
      borderBottom: "1px solid #e9ecef",
      color: "#495057",
      verticalAlign: "middle",
      fontSize: "12px",
      borderRight: "1px solid #e9ecef"
    },
    iconBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      transition: "all 0.2s",
      marginRight: "6px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    },
    // Badges
    badge: {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "12px",
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.3px"
    },
    badgeForeignManufacturer: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2"
    },
    badgeExporter: {
      backgroundColor: "#d4edda",
      color: "#155724"
    },
    badgeTradingCompany: {
      backgroundColor: "#fff3cd",
      color: "#856404"
    },
    badgeOemSupplier: {
      backgroundColor: "#d1ecf1",
      color: "#0c5460"
    },
    badgeRawMaterialSupplier: {
      backgroundColor: "#f8d7da",
      color: "#721c24"
    },
    badgeDefault: {
      backgroundColor: "#e9ecef",
      color: "#495057"
    },
    loadingText: {
      textAlign: "center",
      padding: "40px",
      color: "#6c757d",
      fontSize: "14px"
    },
    noData: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#6c757d",
      fontStyle: "italic",
      fontSize: "14px"
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#e74c3c",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "14px",
      marginRight: "8px"
    },
    userName: {
      display: "flex",
      alignItems: "center"
    },
    // Modal
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px"
    },
    modalPanel: {
      background: "white",
      borderRadius: "12px",
      width: "100%",
      maxWidth: "500px",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderBottom: "1px solid #e9ecef"
    },
    modalHeaderH3: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#1a1a1a"
    },
    modalBody: {
      padding: "20px"
    },
    formField: {
      marginBottom: "16px"
    },
    formLabel: {
      display: "block",
      fontSize: "13px",
      fontWeight: "500",
      color: "#495057",
      marginBottom: "6px"
    },
    formInput: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    formSelect: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
      transition: "all 0.2s",
      boxSizing: "border-box",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      backgroundSize: "14px",
      paddingRight: "35px",
      backgroundColor: "white"
    },
    formTextarea: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
      transition: "all 0.2s",
      boxSizing: "border-box",
      minHeight: "80px",
      resize: "vertical",
      fontFamily: "inherit"
    },
    errorInput: {
      borderColor: "#dc3545",
      backgroundColor: "#fff8f8"
    },
    errorText: {
      color: "#dc3545",
      fontSize: "11px",
      marginTop: "4px",
      display: "block"
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      padding: "20px",
      borderTop: "1px solid #e9ecef",
      backgroundColor: "#f8f9fa",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px"
    }
  };

  return (
    <div style={styles.page}>
      {/* Blue Header Bar with Icon */}
      <div style={styles.blueHeader}>
        <div style={styles.decorationCircle}></div>
        <div style={styles.decorationCircle2}></div>
        
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}>
            <span>👥</span>
          </div>
          <div style={styles.headerText}>
            <h3 style={styles.pageTitle}>Seller Management</h3>
            <p style={styles.pageSubtitle}>Manage all seller information, export capabilities and records</p>
          </div>
        </div>
      </div>

      <div style={styles.contentContainer}>
        {apiError && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {apiError}
          </div>
        )}

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <input
            style={styles.search}
            placeholder="Search by name, email, phone, type, address, or ID..."
            value={search}
            onChange={handleSearch}
            disabled={loading}
          />
          
          <button 
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onClick={startAdd}
            disabled={loading}
          >
            <span>+</span> Add Seller {loading ? ' (Loading...)' : ''}
          </button>
        </div>

        {/* Sellers Table */}
        {loading ? (
          <div style={styles.loadingText}>
            ⏳ Loading sellers...
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Seller ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Created Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.length === 0 ? (
                    <tr>
                      <td style={{ ...styles.td, ...styles.noData }} colSpan={8}>
                        {search ? (
                          "🔍 No matching sellers found"
                        ) : sellers.length === 0 ? (
                          "📭 No sellers in database"
                        ) : (
                          "No data available"
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredSellers.map((seller, index) => (
                      <tr 
                        key={seller.id || index}
                        style={{ 
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <td style={styles.td}>
                          <div style={{ fontWeight: "600", color: "#1a1a1a", fontSize: "11px" }}>
                            {seller.seller_id || `SEL-${(index + 1).toString().padStart(3, '0')}`}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.userName}>
                            <div style={styles.avatar}>
                              {seller.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div style={{ fontWeight: "500", color: "#1a1a1a", fontSize: "12px" }}>
                              {seller.name || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={getTypeBadgeStyle(seller.type)}>
                            {formatType(seller.type)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#495057" }}>
                            {seller.phone || '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#495057" }}>
                            {seller.email || '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#6c757d", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {seller.address ? `${seller.address.substring(0, 30)}...` : '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#6c757d" }}>
                            {formatDate(seller.created_at || seller.createdAt || seller.created_date)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={{ ...styles.iconBtn, color: "#007bff" }}
                            onClick={() => startEdit(seller)}
                            title="Edit"
                          >
                            <span>✏️</span>
                          </button>
                          <button 
                            style={{ ...styles.iconBtn, color: "#dc3545" }}
                            onClick={() => deleteSeller(seller.id)}
                            title="Delete"
                          >
                            <span>🗑️</span> 
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Display search info */}
            {search && (
              <div style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#e7f3ff",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#0066cc"
              }}>
                Showing {filteredSellers.length} result{filteredSellers.length !== 1 ? 's' : ''} for "{search}"
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div style={styles.modalBackdrop} onClick={closeModal}>
            <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalHeaderH3}>
                  {editingId ? "Edit Seller" : "Add New Seller"}
                </h3>
                <button 
                  onClick={closeModal}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    fontSize: "24px", 
                    cursor: "pointer",
                    color: "#6c757d",
                    padding: "0",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%"
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.name && styles.errorInput)
                    }}
                    placeholder="e.g., Global Exporters Inc."
                    autoComplete="off"
                  />
                  {validationErrors.name && (
                    <span style={styles.errorText}>{validationErrors.name}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Seller Type *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    style={{
                      ...styles.formSelect,
                      ...(validationErrors.type && styles.errorInput)
                    }}
                  >
                    <option value="FOREIGN_MANUFACTURER">Foreign Manufacturer</option>
                    <option value="EXPORTER">Exporter</option>
                    <option value="TRADING_COMPANY">Trading Company</option>
                    <option value="OEM_SUPPLIER">OEM Supplier</option>
                    <option value="RAW_MATERIAL_SUPPLIER">Raw Material Supplier</option>
                  </select>
                  {validationErrors.type && (
                    <span style={styles.errorText}>{validationErrors.type}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.phone && styles.errorInput)
                    }}
                    placeholder="e.g., 9876543210"
                    autoComplete="off"
                    maxLength="10"
                  />
                  {validationErrors.phone && (
                    <span style={styles.errorText}>{validationErrors.phone}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.email && styles.errorInput)
                    }}
                    placeholder="e.g., contact@company.com"
                    autoComplete="off"
                  />
                  {validationErrors.email && (
                    <span style={styles.errorText}>{validationErrors.email}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    style={styles.formTextarea}
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>
              </div>
              
              <div style={styles.modalFooter}>
                <button 
                  style={{
                    padding: "8px 16px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontSize: "13px"
                  }}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  style={styles.primaryBtn}
                  onClick={saveSeller}
                  disabled={
                    !form.name?.trim() || 
                    !form.phone?.trim() || 
                    !form.type?.trim()
                  }
                >
                  {editingId ? "Update Seller" : "Add Seller"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerManagementPage;