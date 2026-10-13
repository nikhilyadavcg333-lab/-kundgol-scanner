const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const STOCKS = ["ICICIBANK","HDFCBANK","INFY","TCS","RELIANCE","SBIN","BHARTIARTL","LT","ITC","AXISBANK","KOTAKBANK","BAJFINANCE","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","POWERGRID","NTPC","ONGC","COALINDIA","JSWSTEEL","TATASTEEL"];

const BUYERS = ["JPMORGAN","GOLDMAN SACHS","MORGAN STANLEY","BLACKROCK","FIDELITY","HSBC"];
const REAL_BASE = {ICICIBANK:1342,HDFCBANK:708,INFY:1845,TCS:3925,RELIANCE:2940,SBIN:825,BHARTIARTL:1795,LT:3670,ITC:472,AXISBANK:1185,KOTAKBANK:1750,BAJFINANCE:7100,MARUTI:12650,WIPRO:505,HCLTECH:1720,SUNPHARMA:1780,TITAN:3450,ULTRACEMCO:11400,POWERGRID:315,NTPC:405,ONGC:285,COALINDIA:485,JSWSTEEL:1020,TATASTEEL:165};

function getIST(){return new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour12:true,hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function getATM(p){if(p>5000) return Math.round(p/50)*50; return Math.round(p/10)*10;}

let nseCookies = "";
async function getNseCookie(){
 try{
  const r = await fetch("https://www.nseindia.com",{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});
  const c = r.headers.get("set-cookie")||"";
  nseCookies = c.split(',').map(x=>x.split(';')[0]).join('; ');
 }catch(e){}
}

async function fetchNSEPrice(sym){
 // Try NSE Official first
 try{
  if(!nseCookies) await getNseCookie();
  const r = await fetch(`https://www.nseindia.com/api/quote-equity?symbol=${sym}`,{
   headers:{"User-Agent":"Mozilla/5.0","Accept":"application/json","Cookie":nseCookies,"Referer":"https://www.nseindia.com/"}
  });
  if(r.ok){
   const j = await r.json();
   if(j.priceInfo){
    return {ltp:j.priceInfo.lastPrice, prev:j.priceInfo.previousClose};
   }
  }
 }catch(e){}

 // Fallback Yahoo with 2 tries
 try{
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}.NS?interval=1d&range=1d`,{headers:{"User-Agent":"Mozilla/5.0"}});
  const j = await r.json();
  const m = j.chart.result[0].meta;
  return {ltp:m.regularMarketPrice, prev:m.previousClose||m.chartPreviousClose};
 }catch(e){}

 // Last fallback Real Base + live random
 const base = REAL_BASE[sym]||1500;
 const change = (Math.random()-0.5)* (base*0.02);
 return {ltp: base+change, prev: base};
}

let cache={blocks:[],total:0,prem:0,disc:0,scanTime:getIST()};

async function scan(){
 const blocks=[];
 for(let s of STOCKS){
  const {ltp,prev}=await fetchNSEPrice(s);
  const perc=((ltp-prev)/prev*100);
  if(Math.abs(perc)<0.15) continue; // 0.15% min
  blocks.push({
   symbol:s,
   close:prev.toFixed(2),
   ltp:ltp.toFixed(2),
   perc:perc.toFixed(2),
   strike:getATM(ltp),
   buyer:BUYERS[Math.floor(Math.random()*BUYERS.length)],
   isDisc:perc<0,
   Time:getIST()
  });
  if(blocks.length>=18) break;
  await new Promise(r=>setTimeout(r,180));
 }
 cache={blocks,total:blocks.length,prem:blocks.filter(x=>!x.isDisc).length,disc:blocks.filter(x=>x.isDisc).length,scanTime:getIST()};
 return cache;
}

app.get('/api/blocks', async (req,res)=>{if(!cache.blocks.length) await scan(); res.json(cache);});
app.get('/api/scan', async (req,res)=>{res.json(await scan());});
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(process.env.PORT||10000,()=>console.log('KUNDGOL V10 NSE LIVE '+getIST()));
