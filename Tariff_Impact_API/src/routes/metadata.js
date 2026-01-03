const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Admin } = require('../../models');

const BASE = "";   // empty string

const db = require('../../models');  // adjust the path if needed
const { Country } = db;





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
// ==========  TARIFF IMPACT ANALYSIS ==========

const controller = require("../controller/metadata/impact_analysis.controller");

router.get("/impact-analysis/currency", controller.getCurrencyData);
router.get("/impact-analysis/duty-type", controller.getDutyTypeData);
router.get("/impact-analysis/tariff", controller.getTariffData);

// ========== COUNTRY MASTER ==========
const countryController = require("../controller/metadata/country");

router.get("/admin/country", countryController.getCountries);
router.post("/admin/country", countryController.createCountry);
router.get("/admin/country/:id", countryController.getCountryById);
router.put("/admin/country/:id", countryController.updateCountry);
router.delete("/admin/country/:id", countryController.deleteCountry);

// Health check
router.get('/', (req, res) => res.json({ message: 'Backend ready' }));

module.exports = router;
