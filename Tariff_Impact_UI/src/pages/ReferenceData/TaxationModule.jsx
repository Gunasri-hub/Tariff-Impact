// src/components/TaxationModule.js
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import API from "../../Apis/authApi"; // use the axios instance with baseURL
// OR: import { getIndustryRates, getTaxSummary, refreshTaxData } from "../../Apis/authApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#dc2626", "#16a34a"]; // blue, red, green

const TaxationModule = () => {
  const [filters, setFilters] = useState({
    direct: true,
    indirect: true,
    withholding: true,
  });
  const [industryRates, setIndustryRates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const taxTypes = [
        filters.direct && "direct",
        filters.indirect && "indirect",
        filters.withholding && "withholding",
      ]
        .filter(Boolean)
        .join(",");

      // baseURL = http://localhost:8080/api/metadata
      const [ratesRes, summaryRes] = await Promise.all([
        API.get("/taxation/industry-rates", {
          params: { country: "US", taxTypes },
        }),
        API.get("/taxation/summary", { params: { country: "US" } }),
      ]);

      // Normalize data for Recharts: flatten industry name and cast numbers
      // Normalize data for Recharts: flatten industry name and cast numbers
// Normalize data for Recharts: flatten industry name and cast numbers
const normalizedRates = ratesRes.data.map((row) => ({
  industryId: row.industry_id,
  industryName: row.industry?.name,
  direct_tax_pct: Number(row.direct_tax_pct),
  indirect_tax_pct: Number(row.indirect_tax_pct),
  withholding_tax_pct: Number(row.withholding_tax_pct),
}));

// Pick first 5 UNIQUE industries
const fiveIndustries = [];
const seen = new Set();

for (const r of normalizedRates) {
  if (!r.industryName || seen.has(r.industryId)) continue;
  seen.add(r.industryId);
  fiveIndustries.push(r);
  if (fiveIndustries.length === 5) break;
}

setIndustryRates(fiveIndustries);
setSummary(summaryRes.data);

    } catch (err) {
      console.error("Failed to load taxation data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  const pieData =
    summary &&
    [
      { name: "Direct Tax", value: summary.direct_avg },
      { name: "Indirect Tax", value: summary.indirect_avg },
      { name: "Withholding Tax", value: summary.withholding_avg },
    ];

  const handleLiveRefresh = async () => {
    setLoading(true);
    try {
      await API.post("/taxation/refresh"); // POST http://localhost:8080/api/metadata/taxation/refresh
      await loadData();
    } catch (err) {
      console.error("Live refresh failed", err);
    } finally {
      setLoading(false);
    }
  };

  // helper to download report (if you implement this endpoint later)
  const downloadReport = (format) => {
    window.open(
      `http://localhost:8080/api/metadata/taxation/report?country=US&format=${format}`,
      "_blank"
    );
  };

//excel//
const handleExportExcel = () => {
  if (!industryRates.length) {
    console.error("No data to export");
    return;
  }

  const exportData = industryRates.map((row) => ({
    Industry: row.industryName,
    "Direct Tax (%)": row.direct_tax_pct,
    "Indirect Tax (%)": row.indirect_tax_pct,
    "Withholding Tax (%)": row.withholding_tax_pct,
    "Total Effective Tax (%)":
      row.direct_tax_pct +
      row.indirect_tax_pct +
      row.withholding_tax_pct,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Tax Analysis"
  );

  XLSX.writeFile(
    workbook,
    "Industry_Tax_Analysis.xlsx"
  );
};


  return (
    <>
      {/* Top header */}
      <section className="welcome-strip">
        <h2>Taxation Module</h2>
        <p>Analyze direct, indirect and withholding taxes by industry.</p>
      </section>

      {/* Filters + live refresh button */}
      <section className="qa-section">
        <h3 className="section-title">Tax Type Filters</h3>

        <div className="qa-grid">
          <label className="qa-card">
            <input
              type="checkbox"
              checked={filters.direct}
              onChange={() => handleFilterChange("direct")}
            />
            <span>Direct Tax</span>
          </label>
          <label className="qa-card">
            <input
              type="checkbox"
              checked={filters.indirect}
              onChange={() => handleFilterChange("indirect")}
            />
            <span>Indirect Tax</span>
          </label>
          <label className="qa-card">
            <input
              type="checkbox"
              checked={filters.withholding}
              onChange={() => handleFilterChange("withholding")}
            />
            <span>Withholding Tax</span>
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
          <button className="view-all-btn" onClick={loadData} disabled={loading}>
            {loading ? "Loading..." : "Apply Filters"}
          </button>
          <button
            className="view-all-btn"
            onClick={handleLiveRefresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Sync Electronics (Live)"}
          </button>
        </div>
      </section>

      {/* Top row: Bar chart + summary cards */}
      <section className="dash-row">
        {/* Left: bar chart */}
        <div className="panel panel-left">
          <h3 className="section-title">Tax Rates by Industry</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={industryRates}>
  <XAxis dataKey="industryName" />
  <YAxis />
  <Tooltip />
  {filters.direct && (
    <Bar dataKey="direct_tax_pct" fill="#2563eb" name="Direct Tax" />
  )}
  {filters.indirect && (
    <Bar dataKey="indirect_tax_pct" fill="#dc2626" name="Indirect Tax" />
  )}
  {filters.withholding && (
    <Bar
      dataKey="withholding_tax_pct"
      fill="#16a34a"
      name="Withholding Tax"
    />
  )}
</BarChart>

            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: summary cards */}
        {summary && (
          <div className="panel panel-right">
            <h3 className="section-title">Tax Analysis Summary</h3>

            <div className="insight-line insight-blue">
              <span>Average Direct Tax Rate</span>
              <strong>{summary.direct_avg.toFixed(1)}%</strong>
            </div>
            <div className="insight-line insight-red">
              <span>Average Indirect Tax Rate</span>
              <strong>{summary.indirect_avg.toFixed(1)}%</strong>
            </div>
            <div className="insight-line insight-green">
              <span>Average Withholding Tax Rate</span>
              <strong>{summary.withholding_avg.toFixed(1)}%</strong>
            </div>
            <div className="insight-line">
              <span>Total Effective Tax Rate</span>
              <strong>{summary.total_effective.toFixed(1)}%</strong>
            </div>
          </div>
        )}
      </section>

      {/* Bottom row: Pie chart + export */}
      {summary && (
        <section className="dash-row" style={{ marginTop: 24 }}>
          {/* Left: pie + legend */}
          <div className="panel panel-left">
            <h3 className="section-title">Tax Composition Breakdown</h3>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="recent-list">
              <li className="recent-item">
                <span className="recent-title">Direct Tax</span>
                <span className="recent-meta">
                  {summary.direct_avg.toFixed(1)}%
                </span>
              </li>
              <li className="recent-item">
                <span className="recent-title">Indirect Tax</span>
                <span className="recent-meta">
                  {summary.indirect_avg.toFixed(1)}%
                </span>
              </li>
              <li className="recent-item">
                <span className="recent-title">Withholding Tax</span>
                <span className="recent-meta">
                  {summary.withholding_avg.toFixed(1)}%
                </span>
              </li>
            </ul>
          </div>

          {/* Right: export panel */}
          <div className="panel panel-right">
            <h3 className="section-title">Export Tax Analysis Report</h3>
            <p>
              Generate a comprehensive tax analysis report including all
              selected tax types, industry comparisons, and detailed breakdowns.
            </p>
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
             <button
             className="view-all-btn"
            onClick={handleExportExcel}
>
           Export to Excel
           </button>


            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default TaxationModule;
