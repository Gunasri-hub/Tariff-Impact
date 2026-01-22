import API from './ApiConfig';

// ========== ADMIN LOGIN ==========
export const adminLogin = async (data) => {
  const response = await API.post('/admin/login', {
    email: data.email,
    password: data.password,
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// ========== USER LOGIN ==========
export const userLogin = async (data) => {
  const response = await API.post('/user/login', {
    email: data.email,
    password: data.password,
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const getCountries = () =>
  API.get("/admin/country");

export const createCountry = (data) =>
  API.post("/admin/country", data);

export const updateCountry = (id, data) =>
  API.put(`/admin/country/${id}`, data);

export const deleteCountry = (id) =>
  API.delete(`/admin/country/${id}`);

export const getUsers = () =>
  API.get("/admin/users");

export const createUser = (userData) =>
  API.post("admin/users", userData);

export const updateUser = (id, userData) =>
  API.put(`/admin/users/${id}`, userData);

export const deleteUser = (id) =>
  API.delete(`/admin/users/${id}`);

export const updateUserStatus = (id, statusData) =>
  API.patch(`/admin/users/${id}/status`, statusData);

// ====== FOREX ANALYSIS ======

// get currencies
export const getForexCurrencies = () =>
  API.get("/forex/currencies");

// analyze forex
export const analyzeForex = (payload) =>
  API.post("/forex/analyze", payload);
// ========== LOGOUT ==========
export const logout = () => {
  localStorage.removeItem('token');
};

// =======================INDUSTRY EXPLORER=======================

export const getCountriesList = () =>
  API.get("/countries-list");

export const getCurrenciesList = () =>
  API.get("/currencies");

export const getIndustriesList = () =>
  API.get("/industries-list");

export const getSubIndustriesList = (industry) =>
  API.get("/sub-industries-list", {
    params: { industry },
  });

export const getHtsCodesList = (industry, subIndustry) =>
  API.get("/hts-codes-list", {
    params: {
      industry,
      subIndustry,
    },
  });

// Analysis
export const getIndustryTrend = (industry, subIndustry) =>
  API.get("/industry/trend", {
    params: {
      industry,
      subIndustry,
    },
  });

export const getIndustryDistribution = (year, industry) =>
  API.get("/industry/distribution", {
    params: {
      year,
      industry,
    },
  });

export const getSubIndustryDuties = (year, industry) =>
  API.get("/industry/sub-industry-duties", {
    params: {
      year,
      industry,
    },
  });

export const getIndustryHtsCodes = (industry, subIndustry, htsCode) =>
  API.get("/industry/hts-codes", {
    params: {
      industry,
      subIndustry,
      htsCode,
    },
  });

// ========== TARIFF IMPACT ANALYSIS ==========
export const getTariffs = () =>
  API.get("/impact-analysis/tariff");

export const getCurrencies = () =>
  API.get("/impact-analysis/currency");

export const getDutyTypes = () =>
  API.get("/impact-analysis/duty-type");


// ========== AgreementManagementPage ==========

export const getAgreements = () =>
  API.get("/admin/agreement");

export const createAgreement = (data) =>
  API.post("/admin/agreement", data);

export const updateAgreement = (code, data) =>
  API.put(`/admin/agreement/${code}`, data);

export const deleteAgreement = (code) =>
  API.delete(`/admin/agreement/${code}`);

// api/product.js

export const getProducts = (params = {}) =>
  API.get("/admin/products", { params });

export const createProduct = (data) =>
  API.post("/admin/products", data);

export const updateProduct = (id, data) =>
  API.put(`/admin/products/${id}`, data);

export const deleteProduct = (id) =>
  API.delete(`/admin/products/${id}`);




// ===== TAXATION API HELPERS =====//

// Trigger refresh + recompute from World Bank
export const refreshTaxData = () =>
  API.post("/taxation/refresh");

// Get per‑industry tax rates for a country
export const getIndustryRates = (country = "US") =>
  API.get("/taxation/industry-rates", {
    params: { country }, // backend can read req.query.country
  });

// Get summary averages for a country
export const getTaxSummary = (country = "US") =>
  API.get("/taxation/summary", {
    params: { country },
  });

//excel//
export const exportTaxationExcel = (params) =>
  API.get("/taxation/export", {
    params,              // dynamic filters from UI
    responseType: "blob"
  });

// ========== BUYER MANAGEMENT ==========
  //cost calculator api//
  export const runCostCalculator = (payload) =>
  API.post("/calculator/run", payload);   // ✅ FIXED

export const pingCalculator = () =>
  API.get("/calculator/ping");

export const saveCalculation = (data) => 
  API.post("/calculator/save", data);

// GET all buyers with pagination and search
export const getBuyers = (page = 1, limit = 50, search = "") =>
  API.get("/buyers", {
    params: { page, limit, search }
  });

// GET single buyer by ID  
export const getBuyerById = (id) =>
  API.get(`/buyers/${id}`);

// CREATE new buyer
export const createBuyer = (buyerData) =>
  API.post("/buyers", buyerData);

// UPDATE buyer
export const updateBuyer = (id, buyerData) =>
  API.put(`/buyers/${id}`, buyerData);

// DELETE buyer
export const deleteBuyer = (id) =>
  API.delete(`/buyers/${id}`);

// GET all buyers for dropdowns (no pagination)
export const getAllBuyers = () =>
  API.get("/buyers", {
    params: { limit: 1000 }
  });


// ========== SELLER MANAGEMENT ==========

// GET all sellers with pagination and search
export const getSellers = (page = 1, limit = 50, search = "") =>
  API.get("/sellers", {
    params: { page, limit, search }
  });

// GET single seller by ID  
export const getSellerById = (id) =>
  API.get(`/sellers/${id}`);

// ✅ ADD THIS NEW FUNCTION - Get next available seller ID
export const getNextSellerId = () =>
  API.get("/sellers/next-id");

// CREATE new seller
export const createSeller = (sellerData) =>
  API.post("/sellers", sellerData);

// UPDATE seller
export const updateSeller = (id, sellerData) =>
  API.put(`/sellers/${id}`, sellerData);

// DELETE seller
export const deleteSeller = (id) =>
  API.delete(`/sellers/${id}`);

// GET all sellers for dropdowns (no pagination)
export const getAllSellers = () =>
  API.get("/sellers", {
    params: { limit: 1000 }
  });  
  /* ================= TRANSACTIONS ================= */

// ========== USER TRANSACTION MANAGEMENT ==========

// GET all user transactions with pagination and search
export const getUserTransactions = (page = 1, limit = 50, search = "") =>
  API.get("/user/transactions", {
    params: { page, limit, search }
  });

// GET single transaction by ID  
export const getUserTransactionById = (id) =>
  API.get(`/user/transactions/${id}`);

// CREATE new transaction
export const createUserTransaction = (transactionData) =>
  API.post("/user/transactions", transactionData);

// UPDATE transaction
export const updateUserTransaction = (id, transactionData) =>
  API.put(`/user/transactions/${id}`, transactionData);

// DELETE transaction
export const deleteUserTransaction = (id) =>
  API.delete(`/user/transactions/${id}`);

// GET all transactions for dropdowns (no pagination)
export const getAllUserTransactions = () =>
  API.get("/user/transactions", {
    params: { limit: 1000 }
  });

// ✅ NEW - Get next available transaction code
export const getNextTransactionCode = () =>
  API.get("/user/transactions/next-code");

// ✅ NEW - Export transactions to Excel
export const exportUserTransactions = (params) =>
  API.get("/user/transactions/export", {
    params,
    responseType: "blob"
  });

// ✅ NEW - Get transaction dropdown data (countries, currencies, etc.)
export const getTransactionDropdowns = () =>
  API.get("/user/transaction-dropdowns");

// ✅ NEW - Get transaction stats/summary
export const getTransactionStats = () =>
  API.get("/user/transactions/stats");

// ========== REPORTS (USER TRANSACTIONS) ==========
// ========== REPORTS (USER TRANSACTIONS) ==========

export const getSummaryKPIs = async (params) => {
  const response = await API.get('/reports/summary', { params });
  return response.data;
};

export const getTransactionTrend = async (params) => {
  const response = await API.get('/reports/transactions-trend', { params });
  return response.data;
};

export const getIndustryWise = async (params) => {
  const response = await API.get('/reports/industry-distribution', { params });
  return response.data;
};

export const getTransactionTypeAnalysis = async (params) => {
  const response = await API.get('/reports/transaction-type', { params });
  return response.data;
};

export const getCountryWiseTrade = async (params) => {
  const response = await API.get('/reports/country-wise', { params });
  return response.data;
};
// ===== NEW REPORT APIS =====

export const getExportImportTrend = async (params) => {
  const response = await API.get('/reports/export-import-trend', { params });
  return response.data;
};

export const getTransportDistribution = async (params) => {
  const response = await API.get('/reports/transport-distribution', { params });
  return response.data;
};

export const getTopDestinationCountries = async (params) => {
  const response = await API.get('/reports/top-destination-countries', { params });
  return response.data;
};

export const getStatusBreakdown = async (params) => {
  const response = await API.get('/reports/status-breakdown', { params });
  return response.data;
};

export const getTopBuyers = async (params) => {
  const response = await API.get('/reports/top-buyers', { params });
  return response.data;
};

export const getBothCountries = () => {
  return API.get('/reports/countries');  // ✅ API (uppercase) + correct path
};

export const getTopOriginCountries = async (params) => {
  const response = await API.get('/reports/top-origin-countries', { params });
  return response.data;
};

export const getTopTradeRoutes = async (params) => {
  const response = await API.get('/reports/top-trade-routes', { params });
  return response.data;
};

// ✅ ADD THESE 4 MISSING FUNCTIONS
export const getIndustryTransportMatrix = async (params) => {
  const response = await API.get('/reports/industry-transport-matrix', { params });
  return response.data;
};

export const getTopSellers = async (params) => {
  const response = await API.get('/reports/top-sellers', { params });
  return response.data;
};

export const getBuyerSellerOptions = () => {
  return API.get('/reports/buyer-seller-options');  // No params needed
};



export default API;