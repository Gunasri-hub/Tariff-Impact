module.exports = (sequelize, DataTypes) => {
  const IndustryTaxRate = sequelize.define(
    "IndustryTaxRate",
    {
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      industry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      direct_tax_pct: DataTypes.DECIMAL(5, 2),
      indirect_tax_pct: DataTypes.DECIMAL(5, 2),
      withholding_tax_pct: DataTypes.DECIMAL(5, 2),
    },
    {
      tableName: "industry_tax_rates",
      timestamps: true,
      underscored: true, // ✅ REQUIRED
    }
  );

  IndustryTaxRate.associate = (models) => {
    IndustryTaxRate.belongsTo(models.Country, {
      foreignKey: "country_id",
    });

    IndustryTaxRate.belongsTo(models.Industry, {
      foreignKey: "industry_id",
      as: "industry",
    });
  };

  return IndustryTaxRate;
};
