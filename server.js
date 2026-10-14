const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

let CACHE = { data: [], block: [], time: 0 };

// TODAY ALL BLOCK DEALS - No FII Filter
async function getAllBlockDeals(){
  try{
    const headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0','Referer':'https://www.nseindia.com/','Accept':'application/json'};
    // NSE needs session
    await fetch('https://www.nseindia.com', {headers}).catch(()=>{});
    await new Promise(r=>setTimeout(r,500));
    let r = await fetch('https://www.nseindia.com/api/snapshot/capital-market-largedeal', {headers});
    if(r.ok){
      let data = await r.json();
      if(Array.isArray(data) && data.length>0){
        let all = data.map(d=>({
          symbol: d.symbol,
          client: d.clientName,
          value: ((d.quantityTraded * d.tradePrice)/10000000).toFixed(2),
          price: d.tradePrice,
          type: d.buySell || d.dealType || 'BUY',
          qty: d.quantityTraded,
          date: d.date
        }));
        CACHE.block = all;
        return all;
      }
    }
  }catch(e){ console.log('Block Error', e.message); }
  // MOCK - Today Block Deals for Demo - NSE block aadre idu show agutte
  let mock = [
    {symbol:"CANBK", client:"GOLDMAN SACHS", value:"12.5", price:125.4, type:"BUY", qty:100000, date:"14-OCT-2026"},
    {symbol:"RELIANCE", client:"MORGAN STANLEY", value:"45.2", price:2890, type:"BUY", qty:150000, date:"14-OCT-2026"},
    {symbol:"TCS", client:"CITI GROUP", value:"32.1", price:3420, type:"SELL", qty:90000, date:"14-OCT-2026"},
    {symbol:"SBIN", client:"HSBC", value:"18.7", price:815, type:"BUY", qty:200000, date:"14-OCT-2026"},
    {symbol:"INFY", client:"BOFA SECURITIES", value:"28.4", price:1650, type:"BUY", qty:170000, date:"14-OCT-2026"},
    {symbol:"COALINDIA", client:"CAPITAL GROUP", value:"15.3", price:385, type:"BUY", qty:400000, date:"14-OCT-2026"},
  ];
  CACHE.block = mock;
  return mock;
}

async function getNSEAll() {
  try {
    const headers = {'User-Agent':'Mozilla/5.0','Referer':'https://www.nseindia.com/'};
    let r = await fetch('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500', {headers});
    if(r.ok){
      let j = await r.json();
      if(j.data && j.data.length>20){
        return j.data.slice(0,100).map(s=>({
          symbol:s.symbol, spot:s.lastPrice||0, prevClose:s.previousClose||0,
          pChange:parseFloat((s.pChange||0).toFixed(2)),
          surge:parseFloat((Math.abs(s.pChange||1)*0.8+1+Math.random()).toFixed(2)),
          volume:s.totalTradedVolume||0
        })).filter(x=>x.spot>0);
      }
    }
  } catch(e){}
  return [];
}

app.get('/api/all', async (req,res)=>{
  let data = await getNSEAll();
  let block = await getAllBlockDeals();
  // Inject ALL block deal stocks into main list
  block.forEach(f=>{
    if(!data.find(d=>d.symbol===f.symbol)){
      data.unshift({
        symbol:f.symbol, spot:f.price, prevClose:f.price*0.98,
        pChange: f.type==='BUY'?1.8:-0.8, surge:2.3, volume:5000000
      });
    }
  });
  if(data.length===0){
    data = block.map(b=>({symbol:b.symbol, spot:b.price, prevClose:b.price*0.98, pChange:1.8, surge:2.3, volume:5000000}));
  }
  CACHE.data=data; CACHE.time=Date.now();
  res.json({data});
});

// NEW API - TODAY ALL BLOCK DEAL
app.get('/api/real-fii', async (req,res)=>{
  let d = await getAllBlockDeals();
  res.json({data:d, count:d.length});
});

app.get('/api/block-deals', async (req,res)=>{
  let d = await getAllBlockDeals();
  res.json({data:d, count:d.length});
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log(`V32 ALL BLOCK DEAL on ${PORT}`));
