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
  API.get("/metadata/admin/country");

export const createCountry = (data) =>
  API.post("/metadata/admin/country", data);

export const updateCountry = (id, data) =>
  API.put(`/metadata/admin/country/${id}`, data);

export const deleteCountry = (id) =>
  API.delete(`/metadata/admin/country/${id}`);

// ====== FOREX ANALYSIS ======

// get currencies
export const getForexCurrencies = () =>
  API.get("/currencies");

// analyze forex
export const analyzeForex = (payload) =>
  API.post("/analyze", payload);

// ========== LOGOUT ==========
export const logout = () => {
  localStorage.removeItem('token');
};

// ========== TARIFF IMPACT ANALYSIS ==========
export const getTariffs = () =>
  API.get("/impact-analysis/tariff");

export const getCurrencies = () =>
  API.get("/impact-analysis/currency");

export const getDutyTypes = () =>
  API.get("/impact-analysis/duty-type");


// ========== AgreementManagementPage ==========

export const getAgreements = () =>
  API.get("/metadata/admin/agreement");

export const createAgreement = (data) =>
  API.post("/metadata/admin/agreement", data);

export const updateAgreement = (code, data) =>
  API.put(`/metadata/admin/agreement/${code}`, data);

export const deleteAgreement = (code) =>
  API.delete(`/metadata/admin/agreement/${code}`);


export default API;

