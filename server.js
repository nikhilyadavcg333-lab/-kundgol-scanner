const express=require('express');
const cors=require('cors');
const fs=require('fs');
const path=require('path');
const app=express();
app.use(cors());
app.use(express.static(__dirname));

const CACHE_FILE='/tmp/today_block.json';
let TODAY_CACHE=[];

// NSE with cookies
async function fetchNSELive(url){
 try{
  const home=await fetch('https://www.nseindia.com/',{headers:{'User-Agent':'Mozilla/5.0'}});
  const cookies=home.headers.get('set-cookie')||'';
  const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Cookie':cookies,'Referer':'https://www.nseindia.com/'}});
  return await res.json();
 }catch(e){ return null; }
}

app.get('/api/block-deals', async (req,res)=>{
 let data = await fetchNSELive('https://www.nseindia.com/api/block-deals');

 if(data && data.data && data.data.length>0){
  let list=data.data.map(x=>({symbol:x.symbol||x.sctd,price:x.price||0,value:x.value||0,type:x.type||'BUY',client:x.clientName||'',qty:x.qty||0,time:new Date().toISOString()}));
  TODAY_CACHE=list;
  try{fs.writeFileSync(CACHE_FILE,JSON.stringify({date:new Date().toDateString(), data:list}));}catch(e){}
  return res.json({live:true, source:'LIVE NSE', count:list.length, data:list});
 } else {
  // Try cache - today's real live data
  try{
   if(fs.existsSync(CACHE_FILE)){
    let cached=JSON.parse(fs.readFileSync(CACHE_FILE,'utf8'));
    if(cached.date===new Date().toDateString() && cached.data.length>0){
     return res.json({live:false, source:'TODAY CACHE - Market Closed', count:cached.data.length, data:cached.data});
    }
   }
  }catch(e){}
  if(TODAY_CACHE.length>0){
   return res.json({live:false, source:'TODAY CACHE', count:TODAY_CACHE.length, data:TODAY_CACHE});
  }
  return res.json({live:true, source:'NSE Empty', count:0, data:[], message:'Market Closed / No Block Deals Today - Cache Empty'});
 }
});

app.get('/api/quotes', async (req,res)=>{
 let syms=(req.query.syms||'').split(',').filter(Boolean);
 let out={};
 for(let s of syms.slice(0,10)){
  let q=await fetchNSELive(`https://www.nseindia.com/api/quote-equity?symbol=${s}`);
  if(q&&q.priceInfo){ out[s]={ltp:q.priceInfo.lastPrice,pChange:q.priceInfo.pChange}; }
  await new Promise(r=>setTimeout(r,300));
 }
 res.json(out);
});

app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('V46.2 CACHE LIVE '+PORT));
