'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transactionCode: {
        type: Sequelize.STRING
      },
      transactionType: {
        type: Sequelize.STRING
      },
      transactionDate: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      buyerId: {
        type: Sequelize.STRING
      },
      buyerName: {
        type: Sequelize.STRING
      },
      buyerType: {
        type: Sequelize.STRING
      },
      buyerPhone: {
        type: Sequelize.STRING
      },
      buyerEmail: {
        type: Sequelize.STRING
      },
      buyerAddress: {
        type: Sequelize.TEXT
      },
      sellerId: {
        type: Sequelize.STRING
      },
      sellerName: {
        type: Sequelize.STRING
      },
      sellerType: {
        type: Sequelize.STRING
      },
      sellerPhone: {
        type: Sequelize.STRING
      },
      sellerEmail: {
        type: Sequelize.STRING
      },
      sellerAddress: {
        type: Sequelize.TEXT
      },
      originCountry: {
        type: Sequelize.STRING
      },
      originCurrency: {
        type: Sequelize.STRING
      },
      destinationCountry: {
        type: Sequelize.STRING
      },
      destinationCurrency: {
        type: Sequelize.STRING
      },
      modeOfTransport: {
        type: Sequelize.STRING
      },
      mainCategory: {
        type: Sequelize.STRING
      },
      subCategory: {
        type: Sequelize.STRING
      },
      htsCode: {
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
    await queryInterface.dropTable('UserTransactions');
  }
};