const db = require("../../../models");
const Country = db.Country;

exports.createCountry = async (req, res) => {
  try {
    const data = await Country.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const data = await Country.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCountryById = async (req, res) => {
  try {
    const data = await Country.findByPk(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCountry = async (req, res) => {
  try {
    await Country.update(req.body, {
      where: { id: req.params.id },
    });
    res.json({ message: "Country updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    await Country.destroy({
      where: { id: req.params.id },
    });
    res.json({ message: "Country deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
