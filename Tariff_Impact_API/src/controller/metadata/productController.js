// Controller/productController.js
const { ProductTable } = require("../../../models");
const { Op } = require("sequelize");

// GET /api/products?search=&page=1&limit=20
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const search = (req.query.search || "").trim();

    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { product: { [Op.like]: `%${search}%` } },
        { hts_code: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await ProductTable.findAndCountAll({
      where,
      limit,
      offset,
      order: [["hts_code", "ASC"]],
    });

    res.json({
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

// POST /api/products
exports.create = async (req, res) => {
  try {
    const data = req.body;

    if (!data.hts_code || !data.product) {
      return res.status(400).json({ message: "hts_code and product are required" });
    }

    const row = await ProductTable.create({
      section: data.section || "",
      chapter: data.chapter || null,
      main_category: data.main_category || "",
      subcategory: data.subcategory || "",
      group_name: data.group_name || "",
      hts_code: String(data.hts_code).trim(),
      product: data.product,
      unit_of_quantity: data.unit_of_quantity || "",
      general_rate_of_duty: data.general_rate_of_duty || "",
      special_rate_of_duty: data.special_rate_of_duty || "",
      column2_rate_of_duty: data.column2_rate_of_duty || "",
    });

    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};

// PUT /api/products/:id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await ProductTable.update(req.body, { where: { id } });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    const row = await ProductTable.findByPk(id);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

// DELETE /api/products/:id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await ProductTable.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};
