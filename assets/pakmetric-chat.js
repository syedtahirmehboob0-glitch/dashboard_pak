(() => {
  const css = `
#pm-chat{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
#pm-chat *{box-sizing:border-box}
.pm-chat-btn{width:56px;height:56px;border:0;border-radius:50%;background:#0b6b45;color:#fff;font-size:24px;box-shadow:0 10px 28px rgba(16,35,27,.22);cursor:pointer}
.pm-chat-panel{display:none;position:absolute;right:0;bottom:68px;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 105px));background:#fff;color:#10231b;border:1px solid #dfe6e1;border-radius:18px;box-shadow:0 18px 50px rgba(16,35,27,.2);overflow:hidden}
.pm-chat-panel.open{display:flex;flex-direction:column}
.pm-chat-head{display:flex;justify-content:space-between;align-items:center;padding:13px 15px;background:#0b6b45;color:#fff}
.pm-chat-head b{font-size:1rem}.pm-chat-head small{display:block;color:#d8e8df;font-size:.68rem;margin-top:2px}
.pm-chat-close{background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer}
.pm-chat-msgs{flex:1;overflow:auto;padding:12px;background:#f5f7f4}
.pm-msg{max-width:88%;padding:9px 11px;margin:0 0 9px;border-radius:12px;font-size:.86rem;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.pm-msg.user{margin-left:auto;background:#0b6b45;color:#fff;border-bottom-right-radius:4px}
.pm-msg.bot{background:#fff;border:1px solid #dfe6e1;border-bottom-left-radius:4px}
.pm-chat-foot{padding:10px;border-top:1px solid #dfe6e1;background:#fff}
.pm-chat-row{display:flex;gap:7px}.pm-chat-row textarea{flex:1;resize:none;min-height:42px;max-height:100px;padding:9px;border:1px solid #cbd8d1;border-radius:10px;font:inherit;color:#10231b;background:#fff}
.pm-chat-send{border:0;border-radius:10px;padding:0 13px;background:#0b6b45;color:#fff;font-weight:800;cursor:pointer}
.pm-chat-send:disabled{opacity:.55;cursor:wait}
.pm-chat-note{font-size:.62rem;color:#71857b;margin-top:5px}
`;
  const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);\n  if(location.pathname === "/" || location.pathname === "/index.html"){
    const dashboardCss = `
/* PakDigitalDashboard engineering UI refresh — dashboard only */
:root{--bg:#06110d;--panel:#0c1b15;--panel2:#10251c;--line:#244536;--acc:#35e6a0;--mut:#9bb9ac;--tx:#f0f7f3}
body{background:radial-gradient(900px 500px at 85% -8%,rgba(35,111,80,.42),transparent 62%),linear-gradient(180deg,#06110d 0%,#07150f 55%,#06110d 100%);letter-spacing:.002em}
.wrap{max-width:1240px;padding:18px clamp(14px,3vw,28px) 28px}
header{position:sticky;top:0;z-index:80;margin:0 -1px 10px;padding:12px 0;background:rgba(6,17,13,.86);backdrop-filter:blur(14px);border-bottom:1px solid rgba(53,230,160,.10)}
header h1{font-size:clamp(1.25rem,2.5vw,1.65rem);letter-spacing:-.025em}header .sub{max-width:520px}
.bar{gap:6px}.bar button,.bar select{min-height:38px;border-radius:11px;background:#0d2118;border-color:#2a4a3b}
#clock{font-size:.75rem;border-radius:11px;background:#0a1a13}
.quick-nav{padding:6px 0 14px;gap:8px}.quick-nav a{background:rgba(12,31,23,.82);padding:8px 13px;border-color:#294839;font-weight:650}
.dashboard-toolbar{padding:20px;border-radius:24px;background:linear-gradient(145deg,rgba(17,49,36,.96),rgba(8,24,18,.9));border-color:rgba(53,230,160,.22);box-shadow:0 22px 60px rgba(0,0,0,.22)}
.dashboard-title{margin-bottom:16px}.dashboard-title h2{letter-spacing:-.035em}.dashboard-eyebrow,.section-heading .sh-kicker{letter-spacing:.14em}
.dashboard-cards{gap:10px}.dashboard-card{min-height:58px;padding:12px 13px;border-radius:15px;background:rgba(10,29,21,.82);border-color:#294839}.dashboard-card .dc-icon{background:#163a2b;border:1px solid #275642}
.snapshot-grid::before{content:"LIVE NATIONAL SNAPSHOT";color:#68dca9;margin-top:28px}.grid{gap:12px}.card{border-radius:18px;padding:16px;background:linear-gradient(145deg,#0d2018,#0b1a14);box-shadow:0 10px 30px rgba(0,0,0,.14)}.card:hover{box-shadow:0 16px 34px rgba(0,0,0,.2)}.card .v{font-size:clamp(1.55rem,3vw,1.9rem);letter-spacing:-.025em}.card .k{font-weight:600}
.section-shell{border-radius:22px;padding:18px;background:rgba(8,24,18,.5);border-color:rgba(36,69,54,.8);box-shadow:0 12px 34px rgba(0,0,0,.12)}
.section-heading{margin:4px 0 12px}.section-heading h2{letter-spacing:-.02em}.section-heading p{line-height:1.5}
.box,.market-card,.tool,.gov,.ranking-card{border-radius:18px;background:linear-gradient(145deg,#0d2018,#0b1b15);border-color:#244536;box-shadow:0 10px 28px rgba(0,0,0,.13)}
.box{padding:16px}.tool{padding:16px}.gov{padding:15px}.market-card{padding:16px}.ranking-card{padding:15px}
input,select,button{min-height:40px;border-radius:11px}input:focus,select:focus,button:focus-visible{outline:2px solid rgba(53,230,160,.75);outline-offset:2px}
.calc-btn{min-height:42px;border-radius:12px;box-shadow:0 8px 18px rgba(53,230,160,.12)}
.hero{border-radius:24px;padding:26px;background:linear-gradient(135deg,#123d2c,#0b2118 62%,#102a20);border-color:#2a624c;box-shadow:0 22px 55px rgba(0,0,0,.2)}.hero h2{letter-spacing:-.04em}.hero-kpi{border-radius:15px;background:rgba(4,17,12,.5)}
.live-board{gap:14px}.market-card .big{letter-spacing:-.035em}.data-status{padding-top:4px}
.ad-slot{border-style:dashed;border-color:#315947;background:linear-gradient(135deg,rgba(12,35,26,.72),rgba(7,21,15,.72));min-height:82px}
.dashboard-divider{margin:30px 0 6px}
footer.site-footer{margin-top:24px;padding-top:20px;line-height:1.6}
@media(max-width:720px){header{position:relative}.wrap{padding-inline:12px}.dashboard-toolbar{padding:15px;border-radius:20px}.hero{padding:19px;border-radius:20px}.section-shell{padding:13px;border-radius:18px}.card{padding:14px}.section-heading{margin-top:2px}.section-heading p{max-width:none}.ad-slot{min-height:72px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
`;
    const s=document.createElement("style");s.id="dashboard-engineering-ui";s.textContent=dashboardCss;document.head.appendChild(s);
  }

  const root=document.createElement("div");root.id="pm-chat";root.innerHTML=`
<button class="pm-chat-btn" aria-label="Open PakMetric AI" title="PakMetric AI">✦</button>
<div class="pm-chat-panel" role="dialog" aria-label="PakMetric AI">
  <div class="pm-chat-head"><div><b>PakMetric AI</b><small>Ask about Pakistan data, debt, markets & calculators</small></div><button class="pm-chat-close" aria-label="Close">×</button></div>
  <div class="pm-chat-msgs"><div class="pm-msg bot">Hi! Ask me about Pakistan's economy, debt, inflation, markets, remittances, or the data on this page.</div></div>
  <div class="pm-chat-foot"><div class="pm-chat-row"><textarea placeholder="Ask PakMetric AI..." rows="1"></textarea><button class="pm-chat-send">Send</button></div><div class="pm-chat-note">AI answers can be wrong. Check the cited source/date for important decisions.</div></div>
</div>`;
  document.body.appendChild(root);
  const panel=root.querySelector(".pm-chat-panel"), msgs=root.querySelector(".pm-chat-msgs"), ta=root.querySelector("textarea"), send=root.querySelector(".pm-chat-send");
  const history=[];
  root.querySelector(".pm-chat-btn").onclick=()=>{panel.classList.toggle("open");if(panel.classList.contains("open"))ta.focus()};
  root.querySelector(".pm-chat-close").onclick=()=>panel.classList.remove("open");
  const add=(role,text)=>{const el=document.createElement("div");el.className="pm-msg "+role;el.textContent=text;msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;return el};
  const ask=async()=>{
    const q=ta.value.trim();if(!q||send.disabled)return;
    ta.value="";add("user",q);history.push({role:"user",content:q});send.disabled=true;send.textContent="…";
    const pending=add("bot","Thinking…");
    try{
      const context=(document.querySelector("main")||document.body).innerText.slice(0,8000);
      const r=await fetch("/.netlify/functions/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history,context})});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Request failed");
      pending.textContent=d.answer||"No answer returned.";history.push({role:"assistant",content:d.answer||""});
    }catch(e){pending.textContent=e.message||"The AI service is temporarily unavailable."}
    finally{send.disabled=false;send.textContent="Send";ta.focus()}
  };
  send.onclick=ask;ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask()}});
})();