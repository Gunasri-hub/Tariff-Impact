// src/pages/ReferenceData/ReportsPage.jsx - Horizontal Scroll + Blue Theme
import React, { useEffect, useState, useCallback } from "react";
import {
  getSummaryKPIs,
  getTransactionTrend,
  getIndustryWise,
  getTransactionTypeAnalysis,
  getCountryWiseTrade,
  getExportImportTrend,
  getTransportDistribution,
  getTopDestinationCountries,
  getStatusBreakdown,
  getTopBuyers,
  getBothCountries,
  getTopOriginCountries,
  getTopTradeRoutes,
  getIndustryTransportMatrix,
  getTopSellers,
  getBuyerSellerOptions
} from "../../Apis/authApi";

import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ✅ BLUE THEME COLORS
const BLUE_THEME = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  secondary: '#60a5fa',
  accent: '#93c5fd',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  card: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
  shadow: '0 20px 25px -5px rgba(0, 0,0, 0.1), 0 10px 10px -5px rgba(0, 0,0, 0.04)'
};

function ReportsPage() {
  const [filters, setFilters] = useState({
    monthFrom: 'All',
    monthTo: 'All',
    destinationCountry: 'All',
    originCountry: 'All',
    modeOfTransport: 'All',
    monthGroup: 'All',
    transactionType: 'All',
    buyerType: 'All',
    sellerType: 'All',
    status: 'All'
  });

  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    buyerTypes: [],
    sellerTypes: [],
    statuses: ['Draft', 'Completed']
  });

  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [exportImportData, setExportImportData] = useState([]);
  const [transportData, setTransportData] = useState([]);
  const [topCountryData, setTopCountryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topBuyerData, setTopBuyerData] = useState([]);
const [topOriginData, setTopOriginData] = useState([]);
const [tradeRouteData, setTradeRouteData] = useState([]);
const [topSellerData, setTopSellerData] = useState([]);




const loadFilterOptions = async () => {
  try {
    const [countriesRes, buyerSellerRes] = await Promise.all([
      getBothCountries(),
      getBuyerSellerOptions()
    ]);
    
    setFilterOptions({
      countries: countriesRes?.data || [],
      buyerTypes: buyerSellerRes?.buyers || [],
      sellerTypes: buyerSellerRes?.sellers || [],
      statuses: ['All', 'Draft', 'Completed']
    });
  } catch (error) {
    console.error('Filter options error:', error);
  }
};


 


  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== 'All')
      );
      
      const [kpiRes, trendRes, industryRes, typeRes, countryRes, exportImportRes, transportRes, topCountryRes, statusRes, topBuyerRes, topOriginRes, tradeRouteRes, topSellerRes] = await Promise.all([
  getSummaryKPIs(cleanFilters),
  getTransactionTrend(cleanFilters),
  getIndustryWise(cleanFilters),
  getTransactionTypeAnalysis(cleanFilters),
  getCountryWiseTrade(cleanFilters), 
  getExportImportTrend(cleanFilters),
  getTransportDistribution(cleanFilters),
  getTopDestinationCountries(cleanFilters),
  getStatusBreakdown(cleanFilters),
  getTopBuyers(cleanFilters),
  getTopOriginCountries(cleanFilters),
  getTopTradeRoutes(cleanFilters),
  getTopSellers(cleanFilters)
]);

