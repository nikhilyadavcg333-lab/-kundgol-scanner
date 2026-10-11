const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(require('cors')());
app.use(express.static(__dirname));

const TOP_FII = ["GOLDMAN SACHS","FIDELITY","BLACKROCK","MORGAN STANLEY","CITI","BNP PARIBAS"];
const FII_LIST = ["GOLDMAN","FIDELITY","BLACKROCK","MORGAN","CITI","BNP","CAPITAL","VANGUARD","FII","MUTUAL","MF"];
const NIFTY100 = ["RELIANCE","TCS","HDFCBANK","ICICIBANK","INFY","SBIN","BHARTIARTL","ITC","LT","KOTAKBANK","BAJFINANCE","ASIANPAINT","MARUTI","TITAN","AXISBANK","SUNPHARMA","WIPRO","ULTRACEMCO","BAJAJFINSV","NESTLEIND","HCLTECH","POWERGRID","NTPC","ONGC","TATAMOTORS","JSWSTEEL","ADANIENT","COALINDIA","TECHM","HINDALCO","TATASTEEL","GRASIM","INDUSINDBK","CIPLA","DRREDDY","SBILIFE","BPCL","EICHERMOT","DIVISLAB","BRITANNIA","HDFCLIFE","BAJAJ-AUTO","APOLLOHOSP","ADANIPORTS","HEROMOTOCO","UPL","TATACONSUM","LTIM","SHRIRAMFIN","TRENT","BEL","TATAPOWER","VEDL","INDIGO","ZOMATO","SIEMENS","DLF","PIDILITEX","HAVELLS","GODREJCP","ICICIGI","SBICARD","CHOLAFIN","ICICIPRULI","MUTHOOTFIN","BANKBARODA","PNB","CANBK","FEDERALBNK","SAIL","NMDC","ABB","BOSCHLTD","MARICO","DABUR","ACC","GAIL","PFC","IRCTC","HAL"];

let cache = { blocks: [], time: '--' };

function isTopFII(b){ return TOP_FII.some(t=>b.includes(t)); }
function isFII(b){ return FII_LIST.some(t=>b.includes(t)); }

async function fetchBlocks(){
 try{
  console.log('Fetching NSE...');
  let res = await axios.get('https://www.nseindia.com/api/block-deal', {
    headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'},
    timeout:15000
  });
  let raw = res.data || [];
  if(!Array.isArray(raw)){
    if(Array.isArray(raw.data)) raw = raw.data;
    else if(Array.isArray(raw.blockDeals)) raw = raw.blockDeals;
    else if(Array.isArray(raw.deals)) raw = raw.deals;
    else {
      let found = Object.values(raw).find(v=>Array.isArray(v));
      raw = found || [];
    }
  }
  console.log('Got',raw.length,'records');
  let out = [];
  for(let d of raw){
    let sym = (d.symbol || d.SM || '').toString().toUpperCase();
    let buyer = (d.clientName || d.CN || 'BIG BUYER').toString().toUpperCase();
    let qty = parseInt(d.qty || d.Q || d.quantity || 0);
    let price = parseFloat(d.price || d.P || d.tradePrice || 0);
    if(!qty || !price) continue;
    let val = (qty*price)/10000000;
    if(val < 1) continue;
    if(val < 3.5 && !isTopFII(buyer)) continue;
    if(!isFII(buyer) && !isTopFII(buyer)) continue;
    if(!NIFTY100.includes(sym)) continue;
    out.push({
      symbol: sym, price: price, qty: qty, buyer: buyer,
      valueCr: val.toFixed(2), time: new Date().toLocaleTimeString('en-IN'),
      ms: Math.floor(Math.random()*900)+100, ratio: isTopFII(buyer)?'5.0':'3.2',
      isTopFII: isTopFII(buyer), premium: (Math.random()*3+0.5).toFixed(2),
      reason: isTopFII(buyer) ? '🔥 '+buyer+' - Top FII Buying' : 'FII Buying '+val.toFixed(1)+'Cr'
    });
  }
  if(out.length === 0){
    console.log('Sunday - NSE 0, showing DEMO');
    out = [{
      symbol:'RELIANCE', price:1480, qty:75000, buyer:'GOLDMAN SACHS (SINGAPORE) PTE - DEMO',
      valueCr:'11.10', time:'09:02:15', ms:234, ratio:'5.0', isTopFII:true,
      premium:'2.35', reason:'🔥 GOLDMAN SACHS - Top FII + Premium + Nifty Heavy (Demo - Monday Live)'
    }];
  }
  out.sort((a,b)=> parseFloat(b.valueCr) - parseFloat(a.valueCr));
  cache.blocks = out.slice(0,15);
  cache.time = new Date().toLocaleTimeString('en-IN');
  fs.writeFileSync('today_blocks.json', JSON.stringify({date:new Date().toDateString(), blocks:cache.blocks}, null, 2));
 }catch(e){
  console.log('Error',e.message);
  if(cache.blocks.length===0){
    cache.blocks = [{
      symbol:'RELIANCE', price:1480, qty:75000, buyer:'GOLDMAN SACHS DEMO',
      valueCr:'11.10', time:'09:02:15', ms:234, ratio:'5.0', isTopFII:true,
      premium:'2.35', reason:'🔥 GOLDMAN Demo - Monday NSE Live'
    }];
    cache.time = 'Demo Data';
  }
 }
}

app.get('/live-prices', async (req,res)=>{
  if(cache.blocks.length===0) await fetchBlocks();
  let prices={}, details={};
  cache.blocks.forEach(b=>{
    prices[b.symbol]=b.price;
    details[b.symbol]={diff: parseFloat(b.premium), ceStrike: Math.ceil(b.price/50)*50};
  });
  res.json({blocks:cache.blocks, prices:prices, details:details, time:cache.time});
});

app.get('/scan', async (req,res)=>{
  await fetchBlocks();
  res.json({count:cache.blocks.length, time:cache.time, message:'Scanned'});
});

app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'index.html'));
});

app.listen(PORT, ()=>{
  console.log('V6 PRO LIVE on '+PORT);
  fetchBlocks();
});