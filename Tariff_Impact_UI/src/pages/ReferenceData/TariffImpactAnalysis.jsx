import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Select from "react-select";
import API from "../../Apis/authApi";
       

const YEARS = [2021, 2022, 2023, 2024, 2025];
const MODEL_TYPES = ["Advanced", "Moderate", "Basic"];
const PERIODS = ["Pre-Trump", "Trump Era", "Current"];
const PIE_COLORS = ["#2563eb", "#f97316", "#22c55e", "#a855f7"];

const TariffImpactAnalysis = () => {
  const [industryOptions, setIndustryOptions] = useState([]);
  const [subIndustryOptions, setSubIndustryOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [tariffRows, setTariffRows] = useState([]);

  // UI input state (typing/selecting)
const [filters, setFilters] = useState({
  year: "",
  productCategoryId: "",
  subcategoryId: "",
  originCountryCode: "",
  destinationCountryCode: "",
  currencyCode: "",
  modelType: "",
  period: "Pre-Trump",
  minTaxRate: 0,
  maxTaxRate: 100,
});

// Applied state (used for charts)
const [appliedFilters, setAppliedFilters] = useState(null);
const [refreshKey, setRefreshKey] = useState(0);


  const [viewImpactFor, setViewImpactFor] = useState("Buyer");
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [error, setError] = useState("");

  // 🔥 FIXED: Buyer/Seller swaps countries & recalculates EVERY TIME
  const buildChartFromTariff = useCallback(() => {
    console.log("🔥🔥 RECALCULATING - View:", viewImpactFor, "Filters:", filters);
    
    if (!tariffRows || tariffRows.length === 0) {
      console.log("No tariff data");
      return;
    }

    // 🔥 BUYER/SELLER: DYNAMICALLY SWAP COUNTRIES
    let searchOrigin, searchDestination;
    
    if (viewImpactFor === "Buyer") {
      // Buyer: Normal Origin → Destination (import)
      searchOrigin = filters.originCountryCode;
      searchDestination = filters.destinationCountryCode;
      console.log("📦 BUYER MODE: Searching", searchOrigin, "→", searchDestination);
    } else {
      // Seller: SWAP Destination → Origin (export)
      searchOrigin = filters.destinationCountryCode;
      searchDestination = filters.originCountryCode;
      console.log("📤 SELLER MODE: SWAPPED", searchOrigin, "→", searchDestination);
    }

    // 🔥 FIND EXACT MATCH with swapped countries
    let selectedRow = null;
    let bestMatchCount = 0;
    
    for (let row of tariffRows) {
      let matchCount = 0;
      
      // Count matches
      if (!filters.productCategoryId || row["Product Category"] === filters.productCategoryId) matchCount++;
      if (!filters.subcategoryId || row["Subcategory"] === filters.subcategoryId) matchCount++;
      if (!filters.year || !row.Year || Number(row.Year) === Number(filters.year)) matchCount++;
      if (!searchOrigin || row["Origin Country"] === searchOrigin) matchCount++;
      if (!searchDestination || row["Destination Country"] === searchDestination) matchCount++;
      
      // Duty rate filter
      const dutyRate = Number(row["Duty Rate (%)"] || row["Duty Rate"] || row["duty rate"] || row["duty_rate"] || 0);
      if (dutyRate < Number(filters.minTaxRate) || dutyRate > Number(filters.maxTaxRate)) continue;
      
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        selectedRow = row;
      }
    }

    // 🔥 FALLBACK if no perfect match
    if (!selectedRow) {
      for (let row of tariffRows) {
        const dutyRate = Number(row["Duty Rate (%)"] || row["Duty Rate"] || row["duty rate"] || row["duty_rate"] || 0);
        if (dutyRate > 0) {
          selectedRow = row;
          break;
        }
      }
    }

    if (!selectedRow) selectedRow = tariffRows[0];

    const dutyRate = Number(
      selectedRow["Duty Rate (%)"] || 
      selectedRow["Duty Rate"] || 
      selectedRow["duty rate"] || 
      selectedRow["duty_rate"] || 
      25
    );

    // 🔥 SHOW EXACT ROUTE USED
    const route = `${selectedRow["Origin Country"] || '?'} → ${selectedRow["Destination Country"] || '?'}`;
    const dataSource = `${viewImpactFor}: ${selectedRow["Product Category"] || 'Unknown'} / ${selectedRow["Subcategory"] || 'N/A'} (${dutyRate}%) | ${route}`;

    console.log("✅ ✅ SELECTED ROW:", dataSource, "| Matches:", bestMatchCount);

    // 🔥 GENERATE CHARTS
    const shipmentValue = 100000;
    
    let preTrumpMultiplier = 0.5;
    let currentMultiplier = 0.8;
    
    if (filters.modelType === "Advanced") {
      preTrumpMultiplier = 0.4;
      currentMultiplier = 0.75;
    } else if (filters.modelType === "Moderate") {
      preTrumpMultiplier = 0.45;
      currentMultiplier = 0.85;
    }

    const preTrumpRate = dutyRate * preTrumpMultiplier;
    const trumpRate = dutyRate;
    const currentRate = dutyRate * currentMultiplier;

    const barChartData = [
      { period: "Pre-Trump", "Duty Rate": preTrumpRate, "Additional Cost": (shipmentValue * preTrumpRate) / 100 },
      { period: "Trump Era", "Duty Rate": trumpRate, "Additional Cost": (shipmentValue * trumpRate) / 100 },
      { period: "Current", "Duty Rate": currentRate, "Additional Cost": (shipmentValue * currentRate) / 100 },
    ];

    const baseTariff = (shipmentValue * trumpRate) / 100;
    const antiDumping = baseTariff * 0.3;
    const countervailing = baseTariff * 0.2;
    const section301 = baseTariff * 0.36;

    const pieChartData = [
      { name: "Base Tariff", value: baseTariff },
      { name: "Anti-Dumping Duty", value: antiDumping },
      { name: "Countervailing Duty", value: countervailing },
      { name: "Section 301 Tariff", value: section301 },
    ];

    const summary = {
      baseTariff: baseTariff.toFixed(2),
      antiDumping: antiDumping.toFixed(2),
      countervailing: countervailing.toFixed(2),
      section301: section301.toFixed(2),
      totalDutyCost: (baseTariff + antiDumping + countervailing + section301).toFixed(2),
      dutyRate: dutyRate.toFixed(2),
      dataSource,
      currency: filters.currencyCode || "USD",
      modelType: filters.modelType || "Basic",
      viewImpactFor,
      route,
      shipmentValue: shipmentValue.toLocaleString(),
    };

    // 🔥 FORCE CHART UPDATE
    setBarData(barChartData);
    setPieData(pieChartData);
    setSummaryData(summary);
    
    console.log("✅ ✅ CHARTS CHANGED -", viewImpactFor, "MODE | Duty Rate:", dutyRate, "%");
  }, [tariffRows, filters, viewImpactFor]);

  // 🔥 LOAD DATA (unchanged)
  useEffect(() => {
    const loadData = async () => {
      setLoadingDropdowns(true);
      try {
        const [tariffRes, currencyRes] = await Promise.all([
          API.get("/impact-analysis/tariff"),
          API.get("/impact-analysis/currency"),
        ]);

        const rows = tariffRes.data?.data || [];
        console.log("✅ Loaded", rows.length, "tariff rows");
        setTariffRows(rows);

        const categories = Array.from(new Set(rows.map(r => r["Product Category"]))).filter(Boolean);
        setIndustryOptions(categories.map(pc => ({ productCategory: pc })));

        if (categories.length > 0) {
          const firstPC = categories[0];
          const firstSubcats = Array.from(new Set(
            rows.filter(r => r["Product Category"] === firstPC).map(r => r["Subcategory"])
          )).filter(Boolean);
          setSubIndustryOptions(firstSubcats.map(sc => ({ subcategory: sc })));
          
          setFilters(prev => ({
            ...prev,
            productCategoryId: firstPC,
            subcategoryId: firstSubcats[0] || "",
          }));
        }

        const currencies = (currencyRes.data?.data || []).map((r, idx) => ({
          id: idx,
          code: r["ISO 4217 Code"],
          label: `${r["ISO 4217 Code"]} - ${r["Currency"] || ""}`,
        }));
        setCurrencyOptions(currencies);
        if (currencies[0]) setFilters(prev => ({ ...prev, currencyCode: currencies[0].code }));

        setFilters(prev => ({ ...prev, modelType: "Advanced" }));

      } catch (e) {
        console.error("Load error:", e);
        setError("Failed to load data");
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await API.get("/impact-analysis/duty-type");
        const rows = res.data?.data || [];
        const countries = Array.from(new Set(
          rows.slice(1).flatMap(r => 
            ["column 2 duty", "Genaral duty", "special duty"]
              .map(key => r[key])
              .filter(v => v && String(v).toLowerCase() !== "country")
              .map(v => String(v).trim())
          )
        )).sort().map((name, idx) => ({ id: idx, name }));
        setCountryOptions(countries);
      } catch (e) {
        console.error("Countries error:", e);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (!filters.productCategoryId || !tariffRows.length) return;
    
    const subs = Array.from(new Set(
      tariffRows
        .filter(r => r["Product Category"] === filters.productCategoryId)
        .map(r => r["Subcategory"])
        .filter(Boolean)
    )).map(sc => ({ subcategory: sc }));
    
    setSubIndustryOptions(subs);
    setFilters(prev => ({ ...prev, subcategoryId: subs[0]?.subcategory || "" }));
  }, [filters.productCategoryId, tariffRows]);

  // ✅ Run analysis ONLY when Refresh button is clicked
useEffect(() => {
  if (tariffRows.length > 0 && !loadingDropdowns) {
    buildChartFromTariff();
  }
}, [refreshKey, viewImpactFor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("🔄 INPUT:", name, "=", value);
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRunAnalysis = () => {
    console.log("🔥 REFRESH -", viewImpactFor);
    buildChartFromTariff();
  };
  const styles = {
  // ==============================
  // MAIN CONTAINER
  // ==============================
  tariffContainer: {
    width: "100%",
    margin: "0 auto",
    padding: "20px 20px",
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif',
  },
  tariffTitle: {
    fontSize: "26px",
    fontWeight: 600,
    marginBottom: "20px",
    color: "#111827",
  },
  // ==============================
  // HEADER CARD (ADD HERE ✅)
  // ==============================
  headerCard: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: "14px",
    padding: "22px 26px",
    marginBottom: "26px",
    boxShadow: "0 8px 22px rgba(37,99,235,0.35)",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "6px",
  },
  headerSubtitle: {
    fontSize: "14px",
    opacity: 0.95,
  },

  // ==============================
  // LOADING
  // ==============================
  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: 500,
    color: "#374151",
  },

  // ==============================
  // FILTER SECTION
  // ==============================
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    backgroundColor: "#ffffff",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  filterSelect: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  filterSelectHover: {
    borderColor: "#2563eb",
  },
  filterSelectFocus: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.2)",
  },

  // ==============================
  // CHART CARDS
  // ==============================
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "18px 20px 24px",
    marginBottom: "26px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  chartCardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "16px",
  },

  // ==============================
  // TIA CARD SYSTEM
  // ==============================
  tiaCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px 28px",
    marginBottom: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  tiaCardTitle: {
    fontSize: "19px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "18px",
  },

  // ==============================
  // FILTER GRID (LIKE IMAGE 2)
  // ==============================
  tiaFiltersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "18px",
  },
  tiaField: {
    display: "flex",
    flexDirection: "column",
  },
  tiaFieldLabel: {
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "6px",
    color: "#374151",
  },
  tiaFieldInput: {
    padding: "12px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "#fff",
    outline: "none",
    height: "44px",
    width: "100%",

    
  },
  tiaFieldFocus: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 2px rgba(37,99,235,0.2)",
  },

  // ==============================
  // ACTION ROW
  // ==============================
  tiaActionsRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    fontSize: "14px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  // ==============================
  // BUYER / SELLER TOGGLE
  // ==============================
  tiaToggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  toggleButton: {
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    fontSize: "13px",
  },
  toggleButtonActive: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
  },

  // ==============================
  // CHART ROW (PIE + SUMMARY)
  // ==============================
  tiaChartRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "24px",
  },
  tiaChartLeft: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "18px 20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  tiaChartRight: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "18px 20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },

  // ==============================
  // SUMMARY LIST
  // ==============================
  tiaSummaryList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  tiaSummaryItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    borderBottom: "1px dashed #e5e7eb",
  },
  tiaSummaryTotal: {
    fontWeight: 600,
    color: "#111827",
  },

  // ==============================
  // RESPONSIVE
  // ==============================
  media900: {
    tiaChartRow: {
      gridTemplateColumns: "1fr",
    },
  },
};
const reactSelectStyles = {
  control: (base) => ({
    ...base,
    height: "44px",
    minHeight: "44px",
    borderRadius: "8px",
    borderColor: "#d1d5db",
    fontSize: "14px",
    boxShadow: "none",
    width: "100%",
    maxWidth: "200px",
    minWidth: "120px",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
    whiteSpace: "normal",
  }),
  singleValue: (provided, state) => ({
    ...provided,
    whiteSpace: "nowrap",   // allow multiple lines if needed
    overflow: "visible",    // show full text
    textOverflow: "clip",   // do not show ellipsis
  }),
  
  indicatorsContainer: (base) => ({
    ...base,
    height: "44px",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: "8px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
    color: "#111827",
    fontSize: "14px",
    cursor: "pointer",
  }),
};


  return (

  <div style={styles.tariffContainer}>
    <div style={styles.headerCard}>
  <div style={styles.headerTitle}>
    📊 Tariff Impact Analysis
  </div>
  <div style={styles.headerSubtitle}>
    Compare tariff impacts across countries, products, and time periods
  </div>
</div>

    {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}

    {/* FILTER CARD */}
    <div style={styles.tiaCard}>
      <div style={styles.tiaFiltersGrid}>
        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Year</label>
          <Select
  styles={reactSelectStyles}
  options={[
    { value: "", label: "Any" },
    ...YEARS.map(y => ({ value: y, label: y })),
  ]}
  value={
    filters.year
      ? { value: filters.year, label: filters.year }
      : { value: "", label: "Any" }
  }
  onChange={(opt) =>
    setFilters(prev => ({ ...prev, year: opt?.value || "" }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Product Category</label>
          <Select
  styles={reactSelectStyles}
  options={[
    { value: "", label: "Any" },
    ...industryOptions.map(i => ({
      value: i.productCategory,
      label: i.productCategory,
    })),
  ]}
  value={
    filters.productCategoryId
      ? { value: filters.productCategoryId, label: filters.productCategoryId }
      : { value: "", label: "Any" }
  }
  onChange={(opt) =>
    setFilters(prev => ({ ...prev, productCategoryId: opt?.value || "" }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Subcategory</label>
          <Select
  styles={reactSelectStyles}
  options={[
    { value: "", label: "Any" },
    ...subIndustryOptions.map(s => ({
      value: s.subcategory,
      label: s.subcategory,
    })),
  ]}
  value={
    filters.subcategoryId
      ? { value: filters.subcategoryId, label: filters.subcategoryId }
      : { value: "", label: "Any" }
  }
  onChange={(opt) =>
    setFilters(prev => ({ ...prev, subcategoryId: opt?.value || "" }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Period Selection</label>
          <Select
  styles={reactSelectStyles}
  options={PERIODS.map(p => ({ value: p, label: p }))}
  value={{ value: filters.period, label: filters.period }}
  onChange={(opt) =>
    setFilters(prev => ({ ...prev, period: opt.value }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Origin Country</label>
          <Select
  styles={reactSelectStyles}
  options={[
    { value: "", label: "Any" },
    ...countryOptions.map(c => ({
      value: c.name,
      label: c.name,
    })),
  ]}
  value={
    filters.originCountryCode
      ? { value: filters.originCountryCode, label: filters.originCountryCode }
      : { value: "", label: "Any" }
  }
  onChange={(opt) =>
    setFilters(prev => ({
      ...prev,
      originCountryCode: opt?.value || "",
    }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Destination Country</label>
          <Select
  styles={reactSelectStyles}
  options={[
    { value: "", label: "Any" },
    ...countryOptions.map(c => ({
      value: c.name,
      label: c.name,
    })),
  ]}
  value={
    filters.destinationCountryCode
      ? { value: filters.destinationCountryCode, label: filters.destinationCountryCode }
      : { value: "", label: "Any" }
  }
  onChange={(opt) =>
    setFilters(prev => ({
      ...prev,
      destinationCountryCode: opt?.value || "",
    }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Currency</label>
         <Select
         
  styles={reactSelectStyles}
  options={currencyOptions.map(c => ({
    value: c.code,
    label: c.label,
  }))}
  value={
    filters.currencyCode
      ? currencyOptions.find(c => c.code === filters.currencyCode)
      : null
  }
  onChange={(opt) =>
    setFilters(prev => ({
      ...prev,
      currencyCode: opt?.value || "",
    }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Model Type</label>
          <Select
  styles={reactSelectStyles}
  options={MODEL_TYPES.map(m => ({ value: m, label: m }))}
  value={{ value: filters.modelType, label: filters.modelType }}
  onChange={(opt) =>
    setFilters(prev => ({ ...prev, modelType: opt.value }))
  }
/>

        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Min Tax Rate (%)</label>
          <input
            type="number"
            name="minTaxRate"
            min={0}
            max={100}
            value={filters.minTaxRate}
            onChange={handleChange}
            style={styles.tiaFieldInput}
          />
        </div>

        <div style={styles.tiaField}>
          <label style={styles.tiaFieldLabel}>Max Tax Rate (%)</label>
          <input
            type="number"
            name="maxTaxRate"
            min={0}
            max={100}
            value={filters.maxTaxRate}
            onChange={handleChange}
            style={styles.tiaFieldInput}
          />
        </div>
      </div>

      <div style={styles.tiaActionsRow}>
        <button
             style={styles.primaryButton}
             onClick={() => setRefreshKey(prev => prev + 1)}
             disabled={loadingDropdowns}
>
           {loadingDropdowns ? "Loading..." : "🔄 Refresh Analysis"}
        </button>

      </div>
    </div>

    {/* IMPACT TOGGLE */}
    <div style={styles.tiaCard}>
      <h3 style={styles.tiaCardTitle}>Impact Configuration</h3>
      <div style={styles.tiaToggleRow}>
        <span>View Impact For:</span>
        <button
          style={{
            ...styles.toggleButton,
            ...(viewImpactFor === "Buyer" ? styles.toggleButtonActive : {}),
          }}
          onClick={() => {
            setViewImpactFor("Buyer");
            buildChartFromTariff();
          }}
        >
          Buyer
        </button>
        <button
          style={{
            ...styles.toggleButton,
            ...(viewImpactFor === "Seller" ? styles.toggleButtonActive : {}),
          }}
          onClick={() => {
            setViewImpactFor("Seller");
            buildChartFromTariff();
          }}
        >
          Seller
        </button>
      </div>
      <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
        {viewImpactFor === "Buyer"
          ? `📦 BUYER: ${filters.originCountryCode || "?"} → ${
              filters.destinationCountryCode || "?"
            }`
          : `📤 SELLER: ${filters.destinationCountryCode || "?"} → ${
              filters.originCountryCode || "?"
            }`}
      </div>
    </div>

    {/* BAR CHART */}
    <div style={styles.tiaCard}>
      <h3 style={styles.tiaCardTitle}>
        Tariff Impact ({filters.productCategoryId || "All"})
      </h3>
      {barData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="period" />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#2563eb"
              tickFormatter={(v) => `${v.toFixed(1)}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f97316"
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Duty Rate" name="Duty Rate %" fill="#2563eb" yAxisId="left" />
            <Bar dataKey="Additional Cost" name="Additional Cost $" fill="#f97316" yAxisId="right" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ ...styles.loading, minHeight: "300px" }}>Loading charts...</div>
      )}
    </div>

    {/* PIE + SUMMARY */}
    <div style={styles.tiaChartRow}>
      <div style={styles.tiaChartLeft}>
        <h3 style={styles.tiaCardTitle}>Duty Cost Breakdown</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ ...styles.loading, minHeight: "250px" }}>Waiting...</div>
        )}
      </div>

      <div style={styles.tiaChartRight}>
        <h3 style={styles.tiaCardTitle}>
          Cost Summary ({summaryData?.shipmentValue} {summaryData?.currency})
        </h3>
        {summaryData ? (
          <ul style={styles.tiaSummaryList}>
            <li style={styles.tiaSummaryItem}>
              <span>Duty Rate</span>
              <span>{summaryData.dutyRate}%</span>
            </li>
            <li style={styles.tiaSummaryItem}>
              <span>Base Tariff</span>
              <span>${summaryData.baseTariff}</span>
            </li>
            <li style={styles.tiaSummaryItem}>
              <span>Anti-Dumping</span>
              <span>${summaryData.antiDumping}</span>
            </li>
            <li style={styles.tiaSummaryItem}>
              <span>Countervailing</span>
              <span>${summaryData.countervailing}</span>
            </li>
            <li style={styles.tiaSummaryItem}>
              <span>Section 301</span>
              <span>${summaryData.section301}</span>
            </li>
            <li style={{ ...styles.tiaSummaryItem, ...styles.tiaSummaryTotal }}>
              <span>Total Duty</span>
              <span>${summaryData.totalDutyCost}</span>
            </li>
            <li style={styles.tiaSummaryItem}>
              <span>View:</span>
              <span>{summaryData.viewImpactFor}</span>
            </li>
          </ul>
        ) : (
          <div style={{ ...styles.loading, minHeight: "250px" }}>Summary loading...</div>
        )}
      </div>
    </div>
  </div>
  );
};
export default TariffImpactAnalysis;