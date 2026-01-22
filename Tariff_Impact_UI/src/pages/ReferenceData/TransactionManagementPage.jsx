import { useEffect, useState } from "react";
import {
  getUserTransactions,
  deleteUserTransaction,
  getNextTransactionCode,
  updateUserTransaction,
  createUserTransaction,
  getTransactionDropdowns,
  getCountriesList,
  getCurrenciesList,
  getProducts,
   getAllBuyers,
  getAllSellers
} from "../../Apis/authApi";

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label
      style={{
        fontSize: "12px",
        fontWeight: 600,
        color: "#374151"
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

// Convert yyyy-mm-dd → dd/mm/yyyy
const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr; // already formatted
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

// Convert dd/mm/yyyy → dd/mm/yyyy (validation-safe)
const normalizeDDMMYYYY = (value) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(value) ? value : value;
};

// dd/mm/yyyy → yyyy-mm-dd
const toISODate = (ddmmyyyy) => {
  if (!ddmmyyyy) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
};






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
const [countries, setCountries] = useState([]);
const [countryCurrencyMap, setCountryCurrencyMap] = useState({});
const [products, setProducts] = useState([]);
const [buyers, setBuyers] = useState([]);
const [sellers, setSellers] = useState([]);
const [toast, setToast] = useState({
  open: false,
  message: "",
});
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState(null);









  /* ================= LOAD TRANSACTIONS ================= */
  useEffect(() => {
  loadTransactions();
}, [search]);

useEffect(() => {
  loadCountriesAndCurrencies();
   loadAllProducts();
    loadBuyers();
  loadSellers();
}, []);




const loadCountriesAndCurrencies = async () => {
  try {
    const [countriesRes, currenciesRes] = await Promise.all([
      getCountriesList(),
      getCurrenciesList()
    ]);

    console.log("COUNTRIES API 👉", countriesRes.data);
    console.log("CURRENCIES API 👉", currenciesRes.data);

    const countryRows = countriesRes.data?.data || countriesRes.data || [];
    const currencyRows = currenciesRes.data?.data || currenciesRes.data || [];

    const countrySet = new Set();
    const map = {};

    countryRows.forEach(c => {
      const name = c.name || c.countryName || c.country;
      if (!name) return;

      const country = name.trim().toUpperCase();
      countrySet.add(country);
      map[country] = [];
    });

    currencyRows.forEach(cur => {
      const country =
        cur.country ||
        cur.countryName;

      const code =
        cur.currencyCode ||
        cur.code;

      if (!country || !code) return;

      const c = country.trim().toUpperCase();

      if (!map[c]) map[c] = [];

      map[c].push({
        code,
        currency: code
      });
    });

    setCountries([...countrySet]);
    setCountryCurrencyMap(map);
  } catch (err) {
    console.error("❌ Failed to load country & currency lists", err);
  }
};
const loadAllProducts = async () => {
  try {
    let page = 1;
    const limit = 200;
    let all = [];

    while (true) {
      const res = await getProducts({ page, limit });

      console.log("PRODUCT API RESPONSE 👉", res.data); // ✅ ADD THIS

      const rows =
        res.data?.data ||
        res.data?.rows ||     // 🔥 IMPORTANT
        res.data || [];

      all = [...all, ...rows];

      if (!res.data?.totalPages || page >= res.data.totalPages) break;
      page++;
    }

    console.log("TOTAL PRODUCTS LOADED 👉", all.length); // ✅ ADD THIS
    setProducts(all);
  } catch (err) {
    console.error("Failed to load products", err);
  }
};


const loadBuyers = async () => {
  try {
    const res = await getAllBuyers();
    const list = res.data?.data || res.data || [];
    setBuyers(list);
  } catch (err) {
    console.error("Failed to load buyers", err);
  }
};

const loadSellers = async () => {
  try {
    const res = await getAllSellers();
    const list = res.data?.data || res.data || [];
    setSellers(list);
  } catch (err) {
    console.error("Failed to load sellers", err);
  }
};


const normalize = v =>
  v?.toString().replace(/\s+/g, " ").replace(/:+$/, "").trim();

const mainCategories = Array.from(
  new Set(
    products
      .map(p =>
        normalize(
          p.main_category ||
          p.mainCategory ||     // ✅ ADD
          p.maincategory
        )
      )
      .filter(Boolean)
  )
);

const getSubCategories = (mainCategory) =>
  Array.from(
    new Set(
      products
        .filter(p =>
          normalize(
            p.main_category ||
            p.mainCategory
          ) === normalize(mainCategory)
        )
        .map(p =>
          normalize(
            p.subcategory ||
            p.subCategory        // ✅ ADD
          )
        )
        .filter(Boolean)
    )
  );

const getHtsCodes = (mainCategory, subCategory) =>
  Array.from(
    new Set(
      products
        .filter(
          p =>
            normalize(
              p.main_category ||
              p.mainCategory
            ) === normalize(mainCategory) &&
            normalize(
              p.subcategory ||
              p.subCategory
            ) === normalize(subCategory)
        )
        .map(p =>
          p.hts_code ||
          p.htsCode             // ✅ ADD
        )
        .filter(Boolean)
    )
  );

  const showSuccessToast = (message) => {
  setToast({ open: true, message });

  setTimeout(() => {
    setToast({ open: false, message: "" });
  }, 3000); // auto close in 3s
};








useEffect(() => {
  if (!editForm) return;
  if (!countries.length) return;

  // Re-sync origin & destination country after dropdown loads
  setEditForm(prev => ({
    ...prev,
    originCountry: prev.originCountry || "",
    destinationCountry: prev.destinationCountry || ""
  }));
}, [countries]);





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
    transactionDate: formatDateToDDMMYYYY(tx.transactionDate),

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

    originCountry: tx.originCountry?.trim().toUpperCase() || "",
    originCurrency: tx.originCurrency,
    destinationCountry: tx.destinationCountry?.trim().toUpperCase() || "",
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
  const handleDelete = async () => {
  try {
    await deleteUserTransaction(deleteId);

    setShowDeleteModal(false);
    setDeleteId(null);

    loadTransactions();
    showSuccessToast("Transaction deleted successfully");
  } catch (err) {
    console.error("Delete failed", err);
    alert("Failed to delete transaction");
  }
};


  const handleSaveTransaction = async () => {
  try {
    // ✅ BUILD CLEAN PAYLOAD (BACKEND SAFE)
    const payload = {
      transactionCode: editForm.transactionCode,
      transactionType: editForm.transactionType,
      transactionDate: toISODate(editForm.transactionDate),
      status: editForm.status,

      buyerId: editForm.buyerId,
      buyerName: editForm.buyerName,
      buyerType: editForm.buyerType,
      buyerPhone: editForm.buyerPhone,
      buyerEmail: editForm.buyerEmail,
      buyerAddress: editForm.buyerAddress,

      sellerId: editForm.sellerId,
      sellerName: editForm.sellerName,
      sellerType: editForm.sellerType,
      sellerPhone: editForm.sellerPhone,
      sellerEmail: editForm.sellerEmail,
      sellerAddress: editForm.sellerAddress,

      originCountry: editForm.originCountry,
      originCurrency: editForm.originCurrency,
      destinationCountry: editForm.destinationCountry,
      destinationCurrency: editForm.destinationCurrency,
      modeOfTransport: editForm.modeOfTransport,

      // ✅ IMPORTANT: SEND CODES ONLY
      mainCategory: editForm.mainCategory,
      subCategory: editForm.subCategory,
      htsCode: editForm.htsCode
    };

    console.log("🚀 CREATE PAYLOAD 👉", payload);

    if (isAdding) {
  await createUserTransaction(payload);
  showSuccessToast("Transaction created successfully");
} else {
  await updateUserTransaction(editForm.id, payload);
  showSuccessToast("Transaction updated successfully");
}

setShowEditModal(false);
setIsAdding(false);
setEditForm(null);
loadTransactions();


  } catch (err) {
    console.error("❌ Save failed", err?.response?.data || err);
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
    💳Transaction Management
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
                    <td style={styles.td}>
  <span
    style={{
      background: "#dcfce7",
      color: "#166534",
      padding: "4px 10px",
      borderRadius: "999px",
      fontWeight: 600,
      fontSize: "12px"
    }}
  >
    {tx.transactionCode}
  </span>
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
  {formatDateToDDMMYYYY(tx.transactionDate) || "-"}
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
  style={{ border: "none", background: "none", cursor: "pointer" }}
  onClick={() => {
    setDeleteId(tx.id);
    setShowDeleteModal(true);
  }}
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
        <Field label="Transaction Type">
  <select
    style={inputStyle}
    value={editForm.transactionType}
    onChange={e =>
      setEditForm({ ...editForm, transactionType: e.target.value })
    }
  >
    <option>Import</option>
    <option>Export</option>
  </select>
</Field>


          
        

        <Field label="Transaction Date">
  <input
    style={inputStyle}
    placeholder="dd/mm/yyyy"
    value={editForm.transactionDate || ""}
    onChange={e =>
      setEditForm({
        ...editForm,
        transactionDate: e.target.value
      })
    }
  />
</Field>



        <Field label="Status">
  <select
    style={inputStyle}
    value={editForm.status}
    onChange={e =>
      setEditForm({ ...editForm, status: e.target.value })
    }
  >
    <option>Draft</option>
    <option>Completed</option>
  </select>
</Field>

<Field label="Mode of Transport">
  <select
    style={inputStyle}
    value={editForm.modeOfTransport}
    onChange={e =>
      setEditForm({ ...editForm, modeOfTransport: e.target.value })
    }
  >
    <option value="">Select Mode</option>
    <option value="Air">Air</option>
    <option value="Sea">Sea</option>
    <option value="Road">Road</option>
  </select>
</Field>



        {/* Buyer */}

        <Field label="Buyer ID">
  <select
    style={inputStyle}
    value={editForm.buyerId}
    onChange={(e) => {
      const b = buyers.find(x => x.buyer_id === e.target.value);
      if (!b) return;

      setEditForm({
        ...editForm,
        buyerId: b.buyer_id,
        buyerName: b.name,
        buyerType: b.type,
        buyerPhone: b.phone_number,
        buyerEmail: b.email_id,
        buyerAddress: b.address
      });
    }}
  >
    <option value="">Select Buyer</option>
    {buyers.map(b => (
      <option key={b.buyer_id} value={b.buyer_id}>
        {b.buyer_id}
      </option>
    ))}
  </select>
</Field>



{/* Buyer Type */}
<Field label="Buyer Type">
  <select
    style={inputStyle}
    value={editForm.buyerType}
    disabled     // ✅ LOCK IT
  >

  <option value="INDIVIDUAL_IMPORTER">Individual Importer</option>
  <option value="CORPORATE_IMPORTER">Corporate Importer</option>
  <option value="DISTRIBUTOR">Distributor</option>
  <option value="RETAIL_IMPORTER">Retail Importer</option>
  <option value="WHOLESALE_IMPORTER">Wholesale Importer</option>
  <option value="GOVERNMENT_IMPORTER">Government Importer</option>
</select>
</Field>

        <Field label="Buyer Name">
  <input style={inputStyle} value={editForm.buyerName} readOnly />
</Field>

<Field label="Buyer Phone">
  <input style={inputStyle} value={editForm.buyerPhone} readOnly />
</Field>

<Field label="Buyer Email">
  <input style={inputStyle} value={editForm.buyerEmail} readOnly />
</Field>

<Field label="Buyer Address">
  <input style={inputStyle} value={editForm.buyerAddress} readOnly />
</Field>



        {/* Seller */}

       <Field label="Seller ID">
  <select
    style={inputStyle}
    value={editForm.sellerId}
    onChange={(e) => {
      const s = sellers.find(x => x.seller_id === e.target.value);
      if (!s) return;

      setEditForm({
        ...editForm,
        sellerId: s.seller_id,
        sellerName: s.name,
        sellerType: s.type,
        sellerPhone: s.phone,
        sellerEmail: s.email,
        sellerAddress: s.address
      });
    }}
  >
    <option value="">Select Seller</option>
    {sellers.map(s => (
      <option key={s.seller_id} value={s.seller_id}>
        {s.seller_id}
      </option>
    ))}
  </select>
</Field>



{/* Seller Type */}
<Field label="Seller Type">
  <select
    style={inputStyle}
    value={editForm.sellerType}
    disabled     // ✅ LOCK IT
  >

    <option value="FOREIGN_MANUFACTURER">Foreign Manufacturer</option>
    <option value="EXPORTER">Exporter</option>
    <option value="TRADING_COMPANY">Trading Company</option>
    <option value="OEM_SUPPLIER">OEM Supplier</option>
    <option value="RAW_MATERIAL_SUPPLIER">Raw Material Supplier</option>
  </select>
</Field>


        <Field label="Seller Name">
  <input style={inputStyle} value={editForm.sellerName} readOnly />
</Field>

<Field label="Seller Phone">
  <input style={inputStyle} value={editForm.sellerPhone} readOnly />
</Field>

<Field label="Seller Email">
  <input style={inputStyle} value={editForm.sellerEmail} readOnly />
</Field>

<Field label="Seller Address">
  <input style={inputStyle} value={editForm.sellerAddress} readOnly />
</Field>



        {/* Trade */}
        <Field label="Origin Country">
  <select
    style={inputStyle}
    value={editForm.originCountry || ""}
    onChange={e => {
      const country = e.target.value;
      const currencies = countryCurrencyMap[country] || [];

      setEditForm({
        ...editForm,
        originCountry: country,
        originCurrency: currencies[0]?.code || ""   // ✅ AUTO SELECT
      });
    }}
  >

    <option value="">Select Country</option>
    {countries.map(country => (
      <option key={country} value={country}>
        {country}
      </option>
    ))}
  </select>
</Field>



        <Field label="Origin Currency">
  <select
    style={inputStyle}
    value={editForm.originCurrency}
    onChange={e =>
      setEditForm({ ...editForm, originCurrency: e.target.value })
    }
    disabled={!editForm.originCountry}
  >
    <option value="">Select Currency</option>

    {(countryCurrencyMap[editForm.originCountry] || []).map(c => (
      <option key={c.code} value={c.code}>
        {c.currency} ({c.code})
      </option>
    ))}
  </select>
</Field>



        <Field label="Destination Country">
  <select
    style={inputStyle}
    value={editForm.destinationCountry || ""}
    onChange={e => {
      const country = e.target.value;
      const currencies = countryCurrencyMap[country] || [];

      setEditForm({
        ...editForm,
        destinationCountry: country,
        destinationCurrency: currencies[0]?.code || "" // ✅ AUTO SELECT
      });
    }}
  >

    <option value="">Select Country</option>
    {countries.map(country => (
      <option key={country} value={country}>
        {country}
      </option>
    ))}
  </select>
</Field>



        <Field label="Destination Currency">
  <select
    style={inputStyle}
    value={editForm.destinationCurrency}
    onChange={e =>
      setEditForm({ ...editForm, destinationCurrency: e.target.value })
    }
    disabled={!editForm.destinationCountry}
  >
    <option value="">Select Currency</option>

    {(countryCurrencyMap[editForm.destinationCountry] || []).map(c => (
      <option key={c.code} value={c.code}>
        {c.currency} ({c.code})
      </option>
    ))}
  </select>
</Field>



        {/* Main Category */}
<Field label="Main Category">
  <select
    style={inputStyle}
    value={editForm.mainCategory}
    onChange={e =>
      setEditForm({
        ...editForm,
        mainCategory: e.target.value,
        subCategory: "",
        htsCode: ""
      })
    }
  >
    <option value="">Select</option>
    {mainCategories.map(mc => (
      <option key={mc} value={mc}>{mc}</option>
    ))}
  </select>
</Field>

{/* Sub Category */}
<Field label="Sub Category">
  <select
    style={inputStyle}
    value={editForm.subCategory}
    disabled={!editForm.mainCategory}
    onChange={e =>
      setEditForm({
        ...editForm,
        subCategory: e.target.value,
        htsCode: ""
      })
    }
  >
    <option value="">Select</option>
    {getSubCategories(editForm.mainCategory).map(sc => (
      <option key={sc} value={sc}>{sc}</option>
    ))}
  </select>
</Field>

{/* HTS Code */}
<Field label="HTS Code">
  <select
    style={inputStyle}
    value={editForm.htsCode}
    disabled={!editForm.subCategory}
    onChange={e =>
      setEditForm({ ...editForm, htsCode: e.target.value })
    }
  >
    <option value="">Select</option>
    {getHtsCodes(editForm.mainCategory, editForm.subCategory).map(h => (
      <option key={h} value={h}>{h}</option>
    ))}
  </select>
</Field>


      </div>

      {/* Footer */}
      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button
  onClick={() => {
    setShowEditModal(false);
    setIsAdding(false);      // ✅ RESET MODE
    setEditForm(null);
  }}
  style={{ marginRight: "10px" }}
>
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
      {/* HEADER */}
      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
        Delete Transaction
      </h3>

      <p style={{ marginTop: "10px", color: "#4b5563", fontSize: "14px" }}>
        Are you sure you want to delete this transaction?
      </p>

      {/* ACTIONS */}
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
          onClick={handleDelete}
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
      zIndex: 2000,
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
        fontSize: "16px",
        marginLeft: "8px"
      }}
    >
      ✕
    </button>
  </div>
)}



    </div>
  );
}

export default TransactionManagementPage;