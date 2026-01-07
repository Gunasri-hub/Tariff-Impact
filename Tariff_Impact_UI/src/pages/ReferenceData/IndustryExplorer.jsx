// src/components/IndustryExplorerPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import API from "../../Apis/authApi";
import Select from "react-select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CURRENT_YEAR = 2024;
const YEARS = [2022, 2023, 2024, 2025];

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f97316",
  "#e11d48",
  "#6366f1",
  "#14b8a6",
  "#facc15",
  "#ec4899",
];

const formatPercent = (v) => `${v}%`;
const formatNumber = (v) =>
  typeof v === "number"
    ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : v;

function getShortLabel(text = "") {
  if (!text) return "";
  const cleaned = text.replace(/<[^>]+>/g, "").trim();
  const byColon = cleaned.split(":");
  const firstPart = byColon[0];
  const main = firstPart.split(/[;,]/)[0];
  return main.trim();
}

// shorter label only for chart X-axis
function getVeryShortLabel(text = "") {
  const short = getShortLabel(text);
  if (short.length <= 18) return short;
  return short.slice(0, 15) + "…";
}

function IndustryExplorerPage() {
  const [filters, setFilters] = useState({
    country: "",
    year: CURRENT_YEAR,
    currency: "",
    industry: "",
    subIndustry: "",
    htsCode: "",
  });

  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [subIndustries, setSubIndustries] = useState([]);
  const [htsCodes, setHtsCodes] = useState([]);

  const [trendRaw, setTrendRaw] = useState([]);
  const [distributionRaw, setDistributionRaw] = useState([]);
  const [subIndustryDutyRaw, setSubIndustryDutyRaw] = useState([]);
  const [htsRows, setHtsRows] = useState([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [menuPortalTarget, setMenuPortalTarget] = useState(null);
  useEffect(() => {
    if (typeof document !== "undefined") {
      setMenuPortalTarget(document.body);
    }
  }, []);

  const [selectedTreeSubIndustry, setSelectedTreeSubIndustry] = useState("");

  // initial dropdown data
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setError("");
        const [countriesRes, currenciesRes, industriesRes] = await Promise.all([
          API.get("/countries-list"),
          API.get("/currencies"),
          API.get("/industries-list"),
        ]);

        const countriesData = countriesRes.data || [];
        const currenciesData = currenciesRes.data || [];
        const industriesData = industriesRes.data || [];

        setCountries(countriesData);
        setCurrencies(currenciesData);
        setIndustries(industriesData);

        const defaultIndustry = industriesData[0]?.industry || "";

        setFilters((prev) => ({
          ...prev,
          country: countriesData[0]?.country || "",
          currency: currenciesData[0]?.code || "",
          industry: defaultIndustry,
        }));
      } catch (err) {
        console.error("Initial dropdown load error", err);
        setError("Failed to load initial dropdown data.");
      }
    };

    loadInitial();
  }, []);

  // dependent dropdowns
  useEffect(() => {
    if (!filters.industry) return;

    const loadSubs = async () => {
      try {
        setError("");
        const res = await API.get("/sub-industries-list", {
          params: { industry: filters.industry },
        });
        const subs = res.data || [];
        setSubIndustries(subs);
        const defaultSub = subs[0]?.sub_industry || "";
        setFilters((prev) => ({
          ...prev,
          subIndustry: defaultSub,
          htsCode: "",
        }));
        setSelectedTreeSubIndustry(defaultSub);
      } catch (err) {
        console.error("Sub-industries load error", err);
        setError("Failed to load sub-industries.");
      }
    };

    loadSubs();
  }, [filters.industry]);

  useEffect(() => {
    if (!filters.industry || !filters.subIndustry) return;

    const loadHtsCodes = async () => {
      try {
        setError("");
        const res = await API.get("/hts-codes-list", {
          params: {
            industry: filters.industry,
            subIndustry: filters.subIndustry,
          },
        });
        setHtsCodes(res.data || []);
      } catch (err) {
        console.error("HTS codes load error", err);
        setError("Failed to load HTS codes.");
      }
    };

    loadHtsCodes();
  }, [filters.industry, filters.subIndustry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    const defaultIndustry = industries[0]?.industry || "";
    setFilters((prev) => ({
      ...prev,
      year: CURRENT_YEAR,
      country: countries[0]?.country || "",
      currency: currencies[0]?.code || "",
      industry: defaultIndustry,
      subIndustry: "",
      htsCode: "",
    }));
    setTrendRaw([]);
    setDistributionRaw([]);
    setSubIndustryDutyRaw([]);
    setHtsRows([]);
    setError("");
    setSelectedTreeSubIndustry("");
  };

  const runAnalysis = async () => {
    const { year, industry, subIndustry, htsCode } = filters;

    try {
      setIsLoading(true);
      setError("");

      const [trendRes, distRes, subDutyRes, htsRes] = await Promise.all([
        API.get("/industry/trend", { params: { industry, subIndustry } }),
        API.get("/industry/distribution", { params: { year, industry } }),
        API.get("/industry/sub-industry-duties", {
          params: { year, industry },
        }),
        API.get("/industry/hts-codes", {
          params: { industry, subIndustry, htsCode },
        }),
      ]);

      setTrendRaw(trendRes.data || []);
      setDistributionRaw(distRes.data || []);
      setSubIndustryDutyRaw(subDutyRes.data || []);
      setHtsRows(htsRes.data || []);
    } catch (err) {
      console.error("runAnalysis error", err);
      if (err.response) {
        setError(
          `Analysis failed: ${err.response.status} ${
            err.response.data?.message || ""
          }`.trim()
        );
      } else {
        setError(`Analysis failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const shortIndustry = getShortLabel(filters.industry);
  const shortSubIndustry = getShortLabel(filters.subIndustry);

  const trend = useMemo(() => {
    const byYear = new Map();
    (trendRaw || []).forEach((row) => {
      if (row.year != null) byYear.set(Number(row.year), row);
    });

    return YEARS.map((y) => {
      const row = byYear.get(y) || {};
      return {
        year: y,
        avgDuty: Number(row.avgDuty ?? 0),
        tradeVolume: Number(row.tradeVolume ?? 0),
      };
    });
  }, [trendRaw]);

  const distributionTop = useMemo(() => {
    const shaped = (distributionRaw || []).map((row, idx) => ({
      industry: row.industry || "",
      shortIndustry: getShortLabel(row.industry || ""),
      tradeVolume: Number(row.tradeVolume ?? 0),
      avgDuty: Number(row.avgDuty ?? 0),
      color: COLORS[idx % COLORS.length],
    }));

    return shaped.sort((a, b) => (b.tradeVolume || 0) - (a.tradeVolume || 0));
  }, [distributionRaw]);

  const topSubIndustryDuties = useMemo(
    () =>
      (subIndustryDutyRaw || [])
        .map((row) => ({
          subIndustry: row.sub_industry || "",
          shortSubIndustry: getVeryShortLabel(row.sub_industry || ""),
          avgDuty: Number(row.avgDuty ?? 0),
        }))
        .sort((a, b) => (b.avgDuty || 0) - (a.avgDuty || 0))
        .slice(0, 5),
    [subIndustryDutyRaw]
  );

  const treeRootNode = useMemo(
    () =>
      filters.industry
        ? {
            label: shortIndustry || "Industry",
            full: filters.industry,
          }
        : null,
    [filters.industry, shortIndustry]
  );

  const treeChildren = useMemo(
    () =>
      (subIndustryDutyRaw || []).map((row) => ({
        label: getShortLabel(row.sub_industry || ""),
        full: row.sub_industry || "",
      })),
    [subIndustryDutyRaw]
  );

  return (
    <>
      <style>{`
        /* Page background & wrapper */
        .industry-page {
          padding: 24px 0;
          background-color: #f5f7fb;
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* FULL‑WIDTH wrapper instead of fixed 1180px */
        .industry-page .content-wrapper {
          max-width: 100%;
          width: 100%;
          margin: 0 ; /* side margin so card doesn't touch edges */
          }

        /* Card container */
        .industry-page .card {
          width: 100%;
          background: #ffffff;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
          margin-bottom: 24px;
        }

        .industry-page .panel-card {
          margin-bottom: 24px;
        }

        /* Headers and text */
        .industry-page .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .industry-page .panel-header.no-bottom {
          margin-bottom: 8px;
        }

        .industry-page .panel-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #0f172a;
        }

        .industry-page .panel-subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .industry-page .card-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: #0f172a;
        }

        .industry-page .card-subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .industry-page .small-title {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .industry-page .empty-state {
          font-size: 13px;
          color: #9ca3af;
        }

        /* Buttons */
        .industry-page .btn {
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .industry-page .btn.primary {
          background-color: #2563eb;
          color: #ffffff;
        }

        .industry-page .btn.ghost {
          background-color: #ffffff;
          color: #111827;
          border-color: #e5e7eb;
          margin-right: 8px;
        }

        .industry-page .panel-actions {
          display: flex;
          align-items: center;
        }

        /* Control panel grid */
        .industry-page .panel-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.1fr 1.8fr 1.6fr 1.6fr 1.6fr;
          column-gap: 16px;
        }

        .industry-page .panel-field {
          margin-top: 8px;
        }

        .industry-page .panel-field label {
          font-size: 12px;
          color: #6b7280;
          display: block;
          margin-bottom: 4px;
        }

        .industry-page .panel-field select {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          font-size: 13px;
          background-color: #ffffff;
        }

        /* react-select (rs_) */
        .industry-page .rs-select {
          font-size: 13px;
        }

        .industry-page .rs__control {
          min-height: 36px !important;
          border-radius: 8px !important;
          border-color: #e5e7eb !important;
        }

        .industry-page .rs__value-container {
          padding: 0 8px !important;
        }

        .industry-page .rs__menu {
          max-width: 260px;
        }

        /* Charts layout */

        /* Row 1: Tariff Trend (3) + Country Comparison (2) */
        .industry-page .charts-row {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
          min-width: 0; /* important for Recharts in CSS grid */
        }

        /* Row 2 in Industry Distribution card: pie (1) + bar (1) */
        .industry-page .charts-row.wide {
          grid-template-columns: 1fr 1fr;
        }

        /* Chart cards */
        .industry-page .chart-card {
          height: 280px;
          min-height: 280px;
        }

        .industry-page .chart-card.no-shadow {
          box-shadow: none;
          padding: 12px 0 0 0;
        }

        /* Inner chart body */
        .industry-page .chart-body {
          height: 210px;
          min-height: 210px;
          padding: 8px 4px;
        }

        /* HTS section */
        .industry-page .hts-card {
          margin-top: 4px;
        }

        /* -------- Figma-style HTS list -------- */

        .industry-page .hts-list-card {
          padding-top: 16px;
        }

        .industry-page .hts-empty {
          font-size: 13px;
          color: #9ca3af;
          padding: 12px 4px;
        }

        /* Container for all HTS items */
        .industry-page .hts-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Single HTS row card */
        .industry-page .hts-item {
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          padding: 16px 20px;
          background: radial-gradient(circle at top left, #f9fafb 0, #ffffff 40%);
        }

        /* Top line: code + description */
        .industry-page .hts-main {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 20px;
          margin-bottom: 10px;
        }

        .industry-page .hts-code {
          font-weight: 700;
          font-size: 16px;
          color: #111827;
          min-width: 96px;
        }

        .industry-page .hts-desc {
          flex: 1;
        }

        .industry-page .hts-industry {
          font-size: 14px;
          color: #111827;
        }

        .industry-page .hts-sub {
          font-size: 13px;
          color: #6b7280;
        }

        /* Bottom meta row */
        .industry-page .hts-meta {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px 32px;
          margin-top: 4px;
        }

        .industry-page .meta-block {
          font-size: 12px;
        }

        .industry-page .meta-label {
          color: #00050e;
          margin-right: 4px;
        }

        /* Brighter duty/year values */
        .industry-page .meta-value {
          color: #111827;
          font-weight: 500;
        }

        .industry-page .meta-value.highlight {
          color: #42464f;          /* bright blue */
          font-weight: 600;
        }

        /* Responsive behavior */
        @media (max-width: 900px) {
          .industry-page .hts-meta {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .industry-page .hts-main {
            flex-direction: column;
            align-items: flex-start;
          }

          .industry-page .hts-meta {
            grid-template-columns: 1fr 1fr;
          }
        }
        /* Single full-width row (only Tariff Trend) */
        .industry-page .charts-row.single {
          grid-template-columns: 1fr;
        }

        .industry-page .chart-card.tall {
          height: 340px;
          min-height: 320px;
        }
        .industry-page .chart-body.tall-body {
          height: calc(100% - 70px);
          min-height: 250px;
        }
        /* Horizontal decomposition tree */

        .decomp-tree.horizontal {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 12px;
        }

        .tree-horizontal-container {
          display: grid;
          grid-template-columns: auto 80px 1fr; /* root | connectors | children */
          align-items: center;
          column-gap: 16px;
        }

        /* Root column */
        .tree-root-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Middle column: main vertical line + spokes up/down */
        .tree-connector-col {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* main vertical bar from top child to bottom child */
        .tree-main-connector {
          width: 2px;
          height: 70%;
          background: #e5e7eb;
        }

        /* each spoke is a small horizontal curve from main line to child row */
        .tree-spokes {
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          height: 70%;
          pointer-events: none;
        }

        .tree-spoke {
          position: relative;
          width: 40px;
          height: 18px;
        }

        .tree-spoke::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 40px;
          height: 2px;
          background: #e5e7eb;
        }

        /* Children column */
        .tree-children-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Node styles */

        .tree-node {
          border-radius: 8px;
          padding: 8px 12px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          min-width: 190px;
          text-align: left;
        }

        .tree-node-root {
          background: #2563eb;
          border-color: #1d4ed8;
          color: #ffffff;
        }

        .tree-node-child {
          background: #f9fafb;
          border-color: #e5e7eb;
          color: #111827;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            border-color 0.12s ease;
        }

        .tree-node-child:hover {
          transform: translateX(2px);
          box-shadow: 0 4px 8px rgba(15, 23, 42, 0.12);
          border-color: #93c5fd;
        }

        .tree-node-selected {
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25);
        }

        .tree-node-title {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .tree-node-subtitle {
          display: block;
          font-size: 11px;
          opacity: 0.9;
        }

        .empty-state.small {
          font-size: 12px;
        }
        .tree-connector-col.curved {
          position: relative;
          width: 140px;  
          z-index : 0;        /* space for curves */
        }

        .tree-connector-svg {
          width: 100%;
          height: 100%;
        }

        .tree-branch-path {
          fill: none;
          stroke: #d4d4d8;       /* light grey */
          stroke-width: 4;
          stroke-linecap: round;
        }
        .tree-children-col {
          position: relative;
          z-index: 1;              /* above curves */
        }

        .tree-children-stack {
          margin-left: 12px;       /* push boxes right of the curves */
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* row with two equal cards */
        .charts-row.equal {
          display: grid;
          grid-template-columns: 1fr 1fr;   /* 2 equal columns */
          gap: 16px;
        }

        /* card shell */
        .card.chart-card.tall {
          display: flex;
          flex-direction: column;
          height: 340px;                    /* same height for both charts */
        }

        /* header area inside card */
        .card.chart-card.tall .panel-header.no-bottom {
          padding-bottom: 0;
        }

        /* chart area fills remaining height */
        .chart-body.tall-body {
          flex: 1;
          min-height: 0;
        }

        /* Recharts container always fills card body */
        .chart-body.tall-body > .recharts-responsive-container {
          width: 100% !important;
          height: 100% !important;
        }

        .card.chart-card .recharts-default-legend {
          margin-top: 0;
        }

        .charts-row.equal .chart-card.no-shadow.tall {
          display: flex;
          flex-direction: column;
          height: 320px;        /* same height for tree and chart */
        }

        /* tree body should stretch like chart body */
        .decomp-tree.horizontal {
          flex: 1;
          min-height: 0;
        }

        /* trade volume card body already uses this */
        .chart-body.tall-body {
          flex: 1;
          min-height: 0;
        }

        /* Error banner */
        .industry-page .error-banner {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-top: 16px;
        }
/* ==============================
   INDUSTRY EXPLORER TOP BAR
================================ */
.industry-header {
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
  color: #ffffff;
  padding: 18px 24px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
}

.industry-header-title {
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.industry-header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}
/* REMOVE space below yellow header */
.main-header {
  padding-bottom: 0;
  margin-bottom: 0;
}

/* REMOVE h1 bottom margin completely */
.main-header h1 {
  margin-bottom: 0;
}


      `}</style>
      <div className="industry-page">

        <div className="content-wrapper">
          <div className="industry-header">
            <div className="industry-header-title">
              🏭 Industry Explorer
            </div>
            <div className="industry-header-subtitle">
              Analyze trade volumes and agreements by industry sector
            </div>
          </div>

          {/* Control Panel */}
          <div className="card panel-card">
            
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Industry Analysis Control Panel</h2>
                <p className="panel-subtitle">
                  Select parameters to analyze tariff data dynamically
                </p>
              </div>
              <div className="panel-actions">
                <button className="btn ghost" onClick={resetFilters}>
                  Reset
                </button>
                <button
                  className="btn primary"
                  onClick={runAnalysis}
                  disabled={isLoading}
                >
                  {isLoading ? "Running..." : "Run Analysis"}
                </button>
              </div>
            </div>

            <div className="panel-grid">
              <div className="panel-field">
                <label>Country</label>
                <select
                  name="country"
                  value={filters.country}
                  onChange={handleChange}
                >
                  {countries.map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-field">
                <label>Year</label>
                <select name="year" value={filters.year} onChange={handleChange}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-field">
                <label>Currency</label>
                <select
                  name="currency"
                  value={filters.currency}
                  onChange={handleChange}
                >
                  {currencies.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-field">
                <label>Industry</label>
                <Select
                  className="rs-select"
                  classNamePrefix="rs"
                  value={
                    filters.industry
                      ? { value: filters.industry, label: shortIndustry }
                      : null
                  }
                  onChange={(opt) =>
                    setFilters((prev) => ({
                      ...prev,
                      industry: opt?.value || "",
                    }))
                  }
                  options={industries.map((i) => ({
                    value: i.industry,
                    label: getShortLabel(i.industry),
                  }))}
                  isClearable={false}
                  menuPortalTarget={menuPortalTarget}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              <div className="panel-field">
                <label>Sub-Industry</label>
                <Select
                  className="rs-select"
                  classNamePrefix="rs"
                  value={
                    filters.subIndustry
                      ? { value: filters.subIndustry, label: shortSubIndustry }
                      : null
                  }
                  onChange={(opt) =>
                    setFilters((prev) => ({
                      ...prev,
                      subIndustry: opt?.value || "",
                    }))
                  }
                  options={subIndustries.map((s) => ({
                    value: s.sub_industry,
                    label: getShortLabel(s.sub_industry),
                  }))}
                  placeholder="Select sub-industry"
                  isClearable={false}
                  menuPortalTarget={menuPortalTarget}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              <div className="panel-field">
                <label>HTS Code</label>
                <Select
                  className="rs-select"
                  classNamePrefix="rs"
                  value={
                    filters.htsCode
                      ? { value: filters.htsCode, label: filters.htsCode }
                      : { value: "", label: "All codes" }
                  }
                  onChange={(opt) =>
                    setFilters((prev) => ({ ...prev, htsCode: opt?.value || "" }))
                  }
                  options={[
                    { value: "", label: "All codes" },
                    ...htsCodes.map((h) => ({
                      value: h.hts_code,
                      label: h.hts_code,
                    })),
                  ]}
                  isClearable={false}
                  menuPortalTarget={menuPortalTarget}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}
          </div>

          {/* Row 1 */}
          <div className="charts-row equal">
            {/* Tariff Rate Trend */}
            <div className="card chart-card tall">
              <div className="panel-header no-bottom">
                <div>
                  <h3 className="card-title">Tariff Rate Trend</h3>
                  <p className="card-subtitle">
                    Historical tariff trends for {shortIndustry || "industry"}
                  </p>
                </div>
              </div>
              <div className="chart-body tall-body">
                {trend.every((p) => !p.avgDuty && !p.tradeVolume) ? (
                  <span className="empty-state">Run Analysis to view data.</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trend}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis
                        yAxisId="left"
                        tickFormatter={formatPercent}
                        domain={[0, (max) => (max || 0) + 2]}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, (max) => (max || 0) * 1.1 + 1]}
                        tickFormatter={formatNumber}
                      />
                      <Tooltip
                        cursor={{ stroke: "#93c5fd", strokeWidth: 1 }}
                        labelFormatter={(label) => `${label}`}
                        formatter={(value, name) =>
                          name === "Tariff Rate (%)"
                            ? [`${value}%`, name]
                            : [formatNumber(value), name]
                        }
                      />
                      <Legend verticalAlign="bottom" height={24} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="avgDuty"
                        name="Tariff Rate (%)"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="tradeVolume"
                        name="Trade Volume"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Sub‑Industries */}
            <div className="card chart-card tall">
              <div className="panel-header no-bottom">
                <div>
                  <h3 className="card-title">Top Sub‑Industries by Tariff</h3>
                  <p className="card-subtitle">
                    Highest average general duty for {shortIndustry || "industry"}
                  </p>
                </div>
              </div>
              <div className="chart-body tall-body">
                {topSubIndustryDuties.length === 0 ? (
                  <span className="empty-state">Run Analysis to view data.</span>
                ) : topSubIndustryDuties.every(
                    (d) => d.avgDuty == null || d.avgDuty === 0
                  ) ? (
                  <span className="empty-state">
                    There is no duty for the selected industry and sub‑industry.
                  </span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}%`,
                          props.payload.subIndustry || "Average Duty",
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ paddingTop: 8 }}
                      />
                      <Pie
                        data={topSubIndustryDuties}
                        dataKey="avgDuty"
                        nameKey="shortSubIndustry"
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        label={(props) => {
                          const { shortSubIndustry, percent } = props;
                          // hide labels smaller than 5%
                          if (!percent || percent * 100 < 5) return null;
                          return `${shortSubIndustry} ${(percent * 100).toFixed(1)}%`;
                        }}
                      >
                        {topSubIndustryDuties.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: tree + Trade Volume chart */}
          <div className="card hts-card">
            <div className="panel-header no-bottom">
              <div>
                <h3 className="card-title">Industry And Sub-Industry Analysis</h3>
              </div>
            </div>

            <div className="charts-row equal">
              {/* Horizontal tree */}
              <div className="chart-card no-shadow tall">
                <h4 className="small-title">Industry → Sub‑Industry Tree</h4>
                <div className="decomp-tree horizontal">
                  {treeRootNode ? (
                    <div className="tree-horizontal-container">
                      <div className="tree-root-col">
                        <div className="tree-node tree-node-root">
                          <span className="tree-node-title">
                            {treeRootNode.label}
                          </span>
                        </div>
                      </div>

                      {/* Curved SVG connectors */}
                      <div className="tree-connector-col curved">
                        <svg
                          className="tree-connector-svg"
                          viewBox="0 0 120 100"
                          preserveAspectRatio="none"
                        >
                          {treeChildren.map((_, idx) => {
                            const count = treeChildren.length || 1;
                            const yStep = count > 1 ? 100 / (count + 1) : 50;
                            const y = yStep * (idx + 1);
                            return (
                              <path
                                key={idx}
                                className="tree-branch-path"
                                d={`M 0 50 C 40 50, 60 ${y}, 120 ${y}`}
                              />
                            );
                          })}
                        </svg>
                      </div>

                      <div className="tree-children-col">
                        {treeChildren.length === 0 ? (
                          <span className="empty-state small">
                            Run Analysis to fetch sub‑industries.
                          </span>
                        ) : (
                          <div className="tree-children-stack">
                            {treeChildren.map((child) => (
                              <button
                                key={child.full}
                                type="button"
                                className={
                                  "tree-node tree-node-child" +
                                  (selectedTreeSubIndustry === child.full
                                    ? " tree-node-selected"
                                    : "")
                                }
                                onClick={() => setSelectedTreeSubIndustry(child.full)}
                              >
                                <span className="tree-node-title">{child.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="empty-state">
                      Run Analysis to view the tree.
                    </span>
                  )}
                </div>
              </div>
              {/* Trade Volume by Industry – line + column */}
              <div className="chart-card no-shadow tall">
                <h4 className="small-title">Trade Volume And Trend by Industry</h4>
                <div className="chart-body tall-body">
                  {distributionTop.length === 0 ? (
                    <span className="empty-state">Run Analysis to view data.</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={distributionTop}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid
                          stroke="#e5e7eb"
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          dataKey="shortIndustry"
                          interval={0}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, (max) => (max || 0) * 1.1]}
                          tickFormatter={formatNumber}
                        />
                        <Tooltip
                          labelFormatter={(label, payload) =>
                            payload?.[0]?.payload?.shortIndustry || label
                          }
                          formatter={(value, name) => [
                            formatNumber(value),
                            name,
                          ]}
                        />
                        <Legend verticalAlign="top" height={24} />

                        <Bar
                          dataKey="tradeVolume"
                          name="Trade Volume (rows)"
                          fill="#10b981"
                          barSize={60}
                          radius={[2, 2, 0, 0]}
                        />

                        <Line
                          type="monotone"
                          dataKey="tradeVolume"
                          name="Trend"
                          stroke="#1d4ed8"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 4 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HTS list */}
          <div className="card hts-card hts-list-card">
            <h3 className="card-title">
              Available HTS Codes - {shortSubIndustry || "All"}
            </h3>
            <p className="card-subtitle">
              Detailed tariff information for selected sub-industry
            </p>

            {htsRows.length === 0 && (
              <div className="hts-empty">Run Analysis to view HTS codes.</div>
            )}

            <div className="hts-list">
              {htsRows.map((row) => {
                const cleanIndustry = String(row.industry || "").replace(
                  /<[^>]+>/g,
                  ""
                );
                const cleanSub = String(row.sub_industry || "").replace(
                  /<[^>]+>/g,
                  ""
                );

                return (
                  <div className="hts-item" key={row.id}>
                    <div className="hts-main">
                      <div className="hts-code">{row.hts_code}</div>
                      <div className="hts-desc">
                        <div className="hts-industry">{cleanIndustry}</div>
                        <div className="hts-sub">{cleanSub}</div>
                      </div>
                    </div>

                    <div className="hts-meta">
                      <div className="meta-block">
                        <span className="meta-label">General Duty:</span>
                        <span className="meta-value highlight">
                          {row.general_duty || "—"}
                        </span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-label">Special Duty:</span>
                        <span className="meta-value highlight">
                          {row.special_duty || "—"}
                        </span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-label">Column 2:</span>
                        <span className="meta-value highlight">
                          {row.column2_duty || "—"}
                        </span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-label">Year:</span>
                        <span className="meta-value highlight">
                          {row.year || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IndustryExplorerPage;