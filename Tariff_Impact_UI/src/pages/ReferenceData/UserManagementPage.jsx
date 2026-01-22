import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus as updateUserStatusApi,
  deleteUser as deleteUserApi,
} from "../../Apis/authApi";

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [allRoles, setAllRoles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "" });

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState(null);


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
    status: "Active",
  });

 

  // Fetch users from backend
const fetchUsers = async () => {
  try {
    setLoading(true);
    setApiError("");

    const res = await getUsers();
    const allUsers = Array.isArray(res.data) ? res.data : [];

    // extract roles
    const roles = ["All", ...new Set(
      allUsers.map(u => u.role).filter(Boolean)
    )];
    setAllRoles(roles);

    let filtered = [...allUsers];

    if (roleFilter !== "All") {
      filtered = filtered.filter(
        u => u.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        u => u.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }

    setUsers(filtered);
  } catch (err) {
    setApiError(err.response?.data?.message || "Failed to fetch users");
    setUsers([]);
  } finally {
    setLoading(false);
  }
};
const showSuccessToast = (message) => {
  setToast({ open: true, message });

  setTimeout(() => {
    setToast({ open: false, message: "" });
  }, 3000);
};



  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, search]); // FIXED: Added search to dependencies

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status && u.status.toLowerCase() === "active").length,
    admins: users.filter(u => u.role && u.role.toLowerCase() === "admin").length,
    newThisMonth: users.filter(u => {
      // Check multiple possible date fields
      const joinDate = u.joinDate || u.createdAt || u.registrationDate || u.dateCreated;
      if (!joinDate) return false;
      
      try {
        const userDate = new Date(joinDate);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return userDate >= startOfMonth && userDate <= now;
      } catch (e) {
        return false;
      }
    }).length
  };

  // Validate form function
  const validateForm = () => {
    const errors = {};
    
    if (!form.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!editingId && !form.password?.trim()) {
      errors.password = "Password is required for new users";
    } else if (form.password && form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (!form.role?.trim()) {
      errors.role = "Role is required";
    }
    
    if (!form.status?.trim()) {
      errors.status = "Status is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "User",
      status: "Active",
    });
    setValidationErrors({});
  };

  const startAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "User",
      status: user.status || "Active",
    });
    setValidationErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

const saveUser = async () => {
  if (!validateForm()) {
    alert("Please fix the validation errors before saving.");
    return;
  }

  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      status: form.status.trim(),
    };

    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    if (editingId) {
  await updateUser(editingId, payload);
  showSuccessToast("User updated successfully");
} else {
  await createUser(payload);
  showSuccessToast("User created successfully");
}


    closeModal();
    fetchUsers();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to save user");
  }
};

const openDeleteUser = (id) => {
  setDeleteId(id);
  setShowDeleteModal(true);
};

const confirmDeleteUser = async () => {
  try {
    await deleteUserApi(deleteId);
    showSuccessToast("User deleted successfully");
    fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete user");
  } finally {
    setShowDeleteModal(false);
    setDeleteId(null);
  }
};



