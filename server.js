const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
app.use(cors());
app.use(express.static('.'));
const PORT = process.env.PORT || 10000;

// Auto Live NSE Price - Works Every Day Automatically!
async function getNSEPrice(symbol) {
  try {
    // Method 1: Yahoo Finance (Most Reliable)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1m&range=1d`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    if (data.chart && data.chart.result && data.chart.result[0]) {
      const meta = data.chart.result[0].meta;
      return {
        symbol,
        spot: meta.regularMarketPrice,
        prevClose: meta.previousClose,
        pChange: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
        source: "YAHOO LIVE"
      };
    }
  } catch(e){ console.log(symbol+" Yahoo fail "+e.message); }

  // Fallback
  return { symbol, spot: 0, pChange: 0, source: "FALLBACK" };
}

app.get('/api/all', async (req, res) => {
  const symbols = ["INFY","HINDCOPPER","ABB","SIEMENS","BHARATFORG","ASHOKLEY","RELIANCE","HAL","TCS","HDFCBANK","ICICIBANK","SBIN","TATAPOWER","ZYDUSLIFE","LUPIN","MOTHERSON","DIXON","TVSMOTOR"];
  let results = [];
  for (let sym of symbols) {
    let priceData = await getNSEPrice(sym);
    // If live fails, use yesterday close as backup
    if (priceData.spot === 0) {
      const backup = { "INFY":1062.10, "HINDCOPPER":469, "ABB":6816, "RELIANCE":1157, "HAL":4850 };
      priceData.spot = backup[sym] || 1000;
      priceData.pChange = "0.00";
      priceData.source = "BACKUP 13-Oct";
    }
    results.push(priceData);
    await new Promise(r => setTimeout(r, 300)); // Avoid rate limit
  }
  res.json({ date: new Date().toLocaleString("en-IN"), market: "NSE LIVE", data: results });
});

app.get('/api/live/:symbol', async (req, res) => {
  let data = await getNSEPrice(req.params.symbol.toUpperCase());
  res.json(data);
});

app.listen(PORT, () => console.log("Nikhil Yadav Auto Live Scanner Running on " + PORT + " - Tomorrow Auto!"));
