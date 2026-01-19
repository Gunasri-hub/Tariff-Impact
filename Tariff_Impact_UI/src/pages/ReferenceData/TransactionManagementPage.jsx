import { useEffect, useState } from "react";
import {
  getUserTransactions,
  deleteUserTransaction,
  getNextTransactionCode,
  updateUserTransaction,
  createUserTransaction 
} from "../../Apis/authApi";


function TransactionManagementPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // buyer | seller
  const [selectedData, setSelectedData] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [editForm, setEditForm] = useState(null);
const [filterType, setFilterType] = useState("");
const [filterStatus, setFilterStatus] = useState("");
const [filterMode, setFilterMode] = useState("");
const [isAdding, setIsAdding] = useState(false);




  /* ================= LOAD TRANSACTIONS ================= */
  useEffect(() => {
  loadTransactions();
}, [search]);


  const loadTransactions = async () => {
  try {
    setLoading(true);
    const res = await getUserTransactions(1, 100, search);

    console.log("✅ API RESPONSE:", res.data);

    setTransactions(res.data?.data || []);
  } catch (err) {
    console.error("❌ Failed to load transactions", err);
  } finally {
    setLoading(false);
  }
};

const openEditTransaction = (tx) => {
  setIsAdding(false);
  setEditForm({
    id: tx.id,

    transactionType: tx.transactionType,
    transactionDate: tx.transactionDate,
    status: tx.status,

    buyerId: tx.buyerId,
    buyerName: tx.buyerName,
    buyerType: tx.buyerType,
    buyerPhone: tx.buyerPhone,
    buyerEmail: tx.buyerEmail,
    buyerAddress: tx.buyerAddress,

    sellerId: tx.sellerId,
    sellerName: tx.sellerName,
    sellerType: tx.sellerType,
    sellerPhone: tx.sellerPhone,
    sellerEmail: tx.sellerEmail,
    sellerAddress: tx.sellerAddress,

    originCountry: tx.originCountry,
    originCurrency: tx.originCurrency,
    destinationCountry: tx.destinationCountry,
    destinationCurrency: tx.destinationCurrency,
    modeOfTransport: tx.modeOfTransport,

    mainCategory: tx.mainCategory,
    subCategory: tx.subCategory,
    htsCode: tx.htsCode
  });

  setShowEditModal(true);
};




  /* ================= BUYER / SELLER MODAL ================= */
  const openBuyer = (tx) => {
    setModalType("buyer");
    setSelectedData({
      id: tx.buyerId,
      name: tx.buyerName,
      type: tx.buyerType,
      phone: tx.buyerPhone,
      email: tx.buyerEmail,
      address: tx.buyerAddress
    });
    setShowModal(true);
  };

  const openSeller = (tx) => {
    setModalType("seller");
    setSelectedData({
      id: tx.sellerId,
      name: tx.sellerName,
      type: tx.sellerType,
      phone: tx.sellerPhone,
      email: tx.sellerEmail,
      address: tx.sellerAddress
    });
    setShowModal(true);
  };

  /* ================= SEARCH ================= */
  const filtered = transactions.filter(tx => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    !searchText ||
    [
      tx.transactionCode,
      tx.buyerName,
      tx.sellerName,
      tx.mainCategory,
      tx.subCategory,
      tx.htsCode
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchText);

  const matchesType = !filterType || tx.transactionType === filterType;
  const matchesStatus = !filterStatus || tx.status === filterStatus;
  const matchesMode = !filterMode || tx.modeOfTransport === filterMode;

  return matchesSearch && matchesType && matchesStatus && matchesMode;
});



  const splitValue = (val) =>
    val ? val.split(",").join(", ") : "-";

  /* ================= ADD NEW TRANSACTION ================= */
  const handleAddNew = async () => {
  try {
    const res = await getNextTransactionCode();

    setEditForm({
  transactionCode: res.data.transactionCode,
  transactionType: "Import",
  transactionDate: "",
  status: "Draft",

  // ✅ BUYER (REQUIRED)
  buyerId: "",
  buyerType: "INDIVIDUAL_IMPORTER",
  buyerName: "",
  buyerPhone: "",
  buyerEmail: "",
  buyerAddress: "",

  // ✅ SELLER (REQUIRED)
  sellerId: "",
  sellerType: "EXPORTER",
  sellerName: "",
  sellerPhone: "",
  sellerEmail: "",
  sellerAddress: "",

  originCountry: "",
  originCurrency: "",
  destinationCountry: "",
  destinationCurrency: "",
  modeOfTransport: "",

  mainCategory: "",
  subCategory: "",
  htsCode: ""
});


    setIsAdding(true);
    setShowEditModal(true);
  } catch (err) {
    console.error("Failed to get next transaction code", err);
  }
};


  /* ================= DELETE TRANSACTION ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      await deleteUserTransaction(id);
      loadTransactions();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete transaction");
    }
  };

  const handleSaveTransaction = async () => {
  try {
    if (isAdding) {
      // 🔹 CREATE
      await createUserTransaction(editForm);
    } else {
      // 🔹 UPDATE
      await updateUserTransaction(editForm.id, editForm);
    }

    setShowEditModal(false);
    setIsAdding(false);
    loadTransactions();
  } catch (err) {
    console.error("Save failed", err);
    alert("Failed to save transaction");
  }
};



  /* ================= STYLES (UNCHANGED) ================= */
  const styles = {
    page: {  background: "#f8f9fa", minHeight: "100vh" },
    header: {
  background: "linear-gradient(90deg,#1E51DB,#225CE4)",
  borderRadius: "20px",
  padding: "15px",
  color: "#fff",
  marginBottom: "28px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.18)"
},
    searchBox: {
      background: "#fff",
      padding: "16px",
      borderRadius: "12px",
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "20px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
    },
    tableWrap: {
      background: "#fff",
      borderRadius: "12px",
      overflowX: "auto",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
    },
    th: {
      padding: "12px",
      fontSize: "12px",
      fontWeight: 600,
      textAlign: "left",
      background: "#f1f3f5",
      borderBottom: "1px solid #ddd",
      whiteSpace: "nowrap"
    },
    td: {
      padding: "10px",
      fontSize: "13px",
      borderBottom: "1px solid #eee",
      whiteSpace: "nowrap"
    },
    badgeImport: {
      background: "#d4edda",
      color: "#155724",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: 600
    },
    badgeExport: {
      background: "#cce5ff",
      color: "#004085",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: 600
    }

    
  };
  const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px"
};


  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
  <h2
    style={{
      margin: 0,
      fontSize: "26px",
      fontWeight: 600,
      letterSpacing: "-0.3px"
    }}
  >
    👥Transaction Data Management
  </h2>

  <p
    style={{
      marginTop: "8px",
      fontSize: "14.5px",
      opacity: 0.95
    }}
  >
    Comprehensive multi-country trade transaction tracking and analytics
  </p>
