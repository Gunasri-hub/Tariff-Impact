// src/pages/CountryDatabasePage.jsx
import { useEffect, useState } from "react";
import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry as deleteCountryApi,
} from "../../Apis/authApi";

function CountryDatabasePage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [allRegions, setAllRegions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    country_name: "",
    iso_code: "",
    currency: "",
    region: "",
    status: "General",
    eligibility_criteria: "",
  });

  

  // Fetch countries from backend
 const fetchCountries = async () => {
  try {
    setLoading(true);
    setApiError("");

    const res = await getCountries(); // axios call
    const allCountries = res.data || [];

    // regions
    const regions = [
      ...new Set(allCountries.map(c => c.region).filter(Boolean)),
    ];
    setAllRegions(regions);

    let filtered = [...allCountries];

    if (region !== "All") {
      filtered = filtered.filter(
        c => c.region?.toLowerCase() === region.toLowerCase()
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.country_name?.toLowerCase().includes(s) ||
          c.iso_code?.toLowerCase().includes(s) ||
          c.currency?.toLowerCase().includes(s)
      );
    }

    setCountries(filtered);
  } catch (err) {
    setApiError(err.response?.data?.message || "Failed to fetch countries");
    setCountries([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchCountries();
  }, [region, search]);

  // Validate form function
  const validateForm = () => {
    const errors = {};
    
    if (!form.country_name?.trim()) {
      errors.country_name = "Country name is required";
    }
    
    if (!form.iso_code?.trim()) {
      errors.iso_code = "ISO code is required";
    } else if (form.iso_code.length > 10) {
      errors.iso_code = "ISO code is too long";
    }
    
    if (!form.currency?.trim()) {
      errors.currency = "Currency is required";
    }
    
    if (!form.region?.trim()) {
      errors.region = "Region is required";
    }
    
    if (!form.status?.trim()) {
      errors.status = "Status is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      country_name: "",
      iso_code: "",
      currency: "",
      region: "",
      status: "General",
      eligibility_criteria: "",
    });
    setValidationErrors({});
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      country_name: c.country_name || "",
      iso_code: c.iso_code || "",
      currency: c.currency || "",
      region: c.region || "",
      status: c.status || "General",
      eligibility_criteria: c.eligibility_criteria || "",
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

 const saveCountry = async () => {
  if (!validateForm()) {
    alert("Please fix the validation errors before saving.");
    return;
  }

  const payload = {
    country_name: form.country_name.trim(),
    iso_code: form.iso_code.trim().toUpperCase(),
    currency: form.currency.trim(),
    region: form.region.trim(),
    status: form.status.trim(),
    eligibility_criteria: form.eligibility_criteria?.trim() || "",
  };

  try {
    if (editingId) {
      await updateCountry(editingId, payload);
      alert("✅ Country updated successfully!");
    } else {
      await createCountry(payload);
      alert("✅ Country added successfully!");
    }

    closeModal();
    fetchCountries();
  } catch (err) {
    console.error("Error saving country:", err);
    alert(err.response?.data?.message || "Failed to save country");
  }
};


  const deleteCountry = async (id) => {
  if (!window.confirm("Are you sure you want to delete this country?")) return;

  try {
    await deleteCountryApi(id);
    alert("✅ Country deleted successfully!");
    fetchCountries();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete country");
  }
};

  // Enhanced inline styles to match the image
  const styles = {
    page: {
      padding: "0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    },
        blueHeader: {
      background: "linear-gradient(135deg, #0d47a1, #1565c0)",
      color: "white",
      padding: "20px 0px",
      marginBottom: "0",
      marginTop: "15px", // ADD THIS: space from top of page
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
      borderBottomLeftRadius: "20px",
      borderBottomRightRadius: "20px",
      position: "relative",
      overflow: "hidden"
    },
    headerContent: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      position: "relative",
      zIndex: "2",
      padding: "0 24px", // ADDED: Horizontal padding moved here
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
      right: "-20px", // UPDATED: Adjusted for new padding
      top: "-40px",
      zIndex: "1"
    },
    decorationCircle2: {
      position: "absolute",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      right: "60px", // UPDATED: Adjusted for new padding
      bottom: "-20px",
      zIndex: "1"
    },
    contentContainer: {
      padding: "8px 24px 24px 24px"
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
      minWidth: "200px",
      transition: "all 0.2s",
      backgroundColor: "#fff"
    },
    select: {
      padding: "8px 12px",
      fontSize: "13px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      backgroundColor: "white",
      minWidth: "150px",
      cursor: "pointer",
      transition: "all 0.2s",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 8px center",
      backgroundSize: "14px",
      paddingRight: "30px"
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
    statusBadge: {
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: "10px",
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.2px"
    },
    statusGeneral: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2"
    },
    statusSpecial: {
      backgroundColor: "#f3e5f5",
      color: "#7b1fa2"
    },
    statusColumn2: {
      backgroundColor: "#e8f5e9",
      color: "#388e3c"
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
    },
    regionBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      backgroundColor: "#e7f1ff",
      color: "#0066cc",
      borderRadius: "10px",
      fontSize: "10px",
      fontWeight: "500"
    },
    isoCode: {
      backgroundColor: '#e9ecef', 
      padding: '2px 6px', 
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '11px',
      display: 'inline-block'
    }
  };

  const getStatusStyle = (status) => {
    const baseStyle = styles.statusBadge;
    switch (status?.toLowerCase()) {
      case 'general':
        return { ...baseStyle, ...styles.statusGeneral };
      case 'special':
        return { ...baseStyle, ...styles.statusSpecial };
      case 'column2':
        return { ...baseStyle, ...styles.statusColumn2 };
      default:
        return { ...baseStyle, ...styles.statusGeneral };
    }
  };

  return (
  <div style={styles.page}>
    {/* NEW HERO HEADER */}
    <div style={{ padding: "20px 0" }}>
      <section className="admin-hero">
        <h1>🌍 Country Database</h1>
        <p>Manage country tariff profiles and regulations</p>
      </section>
    </div>

      <div style={styles.contentContainer}>
        {apiError && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {apiError}
          </div>
        )}

        <div style={styles.toolbar}>
          <input
            style={styles.search}
            placeholder="Search by country, ISO code, or currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <select 
            style={styles.select}
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="All">🌍 All Regions</option>
            {allRegions.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
          
          <button 
            style={styles.primaryBtn}
            onClick={startAdd}
          >
            <span>+</span> Add Country
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingText}>
            ⏳ Loading countries...
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Country Name</th>
                  <th style={styles.th}>ISO Code</th>
                  <th style={styles.th}>Currency</th>
                  <th style={styles.th}>Region</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Eligibility</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.length === 0 ? (
                  <tr>
                    <td style={{ ...styles.td, ...styles.noData }} colSpan={7}>
                      {search || region !== "All" ? (
                        "🔍 No matching countries found"
                      ) : (
                        "📭 No countries in database"
                      )}
                    </td>
                  </tr>
                ) : (
                  countries.map((c, index) => (
                    <tr 
                      key={c.id || `${c.iso_code}_${index}`}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={styles.td}>
                        <div style={{ fontWeight: "500", color: "#1a1a1a", fontSize: "12px" }}>
                          {c.country_name}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <code style={styles.isoCode}>
                          {c.iso_code}
                        </code>
                      </td>
                      <td style={styles.td}>
                        {c.currency}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.regionBadge}>
                          {c.region}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={getStatusStyle(c.status)}>
                          {c.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {c.eligibility_criteria || "—"}
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={{ ...styles.iconBtn, color: "#007bff" }}
                          onClick={() => startEdit(c)}
                          title="Edit"
                        >
                          <span>✏️</span>
                        </button>
                        <button 
                          style={{ ...styles.iconBtn, color: "#dc3545" }}
                          onClick={() => deleteCountry(c.id)}
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
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div style={styles.modalBackdrop} onClick={closeModal}>
            <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalHeaderH3}>
                  {editingId ? "Edit Country" : "Add New Country"}
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
                    Country Name *
                  </label>
                  <input
                    name="country_name"
                    value={form.country_name}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.country_name && styles.errorInput)
                    }}
                    placeholder="e.g., United States"
                  />
                  {validationErrors.country_name && (
                    <span style={styles.errorText}>{validationErrors.country_name}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    ISO Code *
                  </label>
                  <input
                    name="iso_code"
                    value={form.iso_code}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.iso_code && styles.errorInput)
                    }}
                    placeholder="e.g., US (2-3 letters)"
                    maxLength="10"
                  />
                  {validationErrors.iso_code && (
                    <span style={styles.errorText}>{validationErrors.iso_code}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Currency *
                  </label>
                  <input
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.currency && styles.errorInput)
                    }}
                    placeholder="e.g., US Dollar"
                  />
                  {validationErrors.currency && (
                    <span style={styles.errorText}>{validationErrors.currency}</span>
                  )}
                </div>
                
                                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Region *
                  </label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    style={{
                      ...styles.formSelect,
                      ...(validationErrors.region && styles.errorInput)
                    }}
                  >
                    <option value="">Select a region</option>
                    {allRegions.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                  {validationErrors.region && (
                    <span style={styles.errorText}>{validationErrors.region}</span>
                  )}
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Status *
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={{
                      ...styles.formSelect,
                      ...(validationErrors.status && styles.errorInput)
                    }}
                  >
                    <option value="General">General</option>
                    <option value="Special">Special</option>
                    <option value="Column2">Column 2</option>
                  </select>
                  {validationErrors.status && (
                    <span style={styles.errorText}>{validationErrors.status}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Eligibility Criteria
                  </label>
                  <input
                    name="eligibility_criteria"
                    value={form.eligibility_criteria}
                    onChange={handleChange}
                    style={styles.formInput}
                    placeholder="e.g., FTA, GSP, IL, MFN"
                  />
                  <span style={{ ...styles.errorText, color: "#6c757d", fontSize: "11px" }}>
                    Optional field
                  </span>
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
                  onClick={saveCountry}
                  disabled={
                    !form.country_name?.trim() || 
                    !form.iso_code?.trim() || 
                    !form.currency?.trim() || 
                    !form.region?.trim()
                  }
                >
                  {editingId ? "Update Country" : "Add Country"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryDatabasePage;