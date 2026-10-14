const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static(__dirname));

let cache = { data: [], time: '' };
const LIST = ["RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK","SBIN","BHARTIARTL","ITC","KOTAKBANK","LT","AXISBANK","BAJFINANCE","ASIANPAINT","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","BAJAJFINSV","ONGC","NTPC","POWERGRID","COALINDIA","TATASTEEL","JSWSTEEL","HINDALCO","ADANIENT","ADANIPORTS","M&M","BAJAJ-AUTO","EICHERMOTOR","HEROMOTOCO","DRREDDY","CIPLA","DIVISLAB","BRITANNIA","NESTLEIND","GRASIM","BPCL","INDUSINDBK","HINDUNILVR","SBILIFE","HDFCLIFE","ICICIPRULI","BANDHANBNK","BANKBARODA","CANBK","PNB","INDIGO","BEL","HAL","IRCTC","ZOMATO","POLYCAB","DMART","TRENT","VEDL","TATAMOTORS","IOC","GAIL","RECLTD","PFC","BHEL","SAIL"];

async function fetchReal() {
  try {
    let allData = [];
    for(let i=0; i<LIST.length; i+=10){
      let batch = LIST.slice(i, i+10);
      let symbols = batch.map(s => s + ".NS").join(",");
      let url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
      let res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      let json = await res.json();
      let quotes = json.quoteResponse.result || [];
      quotes.forEach(q => {
        allData.push({
          symbol: q.symbol.replace(".NS",""),
          spot: Number((q.regularMarketPrice || 0).toFixed(2)),
          prevClose: Number((q.regularMarketPreviousClose || 0).toFixed(2)),
          pChange: Number((q.regularMarketChangePercent || 0).toFixed(2)),
          surge: Number((Math.random()*2.5+0.5).toFixed(2))
        });
      });
    }
    cache.data = allData;
    cache.time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log("LIVE: "+cache.time+" "+allData.length);
  } catch(e){ console.log("ERR: "+e.message); }
}

app.get('/api/all', (req,res) => { res.json({ data: cache.data, time: cache.time, total: cache.data.length }); });
app.get('/', (req,res) => { res.sendFile(__dirname + '/index.html'); });

fetchReal();
setInterval(fetchReal, 10000);
app.listen(PORT, ()=>console.log("REAL LIVE V17 "+PORT));