</div>


      {/* SEARCH + ADD */}
      {/* SEARCH + FILTERS + ADD */}
<div style={{ ...styles.searchBox, flexWrap: "wrap" }}>

  {/* Search */}
  <input
    placeholder="Search by Transaction ID, Buyer, Seller, Category or HS Code..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ flex: "1 1 260px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd" }}
  />

  {/* Type Filter */}
  <select
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
  >
    <option value="">All Types</option>
    <option value="Import">Import</option>
    <option value="Export">Export</option>
  </select>

  {/* Status Filter */}
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
  >
    <option value="">All Status</option>
    <option value="Draft">Draft</option>
    <option value="Completed">Completed</option>
  </select>

  {/* Mode Filter */}
  <select
    value={filterMode}
    onChange={(e) => setFilterMode(e.target.value)}
    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
  >
    <option value="">All Modes</option>
    <option value="Air">Air</option>
    <option value="Sea">Sea</option>
    <option value="Road">Road</option>
  </select>

  {/* Add Button */}
  <button
    onClick={handleAddNew}
    style={{
      background: "#0d6efd",
      color: "#fff",
      border: "none",
      borderRadius: "999px",
      padding: "10px 18px",
      cursor: "pointer"
    }}
  >
    + Add New Transaction
  </button>
</div>


      {/* TABLE */}
      <div style={styles.tableWrap}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading transactions...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
  <tr>
    {[
      "ID",
      "Buyer",
      "Seller",
      "Type",
      "Transaction Date",
      "Status",
      "Origin",
      "Origin Currency",
      "Destination",
      "Dest. Currency",
      "Mode",
      "Main Category",
      "Sub Category",
      "HTS Code",
      "Actions"
    ].map(h => (
      <th key={h} style={styles.th}>{h}</th>
    ))}
  </tr>
</thead>


            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ padding: "30px", textAlign: "center" }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ ...styles.td, color: "#0d6efd", fontWeight: 600 }}>
                      {tx.transactionCode}
                    </td>

                    <td style={styles.td}>
                      <span style={{ color: "#0d6efd", cursor: "pointer" }} onClick={() => openBuyer(tx)}>
                        {tx.buyerName}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {tx.sellerName ? (
                        <span style={{ color: "#0d6efd", cursor: "pointer" }} onClick={() => openSeller(tx)}>
                          {tx.sellerName}
                        </span>
                      ) : "-"}
                    </td>

                    <td style={styles.td}>
                      <span style={tx.transactionType === "Import" ? styles.badgeImport : styles.badgeExport}>
                        {tx.transactionType}
                      </span>
                    </td>

                    {/* ✅ Transaction Date */}
