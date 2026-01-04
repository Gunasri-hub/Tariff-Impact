// src/components/ForexAnalysis.js
import React, { useEffect, useState } from "react";
import { getForexCurrencies, analyzeForex } from "../../Apis/authapi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



function ForexAnalysis() {
  const [currencies, setCurrencies] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(1000);
  const [year, setYear] = useState(2024);

  const [rate, setRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [date, setDate] = useState(null);

  const [history, setHistory] = useState([]);
  const [volatilityPercent, setVolatilityPercent] = useState(null);
  const [volatilityLabel, setVolatilityLabel] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ ALL CSS STYLES INLINE
  const styles = {
    // ===== MAIN CONTAINER =====
    forexMain: {
      padding: "16px 20px",
    },
    // ===== TOPBAR =====
    forexTopbar: {
      h1: {
        fontSize: "18px",
        fontWeight: 600,
        marginBottom: "16px",
        color: "#111827",
      },
    },
    // ===== FILTERS CARD =====
    forexFiltersCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "16px 18px",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
      marginBottom: "16px",
    },
    forexFiltersTitle: {
      fontSize: "14px",
      fontWeight: 500,
      margin: "0 0 10px 0",
      color: "#111827",
    },
    forexFiltersGrid: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1.2fr 0.8fr 0.9fr 0.9fr",
      gap: "16px",
    },
    // ===== FILTER FIELD =====
    filterField: {
      label: {
        display: "block",
        fontSize: "11px",
        color: "#6b7280",
        marginBottom: "4px",
      },
      select: {
        width: "100%",
        padding: "7px 9px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        fontSize: "13px",
        backgroundColor: "#fff",
      },
      input: {
        width: "100%",
        padding: "7px 9px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        fontSize: "13px",
        backgroundColor: "#fff",
      },
      focus: {
        outline: "none",
        borderColor: "#0f5ef7",
        boxShadow: "0 0 0 1px rgba(15, 94, 247, 0.12)",
      },
    },
    filterActions: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
    },
    filterButton: {
      width: "100%",
      border: "none",
      borderRadius: "999px",
      padding: "8px 0",
      background: "#0f5ef7",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    filterButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    // ===== ERROR BANNER =====
    errorBanner: {
      marginTop: "8px",
      marginBottom: "8px",
      padding: "8px 10px",
      borderRadius: "8px",
      background: "#fee2e2",
      color: "#b91c1c",
      fontSize: "12px",
    },
    // ===== SUMMARY STRIP =====
    forexSummaryStrip: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1.4fr",
      gap: "16px",
      margin: "16px 0",
    },
    forexCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "16px 18px",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    },
    forexCardRate: {
      background: "linear-gradient(90deg, #f9fafb, #ffffff)",
    },
    forexCardAmount: {
      background: "linear-gradient(90deg, #ecfdf3, #ffffff)",
    },
    forexCardVol: {
      background: "linear-gradient(90deg, #fef9c3, #ffffff)",
    },
    forexCardH3: {
      fontSize: "13px",
      margin: "0 0 6px 0",
      color: "#111827",
    },
    forexMainValue: {
      fontSize: "18px",
      fontWeight: 600,
      margin: "0 0 2px 0",
      color: "#111827",
    },
    forexSubtext: {
      fontSize: "11px",
      color: "#9ca3af",
      margin: "0",
    },
    forexPlaceholder: {
      fontSize: "12px",
      color: "#9ca3af",
      margin: "0",
    },
    // ===== CHART CARDS =====
    forexChartCard: {
      marginTop: "4px",
      background: "#ffffff",
      borderRadius: "12px",
      padding: "16px 18px 20px",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    },
    forexChartCardH2: {
      fontSize: "14px",
      margin: "0 0 10px 0",
      color: "#111827",
    },
    forexChartWrapper: {
      background: "#f9fafb",
      borderRadius: "10px",
      padding: "10px 12px",
      height: "350px",
    },
    forexVolatilityChartWrapper: {
      background: "#f9fafb",
      borderRadius: "10px",
      padding: "10px 12px",
      height: "300px",
    },
    // ===== INSIGHTS & IMPACT =====
    insightsImpactWrapper: {
      padding: "20px",
      background: "#ffffff",
      borderRadius: "12px",
      margin: "20px 0",
      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    },
    insightsImpactGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "40px",
    },
    insightsContainerH2: {
      fontSize: "16px",
      fontWeight: 600,
      margin: "0 0 16px 0",
      color: "#111827",
    },
    insightsCardsStack: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    insightCardFull: {
      padding: "12px 14px",
      borderRadius: "8px",
      borderLeft: "4px solid",
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
    },
    insightBlue: {
      borderLeftColor: "#2563eb",
      background: "#eff6ff",
    },
    insightGreen: {
      borderLeftColor: "#16a34a",
      background: "#ecfdf3",
    },
    insightOrange: {
      borderLeftColor: "#f59e0b",
      background: "#fef3c7",
    },
    insightIcon: {
      fontSize: "20px",
      flexShrink: 0,
      marginTop: "2px",
    },
    insightText: {
      fontSize: "13px",
      lineHeight: 1.4,
      margin: "0",
      color: "#374151",
    },
    impactContainer: {
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "16px 20px 18px",
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
    },
    impactContainerH2: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#111827",
      margin: "0 0 14px",
    },
    impactMetrics: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    impactRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "9px 12px",
      background: "#f9fafb",
      borderRadius: "6px",
    },
    impactLabel: {
      fontSize: "13px",
      color: "#4b5563",
    },
    metricValue: {
      fontSize: "13px",
      fontWeight: 500,
      color: "#111827",
    },
    textGreen: {
      color: "#16a34a",
    },
    textOrange: {
      color: "#ea580c",
    },
    // ===== RESPONSIVE =====
    responsive900: {
      forexFiltersGrid: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
      forexSummaryStrip: {
        gridTemplateColumns: "1fr 1fr",
      },
      insightsImpactGrid: {
        gridTemplateColumns: "1fr",
        gap: "30px",
      },
    },
    responsive640: {
      forexFiltersGrid: {
        gridTemplateColumns: "1fr",
      },
      forexSummaryStrip: {
        gridTemplateColumns: "1fr",
      },
    },
  };

  // load currency list from backend
  useEffect(() => {
    async function loadCurrencies() {
      try {
        const res = await getForexCurrencies();
        const list = res.data.currencies || {};
        setCurrencies(list);

        if (!from && list.USD) setFrom("USD");
        if (!to && list.EUR) setTo("EUR");
      } catch (err) {
        console.error(err);
        setError("Failed to load currencies");
      }
    }
    loadCurrencies();
  }, []);

  // analyze forex via /api/forex/analyze
  const handleAnalyze = async () => {
    if (!from || !to) {
      setError("Please select base and target currencies");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await analyzeForex({

        base: from,
        target: to,
        amount,
        year,
      });

      const data = res.data;

      setRate(data.latestRate);
      setConvertedAmount(data.convertedAmount);

      const histArray = Array.isArray(data.history) ? data.history : [];

      // aggregate daily data into monthly averages and calculate volatility per month
      const byMonth = {}; // key: 0-11 (month index)
      histArray.forEach((h) => {
        const d = new Date(h.date);
        const m = d.getMonth(); // 0..11
        const monthName = d.toLocaleString("default", { month: "short" });
        if (!byMonth[m]) {
          byMonth[m] = { month: monthName, sum: 0, count: 0, rates: [] };
        }
        byMonth[m].sum += Number(h.rate);
        byMonth[m].count += 1;
        byMonth[m].rates.push(Number(h.rate));
      });

      // convert to array and sort by month, calculate monthly volatility
      const historyData = Object.keys(byMonth)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => {
          const m = byMonth[key];
          const avgRate = m.sum / m.count;

          // monthly volatility (std dev / mean * 100)
          let monthlyVol = 0;
          if (m.rates.length > 1) {
            const variance =
              m.rates.reduce((s, r) => s + Math.pow(r - avgRate, 2), 0) /
              m.rates.length;
            const stdDev = Math.sqrt(variance);
            monthlyVol = (stdDev / avgRate) * 100;
          }

          return {
            month: m.month,
            rate: avgRate,
            volatility: monthlyVol,
          };
        });

      setHistory(historyData);

      if (histArray.length) {
        setDate(histArray[histArray.length - 1].date);
      } else {
        setDate(null);
      }

      const vol =
        typeof data.volatilityIndex === "string"
          ? Number(data.volatilityIndex)
          : data.volatilityIndex;

      setVolatilityPercent(vol);
      setVolatilityLabel(
        vol != null && vol <= 5
          ? "Low volatility · Stable"
          : vol != null
          ? "High volatility"
          : ""
      );
    } catch (err) {
      console.error(err);
      setError("Failed to fetch forex data");
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic insights based on data
  const generateInsights = () => {
    if (!rate || !volatilityPercent || !history.length) return [];

    const avgRate =
      history.reduce((sum, h) => sum + h.rate, 0) / history.length;
    const rateDiff = ((rate - avgRate) / avgRate) * 100;

    const insights = [
      {
        icon: "📊",
        color: "insight-blue",
        text: `The ${from}/${to} pair has maintained average volatility of ${volatilityPercent.toFixed(1)}% over the year.`,
      },
      {
        icon: "📈",
        color: "insight-green",
        text: `Current rate is ${Math.abs(rateDiff).toFixed(1)}% ${rateDiff > 0 ? "above" : "below"} the yearly average - ${rateDiff > 0 ? "favorable for " + from : "favorable for " + to} holders`,
      },
      {
        icon: "🎯",
        color: "insight-orange",
        text: `Projected trend suggests ${volatilityPercent > 3 ? "moderate fluctuations" : "stability"} continuing into next quarter.`,
      },
    ];

    return insights;
  };

  // Generate trade impact metrics
  const generateTradeImpact = () => {
    const forexImpact = (Number(amount) * rate * 0.012).toFixed(0); // 1.2% impact
    const riskLevel =
      volatilityPercent != null && volatilityPercent > 3 ? "High" : "Low";
    const hedgingNeeded =
      volatilityPercent != null && volatilityPercent > 5
        ? "Recommended"
        : "Not Required";
    const bestTime =
      volatilityPercent != null && volatilityPercent < 2
        ? "Now - Optimal"
        : "Mid-month";

    return {
      forexImpact,
      riskLevel,
      hedgingNeeded,
      bestTime,
    };
  };

  const currencyOptions = [
    <option key="" value="">
      Select currency
    </option>,
    ...Object.entries(currencies).map(([code, name]) => (
      <option key={code} value={code}>
        {code} – {name}
      </option>
    )),
  ];

  const insights = generateInsights();
  const tradeImpact = generateTradeImpact();

  return (
    <div style={styles.forexMain}>
     {/* Header */}
<div className="page-padding">
  <section
    className="welcome-strip"
    style={{ marginBottom: "24px" }} //space between bars
  >
    <h2>💱 Forex Analysis</h2>
    <p>Track currency trends and exchange rate impacts</p>
  </section>
</div>
  

      {/* Filters */}
      <section style={styles.forexFiltersCard}>
        <h2 style={styles.forexFiltersTitle}>
          Currency Converter & Analysis
        </h2>

        <div style={styles.forexFiltersGrid}>
          <div>
            <label style={styles.filterField.label}>Base Currency</label>
            <select 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              style={styles.filterField.select}
            >
              {currencyOptions}
            </select>
          </div>

          <div>
            <label style={styles.filterField.label}>Target Currency</label>
            <select 
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              style={styles.filterField.select}
            >
              {currencyOptions}
            </select>
          </div>

          <div>
            <label style={styles.filterField.label}>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.filterField.input}
            />
          </div>

          <div>
            <label style={styles.filterField.label}>Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={styles.filterField.select}
            >
              {Array.from({ length: 10 }, (_, i) => 2016 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterActions}>
            <button 
              onClick={handleAnalyze} 
              disabled={loading}
              style={{
                ...styles.filterButton,
                ...(loading && styles.filterButtonDisabled),
              }}
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>
      </section>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Summary Strip */}
      <section style={styles.forexSummaryStrip}>
        <div style={{ ...styles.forexCard, ...styles.forexCardRate }}>
          <h3 style={styles.forexCardH3}>Current Exchange Rate</h3>
          {rate != null ? (
            <>
              <p style={styles.forexMainValue}>
                1 {from} = {rate.toFixed(4)} {to}
              </p>
              {date && <p style={styles.forexSubtext}>Last updated: {date}</p>}
            </>
          ) : (
            <p style={styles.forexPlaceholder}>Run an analysis to see rate</p>
          )}
        </div>

        <div style={{ ...styles.forexCard, ...styles.forexCardAmount }}>
          <h3 style={styles.forexCardH3}>Converted Amount</h3>
          {convertedAmount != null ? (
            <>
              <p style={styles.forexMainValue}>
                {convertedAmount.toFixed(2)} {to}
              </p>
              <p style={styles.forexSubtext}>
                From {amount} {from}
              </p>
            </>
          ) : (
            <p style={styles.forexPlaceholder}>Run an analysis to convert</p>
          )}
        </div>

        <div style={{ ...styles.forexCard, ...styles.forexCardVol }}>
          <h3 style={styles.forexCardH3}>Volatility Index</h3>
          {volatilityPercent != null ? (
            <>
              <p style={styles.forexMainValue}>
                {volatilityPercent.toFixed(1)}%
              </p>
              <p style={styles.forexSubtext}>{volatilityLabel}</p>
            </>
          ) : (
            <p style={styles.forexPlaceholder}>
              Run an analysis to see volatility
            </p>
          )}
        </div>
      </section>

      {/* Historical Chart */}
      <section style={styles.forexChartCard}>
        <h2 style={styles.forexChartCardH2}>Historical Exchange Rate Trend ({year})</h2>
        <div style={styles.forexChartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Volatility Chart */}
      <section style={styles.forexChartCard}>
        <h2 style={styles.forexChartCardH2}>Exchange Rate Volatility ({year})</h2>
        <div style={styles.forexVolatilityChartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value: "Volatility %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="volatility"
                fill="#f4a6b0"
                stroke="#e57373"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Insights & Impact */}
      {history.length > 0 && (
        <section style={styles.insightsImpactWrapper}>
          <div style={styles.insightsImpactGrid}>
            {/* Left: Insights */}
            <div>
              <h2 style={styles.insightsContainerH2}>Key Insights</h2>
              <div style={styles.insightsCardsStack}>
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.insightCardFull,
                      ...(insight.color === "insight-blue" && styles.insightBlue),
                      ...(insight.color === "insight-green" && styles.insightGreen),
                      ...(insight.color === "insight-orange" && styles.insightOrange),
                    }}
                  >
                    <span style={styles.insightIcon}>{insight.icon}</span>
                    <p style={styles.insightText}>{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Impact */}
            <div style={styles.impactContainer}>
              <h2 style={styles.impactContainerH2}>Impact on Trade Costs</h2>
              <div style={styles.impactMetrics}>
                <div style={styles.impactRow}>
                  <label style={styles.impactLabel}>Monthly Forex Impact</label>
                  <span style={styles.metricValue}>
                    ±${tradeImpact.forexImpact} per $10K
                  </span>
                </div>
                <div style={styles.impactRow}>
                  <label style={styles.impactLabel}>Hedging Recommendation</label>
                  <span
                    style={{
                      ...styles.metricValue,
                      ...(tradeImpact.hedgingNeeded === "Not Required" 
                        ? styles.textGreen 
                        : styles.textOrange),
                    }}
                  >
                    {tradeImpact.hedgingNeeded}
                  </span>
                </div>
                <div style={styles.impactRow}>
                  <label style={styles.impactLabel}>Best Time to Exchange</label>
                  <span style={styles.metricValue}>{tradeImpact.bestTime}</span>
                </div>
                <div style={styles.impactRow}>
                  <label style={styles.impactLabel}>Risk Level</label>
                  <span
                    style={{
                      ...styles.metricValue,
                      ...(tradeImpact.riskLevel === "Low" 
                        ? styles.textGreen 
                        : styles.textOrange),
                    }}
                  >
                    {tradeImpact.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ForexAnalysis;
