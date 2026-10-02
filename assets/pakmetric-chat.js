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
  const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
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