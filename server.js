const express=require('express');
const cors=require('cors');
const path=require('path');
const app=express();
app.use(cors());
app.use(express.static(__dirname));

// NSE Live fetch with cookies
async function fetchNSELive(url){
 try{
  // Step 1: Get NSE cookies
  const homeRes = await fetch('https://www.nseindia.com/', {
   headers: {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
   }
  });
  const cookies = homeRes.headers.get('set-cookie') || '';
  
  // Step 2: Fetch API with cookies
  const apiRes = await fetch(url, {
   headers: {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept':'application/json, text/plain, */*',
    'Cookie': cookies,
    'Referer':'https://www.nseindia.com/',
    'X-Requested-With':'XMLHttpRequest'
   }
  });
  const data = await apiRes.json();
  return data;
 }catch(e){
  console.log('NSE Error:', e.message);
  return null;
 }
}

app.get('/api/block-deals', async (req,res)=>{
 let data = await fetchNSELive('https://www.nseindia.com/api/block-deals');
 if(data && data.data && data.data.length>0){
  let list = data.data.map(x=>({
   symbol:x.symbol || x.sctd || x.nsym,
   price: x.price || x.lastPrice || 0,
   value: x.value || x.totalValue || 0,
   type: x.type || 'BUY',
   client: x.clientName || 'CLIENT',
   qty: x.qty || 0
  }));
  return res.json({live:true, count:list.length, data:list});
 } else {
  // Market closed or no deals today - return empty, NO FAKE
  return res.json({live:true, count:0, data:[], message:'Market Closed / No Block Deals Today'});
 }
});

app.get('/api/quotes', async (req,res)=>{
 let syms=(req.query.syms||'').split(',').filter(Boolean);
 let out={};
 for(let s of syms.slice(0,10)){
  let q = await fetchNSELive(`https://www.nseindia.com/api/quote-equity?symbol=${s}`);
  if(q && q.priceInfo){
   out[s]={ltp:q.priceInfo.lastPrice, pChange:q.priceInfo.pChange||0, change:q.priceInfo.change||0};
  }
  await new Promise(r=>setTimeout(r,300)); // NSE rate limit
 }
 res.json(out);
});

app.get('/',(req,res)=>{res.sendFile(path.join(__dirname,'index.html'));});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('V46 LIVE ONLY on '+PORT));
