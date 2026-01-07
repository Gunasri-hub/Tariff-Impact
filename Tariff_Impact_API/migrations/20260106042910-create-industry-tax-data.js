"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("industry_tax_rates", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "countries", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      industry_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "industries", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      direct_tax_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      indirect_tax_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      withholding_tax_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("industry_tax_rates");
  },
};
