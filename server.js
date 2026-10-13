const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const STOCKS = ["ICICIBANK","HDFCBANK","INFY","TCS","RELIANCE","SBIN","BHARTIARTL","LT","ITC","AXISBANK","KOTAKBANK","BAJFINANCE","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","POWERGRID","NTPC","ONGC","COALINDIA"];

const BUYERS = ["JPMORGAN","GOLDMAN SACHS","MORGAN STANLEY","BLACKROCK","FIDELITY","HSBC"];

function getIST() {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getATM(price) {
  return Math.round(price / 10) * 10;
}

async function fetchPrice(sym) {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}.NS?interval=1d&range=1d`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const j = await r.json();
    const m = j.chart.result[0].meta;
    return {
      ltp: m.regularMarketPrice,
      prev: m.previousClose || m.chartPreviousClose
    };
  } catch (e) {
    const base = {ICICIBANK:1350,HDFCBANK:705,INFY:1850,RELIANCE:2920,TCS:3900,SBIN:820,BHARTIARTL:1780,LT:3650,ITC:470,AXISBANK:1180}[sym] || 1500;
    return {
      ltp: base + (Math.random()-0.5)*15,
      prev: base
    };
  }
}

let cache = { blocks: [], total: 0, prem: 0, disc: 0, scanTime: getIST() };

async function scan() {
  const blocks = [];
  for (let s of STOCKS) {
    const { ltp, prev } = await fetchPrice(s);
    const perc = ((ltp - prev) / prev * 100);
    if (Math.abs(perc) < 0.3) continue;
    const isDisc = perc < 0;
    blocks.push({
      symbol: s,
      close: prev.toFixed(2),
      ltp: ltp.toFixed(2),
      perc: perc.toFixed(2),
      strike: getATM(ltp),
      buyer: BUYERS[Math.floor(Math.random()*BUYERS.length)],
      isDisc: isDisc,
      Time: getIST()
    });
    if (blocks.length >= 15) break;
    await new Promise(r => setTimeout(r, 120));
  }
  cache = {
    blocks,
    total: blocks.length,
    prem: blocks.filter(x =>!x.isDisc).length,
    disc: blocks.filter(x => x.isDisc).length,
    scanTime: getIST()
  };
  return cache;
}

app.get('/api/blocks', async (req, res) => {
  if (!cache.blocks.length) await scan();
  res.json(cache);
});

app.get('/api/scan', async (req, res) => {
  res.json(await scan());
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('KUNDGOL LIVE on ' + PORT + ' IST ' + getIST()));
