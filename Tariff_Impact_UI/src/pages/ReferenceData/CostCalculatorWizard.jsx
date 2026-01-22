// src/components/CostCalculatorWizard.js
import React, { useState, useEffect, useCallback } from "react";
import { getCountries, getForexCurrencies, getProducts, runCostCalculator, saveCalculation } from '../../Apis/authApi.js';
import "../../App.css";

// NO API_BASE LINE HERE
// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
// preset options
const FREIGHT_OPTIONS = [0, 100, 250, 500, 1000];
const INSURANCE_OPTIONS = [0, 50, 100, 200, 500];

const initialShipment = {
  type: "import",
  originCountry: "",
  destinationCountry: "",
  mode: "Ocean",
  originCurrency: "",
  destCurrency: "",
  forexDate: "2024-12-31",
  originCompany: "",
  destCompany: "",
};

export default function CostCalculatorWizard() {
  const [step, setStep] = useState(1);
  const [shipment, setShipment] = useState(initialShipment);
  const [charges, setCharges] = useState({
    freight: 0,
    insurance: 0,
    freightMode: "preset",
    insuranceMode: "preset",
  });
  const [lines, setLines] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loadingRef, setLoadingRef] = useState(true);
  const [errorRef, setErrorRef] = useState("");

  const [activeLineId, setActiveLineId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
const [saveSuccess, setSaveSuccess] = useState(false);


  useEffect(() => {
  const loadRefData = async () => {
    try {
      setLoadingRef(true);
      setErrorRef("");
      
      const [countryRes, currencyRes] = await Promise.all([
        getCountries(),
        getForexCurrencies(),
      ]);
      
      const toArray = (raw) =>
        Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.rows)
          ? raw.rows
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

      const countryData = toArray(countryRes.data);
      let currencyList = [];
      const rawCur = currencyRes.data;
      if (Array.isArray(rawCur)) {
        currencyList = rawCur;
      } else if (rawCur && rawCur.currencies) {
        currencyList = Object.entries(rawCur.currencies).map(
          ([code, name]) => ({ code, name })
        );
      } else if (rawCur && typeof rawCur === "object") {
        currencyList = Object.entries(rawCur).map(([code, name]) => ({
          code,
          name,
        }));
      }

      setCountries(countryData);
      setCurrencies(currencyList);
    } catch (err) {
      console.error("REF DATA ERROR", err);
      setErrorRef("Failed to load reference data from API.");
    } finally {
      setLoadingRef(false);
    }
  };
  loadRefData();
}, []);


  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

 const handleRun = async () => {
  setLoading(true);
  try {
    const payload = {
      shipment,
      charges: {
        freight: Number(charges.freight),
        insurance: Number(charges.insurance),
      },
      products: lines
        .filter((l) => l.productId)
        .map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
    };

    if (payload.products.length === 0) {
      alert("Please add at least one product with valid HTS code");
      setLoading(false);
      return;
    }

    // ✅ RUN CALCULATION
    const res = await runCostCalculator(payload);  
    console.log("🔢 FULL RESPONSE:", res);
    setResult(res.data || res);
    
    // ✅ AUTO-SAVE TO DATABASE (MANDATORY)
    
    const calculationData = {
      shipment,  // Full shipment details
      products: lines.map(l => ({
        productId: l.productId,
        product_name: l.product_name,
        hts_code: l.hts_code,
        main_category: l.main_category,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice)
      })),
      charges: {
        freight: Number(charges.freight),
        insurance: Number(charges.insurance)
      },
      totals: (res.data || res).totals || {},
      shipmentSummary: (res.data || res).shipmentSummary || {},
      forexRate: (res.data || res).shipmentSummary?.forexRate || 0
    };
    
    
    
    setStep(5);

  } catch (err) {
    console.error("Calculator error:", err.response?.data || err.message);
    alert(
      `Error: ${
        err.response?.data?.message || "Failed to calculate costs"
      }`
    );
  } finally {
    setLoading(false);
  }
};

