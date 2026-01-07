// models/country.js
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    "Country",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      country_name: {
        type: DataTypes.STRING(255), // match your DB
        allowNull: false,
      },

      iso_code: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: true,
      },

      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },

      region: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("General", "Special", "Column2"),
        allowNull: false,
      },

      eligibility_criteria: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      tariff_data_status: {
        type: DataTypes.ENUM("Complete", "Incomplete"),
        allowNull: false,
        defaultValue: "Incomplete",
      },
    },
    {
      tableName: "countries",
      timestamps: true,       // enables createdAt / updatedAt
      underscored: false,     // uses camelCase in DB: createdAt / updatedAt
    }
  );

  return Country;
};
