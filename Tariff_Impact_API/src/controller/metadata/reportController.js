const { Op, fn, col, literal, where } = require("sequelize");
const { UserTransaction } = require("../../../models");

// ✅ FIXED: Get sequelize instance for complex conditions
const sequelize = UserTransaction.sequelize;

/* =====================================================
   BUILD FILTER CONDITIONS - COMPLETELY FIXED
===================================================== */
const buildWhereClause = (query) => {
  const conditions = [];

  // ✅ FIXED: 2025-only + month range (monthFrom=1&monthTo=12 = Jan-Dec)

  // ✅ FIXED: Proper month range (Jan=1 → Dec=12)
  if (query.monthFrom && query.monthFrom !== 'All') {
    conditions.push(
      sequelize.where(ffn('MONTH', col('transactionDate')), '>=', parseInt(query.monthFrom))
    );
  }
  if (query.monthTo && query.monthTo !== 'All') {
    conditions.push(
      sequelize.where(fn('MONTH', col('transactionDate')), '<=', parseInt(query.monthTo))
    );
  }

  // ✅ ADDED: All missing filters from your dropdowns
  if (query.mainCategory && query.mainCategory !== 'All') conditions.push({ mainCategory: query.mainCategory });
  if (query.subCategory && query.subCategory !== 'All') conditions.push({ subCategory: query.subCategory });
  if (query.originCountry && query.originCountry !== 'All') conditions.push({ originCountry: query.originCountry });
  if (query.destinationCountry && query.destinationCountry !== 'All') conditions.push({ destinationCountry: query.destinationCountry });
  if (query.modeOfTransport && query.modeOfTransport !== 'All') conditions.push({ modeOfTransport: query.modeOfTransport });
  if (query.buyerType && query.buyerType !== 'All') conditions.push({ buyerType: query.buyerType });
  if (query.sellerType && query.sellerType !== 'All') conditions.push({ sellerType: query.sellerType });
  if (query.status && query.status !== 'All') conditions.push({ status: query.status });

  if (query.transactionType && query.transactionType !== "BOTH") {
    conditions.push({ transactionType: query.transactionType.toUpperCase() });
  }

  console.log("🔍 WHERE CLAUSE:", JSON.stringify(conditions)); // Debug log
  return { [Op.and]: conditions };
};

/* =====================================================
   KPI SUMMARY - FIXED
===================================================== */
exports.getSummaryKPIs = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    console.log("📊 KPI WHERE:", JSON.stringify(where));

    const totalTransactions = await UserTransaction.count({ where });
    const totalExports = await UserTransaction.count({ where: { ...where, transactionType: "EXPORT" } });
    const totalImports = await UserTransaction.count({ where: { ...where, transactionType: "IMPORT" } });

    const topIndustry = await UserTransaction.findOne({
      attributes: ["subCategory", [fn("COUNT", col("id")), "count"]],
      where: { ...where, subCategory: { [Op.ne]: null } },
      group: ["subCategory"],
      order: [[literal("count"), "DESC"]],
      limit: 1,
      raw: true
    });

    const topTradeRoute = await UserTransaction.findOne({
      attributes: ["modeOfTransport", [fn("COUNT", col("id")), "count"]],
      where: { ...where, modeOfTransport: { [Op.ne]: null } },
      group: ["modeOfTransport"],
      order: [[literal("count"), "DESC"]],
      limit: 1,
      raw: true
    });

    const topBuyer = await UserTransaction.findOne({
      attributes: ["buyerName", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["buyerName"],
      order: [[literal("count"), "DESC"]],
      limit: 1,
      raw: true
    });

    const topSeller = await UserTransaction.findOne({
      attributes: ["sellerName", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["sellerName"],
      order: [[literal("count"), "DESC"]],
      limit: 1,
      raw: true
    });

    const routeEmoji = { air: "✈️ Air", sea: "🚢 Sea", road: "🚚 Road" };

    res.json({
      totalTransactions,
      totalExports,
      totalImports,
      topIndustry: topIndustry?.subCategory || "—",
      topTradeRoute: routeEmoji[topTradeRoute?.modeOfTransport?.toLowerCase()] || "—",
      topBuyer: topBuyer?.buyerName || "—",
      topSeller: topSeller?.sellerName || "—"
    });
  } catch (error) {
    console.error("🚨 KPI ERROR:", error);
    res.status(500).json({ message: "Failed to load KPI summary", error: error.message });
  }
};

// ✅ FIXED: All other functions (add raw: true, proper where, try/catch)
exports.getTransactionTrend = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: [[fn('MONTH', col('transactionDate')), "month"], [fn("COUNT", col("id")), "count"]],
      where,
      group: [fn('MONTH', col('transactionDate'))],
      order: [[literal("month"), "ASC"]],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Trend ERROR:", error);
    res.status(500).json({ message: "Failed to load trend", error: error.message });
  }
};

exports.getIndustryDistribution = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["subCategory", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["subCategory"],
      order: [[literal("count"), "DESC"]],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Industry ERROR:", error);
    res.status(500).json({ message: "Industry distribution failed", error: error.message });
  }
};

exports.getTransactionTypeAnalysis = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["transactionType", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["transactionType"],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Type ERROR:", error);
    res.status(500).json({ message: "Transaction type analysis failed", error: error.message });
  }
};

exports.getCountryWiseTrade = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["destinationCountry", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["destinationCountry"],
      order: [[literal("count"), "DESC"]],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Country ERROR:", error);
    res.status(500).json({ message: "Country trade failed", error: error.message });
  }
};

exports.getExportImportTrend = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: [[fn('MONTH', col('transactionDate')), "month"], "transactionType", [fn("COUNT", col("id")), "count"]],
      where,
      group: [fn('MONTH', col('transactionDate')), "transactionType"],
      order: [[literal("month"), "ASC"]],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 ExportImport ERROR:", error);
    res.status(500).json({ message: "Export import trend failed" });
  }
};

exports.getTopDestinationCountries = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["destinationCountry", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["destinationCountry"],
      order: [[literal("count"), "DESC"]],
      limit: 10,
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 TopDest ERROR:", error);
    res.status(500).json({ message: "Top destinations failed" });
  }
};

exports.getTransportDistribution = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["modeOfTransport", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["modeOfTransport"],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Transport ERROR:", error);
    res.status(500).json({ message: "Transport distribution failed" });
  }
};

exports.getStatusBreakdown = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["status"],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Status ERROR:", error);
    res.status(500).json({ message: "Status breakdown failed" });
  }
};

exports.getTopBuyers = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["buyerName", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["buyerName"],
      order: [[literal("count"), "DESC"]],
      limit: 5,
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 TopBuyers ERROR:", error);
    res.status(500).json({ message: "Top buyers failed" });
  }
};

exports.getIndustryTransportMatrix = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["subCategory", "modeOfTransport", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["subCategory", "modeOfTransport"],
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 Matrix ERROR:", error);
    res.status(500).json({ message: "Industry transport matrix failed" });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const where = buildWhereClause(req.query); // ✅ Now respects filters!
    const [originResults] = await sequelize.query(`
      SELECT DISTINCT originCountry as name 
      FROM usertransactions 
      WHERE originCountry IS NOT NULL AND originCountry != '' 
      ${where[Op.and].length > 1 ? 'AND ' + sequelize.getQueryInterface().queryGenerator.getWhereConditions(where[Op.and][0]) : ''}
      ORDER BY originCountry ASC LIMIT 300
    `);

    const [destinationResults] = await sequelize.query(`
      SELECT DISTINCT destinationCountry as name 
      FROM usertransactions 
      WHERE destinationCountry IS NOT NULL AND destinationCountry != '' 
      ${where[Op.and].length > 1 ? 'AND ' + sequelize.getQueryInterface().queryGenerator.getWhereConditions(where[Op.and][0]) : ''}
      ORDER BY destinationCountry ASC LIMIT 300
    `);

    const allCountries = [
      ...originResults.map(r => ({ id: r.name, name: r.name })),
      ...destinationResults.map(r => ({ id: r.name, name: r.name }))
    ].filter(c => c.name && c.name.trim() !== '');

    const uniqueCountries = [];
    const seen = new Set();
    allCountries.forEach(country => {
      if (!seen.has(country.name)) {
        seen.add(country.name);
        uniqueCountries.push(country);
      }
    });

    res.json(uniqueCountries);
  } catch (error) {
    console.error("🚨 Countries ERROR:", error);
    res.status(500).json({ message: "Failed to load countries", error: error.message });
  }
};

exports.getTopOriginCountries = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["originCountry", [fn("COUNT", col("id")), "count"]],
      where: { ...where, originCountry: { [Op.ne]: null } },
      group: ["originCountry"],
      order: [[literal("count"), "DESC"]],
      limit: 10,
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 TopOrigin ERROR:", error);
    res.status(500).json({ error: "Top origin countries failed" });
  }
};

exports.getTopTradeRoutes = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["originCountry", "destinationCountry", [fn("COUNT", col("id")), "count"]],
      where: {
        ...where,
        originCountry: { [Op.ne]: null },
        destinationCountry: { [Op.ne]: null }
      },
      group: ["originCountry", "destinationCountry"],
      order: [[literal("count"), "DESC"]],
      limit: 10,
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 TradeRoutes ERROR:", error);
    res.status(500).json({ error: "Top trade routes failed" });
  }
};

// ✅ ADD THESE 2 FUNCTIONS (copy to end of reportController.js)
exports.getTopSellers = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    const data = await UserTransaction.findAll({
      attributes: ["sellerName", [fn("COUNT", col("id")), "count"]],
      where,
      group: ["sellerName"],
      order: [[literal("count"), "DESC"]],
      limit: 5,
      raw: true
    });
    res.json(data);
  } catch (error) {
    console.error("🚨 TopSellers ERROR:", error);
    res.status(500).json({ message: "Top sellers failed" });
  }
};

exports.getBuyerSellerOptions = async (req, res) => {
  try {
    const where = buildWhereClause(req.query);
    
    // ✅ FIXED: Query buyerType/sellerType instead of buyerName/sellerName
    const [buyerResults] = await sequelize.query(`
      SELECT DISTINCT buyerType as name, COUNT(*) as count
      FROM usertransactions 
      WHERE buyerType IS NOT NULL AND buyerType != '' 
      GROUP BY buyerType 
      ORDER BY COUNT(*) DESC 
      LIMIT 100
    `);

    const [sellerResults] = await sequelize.query(`
      SELECT DISTINCT sellerType as name, COUNT(*) as count
      FROM usertransactions 
      WHERE sellerType IS NOT NULL AND sellerType != '' 
      GROUP BY sellerType 
      ORDER BY COUNT(*) DESC 
      LIMIT 100
    `);

    res.json({
      buyers: buyerResults.map(r => ({ 
        id: r.name, 
        name: r.name,
        count: r.count || 0  // ✅ Added count for frontend
      })),
      sellers: sellerResults.map(r => ({ 
        id: r.name, 
        name: r.name,
        count: r.count || 0
      }))
    });
  } catch (error) {
    console.error("🚨 BuyerSeller TYPE ERROR:", error);
    res.status(500).json({ message: "Buyer/seller type options failed" });
  }
};


