"use strict";

module.exports = (sequelize, DataTypes) => {
  const HtsFull = sequelize.define(
    "HtsFull",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      hts_code: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },

      industry: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      sub_industry: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      general_duty: {
        type: DataTypes.TEXT, // 🔴 TEXT in DB
        allowNull: true,
      },

      special_duty: {
        type: DataTypes.TEXT, // 🔴 TEXT in DB
        allowNull: true,
      },

      column2_duty: {
        type: DataTypes.TEXT, // 🔴 TEXT in DB
        allowNull: true,
      },

      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "hts_full",
      timestamps: false,
      underscored: true,
    }
  );

  return HtsFull;
};
