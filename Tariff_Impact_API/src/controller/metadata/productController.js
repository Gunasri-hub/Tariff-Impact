const { ProductTable } = require("../../../models");
const { Op } = require("sequelize");

/**
 * GET /api/metadata/products
 */
exports.getAll = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const where = search
      ? {
          [Op.or]: [
            { product: { [Op.like]: `%${search}%` } },
            { hts_code: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const data = await ProductTable.findAll({
      where,
      order: [["hts_code", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/metadata/products/:id
 */
exports.getById = async (req, res) => {
  try {
    const row = await ProductTable.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/metadata/products
 */
exports.create = async (req, res) => {
  try {
    const row = await ProductTable.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * PUT /api/metadata/products/:id
 */
exports.update = async (req, res) => {
  try {
    const [updated] = await ProductTable.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    const row = await ProductTable.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/metadata/products/:id
 */
exports.remove = async (req, res) => {
  try {
    const deleted = await ProductTable.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
