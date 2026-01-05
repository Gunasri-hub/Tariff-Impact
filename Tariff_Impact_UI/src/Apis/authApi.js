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

export const getUsers = () =>
  API.get("/metadata/admin/users");

export const createUser = (userData) =>
  API.post("/metadata/admin/users", userData);

export const updateUser = (id, userData) =>
  API.put(`/metadata/admin/users/${id}`, userData);

export const deleteUser = (id) =>
  API.delete(`/metadata/admin/users/${id}`);

export const updateUserStatus = (id, statusData) =>
  API.patch(`/metadata/admin/users/${id}/status`, statusData);

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

export default API;