setTopSellerData(topSellerRes || []);

      
      setKpi(kpiRes || {});
      setTrendData(trendRes || []);
      setIndustryData(industryRes || []);
      setTypeData(typeRes || []);
      setCountryData(countryRes || []);
      setExportImportData(exportImportRes || []);
      setTransportData(transportRes || []);
      setTopCountryData(topCountryRes || []);
      setStatusData(statusRes || []);
      setTopBuyerData(topBuyerRes || []);
      setTopOriginData(topOriginRes || []);
      setTradeRouteData(tradeRouteRes || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHART DATA WITH BLUE THEME
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthCounts = Array(12).fill(0);
  trendData.forEach(d => {
    const monthIdx = parseInt(d.month) - 1;
    if (!isNaN(monthIdx)) monthCounts[monthIdx] = parseInt(d.count) || 0;
  });

const exportMonths = Array(12).fill(0).map(() => ({ Export: 0, Import: 0 }));
exportImportData.forEach(d => {
  const idx = d.month - 1;
  if (idx >= 0) {
    if (d.transactionType === 'Export') exportMonths[idx].Export = d.count;
    if (d.transactionType === 'Import') exportMonths[idx].Import = d.count;
  }
});


  const industryLabels = industryData.slice(0, 6).map(d => (d.subCategory || 'Other').substring(0, 12));
  const industryCounts = industryData.slice(0, 6).map(d => parseInt(d.count) || 0);

  // Chart configurations with blue theme
const monthlyTrendData = {
  labels: monthLabels,
  datasets: [{
    label: 'Transactions',
    data: monthCounts,
    backgroundColor: '#3b82f6',
    borderColor: '#1e40af',
    borderWidth: 2,
    borderRadius: 8,
    borderSkipped: false,
  }]
};
const baseHorizontalDataset = {
  borderColor: '#1e40af',
  borderWidth: 2,
  borderRadius: 8,
  barThickness: 16,
  maxBarThickness: 18
};


const exportImportChartData = {
  labels: monthLabels,
  datasets: [
    { 
      label: 'Export', 
      data: exportMonths.map(m => m.Export),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8
    },
    { 
      label: 'Import', 
      data: exportMonths.map(m => m.Import),
      backgroundColor: 'rgba(30, 64, 175, 0.8)',
      borderColor: '#1e40af',
      borderWidth: 2,
      borderRadius: 8
    }
  ]
};


  const transportChartData = {
    labels: transportData.map(d => d.modeOfTransport || 'Unknown'),
    datasets: [{
      data: transportData.map(d => d.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.9)',
        'rgba(96, 165, 250, 0.9)', 
        'rgba(147, 197, 253, 0.9)'
      ],
      borderColor: '#1e40af',
      borderWidth: 2
    }]
  };
const topOriginChartData = {
  labels: topOriginData.map(d => d.originCountry),
  datasets: [{
    ...baseHorizontalDataset,
    label: 'Transactions',
    data: topOriginData.map(d => d.count),
    backgroundColor: 'rgba(59,130,246,0.8)',
    barThickness: 14,
    categoryPercentage: 0.7,
    barPercentage: 0.8,
     borderRadius: 6
  }]
};

const topTradeRouteChartData = {
  labels: tradeRouteData.map(
    d => `${d.originCountry} → ${d.destinationCountry}`
  ),
  datasets: [{
    ...baseHorizontalDataset,
    label: 'Transactions',
    data: tradeRouteData.map(d => d.count * 10), // scaled for visibility
    backgroundColor: 'rgba(30,64,175,0.8)',
    borderRadius: 6,
    barThickness: 14,
    categoryPercentage: 0.7,
    barPercentage: 0.8
  }]
};



