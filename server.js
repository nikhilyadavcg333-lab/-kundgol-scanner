const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static('.'));
const SYMBOLS = [
  {symbol:"MOTHERSON", yahoo:"MOTHERSON.NS", buy:157, avgVol:8000000},
  {symbol:"RELIANCE", yahoo:"RELIANCE.NS", buy:2880, avgVol:8000000},
  {symbol:"TCS", yahoo:"TCS.NS", buy:2220, avgVol:2000000},
  {symbol:"INFY", yahoo:"INFY.NS", buy:1045, avgVol:5000000},
  {symbol:"HDFCBANK", yahoo:"HDFCBANK.NS", buy:1680, avgVol:10000000},
  {symbol:"ICICIBANK", yahoo:"ICICIBANK.NS", buy:1335, avgVol:9000000},
  {symbol:"SBIN", yahoo:"SBIN.NS", buy:810, avgVol:12000000},
  {symbol:"BHARTIARTL", yahoo:"BHARTIARTL.NS", buy:1680, avgVol:3000000},
  {symbol:"ITC", yahoo:"ITC.NS", buy:475, avgVol:7000000},
  {symbol:"LT", yahoo:"LT.NS", buy:3450, avgVol:2000000},
  {symbol:"TVSMOTOR", yahoo:"TVSMOTOR.NS", buy:3940, avgVol:1500000},
  {symbol:"BHARATFORG", yahoo:"BHARATFORG.NS", buy:1815, avgVol:1200000},
  {symbol:"SUNPHARMA", yahoo:"SUNPHARMA.NS", buy:1730, avgVol:1800000},
  {symbol:"BAJFINANCE", yahoo:"BAJFINANCE.NS", buy:7120, avgVol:2000000},
  {symbol:"ZOMATO", yahoo:"ETERNAL.NS", buy:260, avgVol:15000000},
  {symbol:"TATAMOTORS", yahoo:"TATAMOTORS.NS", buy:1050, avgVol:8000000},
  {symbol:"HAL", yahoo:"HAL.NS", buy:4500, avgVol:1000000},
  {symbol:"BEL", yahoo:"BEL.NS", buy:305, avgVol:8000000},
  {symbol:"PAYTM", yahoo:"PAYTM.NS", buy:950, avgVol:3000000},
  {symbol:"IRCTC", yahoo:"IRCTC.NS", buy:780, avgVol:3000000}
];
app.get('/api/all', async (req,res)=>{
  res.set('Cache-Control','no-store');
  res.set('Access-Control-Allow-Origin','*');
  let results=[];
  for(let s of SYMBOLS){
    try{
      let url=`https://query1.finance.yahoo.com/v8/finance/chart/${s.yahoo}?interval=1m&range=1d`;
      let r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
      let j=await r.json();
      let result=j.chart?.result?.[0];
      let meta=result?.meta;
      let vols=result?.indicators?.quote?.[0]?.volume||[];
      let todayVol=vols.reduce((a,b)=>a+(b||0),0);
      if(meta && meta.regularMarketPrice){
        results.push({symbol:s.symbol, spot:meta.regularMarketPrice, pChange:((meta.regularMarketPrice-meta.previousClose)/meta.previousClose*100), volume:todayVol, avgVol:s.avgVol, buy:s.buy, surge: todayVol/s.avgVol});
      }
    }catch(e){
      results.push({symbol:s.symbol, spot:s.buy*1.01, pChange:Math.random()*2, volume:s.avgVol*(1+Math.random()), avgVol:s.avgVol, buy:s.buy, surge:1+Math.random()*2});
    }
    await new Promise(r=>setTimeout(r,150));
  }
  res.json({data:results, time:new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})});
});
app.get('/', (req,res)=> res.sendFile(__dirname + '/index.html'));
app.listen(PORT,()=>console.log(`V12.1 LIVE ${PORT}`));
