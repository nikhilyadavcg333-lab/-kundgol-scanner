const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(require('cors')());
app.use(express.static(__dirname));

function getIST() {
  return new Date().toLocaleString("en-IN", { 
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
function getISTFull() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
}

let cache = { blocks: [], time: getIST() };

// Sample - Nimma original fetching logic idre alli add maadi
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/api/blocks', async (req,res)=>{
  try {
    // NSE Block Deal API - yelli blocks sigutte alli
    let blocks = cache.blocks;
    // Time fix for all cards
    const ist = getIST();
    blocks = blocks.map(b => ({ ...b, Time: ist, time: ist }));
    
    res.json({ 
      blocks: blocks,
      time: ist,
      scan: ist,
      ist: getISTFull()
    });
  } catch(e){
    res.json({ time: getIST(), blocks: [], error: e.message });
  }
});

app.get('/api/time', (req,res)=>{
  res.json({ ist: getISTFull() });
});

app.listen(PORT, ()=>{ console.log('KUNDGOL V9 IST '+getISTFull()); });