const handleSaveTransaction = async () => {
  if (!result) return;

  setSaveLoading(true);
  setSaveSuccess(false);

  try {
    const calculationData = {
      shipment,
      products: lines.map(l => ({
        productId: l.productId,
        product_name: l.product_name,
        hts_code: l.hts_code,
        main_category: l.main_category,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice)
      })),
      charges: {
        freight: Number(charges.freight),
        insurance: Number(charges.insurance)
      },
      totals: result.totals || {},
      shipmentSummary: result.shipmentSummary || {},
      forexRate: result.shipmentSummary?.forexRate || 0
    };

    await saveCalculation(calculationData);

    setSaveSuccess(true); // ✅ THIS drives the success message
  } catch (err) {
    alert("Failed to save calculation");
  } finally {
    setSaveLoading(false);
  }
};


  


  return (
  <div className="no-scroll-layout">
    <div className="no-scroll-main">

      {/* Blue Header (EXACT like Industry Explorer) */}
      <section
  className="welcome-strip"
  style={{ marginBottom: "16px" }}   // 👈 ADD THIS
>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ fontSize: 20, lineHeight: 1 }}>💲</span>
    <div>
      <h2
        style={{
          margin: 0,
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        Cost Calculator
      </h2>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: "13px",
          opacity: 0.9,
        }}
      >
        Calculate landed costs including duties, freight, insurance, and forex impact
      </p>
    </div>
  </div>
</section>

{saveSuccess && (
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>✔</span>
      Calculations saved successfully
    </div>

    <button
      onClick={() => setSaveSuccess(false)}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: 16,
        lineHeight: 1,
        color: "#166534",
      }}
    >
      ×
    </button>
  </div>
)}






      <WizardStepper current={step} loadingRef={loadingRef} />
      
      {!loadingRef && errorRef && (
        <div className="no-scroll-panel">
          <p style={{color: '#b91c1c', fontSize: '13px'}}>
            {errorRef}
          </p>
        </div>
      )}
      
      {!loadingRef && !errorRef && (
        <>
          {step === 1 && <ShipmentStep shipment={shipment} setShipment={setShipment} countries={countries} currencies={currencies} onNext={next} />}
          {step === 2 && <ProductsStep lines={lines} setLines={setLines} activeLineId={activeLineId} setActiveLineId={setActiveLineId} searchText={searchText} setSearchText={setSearchText} searchResults={searchResults} setSearchResults={setSearchResults} searchLoading={searchLoading} setSearchLoading={setSearchLoading} searchError={searchError} setSearchError={setSearchError} onNext={next} onBack={prev} />}
          {step === 3 && <ChargesStep charges={charges} setCharges={setCharges} onNext={next} onBack={prev} />}
          {step === 4 && <ReviewStep shipment={shipment} lines={lines} charges={charges} countries={countries} onBack={prev} onRun={handleRun} loading={loading} />}
          {step === 5 && (
  <ResultStep
    result={result}
    onBack={() => setStep(2)}
    onSave={handleSaveTransaction}
    saveLoading={saveLoading}
    saveSuccess={saveSuccess}
  />
)}

        </>
      )}
    </div>
  </div>
);

}

/* ---------- Stepper ---------- */

