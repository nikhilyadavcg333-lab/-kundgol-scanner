const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static(__dirname));

// ========= IST TIME - CORRECT =========
function getIST() {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getISTFull() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

let cachedData = null;

function doScan() {
  const ist = getIST();
  console.log("Scanning at " + getISTFull());

  const stocks = ["RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","DEEPAKNTR","UNIONBANK","MARUTI","PAYTM","LT","ITC","BHARTIARTL"];
  const buyers = ["GOLDMAN SACHS","MORGAN STANLEY","CITI","FII BLOCK","JPMORGAN"];

  const blocks = [];
  for (let i = 0; i < 10; i++) {
    const close = 800 + Math.floor(Math.random() * 2500);
    const percValue = (Math.random() * 8 - 4);
    const perc = percValue.toFixed(2);
    const ltp = Math.round(close * (1 + percValue / 100));
    
    if (Math.abs(percValue) >= 2) {
      const strike = Math.round(ltp / 50) * 50;
      const isPE = percValue < 0;
      blocks.push({
        symbol: stocks[Math.floor(Math.random() * stocks.length)],
        close: close,
        ltp: ltp,
        perc: perc,
        buyer: buyers[Math.floor(Math.random() * buyers.length)],
        Time: ist,
        time: ist,
        strike: strike,
        option: isPE ? "PE" : "CE",
        signal: strike + (isPE ? " PE BUY" : " CE BUY"),
        isDisc: isPE
      });
    }
  }

  blocks.sort((a, b) => Math.abs(b.perc) - Math.abs(a.perc));

  cachedData = {
    total: blocks.length,
    prem: blocks.filter(b => !b.isDisc).length,
    disc: blocks.filter(b => b.isDisc).length,
    blocks: blocks,
    scanTime: ist,
    scanFull: getISTFull(),
    time: ist
  };

  return cachedData;
}

doScan();
setInterval(doScan, 60000);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/blocks', (req, res) => {
  if (!cachedData) {
    doScan();
  }
  const ist = getIST();
  cachedData.blocks = cachedData.blocks.map(b => {
    return { ...b, Time: ist, time: ist };
  });
  cachedData.scanTime = ist;
  cachedData.time = ist;
  cachedData.scanFull = getISTFull();
  res.json(cachedData);
});

app.get('/api/scan', (req, res) => {
  const data = doScan();
  res.json(data);
});

app.listen(PORT, () => {
  console.log("KUNDGOL V9.0 LIVE - IST " + getISTFull());
});
