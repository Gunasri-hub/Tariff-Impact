// Tariff-Analyser-Api/models/hts_full.js
module.exports = (sequelize, DataTypes) => {
  const HtsFull = sequelize.define('HtsFull', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hts_code: DataTypes.STRING,
    industry: DataTypes.TEXT,
    sub_industry: DataTypes.TEXT,
    general_duty: DataTypes.FLOAT,
    special_duty: DataTypes.FLOAT,
    column2_duty: DataTypes.FLOAT,
    year: DataTypes.INTEGER
    // NOTE: no "country" column here
  }, {
    tableName: 'hts_full',
    timestamps: false
  });

  return HtsFull;
};