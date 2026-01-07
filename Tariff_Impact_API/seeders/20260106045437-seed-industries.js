'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('industries', [
      { name: 'Electronics', created_at: now, updated_at: now },
      { name: 'Automotive', created_at: now, updated_at: now },
      { name: 'Textiles', created_at: now, updated_at: now },
      { name: 'Steel', created_at: now, updated_at: now },
      { name: 'Agriculture', created_at: now, updated_at: now },
    ], { fields: ['name', 'created_at', 'updated_at'] });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('industries', null, {});
  },
};
