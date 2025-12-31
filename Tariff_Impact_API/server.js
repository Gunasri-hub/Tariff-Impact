const express = require("express");
const cors = require("cors");
const routes = require('./src/routes');
const { sequelize } = require('./models');
const port = 8080;
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));

app.get('/', (req, res) => {
  res.json({ message: 'Tariff Impact API Running ✅' });
});

sequelize.sync().then(() => {
  console.log('✅ Database synced');
  app.use('/api', routes);
  app.listen(port, () => {
    console.log(`📱 http://localhost:${port}/`);
    console.log(`🔐 Signup: http://localhost:${port}/api/metadata/user/register`);
  });
}).catch(err => {
  console.error('❌ DB Error:', err);
});
