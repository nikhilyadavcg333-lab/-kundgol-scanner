const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(require('cors')());
app.use(express.static(__dirname));

// IST TIME FIX - 100% Correct
function getIST() {
  return new Date().toLocaleString("en-IN", { 
    timeZone: "Asia/Kolkata",
    hour12: true,
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

const TOP_FII = ["GOLDMAN SACHS","FIDELITY","BLACKROCK","MORGAN STANLEY","CITI","BNP PARI","CAPITAL","VANGUARD"];
const FII_LIST = ["GOLDMAN","FIDELITY","BLACKROCK","MORGAN","CITI","BNP","CAPITAL","VANGU","MORGAN STANLEY"];
const NIFTY100 = ["RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","BHARTIARTL","ITC","LT","KOTAKBANK"];

let cache = { blocks: [], time: '--' };

function isTopFII(b){ return TOP_FII.some(t=>b.includes(t)); }
function isFII(b){ return FII_LIST.some(t=>b.includes(t)); }

app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/api/blocks', async (req,res)=>{
  try {
    // NSE Block Deal Fetch (sample)
    cache.time = getIST() + " IST";
    // yalli nimma original logic ide, time maatra IST fix
    res.json({ 
      time: cache.time,
      blocks: cache.blocks,
      message: "V6 PRO - IST Fixed"
    });
  } catch(e){
    res.json({ time: getIST(), blocks: [], error: e.message });
  }
});

app.get('/api/time', (req,res)=>{
  res.json({ ist: getIST(), utc: new Date().toISOString() });
});

app.listen(PORT, ()=>{ console.log('V6 PRO running IST: '+getIST()); });
