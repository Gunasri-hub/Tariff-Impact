'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UserTransactions', 'transactionDate', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UserTransactions', 'transactionDate', {
      type: Sequelize.DATE,
    });
  }
};
