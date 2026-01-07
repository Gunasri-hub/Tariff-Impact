// Tariff-Analyser-Api/models/country_currency.js
module.exports = (sequelize, DataTypes) => {
  const CountryCurrency = sequelize.define('CountryCurrency', {
    country: DataTypes.STRING,
    currency: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    tableName: 'country_currency',
    timestamps: false
  });

  return CountryCurrency;
};