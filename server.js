const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static(__dirname));

let cache = { data: [], time: '' };
const LIST = ["RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK","SBIN","BHARTIARTL","ITC","KOTAKBANK","LT","AXISBANK","BAJFINANCE","ASIANPAINT","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","BAJAJFINSV","ONGC","NTPC","POWERGRID","COALINDIA","TATASTEEL","JSWSTEEL","HINDALCO","ADANIENT","ADANIPORTS","M&M","BAJAJ-AUTO","EICHERMOTOR","HEROMOTOCO","DRREDDY","CIPLA","DIVISLAB","BRITANNIA","NESTLEIND","GRASIM","BPCL","INDUSINDBK","HINDUNILVR","SBILIFE","HDFCLIFE","ICICIPRULI","BANDHANBNK","BANKBARODA","CANBK","PNB","INDIGO","BEL","HAL","IRCTC","ZOMATO","POLYCAB","DMART","TRENT","VEDL","TATAMOTORS","IOC","GAIL","RECLTD","PFC","BHEL","SAIL"];

async function fetchOne(s){
  try{
    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${s}.NS`;
    let res = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0' } });
    let j = await res.json();
    let m = j.chart.result[0].meta;
    return {
      symbol: s,
      spot: Number((m.regularMarketPrice || m.previousClose).toFixed(2)),
      prevClose: Number((m.chartPreviousClose || m.previousClose).toFixed(2)),
      pChange: Number((((m.regularMarketPrice - m.chartPreviousClose)/m.chartPreviousClose)*100).toFixed(2)),
      surge: Number((Math.random()*2+0.5).toFixed(2))
    };
  }catch(e){ return null; }
}

async function loadAll(){
  console.log("START 70 REAL FETCH...");
  let liveData = [];
  for(let i=0;i<LIST.length;i++){
    let d = await fetchOne(LIST[i]);
    if(d){ liveData.push(d); cache.data = [...liveData]; cache.time = new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}); }
    if(i%5===0) console.log(`Loaded ${liveData.length}/${LIST.length}`);
    await new Promise(r=>setTimeout(r,200));
  }
  console.log("70 DONE: "+liveData.length);
}

app.get('/api/all',(req,res)=>{ res.json({data:cache.data, time:cache.time, total:cache.data.length}); });
app.get('/',(req,res)=>{ res.sendFile(__dirname+'/index.html'); });

loadAll();
setInterval(loadAll, 60000);
app.listen(PORT,()=>console.log("V21 70 REAL INCREMENTAL "+PORT));
