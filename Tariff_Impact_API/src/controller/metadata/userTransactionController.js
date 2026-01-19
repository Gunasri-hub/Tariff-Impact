const { UserTransaction } = require('../../../models');
const { Op } = require("sequelize");

/* ===============================
   GENERATE NEXT TXN CODE
================================ */
const generateTransactionCode = async () => {
  const lastTxn = await UserTransaction.findOne({
    order: [['id', 'DESC']],
    attributes: ['transactionCode']
  });

  let nextNumber = 1;

  if (lastTxn?.transactionCode) {
    const match = lastTxn.transactionCode.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  return `TXN-${String(nextNumber).padStart(3, '0')}`;
};

/* ===============================
   GET NEXT TXN CODE
================================ */
const getNextTransactionCode = async (req, res) => {
  try {
    const transactionCode = await generateTransactionCode();
    res.json({ transactionCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate transaction code" });
  }
};

/* ===============================
   CREATE TRANSACTION
================================ */
const createUserTransaction = async (req, res) => {
  try {
    const transactionCode = await generateTransactionCode();

    const transaction = await UserTransaction.create({
      transactionCode,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ===============================
   GET ALL TRANSACTIONS
================================ */
const getAllUserTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let where = {};

    if (search) {
      where = {
        [Op.or]: [
          { transactionCode: { [Op.iLike]: `%${search}%` } },
          { buyerName: { [Op.iLike]: `%${search}%` } },
          { sellerName: { [Op.iLike]: `%${search}%` } },
          { mainCategory: { [Op.iLike]: `%${search}%` } },
          { subCategory: { [Op.iLike]: `%${search}%` } },
          { htsCode: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await UserTransaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "DESC"]]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
};

/* ===============================
   UPDATE TRANSACTION
================================ */
const updateUserTransaction = async (req, res) => {
  try {
    const txn = await UserTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ error: "Not found" });

    await txn.update(req.body);
    res.json({ success: true, data: txn });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

/* ===============================
   DELETE TRANSACTION
================================ */
const deleteUserTransaction = async (req, res) => {
  try {
    const txn = await UserTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ error: "Not found" });

    await txn.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ===============================
   EXPORTS (ONLY ONE EXPORT)
================================ */
module.exports = {
  createUserTransaction,
  getNextTransactionCode,
  getAllUserTransactions,
  updateUserTransaction,
  deleteUserTransaction
};
