import React, { useEffect, useState } from "react";
import {
  getCountriesList,
  getCurrenciesList,
  
  getProducts,
  getAllBuyers,
  getAllSellers,
} from "../../Apis/authApi";
import { createUserTransaction, getNextTransactionCode } from "../../Apis/authApi";



function UserTransactionData() {
  const [step, setStep] = useState(1);

  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [products, setProducts] = useState([]);

  
  

  
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);

 




  const [form, setForm] = useState({
      transactionId: "",
    transactionType: "",
    transactionDate: "",
    status: "",
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
    modeOfTransport: "",
    
    productsSelected: [
  { mainCategory: "", subCategory: "", htsCode: "" }
],

  });

  



  
  



  /* ================= SAFE DATA FETCH ================= */

useEffect(() => {
  getCountriesList().then(res => {
    const list = res.data?.rows || res.data?.data || res.data || [];
    setCountries(Array.isArray(list) ? list : []);
  });

  getCurrenciesList().then(res => {
    const list = res.data?.rows || res.data?.data || res.data || [];
    setCurrencies(Array.isArray(list) ? list : []);
  });

  getAllBuyers().then(res => {
    const list = res.data?.rows || res.data?.data || res.data || [];
    setBuyers(Array.isArray(list) ? list : []);
  });

  getAllSellers().then(res => {
    const list = res.data?.rows || res.data?.data || res.data || [];
    setSellers(Array.isArray(list) ? list : []);
  });

  // ✅ FIXED PRODUCT LOADING (ALL PAGES)
  async function loadAllProducts() {
    try {
      let page = 1;
      const limit = 200; // you can increase to 500 if backend allows
      let allProducts = [];

      while (true) {
        const res = await getProducts({ page, limit });

        const rows = res.data?.data || [];
        allProducts = [...allProducts, ...rows];

        if (page >= res.data.totalPages) break;
        page++;
      }

      console.log("TOTAL PRODUCTS LOADED:", allProducts.length);
      setProducts(allProducts);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  loadAllProducts();
}, []);


// ===== DERIVED DROPDOWNS FROM PRODUCT TABLE =====

const normalize = v =>
  v
    ?.toString()
    .replace(/\s+/g, " ")
    .replace(/:+$/, "")
    .trim();

    const mainCategories = Array.from(
  new Set(
    products
      .map(p => normalize(p.main_category))
      .filter(Boolean)
  )
);


const getSubCategories = (mainCategory) =>
  Array.from(
    new Set(
      products
        .filter(p => normalize(p.main_category) === normalize(mainCategory))
        .map(p => normalize(p.subcategory))
        .filter(Boolean)
    )
  );

const getHtsCodes = (mainCategory, subCategory) =>
  Array.from(
    new Set(
      products
        .filter(
          p =>
            normalize(p.main_category) === normalize(mainCategory) &&
            normalize(p.subcategory) === normalize(subCategory)
        )
        .map(p => p.hts_code)
        .filter(Boolean)
    )
  );


















  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
  let value = e.target.value.replace(/\D/g, ""); // only numbers

  if (value.length >= 3)
    value = value.slice(0, 2) + "/" + value.slice(2);
  if (value.length >= 6)
    value = value.slice(0, 5) + "/" + value.slice(5, 9);

  setForm({ ...form, transactionDate: value });
};


  


  const handleSave = async () => {
  try {
    // ⚠️ For now, save ONLY first product
    

    const payload = {
      
      transactionType: form.transactionType,
      transactionDate: form.transactionDate,
      status: form.status,

      buyerId: form.buyerId,
      buyerName: form.buyerName,
      buyerType: form.buyerType,
      buyerPhone: form.buyerPhone,
      buyerEmail: form.buyerEmail,
      buyerAddress: form.buyerAddress,

      sellerId: form.sellerId,
      sellerName: form.sellerName,
      sellerType: form.sellerType,
      sellerPhone: form.sellerPhone,
      sellerEmail: form.sellerEmail,
      sellerAddress: form.sellerAddress,

      originCountry: form.originCountry,
      originCurrency: form.originCurrency,
      destinationCountry: form.destinationCountry,
      destinationCurrency: form.destinationCurrency,
      modeOfTransport: form.modeOfTransport,

      

      // 🔽 Product & classification
       mainCategory: form.productsSelected.map(p => p.mainCategory).join(","),
  subCategory: form.productsSelected.map(p => p.subCategory).join(","),
  htsCode: form.productsSelected.map(p => p.htsCode).join(","),
    };

    await createUserTransaction(payload);

    // 🔁 Load NEXT TXN from backend
    const res = await getNextTransactionCode();
    // 🔄 Reset for next transaction
    setForm({
      transactionId:  res.data.transactionCode,
      transactionType: "",
      transactionDate: "",
      status: "",
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
      modeOfTransport: "",
      productsSelected: [
        { mainCategory: "", subCategory: "", htsCode: "" }
      ]
    });

    setStep(1);
    alert("Transaction saved successfully");

  } catch (error) {
    console.error("Save failed", error);
    alert("Failed to save transaction");
  }
};



  /* ================= STYLES (UNCHANGED) ================= */

  const styles = {
    page: { padding: "24px" },
    card: {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      maxWidth: "1220px",
      boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
    },
    title: { fontSize: "18px", fontWeight: 600, marginBottom: "16px" },
    sectionTitle: { fontSize: "14px", fontWeight: 600, marginBottom: "12px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    input: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb" },
    select: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb" },
    textarea: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb" },
    footer: { display: "flex", justifyContent: "space-between", marginTop: "24px" },
    btn: { padding: "10px 18px", borderRadius: "999px", border: "1px solid #e5e7eb", background: "#fff" },
    primaryBtn: { padding: "10px 22px", borderRadius: "999px", border: "none", background: "#155EEF", color: "#fff" }
  };

  return (
    <div style={styles.page}>
      
{/* 🔵 PAGE HEADER STRIP */}
<div style={{
  background: "#2563eb",
  borderRadius: "14px",
  padding: "22px 28px",
  marginBottom: "28px",
  color: "#fff"
}}>
  <h1 style={{
    margin: 0,
    fontSize: "22px",
    fontWeight: 600
  }}>
    📦 Transaction Data
  </h1>

  <p style={{
    marginTop: "6px",
    fontSize: "14px",
    opacity: 0.9
  }}>
    Comprehensive multi-country trade transaction tracking and analytics
  </p>
</div>

      <div style={styles.card}>

        {step === 1 && (
          <>
            <h3 style={styles.sectionTitle}>Transaction Details</h3>
            <div style={styles.grid2}><div>
  <input
    value={form.transactionId}
    disabled
    style={{
      ...styles.input,
      backgroundColor: "#f9fafb",
      fontWeight: 600
    }}
  />
  <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
    Auto-generated Transaction ID
  </small>
</div>

              <select name="transactionType" onChange={handleChange} style={styles.select}>
                <option value="">Transaction Type</option>
                <option>Import</option>
                <option>Export</option>
              </select>
              <input
  type="text"
  name="transactionDate"
  placeholder="dd/mm/yyyy"
  value={form.transactionDate}
  onChange={handleDateChange}
  maxLength={10}
  style={styles.input}
/>


              <select name="status" onChange={handleChange} style={styles.select}>
                <option value="">Status</option>
                <option>Draft</option>
                <option>Completed</option>
              </select>
            </div>
          </>
        )}

        {step === 2 && (
  <>
    <h3 style={styles.sectionTitle}>Buyer Details</h3>
    <div style={styles.grid2}>

      {/* Buyer ID */}
      <select
        value={form.buyerId}
        onChange={(e) => {
          const b = buyers.find(x => x.buyer_id === e.target.value);
          if (b) {
            setForm({
              ...form,
              buyerId: b.buyer_id,
              buyerName: b.name,
              buyerType: b.type,
              buyerPhone: b.phone_number,
              buyerEmail: b.email_id,
              buyerAddress: b.address,
            });
          }
        }}
        style={styles.select}
      >
        <option value="">Select Buyer ID</option>
        {buyers.map(b => (
          <option key={b.buyer_id} value={b.buyer_id}>
            {b.buyer_id}
          </option>
        ))}
      </select>

      <input value={form.buyerName} readOnly placeholder="Buyer Name" style={styles.input} />
      <input value={form.buyerType} readOnly placeholder="Buyer Type" style={styles.input} />
      <input value={form.buyerPhone} readOnly placeholder="Phone Number" style={styles.input} />
      <input value={form.buyerEmail} readOnly placeholder="Email ID" style={styles.input} />
      <textarea value={form.buyerAddress} readOnly placeholder="Address" style={styles.textarea} />

    </div>
  </>
)}


        {step === 3 && (
  <>
    <h3 style={styles.sectionTitle}>Seller Details</h3>
    <div style={styles.grid2}>

      {/* Seller ID */}
      <select
        value={form.sellerId}
        onChange={(e) => {
          const s = sellers.find(x => x.seller_id === e.target.value);
          if (s) {
            setForm({
              ...form,
              sellerId: s.seller_id,
              sellerName: s.name,
              sellerType: s.type,
              sellerPhone: s.phone,
              sellerEmail: s.email,
              sellerAddress: s.address,
            });
          }
        }}
        style={styles.select}
      >
        <option value="">Select Seller ID</option>
        {sellers.map(s => (
          <option key={s.seller_id} value={s.seller_id}>
            {s.seller_id}
          </option>
        ))}
      </select>

      <input value={form.sellerName} readOnly placeholder="Seller Name" style={styles.input} />
      <input value={form.sellerType} readOnly placeholder="Seller Type" style={styles.input} />
      <input value={form.sellerPhone} readOnly placeholder="Phone Number" style={styles.input} />
      <input value={form.sellerEmail} readOnly placeholder="Email ID" style={styles.input} />
      <textarea value={form.sellerAddress} readOnly placeholder="Address" style={styles.textarea} />

    </div>
  </>
)}

        {step === 4 && (
          <>
            <h3 style={styles.sectionTitle}>Trade & Logistics</h3>
            <div style={styles.grid2}>
              <select
  name="originCountry"
  value={form.originCountry}
  onChange={handleChange}
  style={styles.select}
>
  <option value="">Origin Country</option>
  {countries.map(c => (
    <option key={c.id} value={c.country_name || c.name || c.country}>
  {c.country_name || c.name || c.country}
</option>

  ))}
</select>

              <select name="originCurrency" onChange={handleChange} style={styles.select}>
                <option value="">Origin Currency</option>
                {currencies.map(c => (
  <option key={`${c.code}-${c.name}`} value={c.code}>
    {c.code}
  </option>
))}
              </select>
              <select
  name="destinationCountry"
  value={form.destinationCountry}
  onChange={handleChange}
  style={styles.select}
>
  <option value="">Destination Country</option>
  {countries.map(c => (
    <option key={c.id} value={c.country_name || c.name || c.country}>
  {c.country_name || c.name || c.country}
</option>

  ))}
</select>

              <select name="destinationCurrency" onChange={handleChange} style={styles.select}>
                <option value="">Destination Currency</option>
                {currencies.map(c => (
  <option key={`${c.code}-${c.name}`} value={c.code}>
  {c.code}
</option>
))}
              </select>

              <select
  name="modeOfTransport"
  value={form.modeOfTransport}
  onChange={handleChange}
  style={styles.select}
  required
>
  <option value="">Select Mode of Transport *</option>
  <option value="Sea">Sea</option>
  <option value="Air">Air</option>
  <option value="Road">Road</option>
</select>

            </div>
          </>
        )}

        {step === 5 && (
  <>
    <h3 style={styles.sectionTitle}>Product & Classification</h3>

    {form.productsSelected.map((prod, index) => (
      <div key={index} style={{ marginBottom: "20px" }}>

        <div style={styles.grid2}>

          {/* Main Category */}
          <select
            value={prod.mainCategory}
            onChange={(e) => {
              const updated = [...form.productsSelected];
              updated[index] = {
                mainCategory: e.target.value,
                subCategory: "",
                htsCode: "",
              };
              setForm({ ...form, productsSelected: updated });
            }}
            style={styles.select}
          >
            <option value="">Select Main Category</option>
            {mainCategories.map(mc => (
              <option key={mc} value={mc}>{mc}</option>
            ))}
          </select>

          {/* Sub Category */}
          <select
            value={prod.subCategory}
            disabled={!prod.mainCategory}
            onChange={(e) => {
              const updated = [...form.productsSelected];
              updated[index].subCategory = e.target.value;
              updated[index].htsCode = "";
              setForm({ ...form, productsSelected: updated });
            }}
            style={styles.select}
          >
            <option value="">Select Sub Category</option>
            {getSubCategories(prod.mainCategory).map(sc => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>

          {/* HTS Code */}
          <select
            value={prod.htsCode}
            disabled={!prod.subCategory}
            onChange={(e) => {
              const updated = [...form.productsSelected];
              updated[index].htsCode = e.target.value;
              setForm({ ...form, productsSelected: updated });
            }}
            style={styles.select}
          >
            <option value="">Select HTS Code</option>
            {getHtsCodes(prod.mainCategory, prod.subCategory).map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

        </div>
      </div>
    ))}

    {/* ➕ ADD PRODUCT BUTTON */}
    <button
      type="button"
      style={{ ...styles.btn, marginTop: "10px" }}
      onClick={() =>
        setForm({
          ...form,
          productsSelected: [
            ...form.productsSelected,
            { mainCategory: "", subCategory: "", htsCode: "" }
          ]
        })
      }
    >
      + Add Product
    </button>
  </>
)}


        <div style={styles.footer}>
          <button style={styles.btn} disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>
          {step < 5
            ? <button
  style={styles.primaryBtn}
  onClick={() => {
    if (step === 4 && !form.modeOfTransport) {
      alert("Please select Mode of Transport");
      return;
    }
    setStep(step + 1);
  }}
>
  Next
</button>

            : <button style={styles.primaryBtn} onClick={handleSave}>Save Transaction</button>}
        </div>
      </div>
    </div>
  );
}

export default UserTransactionData;