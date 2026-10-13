const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(require('cors')());
app.use(express.static(__dirname));

// ========== IST TIME FIX - 100% ==========
function getIST() {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
function getISTFull() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// ========== 150 STOCKS ==========
const STOCKS_150 = [
  "RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","BHARTIARTL","ITC","LT","KOTAKBANK",
  "MARUTI","BAJFINANCE","ASIANPAINT","TITAN","HCLTECH","WIPRO","ULTRACEMCO","SUNPHARMA","POWERGRID","NTPC",
  "DEEPAKNTR","UNIONBANK","METROPOLIS","IPCALAB","PAYTM","CHOLAFIN","BAJAJ-AUTO","BAJFINANCE","DEEPAKNTR","MARUTI",
  "HINDUNILVR","AXISBANK","NESTLEIND","JSWSTEEL","TATASTEEL","ONGC","COALINDIA","ADANIENT","ADANIPORTS","GRASIM",
  "BRITANNIA","CIPLA","DRREDDY","EICHERMOT","HEROMOTOCO","INDUSINDBK","M&M","SHREECEM","TATACONSUM","TATAMOTORS"
  // + 100 more MID100 - list short maadidini, neevu full list add maadbahudu
];

const BUYERS = ["GOLDMAN SACHS","MORGAN STANLEY","CITI","FII BLOCK","JPMORGAN","BLACKROCK","FIDELITY","BNP PARIBAS"];

let cachedData = null;
let lastScan = getIST();

// ========== SCAN LOGIC ==========
async function doScan() {
  try {
    const ist = getIST();
    lastScan = ist;
    console.log(`[${getISTFull()}] Scanning...`);
    
    // Dummy scan logic - Neenga original NSE API logic idre illi idhu replace maadi
    // Yelli LTP / Close fetch maadthira alli IST time use maadi
    const blocks = [];
    for(let i=0; i<15; i++){
      const symbol = STOCKS_150[Math.floor(Math.random()*STOCKS_150.length)];
      const close = 800 + Math.floor(Math.random()*3000);
      const diff = (Math.random()*8 - 4);
      const ltp = Math.round(close * (1 + diff/100));
      const perc = diff.toFixed(2);
      
      if(Math.abs(diff) >= 2){
        const isPE = diff < 0;
        const strike = Math.round(ltp/50)*50;
        blocks.push({
          symbol: symbol,
          type: Math.random() > 0.5 ? "NIFTY50" : "MID100",
          close: close,
          ltp: ltp,
          perc: perc,
          buyer: BUYERS[Math.floor(Math.random()*BUYERS.length)],
          Time: ist, // <-- IST FIXED HERE
          time: ist,
          strike: strike,
          option: isPE ? "PE" : "CE",
          signal: `${symbol} ${strike} ${isPE ? 'PE' : 'CE'} BUY`,
          isDisc: isPE
        });
      }
    }
    
    // Sort by % desc
    blocks.sort((a,b)=>Math.abs(b.perc)-Math.abs(a.perc));
    
    cachedData = {
      total: blocks.length,
      prem: blocks.filter(b=>!b.isDisc).length,
      disc: blocks.filter(b=>b.isDisc).length,
      blocks: blocks,
      scanTime: ist,
      scanFull: getISTFull(),
      time: ist
    };
    
    return cachedData;
  } catch(e){
    console.error(e.message);
    return cachedData;
  }
}

// Initial scan
doScan();
setInterval(doScan, 60*1000); // 1 min ku scan

// ========== ROUTES ==========
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/api/blocks', async (req,res)=>{
  if(!cachedData) await doScan();
  // Force IST time for all cards
  const ist = getIST();
  if(cachedData && cachedData.blocks){
    cachedData.blocks = cachedData.blocks.map(b=>({...b, Time: ist, time: ist}));
    cachedData.scanTime = ist;
    cachedData.time = ist;
    cachedData.scanFull = getISTFull();
  }
  res.json(cachedData);
});

app.get('/api/time', (req,res)=>{
  res.json({ ist: getISTFull(), time: getIST() });
});

app.get('/api/scan', async (req,res)=>{
  const data = await doScan();
  res.json(data);
});

app.listen(PORT, ()=>{
  console.log(`KUNDGOL V9.0 RUNNING on ${PORT} - IST: ${getISTFull()}`);
});
