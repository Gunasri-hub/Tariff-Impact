const { Seller } = require("../../../models");
const { Op } = require("sequelize");

exports.getAllSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const search = req.query.search || "";
    const type = req.query.type || "";
    
    let whereClause = {};
    
    if (search.trim() !== "") {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
          { seller_id: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    if (type && type !== "all" && type !== "") {
      if (whereClause[Op.or]) {
        whereClause = {
          [Op.and]: [
            whereClause,
            { type: type }
          ]
        };
      } else {
        whereClause.type = type;
      }
    }
    
    const { count, rows: sellers } = await Seller.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      attributes: [
        'id', 
        'seller_id', 
        'name', 
        'type', 
        'phone', 
        'email', 
        'address', 
        'created_at',
        'updated_at'
      ]
    });
    
    return res.json({
      success: true,
      data: sellers,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    });
    
  } catch (err) {
    console.error("Get all sellers error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch sellers" 
    });
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByPk(id);

    if (!seller) {
      return res.status(404).json({ 
        success: false,
        error: "Seller not found" 
      });
    }

    return res.json({
      success: true,
      data: seller,
    });
  } catch (err) {
    console.error("Get seller by ID error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch seller" 
    });
  }
};

exports.createSeller = async (req, res) => {
  try {
    console.log("📥 CREATE SELLER - Request received:", req.body);
    
    // ✅ Simplified - Don't expect seller_id from frontend
    const { name, type, phone, email, address } = req.body;

    console.log("📝 Extracted values:", { name, type, phone });

    // Validation
    if (!name || !type || !phone) {
      console.error("❌ Missing required fields:", { name, type, phone });
      return res.status(400).json({ 
        success: false,
        error: "Name, type, and phone number are required" 
      });
    }

    // ✅ AUTO-GENERATE SELLER ID (SIMPLE VERSION)
    const lastSeller = await Seller.findOne({
      order: [["created_at", "DESC"]],
    });

    let seller_id = "SEL-001";
    if (lastSeller && lastSeller.seller_id) {
      const match = lastSeller.seller_id.match(/SEL-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        const nextNumber = lastNumber + 1;
        seller_id = `SEL-${nextNumber.toString().padStart(3, "0")}`;
      }
    }

    // Validate phone number format (10 digits)
    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      console.error("❌ Invalid phone length:", cleanPhone.length);
      return res.status(400).json({ 
        success: false,
        error: "Phone number must be 10 digits" 
      });
    }

    // Validate email if provided
    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid email format" 
        });
      }
    }

    console.log("✅ Creating seller with auto-generated ID:", {
      seller_id,
      name: name.toString().trim(),
      type: type.toString().trim(),
      phone: cleanPhone,
      email: email ? email.toString().trim() : null,
      address: address ? address.toString().trim() : null,
    });

    // Create seller with AUTO-GENERATED ID
    const seller = await Seller.create({
      seller_id,
      name: name.toString().trim(),
      type: type.toString().trim(),
      phone: cleanPhone,
      email: email ? email.toString().trim() : null,
      address: address ? address.toString().trim() : null,
    });

    console.log("✅ Seller created successfully! ID:", seller.seller_id);

    return res.status(201).json({
      success: true,
      message: "Seller created successfully",
      data: seller,
    });
  } catch (err) {
    console.error("❌ Create seller error:", err.message);
    console.error("Error details:", err.errors);
    
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ 
        success: false,
        error: "Seller ID already exists. Please try again." 
      });
    }
    
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map(e => e.message);
      return res.status(400).json({ 
        success: false,
        error: "Validation error",
        details: errors
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Failed to create seller",
      details: err.message
    });
  }
};

exports.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { seller_id, name, type, phone, email, address } = req.body;

    const seller = await Seller.findByPk(id);

    if (!seller) {
      return res.status(404).json({ 
        success: false,
        error: "Seller not found" 
      });
    }

    // If seller_id is being updated, check if it's unique
    if (seller_id && seller_id !== seller.seller_id) {
      const existingSeller = await Seller.findOne({ 
        where: { seller_id: seller_id.trim() } 
      });
      
      if (existingSeller) {
        return res.status(400).json({ 
          success: false,
          error: `Seller ID "${seller_id}" already exists` 
        });
      }
      
      seller.seller_id = seller_id.trim();
    }

    // Validate phone number if being updated
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ 
          success: false,
          error: "Phone number must be 10 digits" 
        });
      }
      seller.phone = cleanPhone;
    }

    // Validate email if being updated
    if (email !== undefined) {
      if (email && email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            success: false,
            error: "Invalid email format" 
          });
        }
        seller.email = email.trim();
      } else {
        seller.email = null;
      }
    }

    // Update other seller fields
    if (name) seller.name = name.trim();
    if (type) seller.type = type.trim();
    if (address !== undefined) {
      seller.address = address ? address.trim() : null;
    }

    await seller.save();

    return res.json({
      success: true,
      message: "Seller updated successfully",
      data: seller,
    });
  } catch (err) {
    console.error("Update seller error:", err.message);
    
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ 
        success: false,
        error: "Seller ID already exists" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Failed to update seller" 
    });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id);

    if (!seller) {
      return res.status(404).json({ 
        success: false,
        error: "Seller not found" 
      });
    }

    await seller.destroy();

    return res.json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (err) {
    console.error("Delete seller error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to delete seller" 
    });
  }
};

exports.getSellerStats = async (req, res) => {
  try {
    const { sequelize } = require("../../../models");
    
    const totalSellers = await Seller.count();
    
    const typeCounts = await Seller.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('type')), 'count']
      ],
      group: ['type'],
      raw: true
    });
    
    const recentSellers = await Seller.findAll({
      order: [["created_at", "DESC"]],
      limit: 5,
      attributes: ['id', 'seller_id', 'name', 'type', 'created_at']
    });
    
    return res.json({
      success: true,
      data: {
        total: totalSellers,
        byType: typeCounts,
        recent: recentSellers
      }
    });
  } catch (err) {
    console.error("Get seller stats error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch seller statistics" 
    });
  }
};

exports.generateNextSellerId = async (req, res) => {
  try {
    const lastSeller = await Seller.findOne({
      order: [['seller_id', 'DESC']],
      attributes: ['seller_id']
    });
    
    let nextId = "SEL-001";
    
    if (lastSeller && lastSeller.seller_id) {
      const match = lastSeller.seller_id.match(/SEL-(\d+)/);
      if (match && match[1]) {
        const lastNumber = parseInt(match[1]);
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
        nextId = `SEL-${nextNumber}`;
      }
    }
    
    return res.json({
      success: true,
      data: {
        next_seller_id: nextId
      }
    });
    
  } catch (err) {
    console.error("Generate next seller ID error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to generate next seller ID" 
    });
  }
};