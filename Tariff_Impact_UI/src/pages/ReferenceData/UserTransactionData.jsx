import React, { useEffect, useState } from "react";
import {
  getCountriesList,
  getCurrenciesList,
  
  getProducts,
  getAllBuyers,
  getAllSellers,
} from "../../Apis/authApi";
import { createUserTransaction, getNextTransactionCode } from "../../Apis/authApi";

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label
      style={{
        fontSize: "13px",
        fontWeight: 500,
        color: "#374151"
      }}
    >
      {label}
    </label>
    {children}
  </div>
);


function UserTransactionData() {
  const [step, setStep] = useState(1);
  const [successPopup, setSuccessPopup] = useState(false);

  const stepLabels = [
  "Transaction Details",
  "Buyer Details",
  "Seller Details",
  "Trade & Logistics",
  "Product & Classification",
  "Review"
];


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

  useEffect(() => {
  if (successPopup) {
    const timer = setTimeout(() => {
      setSuccessPopup(false);
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [successPopup]);


  



  
  



  /* ================= SAFE DATA FETCH ================= */

useEffect(() => {

   getNextTransactionCode().then(res => {
    setForm(prev => ({
      ...prev,
      transactionId: res.data.transactionCode
    }));
  });
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
  // 🔹 COUNTRY → CURRENCY MAPPING
const getCurrencyByCountry = (countryName) => {
  if (!countryName) return [];

  // normalize country name
  const normalized = countryName.trim().toLowerCase();

  // match currency table by country name
  const matched = currencies.filter(c =>
    (c.country_name || c.country || "")
      .toLowerCase()
      .trim() === normalized
  );

  return matched.map(c => c.code);
};




















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
    setSuccessPopup(true);
    

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
    reviewSection: {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "20px",
  background: "#ffffff",
  boxShadow: "0 8px 18px rgba(0,0,0,0.04)"
},

reviewTitle: {
  fontSize: "15px",
  fontWeight: 600,
  marginBottom: "12px",
  color: "#111827"
},

reviewGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px"
},

reviewItem: {
  fontSize: "14px",
  color: "#374151"
},

reviewLabel: {
  fontWeight: 600,
  color: "#111827"
},

productCard: {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
  background: "#f9fafb",
  marginBottom: "12px"
},
stepper: {
  display: "flex",
  gap: "12px",
  padding: "14px",
  borderRadius: "14px",
  background: "#ffffff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  marginBottom: "24px"
},

stepItem: (state) => ({
  flex: 1,
  textAlign: "center",
  padding: "10px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 600,
  background:
    state === "completed"
      ? "#22c55e"
      : state === "active"
      ? "#2563eb"
      : "#e5e7eb",
  color:
    state === "upcoming"
      ? "#6b7280"
      : "#ffffff"
}),


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

{/* 🔹 STEP INDICATOR */}
<div style={styles.stepper}>
  {stepLabels.map((label, index) => {
    const stepNo = index + 1;

    let state = "upcoming";
    if (stepNo < step) state = "completed";
    if (stepNo === step) state = "active";

    return (
      <div key={label} style={styles.stepItem(state)}>
        {stepNo}. {label}
      </div>
    );
  })}
</div>

      <div style={styles.card}>

        {step === 1 && (
          <>
            <h3 style={styles.sectionTitle}>Transaction Details</h3>
            <div style={styles.grid2}>

  <Field label="Transaction ID">
    <input
      value={form.transactionId}
      disabled
      style={{
        ...styles.input,
        backgroundColor: "#f9fafb",
        fontWeight: 600
      }}
    />
  </Field>

  <Field label="Transaction Type">
    <select
      name="transactionType"
      value={form.transactionType}
      onChange={handleChange}
      style={styles.select}
    >
      <option value="">Select</option>
      <option value="Import">Import</option>
      <option value="Export">Export</option>
    </select>
  </Field>

  <Field label="Transaction Date">
    <input
      type="text"
      name="transactionDate"
      value={form.transactionDate}
      onChange={handleDateChange}
      maxLength={10}
      style={styles.input}
    />
  </Field>

  <Field label="Status">
    <select
      name="status"
      value={form.status}
      onChange={handleChange}
      style={styles.select}
    >
      <option value="">Select</option>
      <option value="Draft">Draft</option>
      <option value="Completed">Completed</option>
    </select>
  </Field>

</div>

          </>
        )}

        {step === 2 && (
  <>
    <h3 style={styles.sectionTitle}>Buyer Details</h3>
    <div style={styles.grid2}>

      {/* Buyer ID */}
      <Field label="Buyer ID">
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
          <option value="">Select</option>
          {buyers.map(b => (
            <option key={b.buyer_id} value={b.buyer_id}>
              {b.buyer_id}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Buyer Name">
        <input value={form.buyerName} readOnly style={styles.input} />
      </Field>

      <Field label="Buyer Type">
        <input value={form.buyerType} readOnly style={styles.input} />
      </Field>

      <Field label="Phone Number">
        <input value={form.buyerPhone} readOnly style={styles.input} />
      </Field>

      <Field label="Email ID">
        <input value={form.buyerEmail} readOnly style={styles.input} />
      </Field>

      <Field label="Address">
        <textarea value={form.buyerAddress} readOnly style={styles.textarea} />
      </Field>

    </div>
  </>
)}



        {step === 3 && (
  <>
    <h3 style={styles.sectionTitle}>Seller Details</h3>
    <div style={styles.grid2}>

      {/* Seller ID */}
      <Field label="Seller ID">
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
          <option value="">Select</option>
          {sellers.map(s => (
            <option key={s.seller_id} value={s.seller_id}>
              {s.seller_id}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Seller Name">
        <input value={form.sellerName} readOnly style={styles.input} />
      </Field>

      <Field label="Seller Type">
        <input value={form.sellerType} readOnly style={styles.input} />
      </Field>

      <Field label="Phone Number">
        <input value={form.sellerPhone} readOnly style={styles.input} />
      </Field>

      <Field label="Email ID">
        <input value={form.sellerEmail} readOnly style={styles.input} />
      </Field>

      <Field label="Address">
        <textarea value={form.sellerAddress} readOnly style={styles.textarea} />
      </Field>

    </div>
  </>
)}


        {step === 4 && (
  <>
    <h3 style={styles.sectionTitle}>Trade & Logistics</h3>

    <div style={styles.grid2}>

      <Field label="Origin Country">
        <select
          name="originCountry"
          value={form.originCountry}
          onChange={(e) => {
  setForm({
    ...form,
    originCountry: e.target.value,
    originCurrency: ""   // 🔴 reset currency
  });
}}

          style={styles.select}
        >
          <option value="">Select</option>
          {countries.map(c => (
            <option
              key={c.id}
              value={c.country_name || c.name || c.country}
            >
              {c.country_name || c.name || c.country}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Origin Currency">
  <select
    name="originCurrency"
    value={form.originCurrency}
    onChange={handleChange}
    style={styles.select}
    disabled={!form.originCountry}
  >
    <option value="">Select</option>
    {getCurrencyByCountry(form.originCountry).map(code => (
      <option key={code} value={code}>
        {code}
      </option>
    ))}
  </select>
</Field>


      <Field label="Destination Country">
        <select
          name="destinationCountry"
          value={form.destinationCountry}
          onChange={(e) => {
  setForm({
    ...form,
    destinationCountry: e.target.value,
    destinationCurrency: ""   // 🔴 reset currency
  });
}}

          style={styles.select}
        >
          <option value="">Select</option>
          {countries.map(c => (
            <option
              key={c.id}
              value={c.country_name || c.name || c.country}
            >
              {c.country_name || c.name || c.country}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Destination Currency">
  <select
    name="destinationCurrency"
    value={form.destinationCurrency}
    onChange={handleChange}
    style={styles.select}
     disabled={!form.destinationCountry}
  >
    <option value="">Select</option>
    {getCurrencyByCountry(form.destinationCountry).map(code => (
      <option key={code} value={code}>
        {code}
      </option>
    ))}
  </select>
</Field>


      <Field label="Mode of Transport">
        <select
          name="modeOfTransport"
          value={form.modeOfTransport}
          onChange={handleChange}
          style={styles.select}
          required
        >
          <option value="">Select</option>
          <option value="Sea">Sea</option>
          <option value="Air">Air</option>
          <option value="Road">Road</option>
        </select>
      </Field>

    </div>
  </>
)}


        {step === 5 && (
  <>
    <h3 style={styles.sectionTitle}>Product & Classification</h3>

    {form.productsSelected.map((prod, index) => (
  <div
    key={index}
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      padding: "20px",
      marginBottom: "24px",
      boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
      background: "#ffffff"
    }}
  >


        <div style={styles.grid2}>

          {/* Main Category */}
          <Field label="Main Category">
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
              <option value="">Select</option>
              {mainCategories.map(mc => (
                <option key={mc} value={mc}>{mc}</option>
              ))}
            </select>
          </Field>

          {/* Sub Category */}
          <Field label="Sub Category">
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
              <option value="">Select</option>
              {getSubCategories(prod.mainCategory).map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </Field>

          {/* HTS Code */}
          <Field label="HTS Code">
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
              <option value="">Select</option>
              {getHtsCodes(prod.mainCategory, prod.subCategory).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </Field>

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

{step === 6 && (
  <>
    <h3 style={styles.sectionTitle}>Review Transaction</h3>

    {/* Transaction */}
    <div style={styles.reviewSection}>
      <div style={styles.reviewTitle}>Transaction</div>
      <div style={styles.reviewGrid}>
        <div><b>ID:</b> {form.transactionId}</div>
        <div><b>Type:</b> {form.transactionType}</div>
        <div><b>Date:</b> {form.transactionDate}</div>
        <div><b>Status:</b> {form.status}</div>
      </div>
    </div>

    {/* Buyer */}
<div style={styles.reviewSection}>
  <div style={styles.reviewTitle}>Buyer</div>
  <div style={styles.reviewGrid}>
    <div>
      <b>ID:</b> {form.buyerId}
    </div>
    <div>
      <b>{form.buyerName}</b> ({form.buyerType})
    </div>
    <div>{form.buyerPhone}</div>
    <div>{form.buyerEmail}</div>
    <div>{form.buyerAddress}</div>
  </div>
</div>


    {/* Seller */}
<div style={styles.reviewSection}>
  <div style={styles.reviewTitle}>Seller</div>
  <div style={styles.reviewGrid}>
    <div>
      <b>ID:</b> {form.sellerId}
    </div>
    <div>
      <b>{form.sellerName}</b> ({form.sellerType})
    </div>
    <div>{form.sellerPhone}</div>
    <div>{form.sellerEmail}</div>
    <div>{form.sellerAddress}</div>
  </div>
</div>


    {/* Trade */}
    <div style={styles.reviewSection}>
      <div style={styles.reviewTitle}>Trade & Logistics</div>
      <div style={styles.reviewGrid}>
        <div>
          <b>Route:</b> {form.originCountry} ({form.originCurrency}) →{" "}
          {form.destinationCountry} ({form.destinationCurrency})
        </div>
        <div>
          <b>Transport:</b> {form.modeOfTransport}
        </div>
      </div>
    </div>

    {/* Products */}
    <div style={styles.reviewSection}>
      <div style={styles.reviewTitle}>Products</div>

      {form.productsSelected.map((p, i) => (
        <div key={i} style={styles.productCard}>
          <div><b>Main Category:</b> {p.mainCategory}</div>
          <div><b>Sub Category:</b> {p.subCategory}</div>
          <div><b>HTS Code:</b> {p.htsCode}</div>
        </div>
      ))}
    </div>
  </>
)}






        <div style={styles.footer}>
  <button
    style={styles.btn}
    disabled={step === 1}
    onClick={() => setStep(step - 1)}
  >
    Back
  </button>

  {step < 6 ? (
    <button
  style={styles.primaryBtn}
  onClick={() => setStep(step + 1)}
>
  Next
</button>



  ) : (
    <button
      style={styles.primaryBtn}
      onClick={handleSave}
    >
      Save Transaction
    </button>
  )}
</div>

      </div>

      {successPopup && (
  <div
    style={{
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#e6f4ea",
      color: "#1e4620",
      padding: "12px 18px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      zIndex: 9999,
      minWidth: "320px",
      maxWidth: "420px"
    }}
  >
    <span style={{ fontSize: "18px" }}>✔️</span>

    <span style={{ fontSize: "14px", fontWeight: 500 }}>
      Transaction saved successfully
    </span>

    <button
      onClick={() => setSuccessPopup(false)}
      style={{
        marginLeft: "auto",
        background: "transparent",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
        color: "#1e4620"
      }}
    >
      ×
    </button>
  </div>
)}


    </div>
  );
}

export default UserTransactionData;