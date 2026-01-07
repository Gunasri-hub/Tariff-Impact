'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Agreements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AgreementCode: {
        type: Sequelize.STRING
      },
      AgreementName: {
        type: Sequelize.STRING
      },
      CountriesIncluded: {
        type: Sequelize.TEXT
      },
      ValidityPeriod: {
        type: Sequelize.STRING
      },
      Status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Agreements');
  }
};