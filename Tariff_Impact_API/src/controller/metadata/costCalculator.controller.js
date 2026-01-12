// controllers/costCalculator.controller.js
const { Country, ProductTable } = require("../../../models");

exports.pingCalculator = (req, res) => {
  res.json({ status: "calculator-ok", time: new Date().toISOString() });
};

exports.runCostCalculator = async (req, res) => {
  try {
    const { shipment, charges, products } = req.body;

    console.log("📦 CALC INPUT:", {
      originCountry: shipment.originCountry,
      destCountry: shipment.destinationCountry,
      originCurrency: shipment.originCurrency,
      destCurrency: shipment.destCurrency,
      forexDate: shipment.forexDate,
      products: products.length,
      freight: charges.freight,
      insurance: charges.insurance,
    });

    // 1. VALIDATION & FETCH DATA
    if (
      !shipment.originCountry ||
      !shipment.destinationCountry ||
      products.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing countries or products" });
    }

    const [originCountry, destCountry, allProducts] = await Promise.all([
      Country.findOne({ where: { country_name: shipment.originCountry } }),
      Country.findOne({ where: { country_name: shipment.destinationCountry } }),
      ProductTable.findAll(),
    ]);

    if (!originCountry || !destCountry) {
      return res.status(400).json({
        message: "Country not found",
        originFound: !!originCountry,
        destFound: !!destCountry,
        searched: {
          origin: shipment.originCountry,
          dest: shipment.destinationCountry,
        },
      });
    }

    // DUTY TYPE from SOURCE COUNTRY
    let dutyType = originCountry.status || "General";
    console.log("🌍 Duty Type (from source country):", dutyType);

    // 2. FOREX RATE
    let fxRate = 1;
    if (shipment.originCurrency !== shipment.destCurrency) {
      try {
        const response = await fetch(
          `https://api.frankfurter.app/${shipment.forexDate}?from=${shipment.originCurrency}&to=${shipment.destCurrency}`
        );
        const fxData = await response.json();
        fxRate = fxData.rates[shipment.destCurrency];
        console.log(
          `💱 ${shipment.originCurrency}→${shipment.destCurrency} (${shipment.forexDate}):`,
          fxRate
        );
      } catch (fxErr) {
        console.error("FX fallback to 1.0:", fxErr.message);
      }
    }

    // 3. FIRST PASS: total invoice for proportional allocation
    let totalInvoiceOrigin = 0;
    const validProducts = [];

    for (const product of products) {
      const productRecord = allProducts.find(
        (p) => p.id == product.productId
      );
      if (!productRecord) {
        console.warn("❌ Product not found:", product.productId);
        continue;
      }
      const qty = Number(product.quantity);
      const unitPriceOrigin = Number(product.unitPrice);
      totalInvoiceOrigin += qty * unitPriceOrigin;
      validProducts.push({ product, productRecord });
    }

    if (validProducts.length === 0) {
      return res.status(400).json({ message: "No valid products processed" });
    }

    console.log(
      "💰 Total Invoice Origin (for allocation):",
      totalInvoiceOrigin
    );

    const freight = Number(charges.freight || 0);
    const insurance = Number(charges.insurance || 0);

    // 4. SECOND PASS: per-product CIF, duty, landed
    const enrichedProducts = [];

    for (const { product, productRecord } of validProducts) {
      const qty = Number(product.quantity);
      const unitPriceOrigin = Number(product.unitPrice);
      const lineValueOrigin = qty * unitPriceOrigin;
      const lineValueDest = lineValueOrigin * fxRate;

      const invoiceWeight =
        totalInvoiceOrigin > 0 ? lineValueOrigin / totalInvoiceOrigin : 0;

      console.log(
        `📊 Product ${product.productId} invoiceWeight: ${(invoiceWeight * 100).toFixed(2)}%`
      );

      const allocatedFreightOrigin = freight * invoiceWeight;
      const allocatedInsuranceOrigin = insurance * invoiceWeight;
      const allocatedFreightDest = allocatedFreightOrigin * fxRate;
      const allocatedInsuranceDest = allocatedInsuranceOrigin * fxRate;

      const customsValueOrigin =
        lineValueOrigin + allocatedFreightOrigin + allocatedInsuranceOrigin;
      const customsValueDest = customsValueOrigin * fxRate;

      // DUTY RATE based on dutyType
      let dutyRate = 0;
      switch (dutyType.toLowerCase()) {
        case "general":
          dutyRate = parseFloat(productRecord.general_rate_of_duty) || 0;
          break;
        case "special":
          dutyRate = parseFloat(productRecord.special_rate_of_duty) || 0;
          break;
        case "column2":
          dutyRate = parseFloat(productRecord.column2_rate_of_duty) || 0;
          break;
        default:
          dutyRate = parseFloat(productRecord.general_rate_of_duty) || 0;
      }

      const dutyAmountOrigin = customsValueOrigin * (dutyRate / 100);
      const dutyAmountDest = dutyAmountOrigin * fxRate;

      const totalLandCostOrigin = customsValueOrigin + dutyAmountOrigin;
      const totalLandCostDest = totalLandCostOrigin * fxRate;

      enrichedProducts.push({
        productId: product.productId,
        htsCode: productRecord.hts_code,
        productName: productRecord.product,
        mainCategory: productRecord.main_category,
        subCategory: productRecord.subcategory,
        groupName: productRecord.group_name,
        quantity: qty,
        unitPriceOrigin,
        unitPriceDest: unitPriceOrigin * fxRate,
        lineValueOrigin,
        lineValueDest,
        dutyType,
        dutyRate,
        allocatedFreightOrigin,
        allocatedInsuranceOrigin,
        allocatedFreightDest,
        allocatedInsuranceDest,
        customsValueOrigin,
        customsValueDest,
        dutyAmountOrigin,
        dutyAmountDest,
        totalLandCostOrigin,
        totalLandCostDest,
        unitOfQuantity: productRecord.unit_of_quantity,
        invoiceWeight: invoiceWeight * 100,
      });
    }

    // 5. GRAND TOTALS
    const totals = enrichedProducts.reduce(
      (acc, p) => ({
        invoiceValueOrigin: acc.invoiceValueOrigin + p.lineValueOrigin,
        invoiceValueDest: acc.invoiceValueDest + p.lineValueDest,
        customsValueOrigin: acc.customsValueOrigin + p.customsValueOrigin,
        customsValueDest: acc.customsValueDest + p.customsValueDest,
        dutyOrigin: acc.dutyOrigin + p.dutyAmountOrigin,
        dutyDest: acc.dutyDest + p.dutyAmountDest,
        totalLandCostOrigin:
          acc.totalLandCostOrigin + p.totalLandCostOrigin,
        totalLandCostDest: acc.totalLandCostDest + p.totalLandCostDest,
      }),
      {
        invoiceValueOrigin: 0,
        invoiceValueDest: 0,
        customsValueOrigin: 0,
        customsValueDest: 0,
        dutyOrigin: 0,
        dutyDest: 0,
        totalLandCostOrigin: 0,
        totalLandCostDest: 0,
      }
    );

    // 6. RESPONSE
    res.json({
      shipmentSummary: {
        type: shipment.type,
        origin: originCountry.country_name,
        originCompany: shipment.originCompany || "",
        destination: destCountry.country_name,
        destCompany: shipment.destCompany || "",
        mode: shipment.mode,
        originCurrency: shipment.originCurrency,
        destCurrency: shipment.destCurrency,
        forexRate: fxRate,
        dutyType: dutyType,
        forexDate: shipment.forexDate,
      },
      chargesSummary: {
        freightOrigin: freight,
        freightDest: freight * fxRate,
        insuranceOrigin: insurance,
        insuranceDest: insurance * fxRate,
        totalShippingOrigin: freight + insurance,
        totalShippingDest: (freight + insurance) * fxRate,
      },
      products: enrichedProducts,
      totals,
    });
  } catch (error) {
    console.error("💥 CALCULATOR ERROR:", error);
    res.status(500).json({
      message: "Calculation failed",
      detail: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};