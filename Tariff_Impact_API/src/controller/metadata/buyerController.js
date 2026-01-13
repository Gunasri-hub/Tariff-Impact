const { Buyer } = require("../../../models");
const { Op } = require("sequelize"); // ADD THIS LINE

exports.getAllBuyers = async (req, res) => {
  try {
    // 1. Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default 50 items per page
    const offset = (page - 1) * limit;
    
    // 2. Get search/filter parameters
    const search = req.query.search || "";
    const type = req.query.type || "";
    
    // 3. Build where clause for filtering
    let whereClause = {};
    
    // Add search filter if provided
    if (search.trim() !== "") {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email_id: { [Op.iLike]: `%${search}%` } },
          { phone_number: { [Op.iLike]: `%${search}%` } },
          { buyer_id: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Add type filter if provided
    if (type && type !== "all" && type !== "") {
      if (whereClause[Op.or]) {
        // If we already have search conditions, add type as AND condition
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
    
    // 4. Fetch paginated data AND total count
    const { count, rows: buyers } = await Buyer.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      // Select only necessary fields for listing
      attributes: [
        'id', 
        'buyer_id', 
        'name', 
        'type', 
        'phone_number', 
        'email_id', 
        'address', 
        'created_at',
        'updated_at'
      ]
    });
    
    // 5. Return response with pagination metadata
    return res.json({
      success: true,
      data: buyers,
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
    console.error("Get all buyers error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch buyers" 
    });
  }
};

exports.getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = await Buyer.findByPk(id);

    if (!buyer) {
      return res.status(404).json({ 
        success: false,
        error: "Buyer not found" 
      });
    }

    return res.json({
      success: true,
      data: buyer,
    });
  } catch (err) {
    console.error("Get buyer by ID error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch buyer" 
    });
  }
};

exports.createBuyer = async (req, res) => {
  try {
    const { name, type, phone_number, email_id, address } = req.body;

    // Validation
    if (!name || !type || !phone_number) {
      return res.status(400).json({ 
        success: false,
        error: "Name, type, and phone number are required" 
      });
    }

    // Validate phone number format (10 digits)
    const cleanPhone = phone_number.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ 
        success: false,
        error: "Phone number must be 10 digits" 
      });
    }

    // Validate email if provided
    if (email_id && email_id.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_id)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid email format" 
        });
      }
    }

    // Generate next buyer ID (BYR-001, BYR-002, ...)
    const lastBuyer = await Buyer.findOne({
      order: [["created_at", "DESC"]],
    });

    let buyer_id = "BYR-001";
    if (lastBuyer && lastBuyer.buyer_id) {
      const match = lastBuyer.buyer_id.match(/BYR-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        const nextNumber = lastNumber + 1;
        buyer_id = `BYR-${nextNumber.toString().padStart(3, "0")}`;
      }
    }

    // Create buyer in DB
    const buyer = await Buyer.create({
      buyer_id,
      name: name.trim(),
      type: type.trim(),
      phone_number: cleanPhone,
      email_id: email_id ? email_id.trim() : null,
      address: address ? address.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: "Buyer created successfully",
      data: buyer,
    });
  } catch (err) {
    console.error("Create buyer error:", err.message);
    
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ 
        success: false,
        error: "Buyer ID already exists" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Failed to create buyer" 
    });
  }
};

exports.updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, phone_number, email_id, address } = req.body;

    const buyer = await Buyer.findByPk(id);

    if (!buyer) {
      return res.status(404).json({ 
        success: false,
        error: "Buyer not found" 
      });
    }

    // Validate phone number if being updated
    if (phone_number) {
      const cleanPhone = phone_number.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ 
          success: false,
          error: "Phone number must be 10 digits" 
        });
      }
      buyer.phone_number = cleanPhone;
    }

    // Validate email if being updated
    if (email_id !== undefined) {
      if (email_id && email_id.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_id)) {
          return res.status(400).json({ 
            success: false,
            error: "Invalid email format" 
          });
        }
        buyer.email_id = email_id.trim();
      } else {
        buyer.email_id = null;
      }
    }

    // Update other buyer fields
    if (name) buyer.name = name.trim();
    if (type) buyer.type = type.trim();
    if (address !== undefined) {
      buyer.address = address ? address.trim() : null;
    }

    await buyer.save();

    return res.json({
      success: true,
      message: "Buyer updated successfully",
      data: buyer,
    });
  } catch (err) {
    console.error("Update buyer error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to update buyer" 
    });
  }
};

exports.deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;

    const buyer = await Buyer.findByPk(id);

    if (!buyer) {
      return res.status(404).json({ 
        success: false,
        error: "Buyer not found" 
      });
    }

    await buyer.destroy();

    return res.json({
      success: true,
      message: "Buyer deleted successfully",
    });
  } catch (err) {
    console.error("Delete buyer error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to delete buyer" 
    });
  }
};

// Optional: Export stats for dashboard
exports.getBuyerStats = async (req, res) => {
  try {
    const totalBuyers = await Buyer.count();
    
    const typeCounts = await Buyer.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('type')), 'count']
      ],
      group: ['type'],
      raw: true
    });
    
    const recentBuyers = await Buyer.findAll({
      order: [["created_at", "DESC"]],
      limit: 5,
      attributes: ['id', 'buyer_id', 'name', 'type', 'created_at']
    });
    
    return res.json({
      success: true,
      data: {
        total: totalBuyers,
        byType: typeCounts,
        recent: recentBuyers
      }
    });
  } catch (err) {
    console.error("Get buyer stats error:", err.message);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch buyer statistics" 
    });
  }
};