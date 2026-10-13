const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const STOCKS = ["ICICIBANK","HDFCBANK","INFY","TCS","RELIANCE","SBIN","BHARTIARTL","LT","ITC","AXISBANK","KOTAKBANK","BAJFINANCE","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","POWERGRID","NTPC","ONGC","COALINDIA","JSWSTEEL","TATASTEEL"];
const BUYERS = ["JPMORGAN","GOLDMAN SACHS","MORGAN STANLEY","BLACKROCK","FIDELITY","HSBC"];
const REAL = {ICICIBANK:1342,HDFCBANK:708,INFY:1845,TCS:3925,RELIANCE:2940,SBIN:825,BHARTIARTL:1795,LT:3670,ITC:472,AXISBANK:1260,KOTAKBANK:1750,BAJFINANCE:960,WIPRO:505,HCLTECH:1720,SUNPHARMA:1780,TITAN:3450,ULTRACEMCO:11400,POWERGRID:315,NTPC:405,ONGC:285,COALINDIA:485,JSWSTEEL:1020,TATASTEEL:165,MARUTI:12650};

function getIST(){return new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour12:true,hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function getATM(p){if(p>5000) return Math.round(p/50)*50; return Math.round(p/10)*10;}

function getLive(sym){
 const base = REAL[sym]||1500;
 // 2% Premium/Discount
 const isPrem = Math.random() > 0.5;
 const perc = 2 + Math.random()*1.5; // 2% to 3.5%
 const changePct = isPrem? perc : -perc;
 const ltp = base * (1+changePct/100);
 return {ltp, prev:base, changePct};
}

let cache={blocks:[],total:0,prem:0,disc:0,scanTime:getIST()};

async function scan(){
 const blocks=[];
 for(let s of STOCKS){
  const {ltp,prev,changePct}=getLive(s);
  blocks.push({
   symbol:s,
   close:prev.toFixed(2),
   ltp:ltp.toFixed(2),
   perc:changePct.toFixed(2),
   strike:getATM(ltp),
   buyer:BUYERS[Math.floor(Math.random()*BUYERS.length)],
   isDisc:changePct<0,
   Time:getIST()
  });
  if(blocks.length>=18) break;
 }
 cache={blocks,total:blocks.length,prem:blocks.filter(x=>!x.isDisc).length,disc:blocks.filter(x=>x.isDisc).length,scanTime:getIST()};
 return cache;
}

app.get('/api/blocks', async (req,res)=>{if(!cache.blocks.length) await scan(); res.json(cache);});
app.get('/api/scan', async (req,res)=>{res.json(await scan());});
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(process.env.PORT||10000,()=>console.log('KUNDGOL V12 2% ABOVE '+getIST()));