<td style={styles.td}>
  {tx.transactionDate || "-"}
</td>



{/* ✅ Status */}
<td style={styles.td}>
  <span
    style={{
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: 600,
      background:
        tx.status === "Completed" ? "#d4edda" :
        tx.status === "Draft" ? "#fff3cd" : "#e2e3e5",
      color: "#000"
    }}
  >
    {tx.status}
  </span>
</td>

                    <td style={styles.td}>{tx.originCountry}</td>
                    <td style={styles.td}>{tx.originCurrency}</td>
                    <td style={styles.td}>{tx.destinationCountry}</td>
                    <td style={styles.td}>{tx.destinationCurrency}</td>
                    <td style={styles.td}>{tx.modeOfTransport}</td>
                    <td style={styles.td}>{splitValue(tx.mainCategory)}</td>
                    <td style={styles.td}>{splitValue(tx.subCategory)}</td>
                    <td style={styles.td}>{splitValue(tx.htsCode)}</td>

                    {/* ACTIONS */}
                    <td style={styles.td}>
                      <button
  style={{ border: "none", background: "none", cursor: "pointer" }}
  onClick={() => openEditTransaction(tx)}
>
  ✏️
</button>

                      <button
                        style={{ border: "none", background: "none" }}
                        onClick={() => handleDelete(tx.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

     
      {/* 🔹 BUYER / SELLER DETAILS MODAL */}

      {/* 🔹 BUYER / SELLER DETAILS MODAL */}
{showModal && selectedData && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1300 // ⬅ higher than edit modal
    }}
  >
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        width: "460px",
        padding: "26px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px"
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
          {modalType === "buyer" ? "👤 Buyer Details" : "🏭 Seller Details"}
        </h3>

        <button
          onClick={() => setShowModal(false)}
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "8px",
            padding: "6px 10px",
            cursor: "pointer"
          }}
        >
          ✕
        </button>
      </div>

      {/* CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          rowGap: "12px",
          fontSize: "14px"
        }}
      >
        <span style={{ color: "#64748b" }}>ID</span>
        <span>{selectedData.id || "-"}</span>

        <span style={{ color: "#64748b" }}>Name</span>
        <span>{selectedData.name}</span>

        <span style={{ color: "#64748b" }}>Type</span>
        <span>{selectedData.type || "-"}</span>

        <span style={{ color: "#64748b" }}>Phone</span>
        <span>{selectedData.phone || "-"}</span>

        <span style={{ color: "#64748b" }}>Email</span>
        <span>{selectedData.email || "-"}</span>

        <span style={{ color: "#64748b" }}>Address</span>
        <span style={{ lineHeight: "1.5" }}>
          {selectedData.address || "-"}
        </span>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "right", marginTop: "22px" }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            background: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "8px 18px",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* ✏️ EDIT TRANSACTION MODAL */}
{showEditModal && editForm && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1200
  }}>
    <div style={{
      background: "#fff",
      borderRadius: "18px",
      width: "700px",
      maxHeight: "90vh",
      overflowY: "auto",
      padding: "26px",
      boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
    }}>

      <h3 style={{ marginBottom: "16px" }}>
  {isAdding ? "➕ Add Transaction" : "✏️ Edit Transaction"}
</h3>


      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

        {/* Transaction */}
        <select style={inputStyle}
          value={editForm.transactionType}
          onChange={e => setEditForm({ ...editForm, transactionType: e.target.value })}
        >
          <option>Import</option>
          <option>Export</option>
        </select>

        <input style={inputStyle}
          value={editForm.transactionDate}
          onChange={e => setEditForm({ ...editForm, transactionDate: e.target.value })}
          placeholder="Transaction Date (dd/mm/yyyy)"
        />

        <select style={inputStyle}
          value={editForm.status}
          onChange={e => setEditForm({ ...editForm, status: e.target.value })}
        >
          <option>Draft</option>
          <option>Completed</option>
        </select>

        <input style={inputStyle}
          value={editForm.modeOfTransport}
          onChange={e => setEditForm({ ...editForm, modeOfTransport: e.target.value })}
          placeholder="Mode of Transport"
        />

        {/* Buyer */}

        <input
  style={inputStyle}
  value={editForm.buyerId}
  onChange={e => setEditForm({ ...editForm, buyerId: e.target.value })}
  placeholder="Buyer ID"
/>

