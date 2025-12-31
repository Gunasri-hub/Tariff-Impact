const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, User } = require('../../../models');
require('dotenv').config();

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.register = async (req, res) => {
  try {
    console.log('🔥 SIGNUP HIT:', req.body);
    
    const { name, email, password, role = 'user' } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('❌ Duplicate:', email);
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hash, 
      role,
      status: 'active'
    });
    
    console.log('✅ CREATED:', { id: user.id, name, email, role });
    
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (err) {
    console.error('💥 ERROR:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt email:', email);

    const user = await User.findOne({ where: { email } });
    console.log('User found:', !!user);

    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    console.log('Password match:', ok);

    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = generateToken({ id: user.id, role: user.role || 'user' });
    res.json({ 
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        error: 'Email, password and role are required' 
      });
    }

    const hash = await bcrypt.hash(password, 10);

    if (role === 'admin') {
      const admin = await Admin.create({
        companyName: 'Default Company',
        email,
        password: hash,
      });
      return res.status(201).json({ 
        success: true,
        message: 'Admin created', 
        role: 'admin', 
        id: admin.id 
      });
    }

    const name = email.split('@')[0];
    const user = await User.create({
      name,
      email,
      password: hash,
      role,
    });

    res.status(201).json({ 
      success: true,
      message: 'User created', 
      role: user.role, 
      id: user.id 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};
