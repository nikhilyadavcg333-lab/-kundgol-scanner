const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(__dirname));

const STOCKS = ["RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK","SBIN","BHARTIARTL","ITC","KOTAKBANK","LT","AXISBANK","BAJFINANCE","ASIANPAINT","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","BAJAJFINSV","ONGC","NTPC","POWERGRID","COALINDIA","TATASTEEL","JSWSTEEL","HINDALCO","ADANIENT","ADANIPORTS","M&M","BAJAJ-AUTO","EICHERMOTOR","HEROMOTOCO","DRREDDY","CIPLA","DIVISLAB","BRITANNIA","NESTLEIND","GRASIM","BPCL","INDUSINDBK","HINDUNILVR","SBILIFE","HDFCLIFE","ICICIPRULI","BAJAJHLDNG","SHREECEM","PIDILITIND","BANDHANBNK","BANKBARODA","AUBANK","CANBK","PNB","INDIGO","BEL","HAL","IRCTC","ZOMATO","PAYTM","POLYCAB","DMART","TRENT","VEDL","TATAMOTORS","TATAPOWER","IOC","GAIL","RECLTD","PFC","BHEL","SAIL"];

let cache = {data:[], time:''};

async function fetchLive(){
 try{
  let data=[];
  for(let sym of STOCKS){
   try{
    let url=`https://www.nseindia.com/api/quote-equity?symbol=${sym}`;
    let r=await axios.get(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}, timeout:3000}).catch(()=>null);
    let d = r?.data?.priceInfo;
    if(d){
      let spot = d.lastPrice || d.ltp || 0;
      let prevClose = d.previousClose || d.close || d.intraDayHighLow?.close || 0;
      let pChange = d.pChange || ((spot-prevClose)/prevClose*100) || 0;
      // CORRECT OLD PRICE = Yesterday Close
      let correctOld = prevClose && prevClose>0 ? prevClose : (spot / (1 + pChange/100));
      data.push({
        symbol: sym,
        spot: Number(spot),
        buy: Number(correctOld), // CORRECTED OLD PRICE
        prevClose: Number(correctOld),
        pChange: Number(pChange),
        surge: Number((Math.random()*1.5+0.5).toFixed(2)), // Volume ratio - Replace with real volume logic
        volume: d.quantityTraded || 0
      });
    }
   }catch(e){}
  }
  if(data.length>10){ cache.data=data; cache.time=new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'}); }
 }catch(e){console.log("Fetch error",e.message)}
}

app.get('/api/all',(req,res)=>{
 res.json({data:cache.data, time:cache.time, total:cache.data.length});
});

app.get('/',(req,res)=>{res.sendFile(__dirname+'/index.html');});

setInterval(fetchLive, 15000);
fetchLive();

app.listen(PORT,()=>console.log(`Running on ${PORT}`));
