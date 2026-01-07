"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // =========================
    // 1. FETCH ALL COUNTRIES
    // =========================
    const [countries] = await queryInterface.sequelize.query(
      `SELECT id, iso_code FROM countries`
    );

    if (!countries.length) {
      throw new Error("Seeder failed: No countries found");
    }

    // =========================
    // 2. FETCH INDUSTRIES
    // =========================
    const [industries] = await queryInterface.sequelize.query(
      `SELECT id, name FROM industries`
    );

    const idByName = {};
    industries.forEach((i) => {
      idByName[i.name] = i.id;
    });

    const requiredIndustries = [
      "Electronics",
      "Automotive",
      "Textiles",
      "Steel",
      "Agriculture",
    ];

    for (const name of requiredIndustries) {
      if (!idByName[name]) {
        throw new Error(`Seeder failed: Industry "${name}" not found`);
      }
    }

    // =========================
    // 3. BUILD BULK DATA
    // =========================
    const records = [];

    for (const country of countries) {
      for (const industry of requiredIndustries) {
        records.push({
          country_id: country.id,
          industry_id: idByName[industry],

          // you can later replace this with API data
          direct_tax_pct: industry === "Agriculture" ? 10.5 : 18.3,
          indirect_tax_pct: industry === "Agriculture" ? 14.2 : 20.1,
          withholding_tax_pct: industry === "Agriculture" ? 3.1 : 6.2,

          created_at: now,
          updated_at: now,
        });
      }
    }

    // =========================
    // 4. CLEAN + INSERT (SAFE)
    // =========================
    await queryInterface.bulkDelete("industry_tax_rates", null, {});
    await queryInterface.bulkInsert("industry_tax_rates", records);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("industry_tax_rates", null, {});
  },
};
