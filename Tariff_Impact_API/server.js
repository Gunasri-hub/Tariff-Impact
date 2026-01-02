const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

/* AUTH ROUTES - ROOT LEVEL */
app.post('/admin/login', (req, res) => {
  console.log('🔐 Admin login:', req.body);
  res.json({
    success: true,
    token: 'admin-jwt-' + Date.now(),
    user: { id: 1, email: req.body.email, role: 'admin' }
  });
});

app.post('/user/login', (req, res) => {
  console.log('🔐 User login:', req.body);
  res.json({
    success: true,
    token: 'user-jwt-' + Date.now(),
    user: { id: 2, email: req.body.email, role: 'user' }
  });
});

app.post('/signup', (req, res) => {
  console.log('📝 Signup:', req.body);
  res.json({
    success: true,
    user: { id: 3, email: req.body.email, role: req.body.role || 'user' }
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Tariff Impact API Running ✅' });
});

try {
  const routes = require('./src/routes');
  app.use('/api', routes);
} catch (e) {
  console.log('No /src/routes found, continuing...');
}

app.listen(PORT, () => {
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log('🔐 Login: POST /admin/login');
  console.log('📊 Data: GET /api/countries');
  console.log('✅ READY');
});
