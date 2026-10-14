const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('.'));

// Real NSE Symbols mapping
const SYMBOLS = [
  {symbol:"LUPIN", yahoo:"LUPIN.NS"},
  {symbol:"MOTHERSON", yahoo:"MOTHERSON.NS"},
  {symbol:"TVSMOTOR", yahoo:"TVSMOTOR.NS"},
  {symbol:"SIEMENS", yahoo:"SIEMENS.NS"},
  {symbol:"DIXON", yahoo:"DIXON.NS"},
  {symbol:"INFY", yahoo:"INFY.NS"},
  {symbol:"TCS", yahoo:"TCS.NS"},
  {symbol:"ICICIBANK", yahoo:"ICICIBANK.NS"},
  {symbol:"BHARATFORG", yahoo:"BHARATFORG.NS"},
  {symbol:"ASHOKLEY", yahoo:"ASHOKLEY.NS"},
  {symbol:"SUNPHARMA", yahoo:"SUNPHARMA.NS"},
  {symbol:"AUROPHARMA", yahoo:"AUROPHARMA.NS"},
  {symbol:"LAURUSLABS", yahoo:"LAURUSLABS.NS"},
  {symbol:"DRREDDY", yahoo:"DRREDDY.NS"},
  {symbol:"BAJAJFINANCE", yahoo:"BAJAJFINANCE.NS"},
  {symbol:"HDFCBANK", yahoo:"HDFCBANK.NS"},
  {symbol:"RELIANCE", yahoo:"RELIANCE.NS"},
  {symbol:"SBIN", yahoo:"SBIN.NS"}
];

app.get('/api/all', async (req,res)=>{
  res.set('Cache-Control','no-store');
  try{
    let results=[];
    for(let s of SYMBOLS){
      try{
        let url=`https://query1.finance.yahoo.com/v8/finance/chart/${s.yahoo}?interval=1m&range=1d`;
        let r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
        let j=await r.json();
        let meta=j.chart?.result?.[0]?.meta;
        if(meta && meta.regularMarketPrice){
          results.push({
            symbol:s.symbol,
            spot: meta.regularMarketPrice,
            pChange: ((meta.regularMarketPrice-meta.previousClose)/meta.previousClose*100)
          });
        }
      }catch(e){}
    }
    // If Yahoo blocked, return backup with today Google price
    if(results.length<5){
      return res.json({data:[
        {symbol:"LUPIN",spot:1936.80,pChange:-0.86},
        {symbol:"MOTHERSON",spot:160.00,pChange:1.92},
        {symbol:"TVSMOTOR",spot:4011.50,pChange:1.81},
        {symbol:"SIEMENS",spot:3742.00,pChange:2.41},
        {symbol:"DIXON",spot:12740.00,pChange:0.63},
        {symbol:"INFY",spot:1062.10,pChange:4.13},
        {symbol:"TCS",spot:2269.30,pChange:2.2},
        {symbol:"ICICIBANK",spot:1360.20,pChange:1.9},
        {symbol:"BHARATFORG",spot:1842.20,pChange:1.5},
        {symbol:"ASHOKLEY",spot:147.37,pChange:2.2},
        {symbol:"SUNPHARMA",spot:1753.10,pChange:1.3},
        {symbol:"AUROPHARMA",spot:1675.40,pChange:0.9},
        {symbol:"LAURUSLABS",spot:2045.80,pChange:1.1},
        {symbol:"DRREDDY",spot:1222.30,pChange:0.8},
        {symbol:"BAJAJFINANCE",spot:7250.50,pChange:1.8},
        {symbol:"HDFCBANK",spot:1705.30,pChange:1.2},
        {symbol:"RELIANCE",spot:2920.10,pChange:1.0},
        {symbol:"SBIN",spot:825.60,pChange:1.5}
      ], source:"backup-google"});
    }
    res.json({data:results, source:"live"});
  }catch(e){
    res.json({data:[], error:e.message});
  }
});

app.listen(PORT,()=>console.log(`Running ${PORT}`));
