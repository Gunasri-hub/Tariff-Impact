module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ImpactAnalysis", {
    type: DataTypes.STRING,
    key: DataTypes.STRING,
    value: DataTypes.STRING,
  });
};
