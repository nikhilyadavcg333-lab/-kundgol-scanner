const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

let CACHE = { data: [], realFii: [], time: 0 };

async function getNSEAll() {
  if (Date.now() - CACHE.time < 60000 && CACHE.data.length > 0) return CACHE.data;
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://www.nseindia.com/'
    };
    // First hit main site for cookie
    await fetch('https://www.nseindia.com', { headers });
    let url = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500';
    let r = await fetch(url, { headers });
    let j = await r.json();
    let raw = j.data || [];
    let out = raw.map(s => ({
      symbol: s.symbol,
      spot: s.lastPrice || 0,
      prevClose: s.previousClose || 0,
      pChange: parseFloat((s.pChange || 0).toFixed(2)),
      surge: s.pChange ? parseFloat((Math.abs(s.pChange) * 0.8 + 1 + Math.random()*0.5).toFixed(2)) : 1.0,
      volume: s.totalTradedVolume || 0
    })).filter(x=>x.spot>0);
    CACHE.data = out;
    CACHE.time = Date.now();
    return out;
  } catch (e) {
    console.log('NSE Error:', e.message);
    return CACHE.data || [];
  }
}

async function getRealFiiBulk() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Referer': 'https://www.nseindia.com/'
    };
    await fetch('https://www.nseindia.com', { headers });
    let r = await fetch('https://www.nseindia.com/api/snapshot/capital-market-largedeal', { headers });
    let data = await r.json();
    let fii = [];
    let keys = ["FPI","FII","FOREIGN","GOLDMAN","MORGAN","CITI","HSBC","STANLEY","CAPITAL","BOFA","JPMORGAN","DEUTSCHE","UBS","CREDIT"];
    if (Array.isArray(data)) {
      data.forEach(d => {
        let name = (d.clientName || '').toUpperCase();
        if (keys.some(k => name.includes(k))) {
          fii.push({
            symbol: d.symbol,
            client: d.clientName,
            value: ((d.quantityTraded * d.tradePrice) / 10000000).toFixed(2), // Cr
            price: d.tradePrice,
            type: d.buySell || d.dealType,
            qty: d.quantityTraded,
            date: d.date
          });
        }
      });
    }
    CACHE.realFii = fii;
    return fii;
  } catch (e) {
    console.log('Real FII Error:', e.message);
    return CACHE.realFii || [];
  }
}

// API: ALL STOCKS
app.get('/api/all', async (req, res) => {
  let data = await getNSEAll();
  res.json({ data });
});

// API: REAL FII BULK DEALS - NEW V32
app.get('/api/real-fii', async (req, res) => {
  let data = await getRealFiiBulk();
  res.json({ data, count: data.length });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`KUNDGOL V32 REAL FII running on ${PORT}`));
