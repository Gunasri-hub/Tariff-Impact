// src/components/ProductLibraryPage.jsx
import { useEffect, useState, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
} from "../../Apis/authApi";

function ProductLibraryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "" });

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState(null);


  const [form, setForm] = useState({
    hts_code: "",
    product: "",
    general_rate_of_duty: "",
    special_rate_of_duty: "",
    column2_rate_of_duty: "",
  });
  const showSuccessToast = (message) => {
  setToast({ open: true, message });

  setTimeout(() => {
    setToast({ open: false, message: "" });
  }, 3000);
};


  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      const params = search.trim() ? { search: search.trim() } : {};
      const res = await getProducts(params);
      const allProducts = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.products || [];
      
      setProducts(allProducts);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Validate form function
  const validateForm = () => {
    const errors = {};
    
    if (!form.product?.trim()) {
      errors.product = "Product name is required";
    }
    
    if (!form.hts_code?.trim()) {
      errors.hts_code = "HS code is required";
    } else if (form.hts_code.length > 20) {
      errors.hts_code = "HS code is too long";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      hts_code: "",
      product: "",
      general_rate_of_duty: "",
      special_rate_of_duty: "",
      column2_rate_of_duty: "",
    });
    setValidationErrors({});
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      hts_code: p.hts_code || "",
      product: p.product || "",
      general_rate_of_duty: p.general_rate_of_duty || "",
      special_rate_of_duty: p.special_rate_of_duty || "",
      column2_rate_of_duty: p.column2_rate_of_duty || "",
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

  const saveProduct = async () => {
    if (!validateForm()) {
      alert("Please fix the validation errors before saving.");
      return;
    }

    const payload = {
      hts_code: form.hts_code.trim(),
      product: form.product.trim(),
      general_rate_of_duty: form.general_rate_of_duty.trim(),
      special_rate_of_duty: form.special_rate_of_duty.trim(),
      column2_rate_of_duty: form.column2_rate_of_duty.trim(),
    };

    try {
      if (editingId) {
  await updateProduct(editingId, payload);
  showSuccessToast("Product updated successfully");
} else {
  await createProduct(payload);
  showSuccessToast("Product added successfully");
}


      closeModal();
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert(err.response?.data?.message || "Failed to save product");
    }
  };

  const openDeleteProduct = (id) => {
  setDeleteId(id);
  setShowDeleteModal(true);
};

const confirmDeleteProduct = async () => {
  try {
    await deleteProductApi(deleteId);
    showSuccessToast("Product deleted successfully");
    fetchProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete product");
  } finally {
    setShowDeleteModal(false);
    setDeleteId(null);
  }
};


  // EXACT CountryDatabasePage STYLES
  const styles = {
    page: {
      padding: "0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
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
    htsCode: {
      backgroundColor: '#e9ecef', 
      padding: '2px 6px', 
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '11px',
      display: 'inline-block'
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
    }
  };

  return (
    <div style={styles.page}>
      {/* NEW HERO HEADER */}
      <div style={{ padding: "20px 0" }}>
        <section className="admin-hero">
          <h1>📦 Product & HTS Code Library</h1>
          <p>Manage tariff products and HS codes</p>
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
            placeholder="Search by product name or HS code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            style={styles.primaryBtn}
            onClick={startAdd}
          >
            <span>+</span> Add Product
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingText}>
            ⏳ Loading products...
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>HS Code</th>
                  <th style={styles.th}>General Rate</th>
                  <th style={styles.th}>Special Rate</th>
                  <th style={styles.th}>Column 2 Rate</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td style={{ ...styles.td, ...styles.noData }} colSpan={6}>
                      {search ? (
                        "🔍 No matching products found"
                      ) : (
                        "📭 No products in database"
                      )}
                    </td>
                  </tr>
                ) : (
                  products.map((p, index) => (
                    <tr 
                      key={p.id || index}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={styles.td}>
                        <div style={{ fontWeight: "500", color: "#1a1a1a", fontSize: "12px" }}>
                          {p.product}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <code style={styles.htsCode}>
                          {p.hts_code}
                        </code>
                      </td>
                      <td style={styles.td}>
                        {p.general_rate_of_duty || "—"}
                      </td>
                      <td style={styles.td}>
                        {p.special_rate_of_duty || "—"}
                      </td>
                      <td style={styles.td}>
                        {p.column2_rate_of_duty || "—"}
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={{ ...styles.iconBtn, color: "#007bff" }}
                          onClick={() => startEdit(p)}
                          title="Edit"
                        >
                          <span>✏️</span>
                        </button>
                        <button 
                          style={{ ...styles.iconBtn, color: "#dc3545" }}
                          onClick={() => openDeleteProduct(p.id)}

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

        {showDeleteModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2100
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        width: "420px",
        padding: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
      }}
    >
      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
        Delete Product
      </h3>

      <p style={{ marginTop: "10px", color: "#4b5563", fontSize: "14px" }}>
        Are you sure you want to delete this product?
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px"
        }}
      >
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          style={{
            background: "#f3f4f6",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteProduct}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer"
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


        {/* Add/Edit Modal - EXACT CountryDatabasePage Style */}
        {modalOpen && (
          <div style={styles.modalBackdrop} onClick={closeModal}>
            <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalHeaderH3}>
                  {editingId ? "Edit Product" : "Add New Product"}
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
                    Product Name *
                  </label>
                  <input
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.product && styles.errorInput)
                    }}
                    placeholder="e.g., Smartphones"
                  />
                  {validationErrors.product && (
                    <span style={styles.errorText}>{validationErrors.product}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    HS Code *
                  </label>
                  <input
                    name="hts_code"
                    value={form.hts_code}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.hts_code && styles.errorInput)
                    }}
                    placeholder="e.g., 8517.12"
                    maxLength="20"
                  />
                  {validationErrors.hts_code && (
                    <span style={styles.errorText}>{validationErrors.hts_code}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    General Rate (%)
                  </label>
                  <input
                    name="general_rate_of_duty"
                    value={form.general_rate_of_duty}
                    onChange={handleChange}
                    style={styles.formInput}
                    placeholder="e.g., 2.5"
                  />
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Special Rate (%)
                  </label>
                  <input
                    name="special_rate_of_duty"
                    value={form.special_rate_of_duty}
                    onChange={handleChange}
                    style={styles.formInput}
                    placeholder="e.g., 0"
                  />
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Column 2 Rate (%)
                  </label>
                  <input
                    name="column2_rate_of_duty"
                    value={form.column2_rate_of_duty}
                    onChange={handleChange}
                    style={styles.formInput}
                    placeholder="e.g., 20"
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
                  onClick={saveProduct}
                  disabled={
                    !form.product?.trim() || 
                    !form.hts_code?.trim()
                  }
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast.open && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#e6f4ea",
      color: "#1e4620",
      padding: "14px 22px",
      borderRadius: "10px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 3000,
      fontSize: "14.5px",
      fontWeight: 500
    }}
  >
    <span style={{ fontSize: "18px" }}>✔</span>
    <span>{toast.message}</span>

    <button
      onClick={() => setToast({ open: false, message: "" })}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "16px"
      }}
    >
      ✕
    </button>
  </div>
)}

    </div>
  );
}

export default ProductLibraryPage;