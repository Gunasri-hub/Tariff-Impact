// src/pages/ReferenceData/BuyerPage.jsx
import { useState } from "react";
import { createBuyer } from "../../Apis/authApi";

function BuyerPage() {
  const [formData, setFormData] = useState({
    name: "",
    type: "INDIVIDUAL_IMPORTER", // Changed default to first ENUM value
    phone_number: "",
    email_id: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [nextIdCounter, setNextIdCounter] = useState(1);
  const [apiMessage, setApiMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone_number) {
      alert("Please fill in required fields (Name and Phone Number)");
      return;
    }

    try {
      setLoading(true);
      setApiMessage("");

      // Generate buyer ID
      const buyerId = `BYR-${nextIdCounter.toString().padStart(3, '0')}`;
      
      // Prepare data for API
      const buyerData = {
        buyer_id: buyerId,
        name: formData.name.trim(),
        type: formData.type.trim(),
        phone_number: formData.phone_number.trim(),
        email_id: formData.email_id.trim() || null,
        address: formData.address.trim() || null,
      };

      // Send to backend API
      const response = await createBuyer(buyerData);
      
      // Increment for next buyer
      setNextIdCounter(nextIdCounter + 1);
      
      // Reset form
      setFormData({
        name: "",
        type: "INDIVIDUAL_IMPORTER", // Reset to default ENUM
        phone_number: "",
        email_id: "",
        address: "",
      });
      
      // Show success message
      setApiMessage({
        type: "success",
        text: `✅ Buyer ${buyerId} information saved successfully to database!`
      });
      
      // Clear message after 5 seconds
      setTimeout(() => setApiMessage(""), 5000);
      
    } catch (error) {
      console.error("Error saving buyer:", error);
      setApiMessage({
        type: "error",
        text: `❌ Failed to save buyer: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      type: "INDIVIDUAL_IMPORTER", // Reset to default ENUM
      phone_number: "",
      email_id: "",
      address: "",
    });
    setApiMessage("");
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>👥 Buyer Information</h2>
        <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>
          Submit buyer information for processing (Next Buyer ID: <strong>BYR-{nextIdCounter.toString().padStart(3, '0')}</strong>)
        </p>
      </div>

      <div style={styles.container}>
        {/* API Message Display */}
        {apiMessage && (
          <div style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: apiMessage.type === "success" ? "#d1fae5" : "#fee2e2",
            color: apiMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${apiMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            fontWeight: "500"
          }}>
            {apiMessage.text}
          </div>
        )}

        {/* FULL WIDTH FORM */}
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Enter Buyer Details</h3>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Next Buyer ID
                  </label>
                  <div style={{
                    ...styles.input,
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    BYR-{nextIdCounter.toString().padStart(3, '0')}
                  </div>
                  <p style={styles.idNote}>Auto-generated Buyer ID</p>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Type <span style={styles.required}>*</span>
                  </label>
                  <select
                    style={styles.input}
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="INDIVIDUAL_IMPORTER">Individual Importer</option>
                    <option value="CORPORATE_IMPORTER">Corporate Importer</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="RETAIL_IMPORTER">Retail Importer</option>
                    <option value="WHOLESALE_IMPORTER">Wholesale Importer</option>
                    <option value="GOVERNMENT_IMPORTER">Government Importer</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Phone Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input}
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email ID</label>
                  <input
                    style={styles.input}
                    type="email"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  style={{ ...styles.input, height: 100, resize: "vertical" }}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows="4"
                  disabled={loading}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  type="button" 
                  style={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...styles.submitBtn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                  disabled={loading || !formData.name || !formData.phone_number}
                >
                  {loading ? "Saving..." : "Save Buyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    padding: 0,
    fontFamily: "Inter, system-ui",
    backgroundColor: "#f5f6fa",
    minHeight: "100vh",
  },

  header: {
    background: "linear-gradient(90deg,#3b82f6,#1d4ed8)",
    color: "#fff",
    padding: "20px 32px",
    borderRadius: "24px",
    margin: "16px 24px 24px 24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: 90,
    width: "calc(100% - 48px)"
  },

  container: {
    display: "block",
    margin: "0 24px 24px 24px",
  },

  formSection: {
    display: "block",
  },

  formCard: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,.05)",
    padding: 32,
    width: "100%",
  },

  formTitle: {
    margin: "0 0 24px 0",
    fontSize: 20,
    color: "#1f2937",
    fontWeight: 600,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: 8,
    fontWeight: 600,
    color: "#374151",
    fontSize: 14,
  },

  required: {
    color: "#ef4444",
  },

  idNote: {
    margin: "4px 0 0 0",
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 15,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },

  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },

  submitBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "14px 32px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 15,
    minWidth: 160,
    transition: "background-color 0.2s",
  },

  cancelBtn: {
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    padding: "14px 32px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 15,
    minWidth: 120,
    transition: "background-color 0.2s",
  },
};

export default BuyerPage;