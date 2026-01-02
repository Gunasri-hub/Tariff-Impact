const { Country } = require('../models');

exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      order: [['country_name', 'ASC']]
    });
    res.json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

exports.createCountry = async (req, res) => {
  try {
    console.log('CREATE COUNTRY REQUEST:', req.body);
    
    const { 
      country_name, 
      iso_code, 
      currency, 
      region, 
      column2_status, 
      fta_eligibility, 
      tariff_data_status 
    } = req.body;
    
    // Validate required fields
    if (!country_name || !iso_code || !currency || !region) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: country_name, iso_code, currency, region' 
      });
    }
    
    // Validate ISO code format
    if (iso_code.length !== 3) {
      return res.status(400).json({ 
        success: false, 
        error: 'ISO code must be exactly 3 characters' 
      });
    }
    
    // Check for duplicate ISO code
    const existing = await Country.findOne({ 
      where: { iso_code: iso_code.toUpperCase() } 
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: `Country with ISO code ${iso_code} already exists` 
      });
    }
    
    // Prepare data
    const countryData = {
      country_name: country_name.trim(),
      iso_code: iso_code.toUpperCase().trim(),
      currency: currency.toUpperCase().trim(),
      region: region.trim(),
      column2_status: column2_status || 'Not Applied',
      fta_eligibility: fta_eligibility ? 'true' : 'false',
      tariff_data_status: tariff_data_status || 'Incomplete',
      created_at: new Date()
    };
    
    // Create country
    const country = await Country.create(countryData);
    
    res.status(201).json({
      success: true,
      message: 'Country created successfully',
      data: country
    });
    
  } catch (error) {
    console.error('CREATE COUNTRY ERROR:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create country' 
    });
  }
};