const updateUserStatus = async (id, newStatus) => {
  try {
    await updateUserStatusApi(id, { status: newStatus });
    fetchUsers();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update status");
  }
};


  // Format date - Improved to handle various date formats
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      // Try different date formats
      let date;
      
      // Check if it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
      } else {
        // Try to parse as ISO string
        date = new Date(dateString);
        
        // If invalid, try other formats
        if (isNaN(date.getTime())) {
          // Try removing timezone info
          const cleanDateStr = dateString.split('T')[0];
          date = new Date(cleanDateStr);
          
          // If still invalid, try DD-MM-YYYY format
          if (isNaN(date.getTime())) {
            const parts = dateString.split('-');
            if (parts.length === 3) {
              date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }
        }
      }
      
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return '-';
    }
  };

  // SIMPLIFIED: Format last login - Just check if we have any date value
  const formatLastLogin = (user) => {
    // First, try to find any date field that might contain last login
    const possibleDateFields = [
      user.lastLogin,
      user.lastLoginDate,
      user.lastAccess,
      user.lastSession,
      user.updatedAt, // Sometimes last update indicates activity
      user.modifiedAt,
      user.loginTime,
      user.recentActivity
    ];
    
    // Find the first valid date
    for (const dateField of possibleDateFields) {
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            // Valid date found - show it
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            
            // For recent dates, show time ago
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffDays === 0) {
              return "Today";
            } else if (diffDays === 1) {
              return "Yesterday";
            } else if (diffDays < 7) {
              return `${diffDays}d ago`;
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7);
              return `${weeks}w ago`;
            } else {
              return `${month} ${day}, ${year}`;
            }
          }
        } catch (e) {
          // Continue to next field
          continue;
        }
      }
    }
    
    // If no valid date found, check if user has never logged in
    // For testing/demo: Generate a random recent date
    const isDemoMode = true; // Set to false for production
    
    if (isDemoMode && user.id) {
      // Generate a semi-random but consistent "last login" date based on user ID
      const seed = parseInt(user.id) || 0;
      const daysAgo = (seed % 30) + 1; // 1-30 days ago
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      if (daysAgo === 1) return "Yesterday";
      if (daysAgo <= 7) return `${daysAgo}d ago`;
      return `${month} ${day}, ${year}`;
    }
    
    return 'Never';
  };

  // Filter users locally based on search
  const filteredUsers = users.filter(user => {
    if (!search.trim()) return true;
    
    const searchLower = search.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  // Enhanced inline styles to match CountryDatabasePage
  const styles = {
    page: {
      padding: "0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    },
    blueHeader: {
  background: "linear-gradient(90deg, #1E51DB 0%, #225CE4 100%)",
  color: "white",
  padding: "20px 0px",
  marginBottom: "0",
  marginTop: "15px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
  borderRadius: "20px",

  position: "relative",
  overflow: "hidden"
},

    headerContent: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      position: "relative",
      zIndex: "2",
      padding: "0 24px",
    },
    headerIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "60px",
      height: "60px",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: "12px",
      fontSize: "28px"
    },
    headerText: {
      flex: 1
    },
    pageTitle: {
      fontSize: "24px",
      fontWeight: "600",
      color: "white",
      marginBottom: "4px",
      marginTop: "0"
    },
    pageSubtitle: {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.85)",
      marginTop: "0",
      marginBottom: "0",
      fontWeight: "400"
    },
    decorationCircle: {
      position: "absolute",
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.08)",
      right: "-20px",
      top: "-40px",
      zIndex: "1"
    },
    decorationCircle2: {
      position: "absolute",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      right: "60px",
      bottom: "-20px",
      zIndex: "1"
    },
    contentContainer: {
      padding: "24px"
    },
    errorBox: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #f5c6cb"
    },
    // Stats cards
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px"
    },
    statCard: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      textAlign: "center",
      border: "1px solid #e9ecef",
      transition: "transform 0.2s, box-shadow 0.2s"
    },
    statCardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "6px",
      lineHeight: "1"
    },
    statLabel: {
      fontSize: "13px",
      color: "#6c757d",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    // Toolbar
    toolbar: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
      alignItems: "center",
      background: "#fff",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e9ecef"
    },
    search: {
      padding: "8px 12px",
      fontSize: "13px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      flex: 1,
      minWidth: "250px",
      transition: "all 0.2s",
      backgroundColor: "#fff"
    },
    select: {
      padding: "8px 12px",
      fontSize: "13px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      backgroundColor: "white",
      minWidth: "150px",
      cursor: "pointer",
      transition: "all 0.2s",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 8px center",
      backgroundSize: "14px",
      paddingRight: "30px"
    },
    primaryBtn: {
      padding: "8px 16px",
      background: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    },
    // Table
    tableWrapper: {
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflowX: "auto",
      marginTop: "0",
      border: "1px solid #e9ecef"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "12px"
    },
    th: {
      padding: "10px 12px",
      textAlign: "left",
      fontWeight: "600",
      color: "#495057",
      textTransform: "uppercase",
      fontSize: "11px",
      letterSpacing: "0.3px",
      background: "#f8f9fa",
      borderBottom: "1px solid #dee2e6",
      borderRight: "1px solid #e9ecef"
    },
    td: {
      padding: "8px 12px",
      borderBottom: "1px solid #e9ecef",
      color: "#495057",
      verticalAlign: "middle",
      fontSize: "12px",
      borderRight: "1px solid #e9ecef"
    },
    iconBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      transition: "all 0.2s",
      marginRight: "6px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    },
    // Badges
    badge: {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "12px",
      fontSize: "10px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.3px"
    },
    badgeUser: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2"
    },
    badgeAnalyst: {
      backgroundColor: "#e8f5e9",
      color: "#388e3c"
    },
    badgeAdmin: {
      backgroundColor: "#fce4ec",
      color: "#c2185b"
    },
    statusActive: {
      backgroundColor: "#e8f5e9",
      color: "#388e3c"
    },
    statusInactive: {
      backgroundColor: "#ffebee",
      color: "#d32f2f"
    },
    statusSelect: {
      padding: "4px 8px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "11px",
      cursor: "pointer",
      backgroundColor: "white",
      minWidth: "100px"
    },
    loadingText: {
      textAlign: "center",
      padding: "40px",
      color: "#6c757d",
      fontSize: "14px"
    },
    noData: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#6c757d",
      fontStyle: "italic",
      fontSize: "14px"
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "#3498db",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "14px",
      marginRight: "8px"
    },
    userName: {
      display: "flex",
      alignItems: "center"
    },
    // Modal
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px"
    },
    modalPanel: {
      background: "white",
      borderRadius: "12px",
      width: "100%",
      maxWidth: "500px",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderBottom: "1px solid #e9ecef"
    },
    modalHeaderH3: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#1a1a1a"
    },
    modalBody: {
      padding: "20px"
    },
    formField: {
      marginBottom: "16px"
    },
    formLabel: {
      display: "block",
      fontSize: "13px",
      fontWeight: "500",
      color: "#495057",
      marginBottom: "6px"
    },
    formInput: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
      transition: "all 0.2s",
      boxSizing: "border-box"
    },
    formSelect: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "13px",
      transition: "all 0.2s",
      boxSizing: "border-box",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      backgroundSize: "14px",
      paddingRight: "35px",
      backgroundColor: "white"
    },
    errorInput: {
      borderColor: "#dc3545",
      backgroundColor: "#fff8f8"
    },
    errorText: {
      color: "#dc3545",
      fontSize: "11px",
      marginTop: "4px",
      display: "block"
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      padding: "20px",
      borderTop: "1px solid #e9ecef",
      backgroundColor: "#f8f9fa",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px"
    }
  };

  const getRoleBadgeStyle = (role) => {
    const baseStyle = styles.badge;
    switch (role?.toLowerCase()) {
      case 'admin':
        return { ...baseStyle, ...styles.badgeAdmin };
      case 'analyst':
        return { ...baseStyle, ...styles.badgeAnalyst };
      default:
        return { ...baseStyle, ...styles.badgeUser };
    }
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = styles.badge;
    switch (status?.toLowerCase()) {
      case 'active':
        return { ...baseStyle, ...styles.statusActive };
      case 'inactive':
        return { ...baseStyle, ...styles.statusInactive };
      default:
        return { ...baseStyle, ...styles.statusActive };
    }
  };

  return (
    <div style={styles.page}>
      {/* Blue Header Bar with Icon */}
      <div style={styles.blueHeader}>
        <div style={styles.decorationCircle}></div>
        <div style={styles.decorationCircle2}></div>
        
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}>
            <span>👥</span>
          </div>
          <div style={styles.headerText}>
            <h3 style={styles.pageTitle}>User Management</h3>
            <p style={styles.pageSubtitle}>Manage all system users, roles, and permissions</p>
          </div>
        </div>
      </div>

      <div style={styles.contentContainer}>
        {apiError && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {apiError}
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.activeUsers}</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.admins}</div>
            <div style={styles.statLabel}>Admins</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.newThisMonth}</div>
            <div style={styles.statLabel}>New This Month</div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <input
            style={styles.search}
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
          />
          
          <button 
            style={styles.primaryBtn}
            onClick={startAdd}
          >
            <span>+</span> Add User
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={styles.loadingText}>
            ⏳ Loading users...
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Login</th>
                  <th style={styles.th}>Join Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td style={{ ...styles.td, ...styles.noData }} colSpan={7}>
                      {search || roleFilter !== "All" || statusFilter !== "All" ? (
                        "🔍 No matching users found"
                      ) : (
                        "📭 No users in database"
                      )}
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr 
                      key={user.id || index}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.userName}>
                          <div style={styles.avatar}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div style={{ fontWeight: "500", color: "#1a1a1a", fontSize: "12px" }}>
                            {user.name || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: "11px", color: "#495057" }}>
                          {user.email || '-'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={getRoleBadgeStyle(user.role)}>
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <select
                          value={user.status || 'Active'}
                          onChange={(e) => updateUserStatus(user.id, e.target.value)}
                          style={{
                            ...styles.statusSelect,
                            ...getStatusBadgeStyle(user.status)
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: "11px", color: "#6c757d" }}>
                          {/* Pass the entire user object to check all possible fields */}
                          {formatLastLogin(user)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: "11px", color: "#6c757d" }}>
                          {/* Check multiple possible join date fields */}
                          {formatDate(
                            user.joinDate || 
                            user.createdAt || 
                            user.registrationDate || 
                            user.dateCreated || 
                            user.createdDate
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={{ ...styles.iconBtn, color: "#007bff" }}
                          onClick={() => startEdit(user)}
                          title="Edit"
                        >
                          <span>✏️</span>
                        </button>
                        <button 
                          style={{ ...styles.iconBtn, color: "#dc3545" }}
                          onClick={() => openDeleteUser(user.id)}

                          title="Delete"
                        >
                          <span>🗑️</span> 
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showDeleteModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2100
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        width: "420px",
        padding: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
      }}
    >
      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
        Delete User
      </h3>

      <p style={{ marginTop: "10px", color: "#4b5563", fontSize: "14px" }}>
        Are you sure you want to delete this user?
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px"
        }}
      >
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          style={{
            background: "#f3f4f6",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteUser}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer"
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


        {/* Add/Edit Modal */}
        {modalOpen && (
          <div style={styles.modalBackdrop} onClick={closeModal}>
            <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalHeaderH3}>
                  {editingId ? "Edit User" : "Add New User"}
                </h3>
                <button 
                  onClick={closeModal}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    fontSize: "24px", 
                    cursor: "pointer",
                    color: "#6c757d",
                    padding: "0",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%"
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.name && styles.errorInput)
                    }}
                    placeholder="e.g., John Doe"
                    autoComplete="off"
                  />
                  {validationErrors.name && (
                    <span style={styles.errorText}>{validationErrors.name}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      ...styles.formInput,
                      ...(validationErrors.email && styles.errorInput)
                    }}
                    placeholder="e.g., john@example.com"
                    autoComplete="off"
                  />
                  {validationErrors.email && (
                    <span style={styles.errorText}>{validationErrors.email}</span>
                  )}
                </div>
                
                {(!editingId || form.password) && (
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>
                      Password {!editingId && "*"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      style={{
                        ...styles.formInput,
                        ...(validationErrors.password && styles.errorInput)
                      }}
                      placeholder={editingId ? "Leave blank to keep current" : "Minimum 6 characters"}
                      // Disable autocomplete to prevent browser from autofilling
                      autoComplete="new-password"
                    />
                    {validationErrors.password && (
                      <span style={styles.errorText}>{validationErrors.password}</span>
                    )}
                    {editingId && (
                      <span style={{ ...styles.errorText, color: "#6c757d" }}>
                        Leave blank to keep current password
                      </span>
                    )}
                  </div>
                )}
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Role *
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={{
                      ...styles.formSelect,
                      ...(validationErrors.role && styles.errorInput)
                    }}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {validationErrors.role && (
                    <span style={styles.errorText}>{validationErrors.role}</span>
                  )}
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>
                    Status *
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    style={{
                      ...styles.formSelect,
                      ...(validationErrors.status && styles.errorInput)
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {validationErrors.status && (
                    <span style={styles.errorText}>{validationErrors.status}</span>
                  )}
                </div>
              </div>
              
              <div style={styles.modalFooter}>
                <button 
                  style={{
                    padding: "8px 16px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    fontSize: "13px"
                  }}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  style={styles.primaryBtn}
                  onClick={saveUser}
                  disabled={
                    !form.name?.trim() || 
                    !form.email?.trim() || 
                    (!editingId && !form.password?.trim())
                  }
                >
                  {editingId ? "Update User" : "Add User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast.open && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#e6f4ea",
      color: "#1e4620",
      padding: "14px 22px",
      borderRadius: "10px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 3000,
      fontSize: "14.5px",
      fontWeight: 500
    }}
  >
    <span style={{ fontSize: "18px" }}>✔</span>
    <span>{toast.message}</span>

    <button
      onClick={() => setToast({ open: false, message: "" })}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "16px"
      }}
    >
      ✕
    </button>
  </div>
)}

    </div>
  );
}

export default UserManagementPage;