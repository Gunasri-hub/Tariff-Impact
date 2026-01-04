"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("countries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      country_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      iso_code: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: true,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("General", "Special", "Column2"),
        allowNull: false,
      },
      eligibility_criteria: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      tariff_data_status: {
        type: Sequelize.ENUM("Complete", "Incomplete"),
        defaultValue: "Incomplete",
      },
      createdAt: {
  allowNull: false,
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
},
updatedAt: {
  allowNull: false,
  type: Sequelize.DATE,
  defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
},

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("countries");
  },
};
