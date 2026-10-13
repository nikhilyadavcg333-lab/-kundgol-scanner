const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const STOCKS = [
  "ICICIBANK","HDFCBANK","INFY","TCS","RELIANCE","SBIN","BHARTIARTL","LT","ITC","AXISBANK","KOTAKBANK","BAJFINANCE","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","PERSISTENT","COFORGE","HAL","BEL","TRENT",
  "ADANIENT","ADANIPORTS","APOLLOHOSP","AUROPHARMA","BANDHANBNK","BANKBARODA","BHEL","CANBK","CONCOR","CUMMINS","DELTACORP","ESCORTS","FEDERALBNK","GODREJPROP","IDFCFIRSTB","INDHOTEL","IRCTC","JINDALSTEL","LUPIN","MUTHOOTFIN","NATIONALUM","MPHASIS","OFSS","POLYCAB","SAIL","TATACOMM","VOLTAS"
];

const REAL = {
  ICICIBANK:1342,HDFCBANK:708,INFY:1845,TCS:3925,RELIANCE:2940,SBIN:825,BHARTIARTL:1795,LT:3670,ITC:472,AXISBANK:1260,KOTAKBANK:1750,BAJFINANCE:960,MARUTI:12650,WIPRO:505,HCLTECH:1720,SUNPHARMA:1780,TITAN:3450,ULTRACEMCO:11400,PERSISTENT:5845,COFORGE:7890,HAL:4640,BEL:285,TRENT:6250,
  ADANIENT:3250,ADANIPORTS:1450,APOLLOHOSP:6450,AUROPHARMA:1120,BANDHANBNK:210,BANKBARODA:250,BHEL:235,CANBK:110,CONCOR:950,CUMMINS:3550,DELTACORP:145,ESCORTS:3650,FEDERALBNK:205,GODREJPROP:2850,IDFCFIRSTB:78,INDHOTEL:620,IRCTC:1020,JINDALSTEL:980,LUPIN:1680,MUTHOOTFIN:1850,NATIONALUM:195,MPHASIS:2850,OFSS:9850,POLYCAB:6850,SAIL:135,TATACOMM:1750,VOLTAS:1650
};

const LARGE_LIST = ["ICICIBANK","HDFCBANK","INFY","TCS","RELIANCE","SBIN","BHARTIARTL","LT","ITC","AXISBANK","KOTAKBANK","BAJFINANCE","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","PERSISTENT","COFORGE","HAL","BEL","TRENT"];

function getIST(){return new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour12:true})}
function getATM(p){if(p>5000) return Math.round(p/50)*50; return Math.round(p/10)*10;}

let cache={blocks:[],source:"LOADING",total:0,prem:0,disc:0,scanTime:getIST()};

async function scan(){
 try{
  const res = await fetch('https://www.nseindia.com/api/live-analysis/bulk-block-deals', {headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.nseindia.com/'}});
  const data = await res.json();
  if(data && data.data && data.data.length){
    const blocks = data.data.slice(0,20).map(d=>{
      const sym = d.symbol; const price = parseFloat(d.price) || REAL[sym] || 1500; const base = REAL[sym] || price*0.98; const perc = ((price-base)/base*100);
      return {symbol:sym, close:base.toFixed(2), ltp:price.toFixed(2), perc:perc.toFixed(2), strike:getATM(price), lot:500, buyer:d.clientName||"FII", isDisc:perc<0, Time:d.date||getIST(), real:true, cat: LARGE_LIST.includes(sym)?'LARGE':'MIDCAP'};
    });
    cache = {blocks, total:blocks.length, prem:blocks.filter(x=>!x.isDisc).length, disc:blocks.filter(x=>x.isDisc).length, source:"REAL NSE", scanTime:getIST()};
    return cache;
  }
  throw new Error("Empty");
 }catch(e){
  const blocks=[];
  for(let s of STOCKS){
   if(Math.random() > 0.55){
     const base = REAL[s]||1500; const isPrem = Math.random() < 0.8; const perc = 2 + Math.random()*2.5; const changePct = isPrem? perc : -perc; const ltp = base*(1+changePct/100);
     blocks.push({symbol:s, close:base.toFixed(2), ltp:ltp.toFixed(2), perc:changePct.toFixed(2), strike:getATM(ltp), lot:500, buyer:["SBI MF","LIC","HDFC MF","ICICI MF","FII"][Math.floor(Math.random()*5)], isDisc:changePct<0, Time:getIST(), real:false, cat: LARGE_LIST.includes(s)?'LARGE':'MIDCAP'});
   }
   if(blocks.length>=18) break;
  }
  cache={blocks,total:blocks.length,prem:blocks.filter(x=>!x.isDisc).length,disc:blocks.filter(x=>x.isDisc).length,source:"SIMULATION (NSE Market Closed)",scanTime:getIST()};
  return cache;
 }
}
app.get('/api/blocks', async (req,res)=>{if(!cache.blocks.length) await scan(); res.json(cache);});
app.get('/api/scan', async (req,res)=>{res.json(await scan());});
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(process.env.PORT||10000,()=>console.log('V16 MIDCAP LIVE '+getIST()));
