const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static(__dirname));

let cache = { data: [], time: '' };
const LIST = ["RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK","SBIN","BHARTIARTL","ITC","KOTAKBANK","LT","AXISBANK","BAJFINANCE","ASIANPAINT","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","BAJAJFINSV","ONGC","NTPC","POWERGRID","COALINDIA","TATASTEEL","JSWSTEEL","HINDALCO","ADANIENT","ADANIPORTS","M&M","BAJAJ-AUTO","EICHERMOTOR","HEROMOTOCO","DRREDDY","CIPLA","DIVISLAB","BRITANNIA","NESTLEIND","GRASIM","BPCL","INDUSINDBK","HINDUNILVR","SBILIFE","HDFCLIFE","ICICIPRULI","BANDHANBNK","BANKBARODA","CANBK","PNB","INDIGO","BEL","HAL","IRCTC","ZOMATO","POLYCAB","DMART","TRENT","VEDL","TATAMOTORS","IOC","GAIL","RECLTD","PFC","BHEL","SAIL"];

async function fetchRealPrices() {
  try {
    const symbols = LIST.map(s => s + ".NS").join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const json = await res.json();
    const quotes = json.quoteResponse.result;
    
    let d = quotes.map(q => {
      let symbol = q.symbol.replace(".NS","");
      let spot = q.regularMarketPrice;
      let prevClose = q.regularMarketPreviousClose;
      let pChange = q.regularMarketChangePercent;
      let volSurge = (Math.random() * 2.5 + 0.5);
      return {
        symbol: symbol,
        spot: Number(spot.toFixed(2)),
        buy: Number(prevClose.toFixed(2)),
        prevClose: Number(prevClose.toFixed(2)),
        pChange: Number(pChange.toFixed(2)),
        surge: Number(volSurge.toFixed(2))
      };
    });
    cache.data = d;
    cache.time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log("Real Prices Updated: " + cache.time);
  } catch(e) {
    console.log("Fetch Error: " + e.message);
  }
}

app.get('/api/all', (req, res) => {
  res.json({ data: cache.data, time: cache.time, total: cache.data.length });
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

fetchRealPrices();
setInterval(fetchRealPrices, 15000);
app.listen(PORT, () => console.log('V16 REAL LIVE Running ' + PORT));
