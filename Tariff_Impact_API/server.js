const express = require("express");
const cors = require("cors");
const routes = require('./src/routes');
const { sequelize, Country } = require('./models');
const port = process.env.PORT || 8080;

const app = express();

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Handle preflight requests - FIXED: Use specific path or remove *
// app.options('*', cors()); // ❌ This causes the error

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', req.body);
  }
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Tariff Impact API Running ✅' });
});

// Test Sequelize connection
sequelize.authenticate()
  .then(() => console.log('🔗 Sequelize Connected'))
  .catch(err => console.error('❌ Sequelize Auth Failed:', err));

sequelize.sync().then(() => {
  console.log('✅ Database & Models Synced');
  
  // ========== COUNTRY CRUD ENDPOINTS ==========
  
  // 1. GET all countries
  app.get('/api/countries', async (req, res) => {
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
      console.error('❌ GET Countries Error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch countries' 
      });
    }
  });
  
  // 2. POST create new country
  app.post('/api/countries', async (req, res) => {
    console.log('📝 POST /api/countries - CREATE NEW COUNTRY');
    
    try {
      const { 
        country_name, 
        iso_code, 
        currency, 
        region, 
        column2_status = 'Not Applied',
        fta_eligibility = '',
        tariff_data_status = 'Incomplete'
      } = req.body;
      
      // Validate required fields
      if (!country_name || !iso_code || !currency || !region) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: country_name, iso_code, currency, region' 
        });
      }
      
      // Validate ISO code
      const cleanIsoCode = iso_code.trim().toUpperCase();
      if (cleanIsoCode.length !== 3) {
        return res.status(400).json({ 
          success: false, 
          error: 'ISO code must be exactly 3 characters (e.g., USA, IND)' 
        });
      }
      
      // Check for duplicate
      const existing = await Country.findOne({ 
        where: { iso_code: cleanIsoCode } 
      });
      
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          error: `Country with ISO code "${cleanIsoCode}" already exists` 
        });
      }
      
      // Create country
      const country = await Country.create({
        country_name: country_name.trim(),
        iso_code: cleanIsoCode,
        currency: currency.trim().toUpperCase(),
        region: region.trim(),
        column2_status,
        fta_eligibility: fta_eligibility.toString(),
        tariff_data_status,
        created_at: new Date()
      });
      
      console.log('✅ Country created! ID:', country.id);
      
      res.status(201).json({
        success: true,
        message: 'Country created successfully',
        data: country
      });
      
    } catch (error) {
      console.error('❌ CREATE ERROR:', error.message);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create country'
      });
    }
  });
  
  // 3. PUT update country
  app.put('/api/countries/:id', async (req, res) => {
    try {
      const country = await Country.findByPk(req.params.id);
      if (!country) {
        return res.status(404).json({ 
          success: false, 
          error: 'Country not found' 
        });
      }
      
      await country.update(req.body);
      
      res.json({
        success: true,
        message: 'Country updated successfully',
        data: country
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
  
  // 4. DELETE country
  app.delete('/api/countries/:id', async (req, res) => {
    try {
      const country = await Country.findByPk(req.params.id);
      if (!country) {
        return res.status(404).json({ 
          success: false, 
          error: 'Country not found' 
        });
      }
      
      await country.destroy();
      
      res.json({
        success: true,
        message: 'Country deleted successfully'
      });
      
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
  
  // ========== MOUNT OTHER ROUTES ==========
  
  app.use('/api', routes);
  
  // Mount metadata routes (login, signup)
  try {
    const metadataRoutes = require('./src/routes/metadata');
    app.use('/', metadataRoutes);
    console.log('✅ Metadata routes mounted at /');
  } catch (error) {
    console.error('❌ Failed to load metadata routes:', error.message);
  }
  
  // ========== START SERVER ==========
  
  app.listen(port, () => {
    console.log(`\n🚀 Server started successfully!`);
    console.log(`📱 URL: http://localhost:${port}/`);
    console.log(`\n🔐 AUTH ENDPOINTS:`);
    console.log(`   • Admin Login: POST http://localhost:${port}/admin/login`);
    console.log(`   • User Login: POST http://localhost:${port}/user/login`);
    console.log(`   • Signup: POST http://localhost:${port}/signup`);
    console.log(`\n🌍 COUNTRY CRUD ENDPOINTS:`);
    console.log(`   • GET all: GET http://localhost:${port}/api/countries`);
    console.log(`   • CREATE: POST http://localhost:${port}/api/countries`);
    console.log(`   • UPDATE: PUT http://localhost:${port}/api/countries/:id`);
    console.log(`   • DELETE: DELETE http://localhost:${port}/api/countries/:id`);
    console.log(`\n✅ All endpoints are ready!`);
  });
  
}).catch(err => {
  console.error('❌ Database Sync Error:', err);
});