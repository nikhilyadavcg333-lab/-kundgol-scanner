const express=require('express');
const app=express();
const PORT=process.env.PORT||10000;
app.use(express.static(__dirname));
let cache={data:[],time:''};
const LIST=["RELIANCE","TCS","INFY","HDFCBANK","ICICIBANK","SBIN","BHARTIARTL","ITC","KOTAKBANK","LT","AXISBANK","BAJFINANCE","ASIANPAINT","MARUTI","WIPRO","HCLTECH","SUNPHARMA","TITAN","ULTRACEMCO","BAJAJFINSV","ONGC","NTPC","POWERGRID","COALINDIA","TATASTEEL","JSWSTEEL","HINDALCO","ADANIENT","ADANIPORTS","M&M","BAJAJ-AUTO","EICHERMOTOR","HEROMOTOCO","DRREDDY","CIPLA","DIVISLAB","BRITANNIA","NESTLEIND","GRASIM","BPCL","INDUSINDBK","HINDUNILVR","SBILIFE","HDFCLIFE","ICICIPRULI","BANDHANBNK","BANKBARODA","CANBK","PNB","INDIGO","BEL","HAL","IRCTC","ZOMATO","POLYCAB","DMART","TRENT","VEDL","TATAMOTORS","IOC","GAIL","RECLTD","PFC","BHEL","SAIL"];
function gen(){let d=LIST.map(s=>{let b=100+Math.random()*3000,pc=(Math.random()*6-3),sp=b,old=sp/(1+pc/100);return{symbol:s,spot:+sp.toFixed(2),buy:+old.toFixed(2),prevClose:+old.toFixed(2),pChange:+pc.toFixed(2),surge:+(Math.random()*2.5+0.3).toFixed(2)}});cache.data=d;cache.time=new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'});}
app.get('/api/all',(q,r)=>{r.json({data:cache.data,time:cache.time,total:cache.data.length})});
app.get('/',(q,r)=>{r.sendFile(__dirname+'/index.html')});
gen();setInterval(gen,10000);
app.listen(PORT,()=>console.log(PORT));
