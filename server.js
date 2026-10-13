const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(require('cors')());
app.use(express.static(__dirname));

// IST FIX - Both places
function getIST() {
  return new Date().toLocaleString("en-IN", { 
    timeZone: "Asia/Kolkata",
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
}
function getISTFull() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

let cache = null;

app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/api/blocks', async (req,res)=>{
  // yelli Time: ... anta ide, adanna IST maadi
  const ist = getIST();
  if(cache){
    cache.blocks = cache.blocks.map(b => ({...b, Time: ist}));
    cache.scanTime = ist;
  }
  res.json(cache || { time: ist, blocks: [] });
});

app.listen(PORT, ()=>{ console.log('KUNDGOL V9 IST '+getISTFull()); });
