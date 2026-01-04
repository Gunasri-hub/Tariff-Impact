// src/controller/metadata/agreementController.js

const db = require("../../../models");
const Agreement = db.Agreement;

// CREATE
exports.createAgreement = async (req, res) => {
  try {
    const {
      AgreementCode,
      AgreementName,
      CountriesIncluded,
      ValidityPeriod,
      Status,
    } = req.body;

    const item = await Agreement.create({
      AgreementCode,
      AgreementName,
      CountriesIncluded,
      ValidityPeriod,
      Status,
      Version: 1,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create failed" });
  }
};

// READ ALL
exports.getAllAgreements = async (req, res) => {
  try {
    const list = await Agreement.findAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "List failed" });
  }
};

// READ ONE (by code)
exports.getAgreementByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const item = await Agreement.findOne({
      where: { AgreementCode: code },
    });

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Get failed" });
  }
};

// UPDATE (by code)
exports.updateAgreement = async (req, res) => {
  try {
    const { code } = req.params;
    const {
      AgreementCode,
      AgreementName,
      CountriesIncluded,
      ValidityPeriod,
      Status,
    } = req.body;

    const [updated] = await Agreement.update(
      {
        AgreementCode,
        AgreementName,
        CountriesIncluded,
        ValidityPeriod,
        Status,
      },
      { where: { AgreementCode: code } }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE (by code)
exports.deleteAgreement = async (req, res) => {
  try {
    const { code } = req.params;

    const deleted = await Agreement.destroy({
      where: { AgreementCode: code },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
