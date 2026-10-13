const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const STOCKS = ["ICICIBANK","HDFCBANK","INFY","TCS","RELIANCE","SBIN","BHARTIARTL","LT","ITC","AXISBANK","KOTAKBANK","BAJFINANCE","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","PERSISTENT","COFORGE","HAL","BEL","TRENT"];
const REAL = {ICICIBANK:1342,HDFCBANK:708,INFY:1845,TCS:3925,RELIANCE:2940,SBIN:825,BHARTIARTL:1795,LT:3670,ITC:472,AXISBANK:1260,KOTAKBANK:1750,BAJFINANCE:960,MARUTI:12650,WIPRO:505,HCLTECH:1720,SUNPHARMA:1780,TITAN:3450,ULTRACEMCO:11400,PERSISTENT:5845,COFORGE:7890,HAL:4640,BEL:285,TRENT:6250};

function getIST(){return new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour12:true})}
function getATM(p){if(p>5000) return Math.round(p/50)*50; return Math.round(p/10)*10;}

let cache={blocks:[],source:"SIMULATION",total:0,scanTime:getIST()};

async function scan(){
 try{
  // TRY REAL NSE BULK DEAL API
  console.log("Trying Real NSE API...");
  const res = await fetch('https://www.nseindia.com/api/live-analysis/bulk-block-deals', {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Referer': 'https://www.nseindia.com/'
    }
  });
  const data = await res.json();

  if(data && data.data){
    const blocks = data.data.slice(0,20).map(d=>{
      const sym = d.symbol;
      const price = parseFloat(d.price) || REAL[sym] || 1500;
      const base = REAL[sym] || price*0.98;
      const perc = ((price-base)/base*100);
      return {
        symbol: sym,
        close: base.toFixed(2),
        ltp: price.toFixed(2),
        perc: perc.toFixed(2),
        strike: getATM(price),
        buyer: d.clientName || d.client || "FII",
        isDisc: perc<0,
        Time: d.date || getIST(),
        real: true
      };
    });
    cache = {blocks, total:blocks.length, prem:blocks.filter(x=>!x.isDisc).length, disc:blocks.filter(x=>x.isDisc).length, source:"REAL NSE", scanTime:getIST()};
    return cache;
  }
  throw new Error("NSE Empty");
 }catch(e){
  console.log("NSE Fail, Using Simulation:", e.message);
  // FALLBACK SIMULATION 80% UP 2%
  const blocks=[];
  for(let s of STOCKS){
   const base = REAL[s]||1500;
   if(Math.random() > 0.6){ // Only 40% stocks show = Big player bought
     const isPrem = Math.random() < 0.8;
     const perc = 2 + Math.random()*2;
     const changePct = isPrem? perc : -perc;
     const ltp = base*(1+changePct/100);
     blocks.push({
       symbol:s, close:base.toFixed(2), ltp:ltp.toFixed(2), perc:changePct.toFixed(2),
       strike:getATM(ltp), buyer:["SBI MF","LIC","HDFC MF","ICICI MF","FII"][Math.floor(Math.random()*5)],
       isDisc:changePct<0, Time:getIST(), real:false
     });
   }
   if(blocks.length>=10) break;
  }
  cache={blocks,total:blocks.length,prem:blocks.filter(x=>!x.isDisc).length,disc:blocks.filter(x=>x.isDisc).length,source:"SIMULATION (NSE Fail)",scanTime:getIST()};
  return cache;
 }
}

app.get('/api/blocks', async (req,res)=>{if(!cache.blocks.length) await scan(); res.json(cache);});
app.get('/api/scan', async (req,res)=>{res.json(await scan());});
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(process.env.PORT||10000,()=>console.log('KUNDGOL V15 REAL NSE '+getIST()));
