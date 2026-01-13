'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Seller extends Model {
    static associate(models) {
      // associations can be defined here
    }
  }
  
  Seller.init({
    seller_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'FOREIGN_MANUFACTURER',
      validate: {
        isIn: [['FOREIGN_MANUFACTURER', 'EXPORTER', 'TRADING_COMPANY', 'OEM_SUPPLIER', 'RAW_MATERIAL_SUPPLIER']]
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 10]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Seller',
    tableName: 'sellers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
    // ✅ NO HOOKS - Controller handles ID generation
  });
  
  return Seller;
};