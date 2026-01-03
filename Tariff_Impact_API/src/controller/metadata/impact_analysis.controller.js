const path = require("path");
const XLSX = require("xlsx");

// Helper function to safely load Excel files
function loadExcel(fileName) {
  // Use __dirname to calculate absolute path
  const filePath = path.join(
    __dirname,   // metadata
    "..",        // controller
    "..",        // src
    "..",        // Tariff_Impact_API
    "pipeline",
    "parsed",
    fileName
  );

  console.log("📂 Loading Excel file:", filePath);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  } catch (err) {
    throw new Error(`Failed to read Excel file "${fileName}": ${err.message}`);
  }
}

// GET /api/impact-analysis/currency
exports.getCurrencyData = (req, res) => {
  try {
    const data = loadExcel("currency.xlsx");
    res.json({ success: true, data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/impact-analysis/duty-type
exports.getDutyTypeData = (req, res) => {
  try {
    const data = loadExcel("duty_type.xlsx");
    res.json({ success: true, data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/impact-analysis/tariff
exports.getTariffData = (req, res) => {
  try {
    const data = loadExcel("tariff_dataset_500_rows.xlsx");
    res.json({ success: true, data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
