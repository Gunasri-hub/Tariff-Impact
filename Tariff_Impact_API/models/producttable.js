"use strict";

module.exports = (sequelize, DataTypes) => {
  const ProductTable = sequelize.define(
    "ProductTable",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      section: {
        type: DataTypes.STRING(5),
      },
      chapter: {
        type: DataTypes.INTEGER,
      },
      main_category: {
        type: DataTypes.TEXT,
      },
      subcategory: {
        type: DataTypes.TEXT,
      },
      group_name: {
        type: DataTypes.TEXT,
      },
      hts_code: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      product: {
        type: DataTypes.TEXT,
      },
      unit_of_quantity: {
        type: DataTypes.STRING(50),
      },
      general_rate_of_duty: {
        type: DataTypes.STRING(50),
      },
      special_rate_of_duty: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      column2_rate_of_duty: {
        type: DataTypes.STRING(50),
      },
      last_updated: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "product_table",
      timestamps: false,
    }
  );

  return ProductTable;
};