function WizardStepper({ current }) {
  const steps = ["Shipment", "Products", "Charges", "Review", "Summary"];
  return (
    <div className="dash-row" style={{ marginTop: 0, marginBottom: 20 }}>
      <div className="panel" style={{ gridColumn: "1 / -1" }}>
        <div
          className="qa-grid"
          style={{ gridTemplateColumns: `repeat(${steps.length},1fr)` }}
        >
          {steps.map((label, i) => {
            const num = i + 1;
            let bg = "#e5e7eb";
            let color = "#4b5563";
            if (num < current) {
              bg = "#22c55e";
              color = "#ffffff";
            } else if (num === current) {
              bg = "#2563eb";
              color = "#ffffff";
            }
            return (
              <div
                key={label}
                style={{
                  textAlign: "center",
                  padding: "8px 0",
                  borderRadius: 999,
                  background: bg,
                  color,
                  fontSize: 12,
                  fontWeight: num === current ? 600 : 500,
                }}
              >
                {num}. {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 1: Shipment ---------- */

function ShipmentStep({ shipment, setShipment, countries, currencies, onNext }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipment((s) => ({ ...s, [name]: value }));
  };

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, marginBottom: 4 }}>Shipment Details</h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        Configure your shipment parameters
      </p>

      {/* Row 1: Shipment Type + Mode */}
      <div className="field-row">
        <div className="field">
          <label className="field-label">Shipment Type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["import", "export"].map((t) => (
              <button
                key={t}
                type="button"
                className="primary-button small"
                style={{
                  background: shipment.type === t ? "#2563eb" : "#ffffff",
                  color: shipment.type === t ? "#ffffff" : "#4b5563",
                  border:
                    shipment.type === t ? "none" : "1px solid #d1d5db",
                }}
                onClick={() => setShipment((s) => ({ ...s, type: t }))}
              >
                {t === "import" ? "Import" : "Export"}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Mode of Transport</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["Ocean", "Air", "Other"].map((mode) => (
              <button
                key={mode}
                type="button"
                className="primary-button small"
                style={{
                  background: shipment.mode === mode ? "#2563eb" : "#ffffff",
                  color: shipment.mode === mode ? "#ffffff" : "#4b5563",
                  border:
                    shipment.mode === mode ? "none" : "1px solid #d1d5db",
                }}
                onClick={() => setShipment((s) => ({ ...s, mode }))}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: country dropdowns */}
      <div className="field-row" style={{ marginTop: 12 }}>
        <div className="field">
          <label className="field-label">Source Country</label>
          <select
            className="input"
            name="originCountry"
            value={shipment.originCountry}
            onChange={handleChange}
          >
            <option value="">Select source country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.country_name}>
                {c.country_name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Destination Country</label>
          <select
            className="input"
            name="destinationCountry"
            value={shipment.destinationCountry}
            onChange={handleChange}
          >
            <option value="">Select destination country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.country_name}>
                {c.country_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2b: company names */}
      <div className="field-row" style={{ marginTop: 12 }}>
        <div className="field">
          <label className="field-label">Source Company</label>
          <input
            className="input"
            type="text"
            name="originCompany"
            value={shipment.originCompany}
            onChange={handleChange}
            placeholder="Enter source company name"
          />
        </div>

        <div className="field">
          <label className="field-label">Destination Company</label>
          <input
            className="input"
            type="text"
            name="destCompany"
            value={shipment.destCompany}
            onChange={handleChange}
            placeholder="Enter destination company name"
          />
        </div>
      </div>

      {/* Row 3: currencies */}
      <div className="field-row" style={{ marginTop: 12 }}>
        <div className="field">
          <label className="field-label">Source Currency</label>
          <select
            className="input"
            name="originCurrency"
            value={shipment.originCurrency}
            onChange={handleChange}
          >
            <option value="">Select source currency</option>
            {currencies.map((cur) => (
              <option key={cur.code} value={cur.code}>
                {cur.code} {cur.name ? `- ${cur.name}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Target Currency</label>
          <select
            className="input"
            name="destCurrency"
            value={shipment.destCurrency}
            onChange={handleChange}
          >
            <option value="">Select target currency</option>
            {currencies.map((cur) => (
              <option key={cur.code} value={cur.code}>
                {cur.code} {cur.name ? `- ${cur.name}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forex date */}
      <div className="field" style={{ marginTop: 12 }}>
        <label className="field-label">Forex Date</label>
        <input
          className="input"
          type="date"
          name="forexDate"
          value={shipment.forexDate}
          onChange={handleChange}
        />
      </div>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}
      >
        <button className="primary-button" onClick={onNext}>
          Next: Product Entry
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 2: Products ---------- */

function ProductsStep({
  lines,
  setLines,
  activeLineId,
  setActiveLineId,
  searchText,
  setSearchText,
  searchResults,
  setSearchResults,
  searchLoading,
  setSearchLoading,
  searchError,
  setSearchError,
  onNext,
  onBack,
}) {
  const addLine = () => {
    const newLine = {
      id: Date.now(),
      productId: null,
      main_category: "",
      subcategory: "",
      group_name: "",
      hts_code: "",
      product_name: "",
      quantity: 1,
      unitPrice: 0,
    };
    setLines((prev) => [...prev, newLine]);
    setActiveLineId(newLine.id);
    setSearchText("");
    setSearchResults([]);
  };

  const updateLine = (id, patch) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  };

  const removeLine = (id) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
    if (activeLineId === id) {
      setActiveLineId(null);
      setSearchText("");
      setSearchResults([]);
    }
  };

  const handlePickProduct = (lineId, p) => {
    updateLine(lineId, {
      productId: p.id,
      main_category: p.main_category,
      subcategory: p.subcategory,
      group_name: p.group_name,
      hts_code: p.hts_code,
      product_name: p.product,
    });
    setSearchText("");
    setSearchResults([]);
  };
const doSearch = useCallback(async (q) => {
  if (!q.trim() || q.length < 2) {
    setSearchResults([]);
    setSearchError("");
    return;
  }
  
  setSearchLoading(true);
  try {
    console.log("🔍 CostCalculator searching:", q);
    
    // EXACT SAME PARAMS as ProductLibraryPage ✅
    const params = { search: q.trim() };
    const res = await getProducts(params);
    console.log("📦 CostCalculator API Response:", res);
    
    // EXACT SAME DATA EXTRACTION as ProductLibraryPage ✅
    const dataArray = Array.isArray(res.data) 
      ? res.data 
      : res.data?.data || res.data?.products || [];
    
    console.log("✅ CostCalculator found:", dataArray.length, dataArray[0]);
    setSearchResults(dataArray.slice(0, 10));
    setSearchError(dataArray.length === 0 ? "No products found" : "");
    
  } catch (err) {
    console.error("CostCalculator search error:", err.response?.data || err);
    setSearchError("Search failed");
    setSearchResults([]);
  } finally {
    setSearchLoading(false);
  }
}, []);

// ✅ Empty deps since set* functions are stable

  useEffect(() => {
    if (!searchText) {
      setSearchResults([]);
      setSearchError("");
      return;
    }
    const id = setTimeout(() => {
      doSearch(searchText);
    }, 300);

    return () => clearTimeout(id);
  }, [searchText, doSearch]);


  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, marginBottom: 6 }}>
        Cost Calculator – Products
      </h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: 18,
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        Type product name or HTS to search; pick one to auto-fill its category
        and code.
      </p>

      {lines.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            borderRadius: 10,
            border: "1px dashed #d1d5db",
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          No products added yet. Click &quot;Add Product&quot; to begin.
        </div>
      )}

      {lines.map((line, idx) => {
        const isActive = line.id === activeLineId;
        return (
          <div
            key={line.id}
            style={{
              borderRadius: 10,
              border: isActive ? "1px solid #2563eb" : "1px solid #e5e7eb",
              padding: 12,
              marginBottom: 10,
            }}
            onClick={() => setActiveLineId(line.id)}
          >
            <div className="field-row">
              <div className="field">
                <label className="field-label">Main Category</label>
                <input
                  className="input"
                  value={line.main_category || ""}
                  readOnly
                />
              </div>
              <div className="field">
                <label className="field-label">Subcategory</label>
                <input
                  className="input"
                  value={line.subcategory || ""}
                  readOnly
                />
              </div>
              <div className="field">
                <label className="field-label">Group</label>
                <input
                  className="input"
                  value={line.group_name || ""}
                  readOnly
                />
              </div>
              <div className="field">
                <label className="field-label">HTS Code</label>
                <input className="input" value={line.hts_code || ""} readOnly />
              </div>
            </div>

            <div className="field">
              <label className="field-label">
                Search Product for line {idx + 1}
              </label>
              <input
                className="input"
                placeholder="Type product name or HTS"
                value={isActive ? searchText : ""}
                onChange={(e) => {
                  setActiveLineId(line.id);
                  setSearchText(e.target.value);
                }}
              />
              {searchLoading && (
                <small style={{ fontSize: 11, color: "#6b7280" }}>
                  Searching…
                </small>
              )}
              {searchError && (
                <small style={{ fontSize: 11, color: "#b91c1c" }}>
                  {searchError}
                </small>
              )}
              {isActive && searchResults.length > 0 && (
                <div
                  style={{
                    marginTop: 6,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    maxHeight: 220,
                    overflowY: "auto",
                    background: "#ffffff",
                    zIndex: 1000,
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePickProduct(line.id, p)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 10px",
                        border: "none",
                        background: "transparent",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>
                        {p.hts_code} — {p.product}
                      </div>
                      <div style={{ color: "#6b7280" }}>
                        {p.main_category} › {p.subcategory} ›{" "}
                        {p.group_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 12,
                alignItems: "flex-end",
                marginTop: 8,
              }}
            >
              <div className="field">
                <label className="field-label">Quantity</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.id, { quantity: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label className="field-label">
                  Unit Price (source currency)
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(line.id, { unitPrice: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="primary-button danger small"
                onClick={() => removeLine(line.id)}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          gap: 8,
        }}
      >
        <button className="ghost-button" onClick={onBack}>
          Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost-button" onClick={addLine}>
            + Add Product
          </button>
          <button
            className="primary-button"
            disabled={lines.length === 0}
            onClick={onNext}
          >
            Next: Charges
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 3: Charges ---------- */

function ChargesStep({ charges, setCharges, onNext, onBack }) {
  const total =
    Number(charges.freight || 0) + Number(charges.insurance || 0);

  const handlePresetChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setCharges((c) => ({
        ...c,
        [`${name}Mode`]: "custom",
      }));
      return;
    }
    setCharges((c) => ({
      ...c,
      [name]: Number(value),
      [`${name}Mode`]: "preset",
    }));
  };

  const handleCustomInput = (e) => {
    const { name, value } = e.target;
    setCharges((c) => ({
      ...c,
      [name]: Number(value || 0),
      [`${name}Mode`]: "custom",
    }));
  };

  const handleCustomToggle = (field) => {
    setCharges((c) => ({
      ...c,
      [`${field}Mode`]: "custom",
    }));
  };

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0, marginBottom: 6 }}>
        Freight &amp; Insurance Charges
      </h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: 18,
          fontSize: 13,
          color: "#6b7280",
        }}
      >
        Select from list or enter your own amount.
      </p>

      <div className="field-row">
        {/* Insurance */}
        <div className="field">
          <label className="field-label">Insurance Cost</label>
          <select
            className="input"
            name="insurance"
            value={
              charges.insuranceMode === "preset" ? charges.insurance : ""
            }
            onChange={handlePresetChange}
          >
            {INSURANCE_OPTIONS.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
            <option value="">Other (enter manually)</option>
          </select>

          {charges.insuranceMode === "custom" && (
            <input
              className="input"
              type="number"
              name="insurance"
              min="0"
              value={charges.insurance}
              onChange={handleCustomInput}
              placeholder="Enter custom insurance amount"
              style={{ marginTop: 6 }}
            />
          )}

          {charges.insuranceMode !== "custom" && (
            <button
              type="button"
              className="ghost-button small"
              onClick={() => handleCustomToggle("insurance")}
              style={{ marginTop: 6 }}
            >
              Enter custom amount
            </button>
          )}
        </div>

        {/* Freight */}
        <div className="field">
          <label className="field-label">Freight Cost</label>
          <select
            className="input"
            name="freight"
            value={charges.freightMode === "preset" ? charges.freight : ""}
            onChange={handlePresetChange}
          >
            {FREIGHT_OPTIONS.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
            <option value="">Other (enter manually)</option>
          </select>

          {charges.freightMode === "custom" && (
            <input
              className="input"
              type="number"
              name="freight"
              min="0"
              value={charges.freight}
              onChange={handleCustomInput}
              placeholder="Enter custom freight amount"
              style={{ marginTop: 6 }}
            />
          )}

          {charges.freightMode !== "custom" && (
            <button
              type="button"
              className="ghost-button small"
              onClick={() => handleCustomToggle("freight")}
              style={{ marginTop: 6 }}
            >
              Enter custom amount
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 10,
          background: "#eff6ff",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
        }}
      >
        <div>
          Insurance:{" "}
          <strong>{Number(charges.insurance || 0).toFixed(2)}</strong>
        </div>
        <div>
          Freight: <strong>{Number(charges.freight || 0).toFixed(2)}</strong>
        </div>
        <div>
          Total Shipping: <strong>{total.toFixed(2)}</strong>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
          gap: 8,
        }}
      >
        <button className="ghost-button" onClick={onBack}>
          Back
        </button>
        <button className="primary-button" onClick={onNext}>
          Next: Review
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 4: Review ---------- */

function ReviewStep({
  shipment,
  lines,
  charges,
  countries,
  onBack,
  onRun,
  loading,
}) {
  const totalShipping =
    Number(charges.freight || 0) + Number(charges.insurance || 0);
  const subtotal = lines.reduce(
    (sum, l) => sum + Number(l.quantity || 0) * Number(l.unitPrice || 0),
    0
  );

    const origin = countries.find((c) => c.country_name === shipment.originCountry);
  const dest = countries.find((c) => c.country_name === shipment.destinationCountry);


  return (
    <div className="dash-row">
      <div className="panel">
        <h3>Shipment Summary</h3>
        <div className="recent-list">
          <div className="recent-item">
            <span className="recent-title">Type</span>
            <span>{shipment.type === "import" ? "Import" : "Export"}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Origin</span>
            <span>{origin ? origin.country_name : shipment.originCountry}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Destination</span>
            <span>
              {dest ? dest.country_name : shipment.destinationCountry}
            </span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Source Company</span>
            <span>{shipment.originCompany || "-"}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Destination Company</span>
            <span>{shipment.destCompany || "-"}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Mode</span>
            <span>{shipment.mode}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Source Currency</span>
            <span>{shipment.originCurrency}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Target Currency</span>
            <span>{shipment.destCurrency}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Forex Date</span>
            <span>{shipment.forexDate}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Product Summary</h3>
        <div className="recent-list">
          {lines.map((l, idx) => (
            <div key={l.id} className="recent-item">
              <div>
                <p className="recent-title">
                  {idx + 1}. {l.hts_code || "No HTS"} —{" "}
                  {l.product_name || "No product selected"}
                </p>
                <p className="recent-meta">
                  Qty: {l.quantity} • Unit:{" "}
                  {Number(l.unitPrice || 0).toFixed(2)}{" "}
                  {shipment.originCurrency || ""}
                </p>
              </div>
              <span className="status-pill">
                {shipment.originCurrency || ""}{" "}
                {(
                  Number(l.quantity || 0) * Number(l.unitPrice || 0)
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 13 }}>
          Subtotal:{" "}
          <strong>
            {shipment.originCurrency || ""} {subtotal.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="panel">
        <h3>Charges</h3>
        <div className="qa-grid">
          <div className="qa-card">
            <div className="qa-icon qa-blue">$</div>
            <div className="qa-text">
              <h4>Freight</h4>
              <p>
                {shipment.originCurrency || ""}{" "}
                {Number(charges.freight || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="qa-card">
            <div className="qa-icon qa-green">$</div>
            <div className="qa-text">
              <h4>Insurance</h4>
              <p>
                {shipment.originCurrency || ""}{" "}
                {Number(charges.insurance || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="qa-card">
            <div className="qa-icon qa-purple">$</div>
            <div className="qa-text">
              <h4>Total Shipping</h4>
              <p>
                {shipment.originCurrency || ""} {totalShipping.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            gap: 8,
          }}
        >
          <button className="ghost-button" onClick={onBack}>
            Back
          </button>
          <button className="primary-button" onClick={onRun} disabled={loading}>
            {loading ? "Calculating…" : "Run Cost Calculator"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 5: Result ---------- */
function ResultStep({ result, onBack, onSave, saveLoading, saveSuccess }) {

  const safeResult = result || {};
  const shipmentSummary = safeResult.shipmentSummary || {};
  const chargesSummary = safeResult.chargesSummary || {};
  const products = Array.isArray(safeResult.products) ? safeResult.products : [];
  const totals = safeResult.totals || {};
  
  const src = shipmentSummary.originCurrency || '';
  const tgt = shipmentSummary.destCurrency || '';

  const fmt = (n) => Number(n ?? 0).toFixed(2);

  // ✅ SAFE ACCESS
  const totalLandedOrigin = totals?.totalLandCostOrigin ?? 0;
  const totalLandedDest = totals?.totalLandCostDest ?? 0;


  return (
    <div className="dash-row">
      <div className="panel">
        <h3>Shipment Summary</h3>
        <div className="recent-list">
          <div className="recent-item">
            <span className="recent-title">Type</span>
            <span>{shipmentSummary.type}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Origin</span>
            <span>{shipmentSummary.origin}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Destination</span>
            <span>{shipmentSummary.destination}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Source Company</span>
            <span>{shipmentSummary.originCompany}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Destination Company</span>
            <span>{shipmentSummary.destCompany}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Mode</span>
            <span>{shipmentSummary.mode}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Source Currency</span>
            <span>{src}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Target Currency</span>
            <span>{tgt}</span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Forex Rate</span>
            <span>
              1 {src} = {fmt(shipmentSummary.forexRate)} {tgt}
            </span>
          </div>
          <div className="recent-item">
            <span className="recent-title">Duty Type</span>
            <span className="status-pill">{shipmentSummary.dutyType}</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Product Summary</h3>
        <div className="recent-list">
          {products.map((p, idx) => (
            <div key={p.productId} className="recent-item">
              <div>
                <p className="recent-title">
                  {idx + 1}. {p.htsCode} — {p.productName}
                </p>
                <p className="recent-meta">
                  Qty: {p.quantity} • Unit ({src}): {fmt(p.unitPriceOrigin)} •
                  Unit ({tgt}): {fmt(p.unitPriceDest)}
                </p>
                <p className="recent-meta">Duty: {fmt(p.dutyRate)}%</p>
              </div>
              <span className="status-pill">
                {src} {fmt(p.lineValueOrigin)} / {tgt}{" "}
                {fmt(p.lineValueDest)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Charges &amp; Totals</h3>
        <div className="qa-grid">
          <div className="qa-card">
            <div className="qa-icon qa-blue">$</div>
            <div className="qa-text">
              <h4>Freight</h4>
              <p>
                {src} {fmt(chargesSummary.freightOrigin)} / {tgt}{" "}
                {fmt(chargesSummary.freightDest)}
              </p>
            </div>
          </div>
          <div className="qa-card">
            <div className="qa-icon qa-green">$</div>
            <div className="qa-text">
              <h4>Insurance</h4>
              <p>
                {src} {fmt(chargesSummary.insuranceOrigin)} / {tgt}{" "}
                {fmt(chargesSummary.insuranceDest)}
              </p>
            </div>
          </div>
          <div className="qa-card">
            <div className="qa-icon qa-purple">$</div>
            <div className="qa-text">
              <h4>Total Shipping</h4>
              <p>
                {src} {fmt(chargesSummary.totalShippingOrigin)} / {tgt}{" "}
                {fmt(chargesSummary.totalShippingDest)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6 }}>
          <div>
            Invoice Value:{" "}
            <strong>
              {src} {fmt(totals.invoiceValueOrigin)} / {tgt}{" "}
              {fmt(totals.invoiceValueDest)}
            </strong>
          </div>
          <div>
            Customs Value:{" "}
            <strong>
              {src} {fmt(totals.customsValueOrigin)} / {tgt}{" "}
              {fmt(totals.customsValueDest)}
            </strong>
          </div>
          <div>
            Total Duty:{" "}
            <strong>
              {src} {fmt(totals.dutyOrigin)} / {tgt}{" "}
              {fmt(totals.dutyDest)}
            </strong>
          </div>
          <div>
            Total Landed:{" "}
            <strong>
              {src} {fmt(totalLandedOrigin)} / {tgt}{" "}
              {fmt(totalLandedDest)}
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
  <button className="ghost-button" onClick={onBack}>
    Back
  </button>

  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
   

    <button
      className="primary-button"
      onClick={onSave}
      disabled={saveLoading || saveSuccess}
    >
      {saveLoading ? "Saving..." : "Save Calculations"}
    </button>
  </div>



  
    

   
  </div>
</div>

      </div>
    
  );
}