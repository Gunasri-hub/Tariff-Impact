// controllers/forexController.js
const axios = require("axios");
const { ForexQuery, ForexRate } = require("../../../models");

const FX_API = "https://api.frankfurter.app";   // frankfurther API

exports.analyze = async (req, res) => {
  try {
    const { base, target, amount, year } = req.body;

    if (!base || !target || !amount || !year) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 1) Latest conversion (Frankfurter ignores amount in query; we multiply ourselves)
    const latestResp = await axios.get(`${FX_API}/latest`, {
      params: { from: base, to: target },
    });

    if (!latestResp.data || !latestResp.data.rates || !latestResp.data.rates[target]) {
      return res.status(500).json({ error: "No rate data from forex API" });
    }

    const latestRate = Number(latestResp.data.rates[target]);
    const convertedAmount = latestRate * Number(amount);

    // 2) Time series for the full year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const tsResp = await axios.get(`${FX_API}/${startDate}..${endDate}`, {
      params: { from: base, to: target },
    });

    const rawRates = tsResp.data?.rates || {};
    const history = Object.keys(rawRates)
      .sort()
      .map((d) => ({
        date: d,
        rate: Number(rawRates[d][target]),
      }))
      .filter((h) => !Number.isNaN(h.rate));

    // 3) Store query in DB
    await ForexQuery.create({
      base,
      target,
      amount,
      year,
      userId: null, // link to user later if needed
    });

    // Cache last known rate
    if (history.length) {
      const last = history[history.length - 1];
      await ForexRate.upsert({
        date: last.date,
        base,
        target,
        rate: last.rate,
      });
    }

    // 4) Simple volatility index (std dev / mean * 100)
    let volatilityIndex = 0;
    if (history.length > 1) {
      const ratesOnly = history.map((h) => h.rate);
      const avg =
        ratesOnly.reduce((sum, r) => sum + r, 0) / ratesOnly.length;
      const variance =
        ratesOnly.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) /
        ratesOnly.length;
      const stdDev = Math.sqrt(variance);
      volatilityIndex = ((stdDev / avg) * 100).toFixed(1);
    }

    return res.json({
      base,
      target,
      amount: Number(amount),
      latestRate,
      convertedAmount,
      volatilityIndex: Number(volatilityIndex),
      history,
    });
  } catch (err) {
    console.error(
      "Forex analyze error (Frankfurter):",
      err.response?.data || err.message
    );
    return res.status(500).json({ error: "Forex analysis failed" });
  }
};