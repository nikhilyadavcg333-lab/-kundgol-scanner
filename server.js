const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname)));

let nseCookie='';
async function getNSECookie(){
 try{
  let r=await fetch('https://www.nseindia.com',{headers:{'User-Agent':'Mozilla/5.0'}});
  nseCookie=r.headers.raw()['set-cookie']?.join('; ')||'';
 }catch(e){}
}
getNSECookie();
setInterval(getNSECookie,5*60*1000);

app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/api/all', async (req,res)=>{
 try{
  let r=await fetch('https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500',{headers:{'User-Agent':'Mozilla/5.0','Cookie':nseCookie}});
  let j=await r.json();
  let data=(j.data||[]).map(s=>({symbol:s.symbol,spot:s.lastPrice||0,pChange:s.pChange||0,surge:1.5,dayHigh:s.dayHigh||0,dayLow:s.dayLow||0,open:s.open||0}));
  res.json({count:data.length,data});
 }catch(e){res.json({count:0,data:[]})}
});

app.get('/api/block-deals', async (req,res)=>{
 try{
  let r=await fetch('https://nsearchives.nseindia.com/content/equities/bulk.csv',{headers:{'User-Agent':'Mozilla/5.0'}});
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
app.listen(PORT,()=>console.log(`LIVE ${PORT}`));
