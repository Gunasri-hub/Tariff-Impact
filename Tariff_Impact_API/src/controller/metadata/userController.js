const db = require("../../../models");

// GET ALL USERS FROM BOTH TABLES
exports.getAllUsers = async (req, res) => {
  try {
    console.log('🔄 Getting users from Users and Admins tables...');
    
    // 1. Get users from Users table
    const usersFromUserTable = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'lastLogin', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });
    
    // 2. Get users from Admins table
    let usersFromAdminTable = [];
    if (db.Admin) {
      const admins = await db.Admin.findAll({
        attributes: ['id', 'companyName', 'email', 'createdAt', 'updatedAt']
      });
      
      // Convert admins to same format as users
      usersFromAdminTable = admins.map(admin => ({
        id: admin.id,
        name: admin.companyName || 'Admin',
        email: admin.email,
        role: 'Admin', // All from Admins table are admins
        status: 'Active', // Default status
        lastLogin: null,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
        isAdmin: true // Flag to identify admin users
      }));
    }
    
    // 3. COMBINE BOTH
    const allUsers = [...usersFromAdminTable, ...usersFromUserTable];
    
    console.log(`✅ Found ${usersFromUserTable.length} regular users + ${usersFromAdminTable.length} admins = ${allUsers.length} total users`);
    
    // Send to frontend
    res.json(allUsers);
    
  } catch (err) {
    console.error("❌ Error in getAllUsers:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// UPDATE USER STATUS (works for both tables)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Try Users table first
    let user = await db.User.findByPk(id);
    
    if (user) {
      // User found in Users table
      user.status = status;
      await user.save();
      res.json({ 
        success: true, 
        message: "User status updated",
        user: user 
      });
    } else if (db.Admin) {
      // Try Admins table
      const admin = await db.Admin.findByPk(id);
      if (admin) {
        // Admins don't have status field, so we can't update it
        res.json({ 
          success: true, 
          message: "Admin user - status field not available",
          user: {
            id: admin.id,
            name: admin.companyName,
            email: admin.email,
            role: 'Admin',
            status: 'Active' // Always active for admins
          }
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
    
  } catch (err) {
    console.error("❌ Error in updateUserStatus:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// CREATE USER (only in Users table - admins created through signup)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'User', status = 'Active' } = req.body;
    
    const user = await db.User.create({
      name,
      email,
      password, // Note: Should hash password
      role,
      status
    });
    
    res.json(user);
    
  } catch (err) {
    console.error("❌ Error in createUser:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// UPDATE USER (only for Users table)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    await user.update(updates);
    res.json({ success: true, message: "User updated", user });
    
  } catch (err) {
    console.error("❌ Error in updateUser:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE USER (check both tables)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try Users table first
    let user = await db.User.findByPk(id);
    let tableName = 'Users';
    
    if (!user && db.Admin) {
      // Try Admins table
      user = await db.Admin.findByPk(id);
      tableName = 'Admins';
    }
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    await user.destroy();
    res.json({ success: true, message: `User deleted from ${tableName} table` });
    
  } catch (err) {
    console.error("❌ Error in deleteUser:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};