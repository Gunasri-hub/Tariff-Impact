// src/pages/Admin/BuyerManagementPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getBuyers,
  createBuyer,
  updateBuyer,
  deleteBuyer as deleteBuyerApi,
} from "../../Apis/authApi";

function BuyerManagementPage() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    type: "INDIVIDUAL_IMPORTER", // Default to first ENUM value
    phone_number: "",
    email_id: "",
    address: "",
  });

  // Fetch buyers function
  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");
      
      const res = await getBuyers();
      
      console.log("✅ API Response:", res);
      
      let buyersData = [];
      
      if (res.data && res.data.success && res.data.data) {
        buyersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        buyersData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        buyersData = res.data.data;
      }
      
      console.log("📊 Total buyers fetched:", buyersData.length);
      setBuyers(buyersData);
      
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setApiError(err.response?.data?.message || err.response?.data?.error || "Failed to fetch buyers");
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search locally
  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
  };

  // Filter buyers based on search term
  const filteredBuyers = search.trim() ? buyers.filter(buyer => {
    const searchLower = search.toLowerCase().trim();
    
    return (
      (buyer.name && buyer.name.toLowerCase().includes(searchLower)) ||
      (buyer.email_id && buyer.email_id.toLowerCase().includes(searchLower)) ||
      (buyer.phone_number && buyer.phone_number.includes(search)) ||
      (buyer.type && buyer.type.toLowerCase().includes(searchLower)) ||
      (buyer.address && buyer.address.toLowerCase().includes(searchLower))
    );
  }) : buyers;

  // Initial fetch only
  useEffect(() => {
    console.log("🔄 Initial fetch");
    fetchBuyers();
  }, [fetchBuyers]);

  // Validate form function
  const validateForm = () => {
    const errors = {};
    
    if (!form.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.phone_number?.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone_number.replace(/\D/g, ''))) {
      errors.phone_number = "Enter valid 10-digit phone number";
    }
    
    if (form.email_id?.trim() && !/\S+@\S+\.\S+/.test(form.email_id)) {
      errors.email_id = "Email is invalid";
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
      type: "INDIVIDUAL_IMPORTER", // Reset to default
      phone_number: "",
      email_id: "",
      address: "",
    });
    setValidationErrors({});
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const startEdit = (buyer) => {
    setEditingId(buyer.id);
    setForm({
      name: buyer.name || "",
      type: buyer.type || "INDIVIDUAL_IMPORTER", // Use actual type or default
      phone_number: buyer.phone_number || "",
      email_id: buyer.email_id || "",
      address: buyer.address || "",
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
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const saveBuyer = async () => {
    if (!validateForm()) {
      alert("Please fix the validation errors before saving.");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type.trim(),
        phone_number: form.phone_number.trim(),
        email_id: form.email_id.trim() || null,
        address: form.address.trim() || null,
      };

      if (editingId) {
        await updateBuyer(editingId, payload);
        alert("✅ Buyer updated successfully!");
      } else {
        await createBuyer(payload);
        alert("✅ Buyer created successfully!");
      }

      closeModal();
      fetchBuyers();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to save buyer");
    }
  };

  const deleteBuyer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this buyer?")) return;

    try {
      await deleteBuyerApi(id);
      alert("✅ Buyer deleted successfully!");
      fetchBuyers();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete buyer");
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

  // Format type for display (convert ENUM to readable format)
  const formatType = (type) => {
    if (!type) return 'Unknown';
    
    const typeMap = {
      'INDIVIDUAL_IMPORTER': 'Individual Importer',
      'CORPORATE_IMPORTER': 'Corporate Importer',
      'DISTRIBUTOR': 'Distributor',
      'RETAIL_IMPORTER': 'Retail Importer',
      'WHOLESALE_IMPORTER': 'Wholesale Importer',
      'GOVERNMENT_IMPORTER': 'Government Importer'
    };
    
    return typeMap[type] || type.replace(/_/g, ' ');
  };

  // Get type badge style
  const getTypeBadgeStyle = (type) => {
    const baseStyle = styles.badge;
    switch (type?.toLowerCase()) {
      case 'individual_importer':
        return { ...baseStyle, ...styles.badgeIndividual };
      case 'corporate_importer':
        return { ...baseStyle, ...styles.badgeCorporate };
      case 'distributor':
        return { ...baseStyle, ...styles.badgeDistributor };
      case 'retail_importer':
        return { ...baseStyle, ...styles.badgeRetail };
      case 'wholesale_importer':
        return { ...baseStyle, ...styles.badgeWholesale };
      case 'government_importer':
        return { ...baseStyle, ...styles.badgeGovernment };
      default:
        return { ...baseStyle, ...styles.badgeDefault };
    }
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
    badge: {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "12px",
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.3px"
    },
    badgeIndividual: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2"
    },
    badgeCorporate: {
      backgroundColor: "#d4edda",
      color: "#155724"
    },
    badgeDistributor: {
      backgroundColor: "#fff3cd",
      color: "#856404"
    },
    badgeRetail: {
      backgroundColor: "#f8d7da",
      color: "#721c24"
    },
    badgeWholesale: {
      backgroundColor: "#d1ecf1",
      color: "#0c5460"
    },
    badgeGovernment: {
      backgroundColor: "#e9ecef",
      color: "#495057"
    },
    badgeDefault: {
      backgroundColor: "#f8f9fa",
      color: "#6c757d"
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
      backgroundColor: "#3498db",
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
            <h3 style={styles.pageTitle}>Buyer Management</h3>
            <p style={styles.pageSubtitle}>Manage all buyer information, import requirements and records</p>
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
            placeholder="Search by name, email, phone, type, or address..."
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
            <span>+</span> Add Buyer {loading ? ' (Loading...)' : ''}
          </button>
        </div>

        {/* Buyers Table */}
        {loading ? (
          <div style={styles.loadingText}>
            ⏳ Loading buyers...
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Buyer ID</th>
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
                  {filteredBuyers.length === 0 ? (
                    <tr>
                      <td style={{ ...styles.td, ...styles.noData }} colSpan={8}>
                        {search ? (
                          "🔍 No matching buyers found"
                        ) : buyers.length === 0 ? (
                          "📭 No buyers in database"
                        ) : (
                          "No data available"
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredBuyers.map((buyer, index) => (
                      <tr 
                        key={buyer.id || index}
                        style={{ 
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <td style={styles.td}>
                          <div style={{ fontWeight: "600", color: "#1a1a1a", fontSize: "11px" }}>
                            {buyer.buyer_id || `BYR-${(index + 1).toString().padStart(3, '0')}`}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.userName}>
                            <div style={styles.avatar}>
                              {buyer.name?.charAt(0)?.toUpperCase() || 'B'}
                            </div>
                            <div style={{ fontWeight: "500", color: "#1a1a1a", fontSize: "12px" }}>
                              {buyer.name || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={getTypeBadgeStyle(buyer.type)}>
                            {formatType(buyer.type)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#495057" }}>
                            {buyer.phone_number || '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#495057" }}>
                            {buyer.email_id || '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#6c757d", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {buyer.address ? `${buyer.address.substring(0, 30)}...` : '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px", color: "#6c757d" }}>
                            {formatDate(buyer.created_at || buyer.createdAt || buyer.created_date)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={{ ...styles.iconBtn, color: "#007bff" }}
                            onClick={() => startEdit(buyer)}
                            title="Edit"
                          >
                            <span>✏️</span>
                          </button>
                          <button 
                            style={{ ...styles.iconBtn, color: "#dc3545" }}
                            onClick={() => deleteBuyer(buyer.id)}
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
                Showing {filteredBuyers.length} result{filteredBuyers.length !== 1 ? 's' : ''} for "{search}"
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
                  {editingId ? "Edit Buyer" : "Add New Buyer"}
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
                    placeholder="e.g., John Smith"
                    autoComplete="off"
                  />
                  {validationErrors.name && (
                    <span style={styles.errorText}>{validationErrors.name}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Type *
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
                    <option value="INDIVIDUAL_IMPORTER">Individual Importer</option>
                    <option value="CORPORATE_IMPORTER">Corporate Importer</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="RETAIL_IMPORTER">Retail Importer</option>
                    <option value="WHOLESALE_IMPORTER">Wholesale Importer</option>
                    <option value="GOVERNMENT_IMPORTER">Government Importer</option>
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
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.phone_number && styles.errorInput)
                    }}
                    placeholder="e.g., 9876543210"
                    autoComplete="off"
                  />
                  {validationErrors.phone_number && (
                    <span style={styles.errorText}>{validationErrors.phone_number}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Email ID
                  </label>
                  <input
                    type="email"
                    name="email_id"
                    value={form.email_id}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.email_id && styles.errorInput)
                    }}
                    placeholder="e.g., john@example.com"
                    autoComplete="off"
                  />
                  {validationErrors.email_id && (
                    <span style={styles.errorText}>{validationErrors.email_id}</span>
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
                  onClick={saveBuyer}
                  disabled={
                    !form.name?.trim() || 
                    !form.phone_number?.trim() || 
                    !form.type?.trim()
                  }
                >
                  {editingId ? "Update Buyer" : "Add Buyer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerManagementPage;