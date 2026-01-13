import React, { useState } from "react";



function UserTransactionData() {
  const [form, setForm] = useState({
    transactionType: "",
    status: "",
    transactionDate: "",
    buyerId: "",
    buyerName: "",
    buyerType: "",
    buyerPhone: "",
    buyerEmail: "",
    buyerAddress: "",
    sellerId: "",
    sellerName: "",
    sellerType: "",
    sellerPhone: "",
    sellerEmail: "",
    sellerAddress: "",
    originCountry: "",
    originCurrency: "",
    destinationCountry: "",
    destinationCurrency: "",
    mode: "",
    productName: "",
    hsCode: "",
    industry: "",
    subIndustry: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  

  const handleSave = () => {
    console.log("User Transaction Data:", form);
    alert("Transaction saved (UI only)");
  };

  // ===== INLINE STYLES =====
  const styles = {
    page: {
      padding: "18px 22px",
    },
    card: {
      background: "#ffffff",
      borderRadius: "14px",
      padding: "20px 24px",
      boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
    },
    title: {
      fontSize: "16px",
      fontWeight: 600,
      marginBottom: "14px",
      color: "#111827",
    },
    section: {
      marginTop: "22px",
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "10px",
      color: "#1f2937",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    grid1: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "16px",
    },
    field: {
      label: {
        fontSize: "12px",
        color: "#6b7280",
        marginBottom: "4px",
        display: "block",
      },
      input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        fontSize: "13px",
      },
      select: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        fontSize: "13px",
      },
      textarea: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        fontSize: "13px",
        resize: "none",
      },
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "26px",
    },
    cancelBtn: {
      padding: "10px 18px",
      borderRadius: "999px",
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      fontSize: "13px",
    },
    saveBtn: {
      padding: "10px 22px",
      borderRadius: "999px",
      border: "none",
      background: "#0f5ef7",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Transaction Data</h2>

        {/* Transaction Details */}
        <div style={styles.grid2}>
          <div>
            <label style={styles.field.label}>Transaction ID *</label>
            <input style={styles.field.input} value="TXN-427465" disabled />
          </div>
          <div>
            <label style={styles.field.label}>Transaction Type *</label>
            <select
              name="transactionType"
              onChange={handleChange}
              style={styles.field.select}
            >
              <option value="">Select type</option>
              <option>Import</option>
              <option>Export</option>
            </select>
          </div>

          <div>
            <label style={styles.field.label}>Transaction Date *</label>
            <input
  type="text"
  name="transactionDate"
  placeholder="dd/mm/yyyy"
  onChange={handleChange}
  style={styles.field.input}
/>

          </div>
          <div>
            <label style={styles.field.label}>Status *</label>
            <select
              name="status"
              onChange={handleChange}
              style={styles.field.select}
            >
              <option value="">Select status</option>
              <option>Draft</option>
              <option>Completed</option>
              <option>Flagged</option>
            </select>
          </div>
        </div>

        <div style={styles.section}>
  <h3 style={styles.sectionTitle}>Buyer Details</h3>

  <div style={styles.grid2}>
    <input
      placeholder="Buyer ID *"
      name="buyerId"
      onChange={handleChange}
      style={styles.field.input}
    />

    <input
      placeholder="Buyer Name *"
      name="buyerName"
      onChange={handleChange}
      style={styles.field.input}
    />

    <select
      name="buyerType"
      onChange={handleChange}
      style={styles.field.select}
    >
      <option value="">Buyer Type *</option>
      <option>INDIVIDUAL_IMPORTER</option>
      <option>CORPORATE_IMPORTER</option>
      <option>DISTRIBUTOR</option>
      <option>RETAIL_IMPORTER</option>
      <option>WHOLESALE_IMPORTER</option>
      <option>GOVERNMENT_IMPORTER</option>
    </select>

    <input
      placeholder="Phone Number *"
      name="buyerPhone"
      onChange={handleChange}
      style={styles.field.input}
    />

    {/* ✅ EMAIL – FULL WIDTH */}
    <input
      placeholder="Email ID *"
      name="buyerEmail"
      onChange={handleChange}
      style={{
        ...styles.field.input,
        gridColumn: "1 / -1",
      }}
    />

    {/* ✅ ADDRESS – FULL WIDTH */}
    <textarea
      rows={3}
      placeholder="Address *"
      name="buyerAddress"
      onChange={handleChange}
      style={{
        ...styles.field.textarea,
        gridColumn: "1 / -1",
      }}
    />
  </div>
</div>

        <div style={styles.section}>
  <h3 style={styles.sectionTitle}>Seller Details</h3>

  <div style={styles.grid2}>
    <input
      placeholder="Seller ID *"
      name="sellerId"
      onChange={handleChange}
      style={styles.field.input}
    />

    <input
      placeholder="Seller Name *"
      name="sellerName"
      onChange={handleChange}
      style={styles.field.input}
    />

    <select
      name="sellerType"
      onChange={handleChange}
      style={styles.field.select}
    >
      <option value="">Seller Type *</option>
      <option>FOREIGN_MANUFACTURER</option>
      <option>EXPORTER</option>
      <option>TRADING_COMPANY</option>
      <option>OEM_SUPPLIER</option>
      <option>RAW_MATERIAL_SUPPLIER</option>
    </select>

    <input
      placeholder="Phone Number *"
      name="sellerPhone"
      onChange={handleChange}
      style={styles.field.input}
    />

    {/* ✅ EMAIL – FULL WIDTH */}
    <input
      placeholder="Email ID *"
      name="sellerEmail"
      onChange={handleChange}
      style={{
        ...styles.field.input,
        gridColumn: "1 / -1",
      }}
    />

    {/* ✅ ADDRESS – FULL WIDTH */}
    <textarea
      rows={3}
      placeholder="Address *"
      name="sellerAddress"
      onChange={handleChange}
      style={{
        ...styles.field.textarea,
        gridColumn: "1 / -1",
      }}
    />
  </div>
</div>
        {/* Trade & Logistics */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Trade & Logistics Details</h3>
          <div style={styles.grid2}>
            <select name="originCountry" onChange={handleChange} style={styles.field.select}>
              <option value="">Origin Country *</option>
              <option>USA</option>
              <option>Germany</option>
              <option>India</option>
            </select>

            <select name="originCurrency" onChange={handleChange} style={styles.field.select}>
              <option value="">Origin Currency *</option>
              <option>USD</option>
              <option>EUR</option>
              <option>INR</option>
            </select>

            <select name="destinationCountry" onChange={handleChange} style={styles.field.select}>
              <option value="">Destination Country *</option>
              <option>USA</option>
              <option>China</option>
              <option>Canada</option>
            </select>

            <select name="destinationCurrency" onChange={handleChange} style={styles.field.select}>
              <option value="">Destination Currency *</option>
              <option>USD</option>
              <option>CNY</option>
              <option>CAD</option>
            </select>

            <select name="mode" onChange={handleChange} style={styles.field.select}>
              <option value="">Mode of Transport *</option>
              <option>Sea</option>
              <option>Air</option>
              <option>Road</option>
            </select>
          </div>
        </div>

        {/* Product */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Product & Classification</h3>
          <div style={styles.grid2}>
            <input placeholder="Product Name *" name="productName" onChange={handleChange} style={styles.field.input} />
            <input placeholder="HS Code *" name="hsCode" onChange={handleChange} style={styles.field.input} />
            <select name="industry" onChange={handleChange} style={styles.field.select}>
              <option value="">Industry *</option>
              <option>Agriculture</option>
              <option>Automotive</option>
            </select>
            <select name="subIndustry" onChange={handleChange} style={styles.field.select}>
              <option value="">Sub-Industry *</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave}>
            ✔ Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserTransactionData;