// Tariff-Analyser-Api/controllers/industryController.js
const { HtsFull, CountryCurrency } = require("../../../models");
const { fn, col } = require("sequelize");

// ---------- BASIC LIST ENDPOINTS ----------

// GET /api/hts-full
exports.getAllHts = async (req, res) => {
  try {
    const rows = await HtsFull.findAll();
    res.json(rows);
  } catch (err) {
    console.error("getAllHts error:", err);
    res.status(500).json({ message: "Error fetching hts_full" });
  }
};

// GET /api/country-currency
exports.getAllCountryCurrency = async (req, res) => {
  try {
    const rows = await CountryCurrency.findAll();
    res.json(rows);
  } catch (err) {
    console.error("getAllCountryCurrency error:", err);
    res.status(500).json({ message: "Error fetching country_currency" });
  }
};

// ---------- INDUSTRY EXPLORER ANALYTICS ----------

// 1) Tariff Rate Trend: avg general duty + row count by year
// GET /api/industry/trend?industry=...&subIndustry=...
exports.getTariffTrend = async (req, res) => {
  try {
    const { industry, subIndustry } = req.query;

    const where = {};
    if (industry) where.industry = industry;
    if (subIndustry) where.sub_industry = subIndustry;

    const rows = await HtsFull.findAll({
      where,
      attributes: [
        "year",
        [fn("AVG", col("general_duty")), "avgDuty"],
        [fn("COUNT", col("id")), "tradeVolume"],
      ],
      group: ["year"],
      order: [["year", "ASC"]],
    });

    res.json(rows);
  } catch (err) {
    console.error("getTariffTrend error:", err);
    res.status(500).json({ message: "Error fetching tariff trend" });
  }
};

// 2) Industry Distribution: trade volume + avg duty per industry
// GET /api/industry/distribution?year=2024&industry=Electronics (industry optional)
exports.getIndustryDistribution = async (req, res) => {
  try {
    const { year, industry } = req.query;

    const where = {};
    if (year) where.year = year;
    if (industry) where.industry = industry;

    const rows = await HtsFull.findAll({
      where,
      attributes: [
        "industry",
        [fn("COUNT", col("id")), "tradeVolume"],
        [fn("AVG", col("general_duty")), "avgDuty"],
      ],
      group: ["industry"],
    });

    res.json(rows);
  } catch (err) {
    console.error("getIndustryDistribution error:", err);
    res.status(500).json({ message: "Error fetching industry distribution" });
  }
};

// 3) HTS Codes for card list
// GET /api/industry/hts-codes?industry=...&subIndustry=...&htsCode=...
exports.getHtsCodes = async (req, res) => {
  try {
    const { industry, subIndustry, htsCode } = req.query;

    const where = {};
    if (industry) where.industry = industry;
    if (subIndustry) where.sub_industry = subIndustry;
    if (htsCode) where.hts_code = htsCode;

    const rows = await HtsFull.findAll({
      where,
      attributes: [
        "id",
        "hts_code",
        "industry",
        "sub_industry",
        "general_duty",
        "special_duty",
        "column2_duty",
        "year",
      ],
      limit: 50,
    });

    res.json(rows);
  } catch (err) {
    console.error("getHtsCodes error:", err);
    res.status(500).json({ message: "Error fetching HTS codes" });
  }
};

// 4) NEW: Top Sub‑Industries by Average Duty
// GET /api/industry/sub-industry-duties?year=2024&industry=Electronics
exports.getSubIndustryDuties = async (req, res) => {
  try {
    const { year, industry } = req.query;

    const where = {};
    if (year) where.year = year;
    if (industry) where.industry = industry;

    const rows = await HtsFull.findAll({
      where,
      attributes: [
        "sub_industry",
        [fn("AVG", col("general_duty")), "avgDuty"],
        [fn("COUNT", col("id")), "rowCount"],
      ],
      group: ["sub_industry"],
      order: [[fn("AVG", col("general_duty")), "DESC"]],
    });

    res.json(rows);
  } catch (err) {
    console.error("getSubIndustryDuties error:", err);
    res.status(500).json({ message: "Error fetching sub‑industry duties" });
  }
};

// ---------- SUPPORTING LIST ENDPOINTS ----------

exports.getCurrencies = async (req, res) => {
  try {
    const rows = await CountryCurrency.findAll({
      attributes: ["id", "country", "currency", "code"],
      order: [["country", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    console.error("getCurrencies error:", err);
    res.status(500).json({ message: "Error fetching currencies" });
  }
};

exports.getCountriesList = async (req, res) => {
  try {
    const rows = await CountryCurrency.findAll({
      attributes: ["country"],
      group: ["country"],
      order: [["country", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    console.error("getCountriesList error:", err);
    res.status(500).json({ message: "Error fetching countries list" });
  }
};

exports.getIndustriesList = async (req, res) => {
  try {
    const rows = await HtsFull.findAll({
      attributes: ["industry"],
      group: ["industry"],
      order: [["industry", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    console.error("getIndustriesList error:", err);
    res.status(500).json({ message: "Error fetching industries list" });
  }
};

exports.getSubIndustriesList = async (req, res) => {
  try {
    const { industry } = req.query;

    const rows = await HtsFull.findAll({
      where: industry ? { industry } : {},
      attributes: ["sub_industry"],
      group: ["sub_industry"],
      order: [["sub_industry", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    console.error("getSubIndustriesList error:", err);
    res.status(500).json({ message: "Error fetching sub-industries list" });
  }
};

exports.getHtsCodesList = async (req, res) => {
  try {
    const { industry, subIndustry } = req.query;

    const where = {};
    if (industry) where.industry = industry;
    if (subIndustry) where.sub_industry = subIndustry;

    const rows = await HtsFull.findAll({
      where,
      attributes: ["hts_code"],
      group: ["hts_code"],
      order: [["hts_code", "ASC"]],
      limit: 200,
    });
    res.json(rows);
  } catch (err) {
    console.error("getHtsCodesList error:", err);
    res.status(500).json({ message: "Error fetching HTS codes list" });
  }
};