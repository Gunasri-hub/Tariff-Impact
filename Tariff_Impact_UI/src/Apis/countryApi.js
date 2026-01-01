import { DataAPI, ENDPOINTS } from './ApiConfig';

export const countryApi = {
  // ========== GET ALL COUNTRIES ==========
  getAllCountries: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${ENDPOINTS.COUNTRIES}${queryParams ? `?${queryParams}` : ''}`;
      
      console.log("Fetching countries from:", DataAPI.defaults.baseURL + url);
      
      const response = await DataAPI.get(url);
      console.log("Countries data received:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error.response?.data || error.message);
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ========== GET SINGLE COUNTRY ==========
  getCountryById: async (id) => {
    try {
      const response = await DataAPI.get(`${ENDPOINTS.COUNTRIES}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching country ${id}:`, error.response?.data || error.message);
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ========== CREATE NEW COUNTRY ==========
  createCountry: async (data) => {
    try {
      console.log("Creating country with data:", data);
      
      const response = await DataAPI.post(ENDPOINTS.COUNTRIES, data);
      console.log("Create country response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating country:', error.response?.data || error.message);
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ========== UPDATE COUNTRY ==========
  updateCountry: async (id, data) => {
    try {
      console.log(`Updating country ${id} with data:`, data);
      
      const response = await DataAPI.put(`${ENDPOINTS.COUNTRIES}/${id}`, data);
      console.log("Update country response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating country ${id}:`, error.response?.data || error.message);
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ========== DELETE COUNTRY ==========
  deleteCountry: async (id) => {
    try {
      console.log(`Deleting country ${id}`);
      
      const response = await DataAPI.delete(`${ENDPOINTS.COUNTRIES}/${id}`);
      console.log("Delete country response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting country ${id}:`, error.response?.data || error.message);
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ========== SEARCH COUNTRIES ==========
  searchCountries: async (searchTerm, filters = {}) => {
    try {
      const params = { search: searchTerm, ...filters };
      const queryParams = new URLSearchParams(params).toString();
      const url = `${ENDPOINTS.COUNTRIES}/search${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await DataAPI.get(url);
      return response.data;
    } catch (error) {
      console.error('Error searching countries:', error.response?.data || error.message);
      throw error.response?.data || { success: false, error: error.message };
    }
  }
};