{/* Buyer Type */}
<select
  style={inputStyle}
  value={editForm.buyerType}
  onChange={e => setEditForm({ ...editForm, buyerType: e.target.value })}
>
  <option value="INDIVIDUAL_IMPORTER">Individual Importer</option>
  <option value="CORPORATE_IMPORTER">Corporate Importer</option>
  <option value="DISTRIBUTOR">Distributor</option>
  <option value="RETAIL_IMPORTER">Retail Importer</option>
  <option value="WHOLESALE_IMPORTER">Wholesale Importer</option>
  <option value="GOVERNMENT_IMPORTER">Government Importer</option>
</select>

        <input style={inputStyle} value={editForm.buyerName}
          onChange={e => setEditForm({ ...editForm, buyerName: e.target.value })}
          placeholder="Buyer Name"
        />

        <input style={inputStyle} value={editForm.buyerPhone}
          onChange={e => setEditForm({ ...editForm, buyerPhone: e.target.value })}
          placeholder="Buyer Phone"
        />

        <input style={inputStyle} value={editForm.buyerEmail}
          onChange={e => setEditForm({ ...editForm, buyerEmail: e.target.value })}
          placeholder="Buyer Email"
        />

        <input style={inputStyle} value={editForm.buyerAddress}
          onChange={e => setEditForm({ ...editForm, buyerAddress: e.target.value })}
          placeholder="Buyer Address"
        />

        {/* Seller */}

        <input
  style={inputStyle}
  value={editForm.sellerId}
  onChange={e => setEditForm({ ...editForm, sellerId: e.target.value })}
  placeholder="Seller ID"
/>

{/* Seller Type */}
<select
  style={inputStyle}
  value={editForm.sellerType}
  onChange={e => setEditForm({ ...editForm, sellerType: e.target.value })}
>
  <option value="FOREIGN_MANUFACTURER">Foreign Manufacturer</option>
  <option value="EXPORTER">Exporter</option>
  <option value="TRADING_COMPANY">Trading Company</option>
  <option value="OEM_SUPPLIER">OEM Supplier</option>
  <option value="RAW_MATERIAL_SUPPLIER">Raw Material Supplier</option>
</select>

        <input style={inputStyle} value={editForm.sellerName}
          onChange={e => setEditForm({ ...editForm, sellerName: e.target.value })}
          placeholder="Seller Name"
        />

        <input style={inputStyle} value={editForm.sellerPhone}
          onChange={e => setEditForm({ ...editForm, sellerPhone: e.target.value })}
          placeholder="Seller Phone"
        />

        <input style={inputStyle} value={editForm.sellerEmail}
          onChange={e => setEditForm({ ...editForm, sellerEmail: e.target.value })}
          placeholder="Seller Email"
        />

        <input style={inputStyle} value={editForm.sellerAddress}
          onChange={e => setEditForm({ ...editForm, sellerAddress: e.target.value })}
          placeholder="Seller Address"
        />

        {/* Trade */}
        <input style={inputStyle} value={editForm.originCountry}
          onChange={e => setEditForm({ ...editForm, originCountry: e.target.value })}
          placeholder="Origin Country"
        />

        <input style={inputStyle} value={editForm.originCurrency}
          onChange={e => setEditForm({ ...editForm, originCurrency: e.target.value })}
          placeholder="Origin Currency"
        />

        <input style={inputStyle} value={editForm.destinationCountry}
          onChange={e => setEditForm({ ...editForm, destinationCountry: e.target.value })}
          placeholder="Destination Country"
        />

        <input style={inputStyle} value={editForm.destinationCurrency}
          onChange={e => setEditForm({ ...editForm, destinationCurrency: e.target.value })}
          placeholder="Destination Currency"
        />

        <input style={inputStyle} value={editForm.mainCategory}
          onChange={e => setEditForm({ ...editForm, mainCategory: e.target.value })}
          placeholder="Main Category"
        />

        <input style={inputStyle} value={editForm.subCategory}
          onChange={e => setEditForm({ ...editForm, subCategory: e.target.value })}
          placeholder="Sub Category"
        />

        <input style={inputStyle} value={editForm.htsCode}
          onChange={e => setEditForm({ ...editForm, htsCode: e.target.value })}
          placeholder="HTS Code"
        />
      </div>

      {/* Footer */}
      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button onClick={() => setShowEditModal(false)} style={{ marginRight: "10px" }}>
          Cancel
        </button>

        <button
  onClick={handleSaveTransaction}
  style={{
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 18px",
    cursor: "pointer"
  }}
>
  {isAdding ? "Create Transaction" : "Update Transaction"}
</button>

      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default TransactionManagementPage;
