import API from "./ApiConfig";

// ADMIN LOGIN
export const adminLogin = async (data) => {
  const response = await API.post("/admin/login", data);
  localStorage.setItem("token", response.data.token);
  const response = await API.post('/admin/login', {
    email: data.email,
    password: data.password,
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// USER LOGIN
export const userLogin = async (data) => {
  const response = await API.post("/user/login", data);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

// LOGOUT
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
  localStorage.removeItem("token");
};

// TARIFF DATA
export const getTariffs = () => API.get("/impact-analysis/tariff");
export const getCurrencies = () => API.get("/impact-analysis/currency");
export const getDutyTypes = () => API.get("/impact-analysis/duty-type");

// PRODUCT CRUD
// GET all products
export const getProducts = async (params = {}) => {
  const response = await API.get("/products", { params });
  return response.data;
};

// GET single product
export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

// CREATE product
export const createProduct = async (data) => {
  const response = await API.post("/products", data);
  return response.data;
};

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

// UPDATE product
export const updateProduct = async (id, data) => {
  const response = await API.put(`/products/${id}`, data);
  return response.data;
};

// DELETE product
export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};


export default API;
