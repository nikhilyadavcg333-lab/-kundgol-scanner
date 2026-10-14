const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.static(__dirname));

let cache = { data: [], time: '', cookies: '' };

async function getCookies(){
  try{
    let r = await fetch('https://www.nseindia.com', { headers: { 'User-Agent':'Mozilla/5.0' } });
    let c = r.headers.get('set-cookie') || '';
    cache.cookies = c;
  }catch(e){}
}

async function fetchNSE(){
  try{
    if(!cache.cookies) await getCookies();
    let url = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050';
    let res = await fetch(url, {
      headers: {
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept':'application/json',
        'Cookie': cache.cookies,
        'Referer':'https://www.nseindia.com/'
      }
    });
    if(res.status==401){ await getCookies(); return fetchNSE(); }
    let json = await res.json();
    let list = json.data || [];
    let mapped = list.map(s=>{
      return {
        symbol: s.symbol,
        spot: Number(s.lastPrice),
        prevClose: Number(s.previousClose),
        pChange: Number(s.pChange),
        surge: Number((Math.random()*2.5+0.5).toFixed(2))
      };
    });
    // Add remaining 20 stocks from NIFTY NEXT 50
    let url2 = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20NEXT%2050';
    let res2 = await fetch(url2, { headers: { 'User-Agent':'Mozilla/5.0','Cookie':cache.cookies,'Referer':'https://www.nseindia.com/' } });
    let json2 = await res2.json();
    let list2 = (json2.data||[]).slice(0,20).map(s=>({
      symbol: s.symbol,
      spot: Number(s.lastPrice),
      prevClose: Number(s.previousClose),
      pChange: Number(s.pChange),
      surge: Number((Math.random()*2.5+0.5).toFixed(2))
    }));
    
    cache.data = [...mapped, ...list2];
    cache.time = new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'});
    console.log("NSE LIVE: "+cache.time+" "+cache.data.length);
  }catch(e){
    console.log("NSE ERR: "+e.message);
    // Fallback demo if NSE fails
    if(cache.data.length==0){
      cache.data=[{symbol:"POWERGRID",spot:249.30,prevClose:248,pChange:0.52,surge:2.7}];
      cache.time = new Date().toLocaleTimeString();
    }
  }
}

app.get('/api/all',(req,res)=>{ res.json({data:cache.data,time:cache.time,total:cache.data.length}); });
app.get('/',(req,res)=>{ res.sendFile(__dirname+'/index.html'); });

getCookies().then(()=>fetchNSE());
setInterval(fetchNSE, 10000);
app.listen(PORT,()=>console.log("NSE DIRECT V17 "+PORT));
