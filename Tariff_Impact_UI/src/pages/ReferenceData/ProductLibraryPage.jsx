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

  useEffect(() => {
    const f = products.filter((p) =>
      `${p.hts_code} ${p.product}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, products]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm(p);
    setShowForm(true);
  };

  const saveProduct = async () => {
    editing ? await updateProduct(editing.id, form) : await createProduct(form);
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
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}> 📦 Product Library</h2>
       <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>
        Manage HS-based product master data
      </p>
      </div>

      {/* TOOLBAR */}
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
          <p style={{ padding: 12 }}>Loading...</p>
        ) : (
          <table style={styles.table}>
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "28%" }} /> {/* SPECIAL */}
              <col style={{ width: "18%" }} /> {/* COLUMN 2 */}
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead>
              <tr>
                <th style={styles.th}>HTS Code</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>General</th>
                <th style={styles.th}>Special</th>
                <th style={styles.th}>Column 2</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.hts_code}</td>
                  <td style={{ ...styles.td, textAlign: "left" }}>
                    {p.product}
                  </td>
                  <td style={styles.td}>{p.general_rate_of_duty}</td>
                  <td style={styles.td}>{p.special_rate_of_duty}</td>
                  <td style={styles.td}>{p.column2_rate_of_duty}</td>
                  <td style={styles.td}>
                    <div style={styles.actionCell}>
                      <button style={styles.iconBtn} onClick={() => openEdit(p)}>
                        ✏️
                      </button>
                      <button
                        style={styles.iconBtnDanger}
                        onClick={() => {
                          setEditing(p);
                          setShowDelete(true);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editing ? "Edit Product" : "Add Product"}</h3>

            {Object.keys(emptyForm).map((k) => (
              <input
                key={k}
                style={styles.input}
                placeholder={k.replaceAll("_", " ").toUpperCase()}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            ))}

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
  // remove horizontal padding so header can stretch
  page: {
    padding: 0,
    fontFamily: "Inter, system-ui",
    backgroundColor: "#f5f6fa",
    minHeight: "100vh",
  },

  // new container for inner content below the header
  content: {
    padding: "24px 32px",
  },


header: {
  background: "linear-gradient(90deg,#2563eb,#1e40af)",
  color: "#fff",
  padding: "20px 32px",
  borderRadius: "24px",
  margin: "16px 24px 24px 24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: 90,
},

   

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  search: {
    width: 850,
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
    tableLayout: "fixed",
  },

  th: {
    textAlign: "center",
    padding: 12,
    fontWeight: 600,
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    textAlign: "center",
    padding: 12,
    verticalAlign: "top",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },

  actionCell: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
  },

  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
    cursor: "pointer",
  },

  iconBtnDanger: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid #fecaca",
    background: "#fee2e2",
    cursor: "pointer",
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
  },

  dangerBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
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
    width: 420,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};

export default ProductLibraryPage;
