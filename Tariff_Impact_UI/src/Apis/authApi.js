import API from './ApiConfig';

// ========== ADMIN LOGIN ==========
export const adminLogin = async (data) => {
  const response = await API.post('/admin/login', {
    email: data.email,
    password: data.password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// ========== USER LOGIN ==========
export const userLogin = async (data) => {
  const response = await API.post('/user/login', {
    email: data.email,
    password: data.password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

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

export default API;