const topCountryChartData = {
  labels: topCountryData.map(d => d.destinationCountry || 'Unknown'),
  datasets: [{
    label: 'Transactions',
    data: topCountryData.map(d => d.count || 0),
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(96, 165, 250, 0.8)',
      'rgba(147, 197, 253, 0.8)',
      'rgba(30, 64, 175, 0.8)'
    ],
    borderColor: '#1e40af',
    borderWidth: 2,
    borderRadius: 4
  }]
};


  const statusChartData = {
    labels: statusData.map(d => d.status),
    datasets: [{
      data: statusData.map(d => d.count),
      backgroundColor: [
        'rgba(16, 185, 129, 0.9)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: '#1e40af',
      borderWidth: 2
    }]
  };

const topBuyerChartData = {
  labels: topBuyerData.map(d => d.buyerName || 'Unknown'),
  datasets: [{
    label: 'Transactions',
    data: topBuyerData.map(d => d.count),
    backgroundColor: '#1e40af',
    borderRadius: 6,
    barThickness: 18
  }]
};



  const industryChartData = {
    labels: industryLabels.map(l => l || 'Other'),
    datasets: [{ 
      data: industryCounts, 
      backgroundColor: [
        '#3b82f6', '#60a5fa', '#93c5fd', 
        '#1e40af', '#1e3a8a', '#3730a3'
      ], 
      borderWidth: 0,
      
    }]
  };
  const exportImportOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,   // REMOVE max: 1
      ticks: { color: '#64748b' }
    },
    x: {
      ticks: { color: '#64748b' }
    }
  }
};


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };
  const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',   // <-- controls thickness
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        padding: 20,
        color: '#374151'
      }
    }
  }
};
const horizontalBarOptions = {
  ...chartOptions,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      ticks: { color: '#64748b', font: { size: 11 } }
    },
    y: {
      ticks: {
        color: '#64748b',
        font: { size: 8.5 },   // 👈 smaller labels
        autoSkip: false
      }
    }
  }
};



  useEffect(() => {
    loadFilterOptions();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  if (loading) return <div style={styles.loading}>Loading analytics...</div>;

  return (
    <div style={styles.page}>
<div style={{ padding: "20px 0" }}>
        <section className="admin-hero">
          <h1>📊 Reports</h1>
          <p>Generate system reports and analytics</p>
        </section>
      </div>

      {/* ✅ HORIZONTAL SCROLLING FILTERS */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersRow}>
          <div style={styles.monthRangeContainer}>
  <select 
    value={filters.monthFrom} 
    onChange={(e) => handleFilterChange('monthFrom', e.target.value)} 
    style={styles.filterSelect}
  >
    <option value="All">From</option>
    <option value="1">Jan</option>
    <option value="2">Feb</option>
    <option value="3">Mar</option>
    <option value="4">Apr</option>
    <option value="5">May</option>
    <option value="6">Jun</option>
    <option value="7">Jul</option>
    <option value="8">Aug</option>
    <option value="9">Sep</option>
    <option value="10">Oct</option>
    <option value="11">Nov</option>
    <option value="12">Dec</option>
  </select>
  
  <span style={styles.rangeArrow}>→</span>
  
  <select 
    value={filters.monthTo} 
    onChange={(e) => handleFilterChange('monthTo', e.target.value)} 
    style={styles.filterSelect}
  >
    <option value="All">To</option>
    <option value="1">Jan</option>
    <option value="2">Feb</option>
    <option value="3">Mar</option>
    <option value="4">Apr</option>
    <option value="5">May</option>
    <option value="6">Jun</option>
    <option value="7">Jul</option>
    <option value="8">Aug</option>
    <option value="9">Sep</option>
    <option value="10">Oct</option>
    <option value="11">Nov</option>
    <option value="12">Dec</option>
  </select>
</div>


          <select value={filters.destinationCountry} onChange={(e) => handleFilterChange('destinationCountry', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Dest. Countries</option>
            {filterOptions.countries.map(country => (
              <option key={country.id} value={country.name}>{country.name}</option>
            ))}
          </select>

          <select value={filters.originCountry} onChange={(e) => handleFilterChange('originCountry', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Origin Countries</option>
            {filterOptions.countries.map(country => (
              <option key={country.id} value={country.name}>{country.name}</option>
            ))}
          </select>

          <select value={filters.modeOfTransport} onChange={(e) => handleFilterChange('modeOfTransport', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Transport</option>
            <option value="Sea">🚢 Sea</option>
            <option value="Air">✈️ Air</option>
            <option value="Road">🚚 Road</option>
          </select>


          <select value={filters.transactionType} onChange={(e) => handleFilterChange('transactionType', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Types</option>
            <option value="Export">📤 Export</option>
            <option value="Import">📥 Import</option>
          </select>

          <select value={filters.buyerType} onChange={(e) => handleFilterChange('buyerType', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Buyers</option>
            <option value="Individual Importer">👤 Individual</option>
            <option value="Corporate Importer">🏢 Corporate</option>
            <option value="Distributor">📦 Distributor</option>
            <option value="Retail Importer">🏪 Retail</option>
            <option value="Wholesale Importer">📊 Wholesale</option>
            <option value="Government Importer">🏛️ Government</option>
          </select>

          <select value={filters.sellerType} onChange={(e) => handleFilterChange('sellerType', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Sellers</option>
            <option value="Foreign Manufacturer">🏭 Manufacturer</option>
            <option value="Exporter">📈 Exporter</option>
            <option value="OEM Supplier">⚙️ OEM</option>
            <option value="Raw Material Supplier">🛠️ Raw Materials</option>
            <option value="Trading Company">📊 Trading CCompany</option>
          </select>

          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={styles.filterSelect}>
            <option value="All">All Status</option>
            <option value="Draft">📝 Draft</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📊</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Total Transactions</div>
            <div style={styles.kpiNumber}>{kpi.totalTransactions || 0}</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📤</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Total Exports</div>
            <div style={styles.kpiNumber}>{kpi.totalExports || 0}</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📥</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Total Imports</div>
            <div style={styles.kpiNumber}>{kpi.totalImports || 0}</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>🏭</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Top Industry</div>
            <div style={styles.kpiValue}>{kpi.topIndustry || '—'}</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>🚚</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Top Route</div>
            <div style={styles.kpiValue}>{kpi.topTradeRoute || '—'}</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>👤</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Top Buyer</div>
            <div style={styles.kpiValue}>{kpi.topBuyer || '—'}</div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>🏪</div>
          <div style={styles.kpiContent}>
            <div style={styles.kpiLabel}>Top Seller</div>
            <div style={styles.kpiValue}>{kpi.topSeller || '—'}</div>
          </div>
        </div>
      </div>

      {/* ✅ CHARTS GRID */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Transactions {filters.year}</h3>
          <div style={styles.chartWrapper}>
            <Bar data={monthlyTrendData} options={chartOptions} />
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Industry Distribution</h3>
          <div style={styles.chartWrapper}>
            <Doughnut data={industryChartData} options={chartOptions} />
          </div>
        </div>

<div style={styles.chartCard}>
  <h3 style={styles.chartTitle}>Export vs Import</h3>
  <div style={styles.chartWrapper}>
    <Bar data={exportImportChartData} options={exportImportOptions} />
  </div>
</div>


        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Transport Modes</h3>
          <div style={styles.chartWrapper}>
            <Doughnut data={transportChartData} options={chartOptions} />
          </div>
        </div>
                <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Transaction Status</h3>
          <div style={styles.chartWrapper}>
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>
<div style={styles.chartCard}>
  <h3 style={styles.chartTitle}>Top Buyers</h3>
  <div style={styles.smallChart}>
    <Bar data={topBuyerChartData} options={chartOptions} />
  </div>
</div>


        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Top Destination Countries</h3>
          <div style={styles.chartWrapper}>
        <Bar data={topCountryChartData} options={horizontalBarOptions} />
          </div>
        </div>
<div style={styles.chartCard}>
 <h3 style={styles.chartTitle}>Top origin Countries</h3>
  <div style={styles.chartWrapper}>
<Bar data={topOriginChartData} options={horizontalBarOptions} />
  </div>
</div>

<div style={styles.chartCard}>
  <h3 style={styles.chartTitle}>Top Trade Routes</h3>
  <div style={styles.chartWrapper}>
<Bar data={topTradeRouteChartData} options={horizontalBarOptions} />
  </div>
</div>




      </div>
    </div>
  );
}

const styles = {
  page: { 
    padding: 24, 
    background: BLUE_THEME.background, 
    minHeight: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: { 
    background: `linear-gradient(135deg, ${BLUE_THEME.primary} 0%, ${BLUE_THEME.primaryLight} 100%)`, 
    padding: 32, 
    borderRadius: 20, 
    color: "#fff", 
    marginBottom: 32,
    boxShadow: BLUE_THEME.shadow
  },
  title: { fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' },
  subtitle: { opacity: 0.95, margin: 0, fontSize: 18, fontWeight: 400 },
  
  // ✅ HORIZONTAL SCROLLING FILTERS
  filtersContainer: {
    background: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    boxShadow: BLUE_THEME.shadow,
    border: '1px solid rgba(59, 130, 246, 0.1)'
  },
  filtersRow: { 
    display: "flex", 
    gap: 12, 
    flexWrap: "nowrap", 
    overflowX: "auto", 
    padding: '8px 0',
    scrollbarWidth: 'thin',
    WebkitOverflowScrolling: 'touch'
  },
filterSelect: { 
  padding: '8px 12px',           // ← SMALLER padding
  border: '1px solid rgba(59, 130, 246, 0.2)',  // ← THINNER border
  borderRadius: 8,               // ← SMALLER radius
  background: 'white',
  fontSize: '13px',              // ← SMALLER font
  minWidth: '110px',             // ← REDUCED width (from 140px)
  width: '110px',                // ← FIXED width
  height: '36px',                // ← FIXED height
  flexShrink: 0, 
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  color: '#1e293b',
  appearance: 'none',            // ← Remove default styling
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 8px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '12px',
  paddingRight: '28px'           // ← Room for dropdown arrow
},
  
  kpiGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '16px', 
    marginBottom: '20px' 
  },
  kpiCard: { 
    background: BLUE_THEME.card, 
    padding: '12px 16px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    boxShadow: BLUE_THEME.shadow,
    border: `1px solid rgba(59, 130, 246, 0.1)`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  kpiIcon: { 
    width: '36px', 
    height: '44px', 
    borderRadius: '16px', 
    background: `linear-gradient(135deg, ${BLUE_THEME.primary} 0%, ${BLUE_THEME.primaryLight} 100%)`, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '20px', 
    color: 'white', 
    flexShrink: 0,
    boxShadow: BLUE_THEME.shadow
  },
  kpiContent: { flex: 1 }, 
  kpiLabel: { fontSize: '15px', color: '#64748b', marginBottom: '8px', fontWeight: 500 },
  kpiNumber: { fontSize: '24px', fontWeight: '800', color: BLUE_THEME.primary, lineHeight: 1 },
  kpiValue: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },

  // ✅ RESPONSIVE CHARTS GRID
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '40px'
  },
  chartCard: { 
    background: BLUE_THEME.card, 
    padding: '18px', 
    borderRadius: '24px', 
    boxShadow: BLUE_THEME.shadow,
    border: `1px solid rgba(59, 130, 246, 0.08)`
  },
  chartCardFull: {
    background: BLUE_THEME.card, 
    padding: '32px', 
    borderRadius: '24px', 
    boxShadow: BLUE_THEME.shadow,
    chartWrapper: { height: '240px', position: 'relative' },

    border: `1px solid rgba(59, 130, 246, 0.08)`,
    gridColumn: '1 / -1'
  },
  chartTitle: { 
    margin: '0 0 24px 0', 
    fontSize: '22px', 
    fontWeight: 700, 
    color: '#1e293b',
    background: `linear-gradient(135deg, ${BLUE_THEME.primary}, ${BLUE_THEME.primaryLight})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  chartWrapper: { height: '190px', position: 'relative' },
  loading: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '60vh', 
    fontSize: '20px', 
    color: BLUE_THEME.primary,
    fontWeight: 600
  },
  tripleRow: {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  marginBottom: '16px'
},

smallChart: {
  height: '160px',
  position: 'relative'
},
monthRangeContainer: {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: '240px'
},
rangeArrow: {
  color: '#64748b',
  fontWeight: 'bold',
  fontSize: '16px',
  whiteSpace: 'nowrap'
}


};

export default ReportsPage;