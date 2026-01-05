// src/components/AgreementsManagementPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  AgreementCode: "",
  AgreementName: "",
  CountriesIncluded: "",
  ValidityPeriod: "",
  Status: "In force",
};

const AgreementsManagementPage = () => {
  const navigate = useNavigate();

  const [agreements, setAgreements] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* =========================
       LOAD DATA
  ========================= */
  const loadAgreements = () => {
    fetch("http://localhost:8080/api/metadata/admin/agreement")
      .then((res) => res.json())
      .then((data) => setAgreements(Array.isArray(data) ? data : []))
      .catch(() => setAgreements([]));
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  /* =========================
       FILTERING
  ========================= */
// ------- FILTERING -------
const filtered = agreements.filter((a) => {
  const q = search.trim().toLowerCase();

  const matchesStatus =
    statusFilter === "All Status" || a.Status === statusFilter;

  if (!q) return matchesStatus;

  const code = (a.AgreementCode || "").toLowerCase();
  const name = (a.AgreementName || "").toLowerCase();
  const countries = (a.CountriesIncluded || "").toLowerCase();

  // decide if this is a "code" search (IL, CA, USM) or "text" search
  const looksLikeCode = /^[a-z]+$/i.test(q) && !q.includes(" ") && q.length <= 3;

  let matchesSearch;

  if (looksLikeCode) {
    // ----- CODE MODE -----
    // AgreementCode must START with what user typed
    const matchesCodePrefix = code.startsWith(q);
    matchesSearch = matchesCodePrefix;
  } else {
    // ----- TEXT MODE (your name + countries logic) -----
    const looksLikePhrase = q.includes(" "); // e.g. "united states"

    if (looksLikePhrase) {
      // phrase like "united states" → only CountriesIncluded
      const matchesCountries = countries.includes(q);
      matchesSearch = matchesCountries;
    } else {
      // single word → Code prefix + Name/Countries contains
      const matchesCodePrefix = code.startsWith(q);
      const matchesName = name.includes(q);
      const matchesCountries = countries.includes(q);
      matchesSearch =
        matchesCodePrefix || matchesName || matchesCountries;
    }
  }

  return matchesStatus && matchesSearch;
});













  









  /* =========================
       FORM HANDLERS
  ========================= */
  const openAddForm = () => {
    setIsEdit(false);
    setEditingCode(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (a) => {
    setIsEdit(true);
    setEditingCode(a.AgreementCode);
    setForm({
      AgreementCode: a.AgreementCode,
      AgreementName: a.AgreementName,
      CountriesIncluded: a.CountriesIncluded,
      ValidityPeriod: a.ValidityPeriod,
      Status: a.Status,
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
   const payload = {
    ...form,
    oldCode: isEdit ? editingCode : form.AgreementCode,
  };


    const url = isEdit
      ? `http://localhost:8080/api/metadata/admin/agreement/${editingCode}`
      : "http://localhost:8080/api/metadata/admin/agreement";

    await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setShowForm(false);
    loadAgreements();
  };

  const handleDelete = async (code) => {
    if (!window.confirm("Delete this agreement?")) return;
    await fetch(
      `http://localhost:8080/api/metadata/admin/agreement/${code}`,
      { method: "DELETE" }
    );
    loadAgreements();
  };

  const statusClass = (status) => {
    if (status === "In force") return "active";
    if (status === "Superseded/Suspended") return "pending";
    if (status === "Deleted/Superseded") return "inactive";
    return "inactive";
  };

  return (
    <>
      {/* =========================
            INLINE CSS
      ========================= */}
      <style>{`
        .agreements-page {
          min-height: 100vh;
          background: #f5f6fa;
          padding: 0;
          
        }
          .agreements-content {
  padding: 24px 32px;
}

        .agreements-header-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .agreements-breadcrumb {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 18px;
        }

        .agreements-toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 16px;
        }

        .agreements-toolbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .agreements-toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .agreements-search-box-wrap {
          position: relative;
          width: 850px;
        }

        .agreements-search-input {
          width: 100%;
          padding: 10px 12px;
          padding-left: 36px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          font-size: 13px;
          outline: none;
          background: #f9fafb;
        }

        .agreements-search-input::placeholder {
          color: #9ca3af;
        }

        .agreements-search-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          font-size: 14px;
          color: #9ca3af;
        }

        .agreements-status-select {
          min-width: 150px;
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          outline: none;
          background: #fff;
        }

        .agreements-add-btn {
          padding: 10px 18px;
          border-radius: 999px;
          border: none;
          background: #2563eb;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 10px 15px rgba(37,99,235,.18);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .agreements-add-btn:hover {
          background: #1d4ed8;
        }

        .agreements-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px 18px 10px 18px;
          box-shadow: 0 1px 3px rgba(15,23,42,.06);
        }

        .agreements-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .agreements-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .agreements-card-subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .agreements-card-total {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #4b5563;
        }

        .agreements-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .agreements-table thead th {
          text-align: left;
          padding: 10px 8px;
          color: #6b7280;
          font-weight: 500;
          border-bottom: 1px solid #e5e7eb;
          font-size: 11px;
          text-transform: uppercase;
        }

        .agreements-table tbody td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
          vertical-align: top;
        }

        .code-pill {
          padding: 4px 10px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          border: none;
          font-size: 12px;
          font-weight: 500;
        }

        .agreement-name {
          font-size: 13px;
          color: #111827;
        }

        .agreement-name-sub {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }

        .country-pill {
          background: #f3f4f6;
          border-radius: 999px;
          padding: 3px 8px;
          margin-right: 4px;
          margin-bottom: 4px;
          display: inline-flex;
          font-size: 11px;
          color: #374151;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-pill.active {
          background:#ecfdf3;
          color:#16a34a;
        }

        .status-pill.pending {
          background:#fffbeb;
          color:#d97706;
        }

        .status-pill.inactive {
          background:#fef2f2;
          color:#b91c1c;
        }

        

        .agreements-actions {
          display: flex;
          gap: 6px;
        }

        .agreements-icon-btn {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }

        .agreements-icon-btn.edit {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .agreements-icon-btn.delete {
          background: #fef2f2;
          color: #b91c1c;
        }

        /* MODAL */
        .agreements-form-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 40;
        }

        .agreements-form-modal {
          background: #fff;
          border-radius: 16px;
          width: 520px;
          padding: 18px 20px 16px 20px;
          box-shadow: 0 25px 45px rgba(15,23,42,.25);
        }

        .agreements-form-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .agreements-form-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .agreements-form-modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 12px;
          font-size: 13px;
        }

        .agreements-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .agreements-form-group-full {
          grid-column: 1 / -1;
        }

        .agreements-form-label {
          font-size: 12px;
          color: #4b5563;
        }

        .agreements-form-input,
        .agreements-form-textarea,
        .agreements-form-select {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          outline: none;
        }

        .agreements-form-textarea {
          min-height: 60px;
          resize: vertical;
        }

        .agreements-form-input:focus,
        .agreements-form-textarea:focus,
        .agreements-form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37,99,235,.15);
        }

        .modal-buttons {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .modal-primary-btn {
          padding: 8px 16px;
          border-radius: 999px;
          border: none;
          background: #2563eb;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .validity-cell {
  white-space: nowrap;
  min-width: 180px;   /* adjust until it looks right */
}

        .modal-secondary-btn {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #374151;
          font-size: 13px;
          cursor: pointer;
        }
      `}</style>

      {/* =========================
             PAGE
      ========================= */}
      <div className="agreements-page">
        <div style={{ padding: "20px 0" }}>
        <section className="admin-hero">
          <h1>📄 Agreements Management</h1>
          <p>Manage trade agreements, FTAs, and policy updates</p>
        </section>
      </div>

        <div className="agreements-toolbar-row">
          <div className="agreements-toolbar-left">
            <div className="agreements-search-box-wrap">
              <span className="agreements-search-icon">🔍</span>
              <input
                className="agreements-search-input"
                placeholder="Search by agreement name, code, or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="agreements-toolbar-right">
            <select
              className="agreements-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>In force</option>
              <option>Superseded/Suspended</option>
              <option>Deleted/Superseded</option>
            </select>

            <button className="agreements-add-btn" onClick={openAddForm}>
              <span>＋</span>
              <span>Add Agreement</span>
            </button>
          </div>
        </div>

        <div className="agreements-card">
          <div className="agreements-card-header">
            <div>
              <div className="agreements-card-title">Trade Agreements</div>
              
            </div>
            <div className="agreements-card-total">
              Total: {filtered.length} agreements
            </div>
          </div>

          <table className="agreements-table">
            <thead>
              <tr>
                <th>Agreement Code</th>
                <th>Agreement Name</th>
                <th>Countries Included</th>
                <th>Validity Period</th>
                <th>Status</th>
                
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.AgreementCode}>
                  <td>
                    <span className="code-pill">{a.AgreementCode}</span>
                  </td>
                  <td>
                    <div className="agreement-name">{a.AgreementName}</div>
                  </td>
                  <td>
                    {a.CountriesIncluded?.split(",").map((c) => (
                      <span key={c} className="country-pill">
                        {c.trim()}
                      </span>
                    ))}
                  </td>
                  <td className="validity-cell">{a.ValidityPeriod}</td>
                  <td>
                    <span className={`status-pill ${statusClass(a.Status)}`}>
                      {a.Status}
                    </span>
                  </td>
                 
                  <td>
                    <div className="agreements-actions">
                      <button
                        className="agreements-icon-btn edit"
                        onClick={() => openEditForm(a)}
                      >
                        ✏️
                      </button>
                      <button
                        className="agreements-icon-btn delete"
                        onClick={() => handleDelete(a.AgreementCode)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
             MODAL
      ========================= */}
      {showForm && (
        <div className="agreements-form-backdrop">
          <form className="agreements-form-modal" onSubmit={handleSave}>
            <div className="agreements-form-modal-header">
              <div className="agreements-form-modal-title">
                {isEdit ? "Edit Agreement" : "Add Agreement"}
              </div>
            </div>

            <div className="agreements-form-modal-body">
              <div className="agreements-form-group">
                <label className="agreements-form-label">Agreement Code</label>
                <input
                  name="AgreementCode"
                  className="agreements-form-input"
                  placeholder="E.g., AU, BH"
                  value={form.AgreementCode}
                  
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="agreements-form-group agreements-form-group-full">
                <label className="agreements-form-label">Agreement Name</label>
                <input
                  name="AgreementName"
                  className="agreements-form-input"
                  placeholder="Agreement Name"
                  value={form.AgreementName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="agreements-form-group agreements-form-group-full">
                <label className="agreements-form-label">
                  Countries Included
                </label>
                <textarea
                  name="CountriesIncluded"
                  className="agreements-form-textarea"
                  placeholder="Comma-separated list of countries"
                  value={form.CountriesIncluded}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="agreements-form-group agreements-form-group-full">
                <label className="agreements-form-label">
                  Validity Period
                </label>
                <input
                  name="ValidityPeriod"
                  className="agreements-form-input"
                  placeholder="dd-mm-yyyy to dd-mm-yyyy"
                  value={form.ValidityPeriod}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="agreements-form-group">
                <label className="agreements-form-label">Status</label>
                <select
                  name="Status"
                  className="agreements-form-select"
                  value={form.Status}
                  onChange={handleFormChange}
                >
                  <option>In force</option>
                  <option>Superseded/Suspended</option>
                  <option>Deleted/Superseded</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="button" className="modal-secondary-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-primary-btn">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AgreementsManagementPage;
