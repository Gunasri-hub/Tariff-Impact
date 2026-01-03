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

// ========== LOGOUT ==========
export const logout = () => {
  localStorage.removeItem('token');
};