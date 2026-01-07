'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const countries = [
      {
        country_name: 'United States',
        iso_code: 'US',
        currency: 'USD',
        region: 'North America',
        status: 'General',
        eligibility_criteria: 'FTA',
        tariff_data_status: 'Complete',
        createdAt: now,
        updatedAt: now,
      },
      {
        country_name: 'Canada',
        iso_code: 'CA',
        currency: 'CAD',
        region: 'North America',
        status: 'General',
        eligibility_criteria: 'FTA',
        tariff_data_status: 'Complete',
        createdAt: now,
        updatedAt: now,
      },
      {
        country_name: 'Mexico',
        iso_code: 'MX',
        currency: 'MXN',
        region: 'North America',
        status: 'General',
        eligibility_criteria: 'FTA',
        tariff_data_status: 'Complete',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('countries', countries, {
      updateOnDuplicate: [
        'country_name',
        'currency',
        'region',
        'status',
        'eligibility_criteria',
        'tariff_data_status',
        'updatedAt',
      ],
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('countries', { iso_code: ['US', 'CA', 'MX'] }, {});
  },
};
