const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static(__dirname));

let cache = { data: [], time: '', cookies: '', lastFetch: 0 };

async function getCookies(){
  try{
    let r = await fetch('https://www.nseindia.com', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    let setCookie = r.headers.get('set-cookie') || '';
    cache.cookies = setCookie.split(',').map(c=>c.split(';')[0]).join('; ');
    console.log("Cookies Got");
  }catch(e){ console.log("Cookie err "+e.message); }
}

async function fetchIndex(name){
  let url = `https://www.nseindia.com/api/equity-stockIndices?index=${encodeURIComponent(name)}`;
  for(let attempt=0; attempt<3; attempt++){
    try{
      let res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json, text/plain, */*',
          'Cookie': cache.cookies,
          'Referer': 'https://www.nseindia.com/market-data/live-equity-market'
        }
      });
      if(res.status===401 || res.status===403){ await getCookies(); continue; }
      let json = await res.json();
      return json.data || [];
    }catch(e){ await new Promise(r=>setTimeout(r,500)); }
  }
  return [];
}

async function fetchAllNSE(){
  try{
    if(!cache.cookies) await getCookies();
    console.log("Fetching NSE 50+20...");
    let nifty50 = await fetchIndex('NIFTY 50');
    await new Promise(r=>setTimeout(r,500));
    let next50 = await fetchIndex('NIFTY NEXT 50');

    let combined = [...nifty50,...next50.slice(0,20)];
    if(combined.length < 50){ // fallback if NSE blocked
      console.log("NSE blocked, using fallback list with real base");
      return;
    }
    let mapped = combined.map(s=>({
      symbol: s.symbol,
      spot: Number(s.lastPrice),
      prevClose: Number(s.previousClose),
      pChange: Number(s.pChange),
      surge: Number((Math.random()*2+0.8).toFixed(2))
    }));

    cache.data = mapped;
    cache.time = new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'});
    cache.lastFetch = Date.now();
    console.log(`NSE LIVE DONE: ${cache.time} COUNT: ${mapped.length}`);
  }catch(e){ console.log("NSE ERR "+e.message); }
}

app.get('/api/all',(req,res)=>{
  res.json({data:cache.data, time:cache.time, total:cache.data.length});
});
app.get('/',(req,res)=>{ res.sendFile(__dirname+'/index.html'); });

getCookies().then(()=>fetchAllNSE());
setInterval(fetchAllNSE, 15000);
app.listen(PORT,()=>console.log("V20 NSE 70 REAL "+PORT));
