const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname)));

let nseCookie = '';
async function refreshCookie(){
 try{
  const r = await fetch('https://www.nseindia.com/',{
   headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36','Accept':'text/html','Accept-Language':'en-US'}
  });
  const cookies = r.headers.raw()['set-cookie'];
  if(cookies) nseCookie = cookies.map(c=>c.split(';')[0]).join('; ');
  console.log('Cookie refreshed');
 }catch(e){console.log('Cookie fail',e.message)}
}
refreshCookie(); setInterval(refreshCookie, 4*60*1000);

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));

// YALLA - With Retry + Bypass
app.get('/api/all', async (req,res)=>{
 try{
  await new Promise(r=>setTimeout(r,800)); // NSE needs delay
  let url='https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500';
  let r=await fetch(url,{
   headers:{
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept':'application/json, text/plain, */*',
    'Accept-Language':'en-US,en;q=0.9',
    'Referer':'https://www.nseindia.com/',
    'Cookie': nseCookie,
    'X-Requested-With':'XMLHttpRequest'
   }
  });
  if(!r.ok) throw new Error('NSE '+r.status);
  let j=await r.json();
  let data=(j.data||[]).map(s=>({
    symbol:s.symbol, spot:s.lastPrice||0, pChange:s.pChange||0,
    surge: s.totalTradedVolume? Math.max(1.1, (s.totalTradedVolume/500000).toFixed(2)) : 1.5,
    dayHigh:s.dayHigh||0, dayLow:s.dayLow||0, open:s.open||0
  }));
  console.log('YALLA OK',data.length);
  res.json({count:data.length,data});
 }catch(e){
  console.log('YALLA FAIL',e.message);
  // FALLBACK - Dummy but scanner works - REAL BULK nodi
  res.json({count:0,data:[],error:e.message});
 }
});

app.get('/api/block-deals', async (req,res)=>{
 try{
  let r=await fetch('https://nsearchives.nseindia.com/content/equities/bulk.csv',{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.nseindia.com/'}});
  let t=await r.text(); let lines=t.split('\n').slice(1); let out=[];
  lines.forEach(l=>{
   if(!l.trim()) return; let p=l.split(','); if(p.length<5) return;
   let qty=parseFloat(p[3])||0, price=parseFloat(p[4])||0;
   out.push({symbol:p[0]?.trim(),client:p[1]?.trim(),type:p[2]?.trim(),qty:p[3]?.trim(),price:p[4]?.trim(),value:((qty*price)/1e7).toFixed(2)});
  });
  res.json({count:out.length,data:out});
 }catch(e){res.json({count:0,data:[]})}
});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`PRO PLUS LIVE ${PORT}`));
