const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

// Metadata routes only
const metadataRoutes = require("./src/routes/metadata");

const app = express();
const PORT = 8080;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   BASE ROUTE
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Tariff Impact API Running ✅" });
});

/* =========================
   ROUTES
========================= */
app.use("/api/metadata", metadataRoutes);

/* =========================
   START SERVER
========================= */
sequelize
  .sync()
  .then(() => {
    console.log("✅ Database synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`✓ Metadata API: http://localhost:${PORT}/api/metadata`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Error:", err);
  });