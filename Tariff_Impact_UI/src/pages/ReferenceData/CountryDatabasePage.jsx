import { useEffect, useState } from "react";
import "./CountryDatabasePage.css";

function CountryDatabasePage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [form, setForm] = useState({
    country_name: "",
    iso_code: "",
    currency: "",
    region: "",
    column2_status: "Not Applied",
    fta_eligibility: "",
    tariff_data_status: "Incomplete",
  });

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      setLoading(true);
      console.log('Fetching countries from API...');
      
      const response = await fetch(`http://localhost:8080/api/countries`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      if (result.success) {
        // Filter based on search and region
        let filteredData = result.data || [];
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredData = filteredData.filter(country =>
            country.country_name?.toLowerCase().includes(searchLower) ||
            country.iso_code?.toLowerCase().includes(searchLower) ||
            country.currency?.toLowerCase().includes(searchLower) ||
            country.region?.toLowerCase().includes(searchLower)
          );
        }
        
        if (region && region !== "All") {
          filteredData = filteredData.filter(country => 
            country.region === region
          );
        }
        
        setCountries(filteredData);
      } else {
        console.error("API returned error:", result.error);
        setCountries([]);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    // Trigger filtering when search or region changes
    const timeoutId = setTimeout(() => {
      fetchCountries();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, region]);

  // Form helpers
  const resetForm = () => {
    setForm({
      country_name: "",
      iso_code: "",
      currency: "",
      region: "",
      column2_status: "Not Applied",
      fta_eligibility: "",
      tariff_data_status: "Incomplete",
    });
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const startEdit = (country) => {
    setEditingId(country.id);
    setForm({
      country_name: country.country_name || "",
      iso_code: country.iso_code || "",
      currency: country.currency || "",
      region: country.region || "",
      column2_status: country.column2_status || "Not Applied",
      fta_eligibility: country.fta_eligibility || "",
      tariff_data_status: country.tariff_data_status || "Incomplete",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setSaveLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const saveCountry = async () => {
    try {
      setSaveLoading(true);
      
      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `http://localhost:8080/api/countries/${editingId}` 
        : "http://localhost:8080/api/countries";

      console.log(`Saving country: ${method} ${url}`, form);

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(form),
      });

      console.log('Save response status:', response.status);
      
      // Get response as text first
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      console.log('Parsed result:', result);
      
      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP error ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      alert(result.message || (editingId ? 'Country updated!' : 'Country created!'));
      closeModal();
      await fetchCountries(); // Refresh the list
      
    } catch (error) {
      console.error("Error saving country:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteCountry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this country?")) return;
    
    try {
      console.log(`Deleting country ${id}`);
      
      const response = await fetch(`http://localhost:8080/api/countries/${id}`, { 
        method: "DELETE" 
      });
      
      console.log('Delete response status:', response.status);
      
      const result = await response.json();
      console.log('Delete result:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error ${response.status}`);
      }
      
      alert('Country deleted successfully!');
      await fetchCountries(); // Refresh the list
    } catch (error) {
      console.error("Error deleting country:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Get unique regions for filter
  const uniqueRegions = [...new Set(countries.map(c => c.region).filter(Boolean))].sort();

  return (
    <div className="country-database-container">
      <div className="country-header">
        <h1>Country Database</h1>
        <p className="subtitle">Manage country information and tariff data</p>
      </div>

      {/* Filters and Actions Bar */}
      <div className="controls-bar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-container">
          <select
            className="region-filter"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="All">All Regions</option>
            {uniqueRegions.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>

          <button className="btn btn-primary add-btn" onClick={startAdd}>
            <span className="btn-icon">+</span> Add Country
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading countries...</p>
          </div>
        ) : countries.length === 0 ? (
          <div className="empty-state">
            <p>No countries found{search ? ` for "${search}"` : ""}</p>
            <button className="btn btn-secondary" onClick={startAdd}>
              Add First Country
            </button>
          </div>
        ) : (
          <>
            <table className="country-table">
              <thead>
                <tr>
                  <th>Country Name</th>
                  <th>ISO Code</th>
                  <th>Currency</th>
                  <th>Region</th>
                  <th>Column 2 Status</th>
                  <th>FTA Eligibility</th>
                  <th>Tariff Data Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr key={country.id}>
                    <td className="country-name">{country.country_name}</td>
                    <td className="iso-code">
                      <span className="code-badge">{country.iso_code}</span>
                    </td>
                    <td>{country.currency}</td>
                    <td>
                      <span className={`region-badge ${country.region?.toLowerCase().replace(" ", "-")}`}>
                        {country.region}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${country.column2_status?.toLowerCase().replace(" ", "-")}`}>
                        {country.column2_status}
                      </span>
                    </td>
                    <td className="fta-eligibility">
                      {country.fta_eligibility || "—"}
                    </td>
                    <td>
                      <span className={`tariff-status ${country.tariff_data_status?.toLowerCase()}`}>
                        {country.tariff_data_status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon edit-btn"
                        onClick={() => startEdit(country)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => deleteCountry(country.id)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="table-summary">
              <p>Showing {countries.length} countries</p>
            </div>
          </>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Country" : "Add New Country"}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Country Name *</label>
                  <input
                    type="text"
                    name="country_name"
                    value={form.country_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., United States"
                  />
                </div>

                <div className="form-group">
                  <label>ISO Code *</label>
                  <input
                    type="text"
                    name="iso_code"
                    value={form.iso_code}
                    onChange={handleChange}
                    required
                    maxLength="3"
                    placeholder="e.g., USA (3 letters)"
                    style={{textTransform: 'uppercase'}}
                  />
                  <small className="form-hint">3-letter code</small>
                </div>

                <div className="form-group">
                  <label>Currency *</label>
                  <input
                    type="text"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    required
                    placeholder="e.g., USD"
                    style={{textTransform: 'uppercase'}}
                  />
                  <small className="form-hint">3-letter currency code</small>
                </div>

                <div className="form-group">
                  <label>Region *</label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Region</option>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Oceania">Oceania</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Caribbean">Caribbean</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Column 2 Status</label>
                  <select
                    name="column2_status"
                    value={form.column2_status}
                    onChange={handleChange}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Not Applied">Not Applied</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tariff Data Status</label>
                  <select
                    name="tariff_data_status"
                    value={form.tariff_data_status}
                    onChange={handleChange}
                  >
                    <option value="Complete">Complete</option>
                    <option value="Incomplete">Incomplete</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>FTA Eligibility</label>
                  <textarea
                    name="fta_eligibility"
                    value={form.fta_eligibility}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter FTA/GSP/IL eligibility details... (e.g., 'Eligible for GSP benefits')"
                  />
                  <small className="form-hint">Your model stores this as TEXT, not boolean</small>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saveLoading}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveCountry}
                disabled={saveLoading || !form.country_name || !form.iso_code || !form.currency || !form.region}
              >
                {saveLoading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountryDatabasePage;