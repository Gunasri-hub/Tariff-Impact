const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Admin } = require('../../models');

const BASE = "";   // empty string

const db = require('../../models');  // adjust the path if needed
const { Country } = db;

const userController = require('../controller/metadata/userController');




// Log all requests
router.use((req, res, next) => {
  console.log('REQUEST:', req.method, req.url, req.body);
  next();
});

// ========== SIGNUP (already working) ==========
router.post('/signup', async (req, res) => {
  console.log('SIGNUP HIT:', req.body);
  try {
    const { name, email, password, role = 'user' } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    if (role === 'admin') {
      const existing = await Admin.findOne({ where: { email } });
      if (existing) return res.json({ success: false, error: 'Admin exists' });
      
      const admin = await Admin.create({
        companyName: name,
        email,
        password: hash
      });
      console.log('ADMIN CREATED:', admin.id);
      return res.json({ 
        success: true, 
        message: 'Admin created',
        user: { id: admin.id, name: admin.companyName, email, role: 'admin' }
      });
    }
    
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.json({ success: false, error: 'User exists' });
    
    const user = await User.create({
      name,
      email,
      password: hash,
      role,
      status: 'active'
    });
    console.log('USER CREATED:', user.id);
    res.json({ 
      success: true, 
      message: 'User created',
      user: { id: user.id, name, email, role }
    });
  } catch (err) {
    console.error('SIGNUP ERROR:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ========== ADMIN LOGIN ==========
router.post('/admin/login', async (req, res) => {
  console.log('ADMIN LOGIN HIT:', req.body);
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ where: { email } });
    if (admin && await bcrypt.compare(password, admin.password)) {
      console.log('ADMIN LOGIN SUCCESS:', admin.email);
      return res.json({
        success: true,
        token: 'admin-jwt-token',
        user: { 
          id: admin.id, 
          name: admin.companyName, 
          email: admin.email, 
          role: 'admin' 
        }
      });
    }
    
    console.log('ADMIN LOGIN FAILED:', email);
    res.status(401).json({ success: false, error: 'Invalid admin credentials' });
  } catch (err) {
    console.error('ADMIN LOGIN ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ========== USER LOGIN ==========
router.post('/user/login', async (req, res) => {
  console.log('USER LOGIN HIT:', req.body);
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('USER LOGIN SUCCESS:', user.email);
      return res.json({
        success: true,
        token: 'user-jwt-token',
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        }
      });
    }
    
    console.log('USER LOGIN FAILED:', email);
    res.status(401).json({ success: false, error: 'Invalid user credentials' });
  } catch (err) {
    console.error('USER LOGIN ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
//========== INDUSTRY EXPLORER ==========

const Controller = require("../controller/metadata/industryController");

// ================= BASIC LISTS =================
router.get("/hts-full", Controller.getAllHts);
router.get("/country-currency", Controller.getAllCountryCurrency);

// ================= ANALYTICS =================
router.get("/industry/trend", Controller.getTariffTrend);
router.get("/industry/distribution", Controller.getIndustryDistribution);
router.get("/industry/hts-codes", Controller.getHtsCodes);
router.get("/industry/sub-industry-duties", Controller.getSubIndustryDuties);

// ================= DROPDOWNS =================
router.get("/currencies", Controller.getCurrencies);
router.get("/countries-list", Controller.getCountriesList);
router.get("/industries-list", Controller.getIndustriesList);
router.get("/sub-industries-list", Controller.getSubIndustriesList);
router.get("/hts-codes-list", Controller.getHtsCodesList);


// ==========  TARIFF IMPACT ANALYSIS ==========

const controller = require("../controller/metadata/impact_analysis.controller");

router.get("/impact-analysis/currency", controller.getCurrencyData);
router.get("/impact-analysis/duty-type", controller.getDutyTypeData);
router.get("/impact-analysis/tariff", controller.getTariffData);

const productController = require("../controller/metadata/productController");

/* PRODUCTS */
router.get("/products", productController.getAll);
router.get("/products/:id", productController.getById);
router.post("/products", productController.create);
router.put("/products/:id", productController.update);
router.delete("/products/:id", productController.remove);
// ========== COUNTRY MASTER ==========
const countryController = require("../controller/metadata/country");

router.get("/admin/country", countryController.getCountries);
router.post("/admin/country", countryController.createCountry);
router.get("/admin/country/:id", countryController.getCountryById);
router.put("/admin/country/:id", countryController.updateCountry);
router.delete("/admin/country/:id", countryController.deleteCountry);
// ========== TAXATION MODULE ==========
const taxationController = require("../controller/metadata/taxationController");

router.get("/taxation/industry-rates", taxationController.getAllIndustryRates);
router.get("/taxation/summary", taxationController.getSummary);
router.post("/taxation/refresh", taxationController.refreshTaxData);
router.get("/taxation/export", taxationController.exportTaxationExcel);




// =======forex analysis ====//
// simple currencies list for dropdowns
const forexController = require("../controller/metadata/forexController");

router.get('/forex/currencies', (req, res) => {
  const currencies = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    INR: 'Indian Rupee',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    SGD: 'Singapore Dollar',
    NZD: 'New Zealand Dollar',
    ZAR: 'South African Rand',
    BRL: 'Brazilian Real',
    HKD: 'Hong Kong Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    MXN: 'Mexican Peso',
    KRW: 'South Korean Won',
    TRY: 'Turkish Lira',
    SAR: 'Saudi Riyal',
    AED: 'UAE Dirham',
  };

  res.json({ currencies });
});

// main analysis endpoint
router.post('/forex/analyze', forexController.analyze);

// ========== AGREEMENT MASTER ==========
const agreementController = require("../controller/metadata/agreementController");

router.post("/admin/agreement", agreementController.createAgreement);
router.get("/admin/agreement", agreementController.getAllAgreements);
router.get("/admin/agreement/:code", agreementController.getAgreementByCode);
router.put("/admin/agreement/:code", agreementController.updateAgreement);
router.delete("/admin/agreement/:code", agreementController.deleteAgreement);



// User Management Routes
router.get("/admin/users", userController.getAllUsers);
router.post("/admin/users", userController.createUser);
router.put("/admin/users/:id", userController.updateUser);
router.delete("/admin/users/:id", userController.deleteUser);
router.patch("/admin/users/:id/status", userController.updateUserStatus);


// Health check
router.get('/', (req, res) => res.json({ message: 'Backend ready' }));

module.exports = router;
