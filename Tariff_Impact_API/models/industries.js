module.exports = (sequelize, DataTypes) => {
  const Industry = sequelize.define(
    "Industry",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "industries",
      timestamps: true,
      underscored: true, // ✅ THIS FIXES created_at / updated_at
    }
  );

  Industry.associate = (models) => {
    Industry.hasMany(models.IndustryTaxRate, {
      foreignKey: "industry_id",
    });
  };

  return Industry;
};
