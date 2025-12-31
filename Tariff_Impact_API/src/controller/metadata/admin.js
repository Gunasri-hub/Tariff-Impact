const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../../../models');
require('dotenv').config();

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.register = async (req, res) => {
  try {
    console.log('🔥 ADMIN REGISTER:', req.body);
    
    const { companyName, email, password } = req.body;
    
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      console.log('❌ Admin exists:', email);
      return res.status(400).json({ 
        success: false,  // ✅ Frontend needs this
        error: 'Admin already exists' 
      });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      companyName: companyName || 'Tariff Intel',
      email,
      password: hash,
    });
    
    console.log('✅ ADMIN CREATED:', { id: admin.id, email });
    
    res.status(201).json({ 
      success: true,  // ✅ Frontend expects this
      message: 'Admin created successfully',
      admin: { 
        id: admin.id, 
        companyName: admin.companyName,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('💥 Admin register error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔥 ADMIN LOGIN:', req.body);
    
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    
    console.log('Admin found:', !!admin);
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid admin credentials' 
      });
    }
    
    const ok = await bcrypt.compare(password, admin.password);
    console.log('Password match:', ok);
    
    if (!ok) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid admin credentials' 
      });
    }
    
    const token = generateToken({ id: admin.id, role: 'admin' });
    res.json({ 
      success: true,  // ✅ Frontend expects this
      token,
      admin: { 
        id: admin.id, 
        companyName: admin.companyName,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};
