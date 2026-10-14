<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NIKHIL YADAV - V16 FII DII</title>
<style>
body{margin:0;background:#0a1931;color:#fff;font-family:Arial}
.header{background:linear-gradient(90deg,#0a1931,#102a5a);padding:12px;text-align:center;border-bottom:2px solid #ffcc00}
.title{color:#00ff88;font-size:17px;font-weight:bold}
.sub{color:#ffcc00;font-size:12px;margin-top:3px}
.livebar{background:#ffcc00;color:#000;padding:8px;text-align:center;font-weight:bold;border-radius:20px;margin:10px;font-size:13px}
.tabs{display:flex;gap:8px;padding:0 10px;justify-content:center;flex-wrap:wrap}
.tab{padding:8px 14px;border-radius:20px;border:1px solid #333;cursor:pointer;font-size:12px;font-weight:bold}
.tab.active{border-color:#00ff88;color:#00ff88;background:#00ff8820}
.tab.sell.active{border-color:#ff4444;color:#ff4444;background:#ff444420}
.tab.dii.active{border-color:#00aaff;color:#00aaff;background:#00aaff20}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px}
th{background:#111;color:#ffcc00;padding:8px 4px;font-size:10px}
td{padding:9px 4px;border-bottom:1px solid #222;text-align:center}
tr.buying{background:linear-gradient(90deg,#0a2e1a,#0f3d22)}
tr.selling{background:linear-gradient(90deg,#2e0a0a,#3d0f0f)}
.badge{padding:3px 7px;border-radius:12px;font-size:10px;font-weight:bold;display:inline-block}
.b-fii{background:#00ff8840;color:#00ff88;border:1px solid #00ff88}
.b-dii{background:#00aaff40;color:#00ccff;border:1px solid #00aaff}
.b-sfii{background:#ff444440;color:#ff8888;border:1px solid #ff4444}
.b-sdii{background:#aa00ff40;color:#cc88ff;border:1px solid #aa00ff}
.price{font-weight:bold;font-size:13px}
.old{color:#aaa;font-size:10px}
.opt{background:#ffcc0020;color:#ffcc00;padding:2px 5px;border-radius:4px;font-size:10px}
.pick{font-size:9px;font-weight:bold}
.fii-pick{color:#00ff88} .dii-pick{color:#00aaff}
</style>
</head>
<body>
<div class="header">
<div class="title">🔥 NIKHIL YADAV - FII + DII LIVE TRACKER V16</div>
<div class="sub">Old Price Correct + FII/DII Separate + Live Pick Point + All Conditions</div>
</div>
<div class="livebar" id="livebar">🔥 LIVE Loading 70 Stocks...</div>
<div class="tabs">
<div class="tab active" onclick="showTab('buy')" id="tbuy">🔥 FII BUY (0)</div>
<div class="tab dii" onclick="showTab('dii')" id="tdii">💎 DII BUY (0)</div>
<div class="tab sell" onclick="showTab('sell')" id="tsell">🛑 FII SELL (0)</div>
<div class="tab" onclick="showTab('all')" id="tall">📊 ALL 70</div>
</div>
<table>
<thead><tr><th>SYMBOL<br><span style="font-size:8px">Old Correct</span></th><th>STATUS<br><span style="font-size:8px">FII/DII + Pick</span></th><th>LIVE PRICE<br><span style="font-size:8px">Buying/Selling @</span></th><th>VOL<br><span style="font-size:8px">Surge</span></th><th>OPTIONS<br><span style="font-size:8px">CE/PE Pick</span></th></tr></thead>
<tbody id="tbody"><tr><td colspan="5" style="padding:30px;color:#555">Loading 70 stocks with correct old price...</td></tr></tbody>
</table>
<script>
let all=[], cur='buy';
function showTab(t){cur=t; document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active')); document.getElementById('t'+t).classList.add('active'); render();}
function getStatus(s){
 let pc=s.pChange, sg=s.surge;
 if(pc>0){
  if(sg>=2.0 && pc>=1.2) return {tag:'🔥 FII BUYING NOW', cls:'b-fii', type:'FII', pick:'⭐ LIVE PICK'};
  if(sg>=1.3 && pc>=0.6) return {tag:'💎 DII BUYING NOW', cls:'b-dii', type:'DII', pick:'🔹 DII PICK'};
  return {tag:'BUYING NOW', cls:'b-fii', type:'BUY', pick:''};
 }else{
  if(sg>=2.0 && pc<=-1.2) return {tag:'💥 FII SELLING NOW', cls:'b-sfii', type:'FII', pick:'⭐ LIVE SELL PICK'};
  if(sg>=1.3 && pc<=-0.6) return {tag:'🔻 DII SELLING NOW', cls:'b-sdii', type:'DII', pick:'🔹 DII SELL PICK'};
  return {tag:'SELLING NOW', cls:'b-sfii', type:'SELL', pick:''};
 }
}
function render(){
 let d=[];
 if(cur=='buy') d=all.filter(x=>x.pChange>0 && x.surge>=2).sort((a,b)=>b.surge-a.surge);
 else if(cur=='dii') d=all.filter(x=>x.pChange>0 && x.surge>=1.0 && x.surge<2.0).sort((a,b)=>b.pChange-a.pChange);
 else if(cur=='sell') d=all.filter(x=>x.pChange<0).sort((a,b)=>a.pChange-b.pChange);
 else d=all.sort((a,b)=>b.surge-a.surge);
 document.getElementById('tbody').innerHTML=d.map(s=>{
  let st=getStatus(s); let ce=Math.ceil(s.spot/50)*50; let pe=Math.floor(s.spot/50)*50;
  return `<tr class="${s.pChange>0?'buying':'selling'}">
   <td><b>${s.symbol}</b><br><span class="old">Old ₹${s.buy.toFixed(2)} ✓</span></td>
   <td><span class="badge ${st.cls}">${st.tag}</span><br><span class="pick ${st.type=='FII'?'fii-pick':'dii-pick'}">${st.pick}</span><br><span style="font-size:10px;color:#888">${new Date().toLocaleTimeString()}</span></td>
   <td><span class="price">₹${s.spot.toFixed(2)}</span><br><span class="opt">${s.pChange>0?'BUYING':'SELLING'} @ THIS PRICE</span></td>
   <td>🔥 ${s.surge.toFixed(2)}x<br>${s.pChange>0?'🚀':''}${s.pChange.toFixed(2)}%</td>
   <td><span class="opt">${s.pChange>0?'CE':'PE'} ${s.pChange>0?ce:pe}</span><br><span style="font-size:9px">${st.type}</span></td>
  </tr>`;
 }).join('') || `<tr><td colspan="5" style="padding:20px;color:#555">No data for ${cur}</td></tr>`;
}
async function load(){
 try{
  let r=await fetch('/api/all',{cache:'no-store'}); let j=await r.json(); all=j.data||[];
  let fiiBuy=all.filter(x=>x.pChange>0 && x.surge>=2).length;
  let diiBuy=all.filter(x=>x.pChange>0 && x.surge>=1.3 && x.surge<2).length;
  let sell=all.filter(x=>x.pChange<0).length;
  document.getElementById('livebar').innerText=`🔥 LIVE ${j.time} | Old Price Correct ✓ | ${fiiBuy} FII BUY | ${diiBuy} DII BUY | ${sell} SELL | 70 Stocks`;
  document.getElementById('tbuy').innerText=`🔥 FII BUY (${fiiBuy})`; document.getElementById('tdii').innerText=`💎 DII BUY (${diiBuy})`;
  document.getElementById('tsell').innerText=`🛑 SELL (${sell})`; document.getElementById('tall').innerText=`📊 ALL 70`; render();
 }catch(e){}
}
load(); setInterval(load,10000);
</script>
</body>
</html>
