import React, { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../Apis/authApi";

const emptyForm = {
  hts_code: "",
  product: "",
  general_rate_of_duty: "",
  special_rate_of_duty: "",
  column2_rate_of_duty: "",
};

function ProductLibraryPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  /* ================= LOAD ================= */
  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const f = products.filter((p) =>
      `${p.hts_code} ${p.product}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, products]);

  /* ================= HANDLERS ================= */
  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      hts_code: p.hts_code,
      product: p.product,
      general_rate_of_duty: p.general_rate_of_duty,
      special_rate_of_duty: p.special_rate_of_duty,
      column2_rate_of_duty: p.column2_rate_of_duty,
    });
    setShowForm(true);
  };

  const saveProduct = async () => {
    if (editing) {
      await updateProduct(editing.id, form);
    } else {
      await createProduct(form);
    }
    setShowForm(false);
    loadProducts();
  };

  const confirmDelete = async () => {
    await deleteProduct(editing.id);
    setShowDelete(false);
    loadProducts();
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2>Product Library</h2>
          <p>Manage HS-based product master data</p>
        </div>
      </div>

      {/* SEARCH + ADD PRODUCT (STRAIGHT LINE) */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Search HTS or Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={styles.primaryBtn} onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>HTS Code</th>
                <th>Product</th>
                <th>General</th>
                <th>Special</th>
                <th>Column 2</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.hts_code}</td>
                  <td>{p.product}</td>
                  <td>{p.general_rate_of_duty}</td>
                  <td>{p.special_rate_of_duty}</td>
                  <td>{p.column2_rate_of_duty}</td>
                  <td>
                    <button
                      style={styles.iconBtn}
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.iconBtnDanger}
                      onClick={() => {
                        setEditing(p);
                        setShowDelete(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT MODAL (RECTANGULAR) */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editing ? "Edit Product" : "Add Product"}</h3>

            <div style={styles.formGrid}>
              <input
                placeholder="HTS Code"
                value={form.hts_code}
                onChange={(e) =>
                  setForm({ ...form, hts_code: e.target.value })
                }
              />
              <input
                placeholder="Product"
                value={form.product}
                onChange={(e) =>
                  setForm({ ...form, product: e.target.value })
                }
              />
              <input
                placeholder="General Rate"
                value={form.general_rate_of_duty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    general_rate_of_duty: e.target.value,
                  })
                }
              />
              <input
                placeholder="Special Rate"
                value={form.special_rate_of_duty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    special_rate_of_duty: e.target.value,
                  })
                }
              />
              <input
                placeholder="Column 2 Rate"
                value={form.column2_rate_of_duty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    column2_rate_of_duty: e.target.value,
                  })
                }
              />
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setShowForm(false)}>Cancel</button>
              <button style={styles.primaryBtn} onClick={saveProduct}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDelete && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowDelete(false)}>Cancel</button>
              <button style={styles.dangerBtn} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { padding: 24, fontFamily: "Inter, system-ui" },

  header: {
    background: "linear-gradient(90deg,#2563eb,#1e40af)",
    color: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  search: {
    width: 320,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,.05)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },

  dangerBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
  },

  iconBtn: {
    marginRight: 8,
    background: "#e5edff",
    border: "1px solid #c7d2fe",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },

  iconBtnDanger: {
    background: "#fee2e2",
    border: "1px solid #fecaca",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    width: 520,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 20,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};

export default ProductLibraryPage;
