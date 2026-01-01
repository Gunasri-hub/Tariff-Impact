'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      // associations can be defined here
    }
  }
  
  Country.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    country_name: DataTypes.STRING,
    iso_code: DataTypes.STRING,
    currency: DataTypes.STRING,
    region: DataTypes.STRING,
    column2_status: DataTypes.ENUM('Applied', 'Not Applied'),
    fta_eligibility: DataTypes.TEXT,
    tariff_data_status: DataTypes.ENUM('Complete', 'Incomplete'),
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
    timestamps: false
  });

  return Country;
};
