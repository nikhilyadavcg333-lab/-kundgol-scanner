const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

let nseCookie='';
async function refreshCookie(){
 try{
  const r=await fetch('https://www.nseindia.com/',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'}});
  const c=r.headers.raw()['set-cookie']; if(c) nseCookie=c.map(x=>x.split(';')[0]).join('; ');
 }catch(e){}
}
refreshCookie(); setInterval(refreshCookie,4*60*1000);

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));

app.get('/api/nifty', async (req,res)=>{
 try{
  let r=await fetch('https://www.nseindia.com/api/allIndices',{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.nseindia.com/','Cookie':nseCookie}});
  let j=await r.json();
  let nifty=j.data.find(x=>x.index=='NIFTY 50')||j.data.find(x=>x.index.includes('NIFTY 50'))||j.data[0];
  res.json({name:nifty.index,last:nifty.last,change:nifty.percentChange,adv:nifty.advances,dec:nifty.declines,trend:nifty.percentChange>=0?'BULLISH':'BEARISH'});
 }catch(e){res.json({name:'NIFTY 50',last:0,change:0,trend:'NEUTRAL'})}
});

app.get('/api/all', async (req,res)=>{
 try{
  let r=await fetch('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500',{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.nseindia.com/','Cookie':nseCookie}});
  let j=await r.json(); let data=(j.data||[]).map(s=>({symbol:s.symbol,spot:s.lastPrice||0,pChange:s.pChange||0,surge:1.5,open:s.open||0,dayHigh:s.dayHigh||0,dayLow:s.dayLow||0}));
  res.json({count:data.length,data});
 }catch(e){res.json({count:0,data:[]})}
});

app.get('/api/block-deals', async (req,res)=>{
 try{
  let r=await fetch('https://nsearchives.nseindia.com/content/equities/bulk.csv',{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.nseindia.com/'}});
  let t=await r.text(); let lines=t.split('\n'); let out=[];
  for(let i=1;i<lines.length;i++){
   let l=lines[i].trim(); if(!l) continue;
   let p=l.split(','); if(p.length<7) continue;
   let symbol=p[1].trim(); let secName=p[2].trim(); let client=p[3].trim(); let type=p[4].trim(); let qty=p[5].trim(); let price=p[6].trim();
   if(!symbol || symbol.length>20 || symbol.includes('-') && symbol.includes('202')) continue;
   let q=parseFloat(qty.replace(/[^0-9]/g,''))||0; let pr=parseFloat(price.replace(/[^0-9.]/g,''))||0; let val=((q*pr)/1e7).toFixed(2);
   out.push({symbol,secName,client,type,qty,price,val,value:val});
  }
  res.json({count:out.length,data:out});
 }catch(e){res.json({count:0,data:[]})}
});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log(`V43 NIFTY LIVE ${PORT}`));
