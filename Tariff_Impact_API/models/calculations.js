"use strict";

module.exports = (sequelize, DataTypes) => {
  const Calculations = sequelize.define(
    "Calculations",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      shipment_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      products_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      charges_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      total_landed_origin: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      total_landed_dest: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      forex_rate: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 0.0000,
      },
      duty_total_origin: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      duty_total_dest: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
      },
      user_id: {
        type: DataTypes.STRING(50),
        defaultValue: "anonymous",
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "calculations",
      timestamps: false,  // Your table uses custom timestamp column
    }
  );

  return Calculations;
};
