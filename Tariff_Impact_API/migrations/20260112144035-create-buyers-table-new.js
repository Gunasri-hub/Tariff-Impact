'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First check if buyers table already exists
    const tableExists = await queryInterface.showAllTables();
    
    if (tableExists.includes('buyers')) {
      console.log('Buyers table already exists, skipping creation');
      return;
    }
    
    // Create buyers table
    await queryInterface.createTable('buyers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      buyer_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      email_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add index
    await queryInterface.addIndex('buyers', ['buyer_id'], {
      name: 'idx_buyer_id'
    });
    
    console.log('Buyers table created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Check if buyers table exists before dropping
    const tableExists = await queryInterface.showAllTables();
    
    if (tableExists.includes('buyers')) {
      await queryInterface.dropTable('buyers');
      console.log('Buyers table dropped');
    } else {
      console.log('Buyers table does not exist, nothing to drop');
    }
  }
};