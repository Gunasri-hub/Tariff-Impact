import API from "./ApiConfig";

// ADMIN LOGIN
export const adminLogin = async (data) => {
  const response = await API.post("/admin/login", data);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

// USER LOGIN
export const userLogin = async (data) => {
  const response = await API.post("/user/login", data);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

// LOGOUT
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
