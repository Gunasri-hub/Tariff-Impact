const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

// GET all countries
router.get('/', countryController.getAllCountries);

// GET single country
router.get('/:id', countryController.getCountryById);

// CREATE new country
router.post('/', countryController.createCountry);

// UPDATE country
router.put('/:id', countryController.updateCountry);

// DELETE country
router.delete('/:id', countryController.deleteCountry);

module.exports = router;