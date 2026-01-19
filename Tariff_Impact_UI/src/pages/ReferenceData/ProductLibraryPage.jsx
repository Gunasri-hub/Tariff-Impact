// src/components/ProductLibraryPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../Apis/authApi";

const EMPTY_FORM = {
  hts_code: "",
  product: "",
  general_rate_of_duty: "",
  special_rate_of_duty: "",
  column2_rate_of_duty: "",
};

function ProductLibraryPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  

  /* =========================
     LOAD DATA
  ========================= */
  const loadProducts = useCallback(async (searchText = "") => {
    setLoading(true);
    try {
      console.log("Loading products with search:", searchText); // Debug log
      const params = searchText ? { search: searchText.trim() } : {};
      const res = await getProducts(params);
      console.log("API Response:", res); // Debug full response
      const dataArray = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.products || [];
      setProducts(dataArray);
      setTotal(res.data?.total || res.data?.count || dataArray.length || 0);
    } catch (err) {
      console.error("Load products error:", err.response?.data || err); // Better logging
      alert(
        err.response?.data?.message ||
        `Request failed (${err.response?.status})` ||
        "Failed to load products - check console for details"
      );
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* =========================
     FORM HANDLERS
  ========================= */
  const openCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (p) => {
    setIsEdit(true);
    setEditingId(p.id);
    setForm({
      hts_code: p.hts_code || "",
      product: p.product || "",
      general_rate_of_duty: p.general_rate_of_duty || "",
      special_rate_of_duty: p.special_rate_of_duty || "",
      column2_rate_of_duty: p.column2_rate_of_duty || "",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      hts_code: form.hts_code,
      product: form.product,
      general_rate_of_duty: form.general_rate_of_duty,
      special_rate_of_duty: form.special_rate_of_duty,
      column2_rate_of_duty: form.column2_rate_of_duty,
    };

    try {
      if (isEdit && editingId) {
        await updateProduct(editingId, payload);
        alert("✅ Product updated successfully!");
      } else {
        await createProduct(payload);
        alert("✅ Product created successfully!");
      }
      await loadProducts(search.trim());
      closeForm();
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete?.id) return;

    try {
      await deleteProduct(productToDelete.id);
      alert("✅ Product deleted successfully!");
      await loadProducts(search.trim());
      closeDeleteConfirm();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const openDeleteConfirm = (p) => {
    setProductToDelete(p);
    setIsDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteOpen(false);
    setProductToDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts(search.trim());
  };

  return (
    <div className="admin-layout">

       <style>{`
    /* ---------- Product Library layout ---------- */

    .dashboard {
      min-height: 100vh;
      display: flex;
      background: #f5f7fb;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
    }

    .sidebar .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      padding: 0 4px;
    }

    .sidebar-logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: #1d4ed8;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .sidebar-brand-title {
      font-size: 17px;
      font-weight: 600;
      color: #111827;
    }

    .dashboard .main {
      flex: 1;
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: none;
    }

    .dashboard .main .card {
      width: 100%;
      max-width: none;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .topbar-breadcrumb {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .topbar-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #111827;
    }

    .metric-value {
      font-size: 14px;
    }

    .metric-value.text-green {
      color: #16a34a;
    }

    .metric-value.text-orange {
      color: #f59e0b;
    }

    /* ===== Product Library full-width content ===== */

   .admin-main-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}


    .admin-main-inner .card {
      width: 100%;
      padding: 20px 24px 16px;
    }
      
  `}</style>
      

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-main-inner">
          <section className="admin-hero">
            <div>
              <h1>Product &amp; HTS Code Library</h1>
              <p>Browse, add, and manage tariff products and HS codes.</p>
            </div>
          </section>

          <section className="card">
            <div className="card-toolbar">
              <form className="card-search-group" onSubmit={handleSearchSubmit}>
                <input
                  className="input"
                  type="text"
                  placeholder="Search by product name or HS code..."
                  value={search}
                  onChange={handleSearchChange}
                />
                <button className="primary-button small" type="submit">
                  Search
                </button>
              </form>

              <div className="card-right-group">
                <button className="primary-button" type="button" onClick={openCreate}>
                  + Add Product
                </button>
                <span className="card-total-pill">Total: {total} products</span>
              </div>
            </div>

            {loading ? (
              <p>Loading products...</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>HS Code</th>
                      <th>General Rate</th>
                      <th>Special Rate</th>
                      <th>Column 2 Rate</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.product}</td>
                        <td className="tag tag-soft">{p.hts_code}</td>
                        <td>{p.general_rate_of_duty || "—"}</td>
                        <td>{p.special_rate_of_duty || "—"}</td>
                        <td>{p.column2_rate_of_duty || "—"}</td>
                        <td>
                          <button
                            className="icon-button edit-icon"
                            type="button"
                            onClick={() => openEdit(p)}
                            aria-label="Edit product"
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-button delete-icon"
                            type="button"
                            onClick={() => openDeleteConfirm(p)}
                            aria-label="Delete product"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && !loading && (
                      <tr>
                        <td colSpan={6} className="empty-row">
                          No products match this search. Try adding one!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Modals - unchanged */}
        {isFormOpen && (
          <div className="side-modal-backdrop" onClick={closeForm}>
            <div className="side-modal" onClick={(e) => e.stopPropagation()}>
              <header className="side-modal-header">
                <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>
                <button className="icon-button" type="button" onClick={closeForm}>
                  ✕
                </button>
              </header>

              <form className="side-modal-body" onSubmit={handleSubmit}>
                <div className="field-row">
                  <label className="field">
                    <span className="field-label">Product Name *</span>
                    <input
                      name="product"
                      value={form.product}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">HS Code *</span>
                    <input
                      name="hts_code"
                      value={form.hts_code}
                      onChange={handleChange}
                      placeholder="e.g., 8517.12"
                      required
                    />
                  </label>
                </div>

                <div className="field">
                  <span className="field-label">Duty Rates (%)</span>
                  <div className="duty-grid">
                    <div>
                      <span className="field-label">General</span>
                      <input
                        name="general_rate_of_duty"
                        value={form.general_rate_of_duty}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <span className="field-label">Special</span>
                      <input
                        name="special_rate_of_duty"
                        value={form.special_rate_of_duty}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <span className="field-label">Column 2</span>
                      <input
                        name="column2_rate_of_duty"
                        value={form.column2_rate_of_duty}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="side-modal-footer">
                  <button type="button" className="ghost-button" onClick={closeForm}>
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    {isEdit ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteOpen && (
          <div className="confirm-backdrop" onClick={closeDeleteConfirm}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Product</h3>
              <p>
                Are you sure you want to delete "{productToDelete?.product}"? This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button type="button" className="ghost-button" onClick={closeDeleteConfirm}>
                  Cancel
                </button>
                <button type="button" className="primary-button danger" onClick={handleConfirmDelete}>
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductLibraryPage;