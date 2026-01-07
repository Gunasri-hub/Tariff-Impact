const axios = require("axios");
const { Parser } = require("json2csv"); 
const { Country, Industry, IndustryTaxRate } = require("../../../models");

/* ===================== CORE UPDATE LOGIC ===================== */
async function updateAllCountriesAndIndustries() {
  const countries = await Country.findAll();
  const industries = await Industry.findAll();

  const indicators = {
    Agriculture: "TM.TAX.MRCH.WM.AR.ZS",
    Automotive: "TM.TAX.MRCH.VH.ZS",
    Electronics: "TM.TAX.MRCH.EL.ZS",
    Steel: "TM.TAX.MRCH.MT.ZS",
    Textiles: "TM.TAX.MRCH.TX.ZS",
  };

  for (const country of countries) {
    for (const industry of industries) {
      const indicator = indicators[industry.name];
      let values = [];

      if (indicator) {
        try {
          const res = await axios.get(
            `https://api.worldbank.org/v2/country/${country.iso_code}/indicator/${indicator}?format=json&date=2020:2025`,
            { timeout: 8000 }
          );

          values =
            res.data?.[1]
              ?.filter(r => r.value !== null)
              .map(r => Number(r.value)) || [];
        } catch (err) {
          console.log(`WB failed: ${country.iso_code} ${industry.name}`);
        }
      }

      if (!values.length) values = [3.5];

      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      await IndustryTaxRate.upsert({
        country_id: country.id,
        industry_id: industry.id,
        direct_tax_pct: avg * 0.2,
        indirect_tax_pct: avg * 0.6 + 8,
        withholding_tax_pct: avg * 0.2,
      });

      console.log(`✔ ${country.iso_code} - ${industry.name}`);
    }
  }
}

/* ===================== CONTROLLER APIS ===================== */

exports.refreshTaxData = async (req, res, next) => {
  try {
    console.log("🔥 TAX REFRESH STARTED");
    await updateAllCountriesAndIndustries();
    res.json({ message: "Tax data refreshed for all countries" });
  } catch (err) {
    next(err);
  }
};

exports.getAllIndustryRates = async (req, res, next) => {
  try {
    const data = await IndustryTaxRate.findAll({
      include: [
        { model: Country },                 // ✅ NO alias
        { model: Industry, as: "industry" } // ✅ EXACT alias match
      ],
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
};


exports.getSummary = async (req, res, next) => {
  try {
    const countryCode = req.query.country || "US";
    const country = await Country.findOne({ where: { iso_code: countryCode } });
    if (!country) return res.json(null);

    const rows = await IndustryTaxRate.findAll({
      where: { country_id: country.id },
    });

    if (!rows.length) return res.json(null);

    const total = rows.reduce(
      (a, r) => {
        a.direct += Number(r.direct_tax_pct);
        a.indirect += Number(r.indirect_tax_pct);
        a.withholding += Number(r.withholding_tax_pct);
        return a;
      },
      { direct: 0, indirect: 0, withholding: 0 }
    );

    const n = rows.length;

    res.json({
      direct_avg: total.direct / n,
      indirect_avg: total.indirect / n,
      withholding_avg: total.withholding / n,
      total_effective:
        (total.direct + total.indirect + total.withholding) / n,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================== CSV EXPORT (PAGE DATA) ===================== */
exports.exportTaxationExcel = async (req, res, next) => {
  try {
    const results = await sequelize.query(
      `
      SELECT 
        i.name AS industry,
        ROUND(AVG(itr.direct_tax_pct), 2) AS avg_direct_tax,
        ROUND(AVG(itr.indirect_tax_pct), 2) AS avg_indirect_tax,
        ROUND(AVG(itr.withholding_tax_pct), 2) AS avg_withholding_tax,
        ROUND(
          AVG(itr.direct_tax_pct) + 
          AVG(itr.indirect_tax_pct) + 
          AVG(itr.withholding_tax_pct), 
        2) AS total_effective_tax,
        ROUND(
          (AVG(itr.direct_tax_pct) /
          (AVG(itr.direct_tax_pct) + AVG(itr.indirect_tax_pct) + AVG(itr.withholding_tax_pct))) * 100, 
        2) AS direct_tax_share,
        ROUND(
          (AVG(itr.indirect_tax_pct) /
          (AVG(itr.direct_tax_pct) + AVG(itr.indirect_tax_pct) + AVG(itr.withholding_tax_pct))) * 100, 
        2) AS indirect_tax_share,
        ROUND(
          (AVG(itr.withholding_tax_pct) /
          (AVG(itr.direct_tax_pct) + AVG(itr.indirect_tax_pct) + AVG(itr.withholding_tax_pct))) * 100, 
        2) AS withholding_tax_share,
        COUNT(*) AS records_analyzed
      FROM industry_tax_rates itr
      JOIN industries i ON i.id = itr.industry_id
      GROUP BY i.name
      ORDER BY total_effective_tax DESC;
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const parser = new Parser({
      fields: [
        "industry",
        "avg_direct_tax",
        "avg_indirect_tax",
        "avg_withholding_tax",
        "total_effective_tax",
        "direct_tax_share",
        "indirect_tax_share",
        "withholding_tax_share",
        "records_analyzed"
      ]
    });

    const csv = parser.parse(results);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=industry_tax_impact_summary.csv"
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
