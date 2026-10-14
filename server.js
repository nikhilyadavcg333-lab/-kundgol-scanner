const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
let nseCookie='';

async function getNSECookie(){
 try{
  let r=await fetch('https://www.nseindia.com',{headers:{'User-Agent':'Mozilla/5.0'}});
  nseCookie=r.headers.raw()['set-cookie']?.join('; ')||'';
 }catch(e){}
}
getNSECookie(); setInterval(getNSECookie,5*60*1000);

// NSE ALL
app.get('/api/all', async (req,res)=>{
 try{
  let r=await fetch('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500',{headers:{'User-Agent':'Mozilla/5.0','Cookie':nseCookie}});
  let j=await r.json();
  let data=j.data.map(s=>({symbol:s.symbol,spot:s.lastPrice,pChange:s.pChange,surge:(s.totalTradedVolume/s.totalTradedVolume||1.2),dayHigh:s.dayHigh,dayLow:s.dayLow,open:s.open}));
  res.json({count:data.length,data});
 }catch(e){res.json({count:0,data:[]})}
});

// REAL BULK - NSE ARCHIVE
app.get('/api/block-deals', async (req,res)=>{
 try{
  let r=await fetch('https://nsearchives.nseindia.com/content/equities/bulk.csv',{headers:{'User-Agent':'Mozilla/5.0'}});
  let t=await r.text(); let lines=t.split('\n').slice(1); let out=[];
  lines.forEach(l=>{
   if(!l.trim()) return; let p=l.split(','); if(p.length<5) return;
   out.push({symbol:p[0]?.trim(),client:p[1]?.trim(),type:p[2]?.trim(),qty:p[3]?.trim(),price:p[4]?.trim(),value:(parseFloat(p[3])*parseFloat(p[4])/1e7).toFixed(2)});
  });
  res.json({count:out.length,data:out});
 }catch(e){res.json({count:0,data:[]})}
});

// PRO PLUS - DELIVERY + OI ESTIMATE (Public bhavcopy logic)
app.get('/api/pro', async (req,res)=>{
 res.json({info:"Pro data merged in frontend - Delivery logic from volume/price action"});
});

app.listen(10000,()=>console.log('PRO PLUS LIVE'));
