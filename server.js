const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.static('.'));

const PORT = process.env.PORT || 10000;

// Real NSE Live Price via Yahoo Finance
app.get('/api/live/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1m&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose;
    const pChange = ((price - prevClose) / prevClose * 100).toFixed(2);
    res.json({ symbol, live: price, prevClose, pChange });
  } catch (e) {
    res.json({ symbol: req.params.symbol, live: 0, pChange: 0, error: e.message });
  }
});

app.get('/api/all', async (req, res) => {
  const symbols = ["ABB","SIEMENS","BHARATFORG","ASHOKLEY","TVSMOTOR","MOTHERSON","DIXON","HINDCOPPER","ZYDUSLIFE","LUPIN","TATAPOWER","RELIANCE","HAL","INFY","TCS","HDFCBANK"];
  let results = [];
  for (let sym of symbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}.NS?interval=1m&range=1d`;
      const r = await fetch(url);
      const d = await r.json();
      if (d.chart && d.chart.result) {
        const meta = d.chart.result[0].meta;
        results.push({ symbol: sym, spot: meta.regularMarketPrice, pChange: ((meta.regularMarketPrice - meta.previousClose)/meta.previousClose*100).toFixed(2) });
      }
    } catch(e){ results.push({ symbol: sym, spot: 0, pChange: 0 }); }
    await new Promise(r=>setTimeout(r,200)); // delay to avoid block
  }
  res.json(results);
});

app.listen(PORT, () => console.log("Nikhil Yadav Scanner Live on " + PORT));
