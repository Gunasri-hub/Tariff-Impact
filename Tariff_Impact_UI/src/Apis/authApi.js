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

  //cost calculator api//
  export const runCostCalculator = (payload) =>
  API.post("/calculator/run", payload);   // ✅ FIXED

export const pingCalculator = () =>
  API.get("/calculator/ping");

export const saveCalculation = (data) => 
  API.post("/calculator/save", data);



export default API;