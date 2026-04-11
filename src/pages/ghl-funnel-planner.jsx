import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_SYSTEM_PROMPT = `You are a funnel strategy specialist helping small business owners and coaches plan their complete sales funnels through a warm, friendly conversation — one question at a time, no jargon, no overwhelm.

You represent SaaSy Funnels by Meg Burrage. Your tone is warm, encouraging, plain-spoken, and a little bit sassy. You're helping people who may have never built a funnel before.

PLAIN ENGLISH RULES:
- Never say "lead magnet" — say "freebie" or "free thing you're giving away"
- Never say "opt-in" — say "sign-up" or "where they enter their details"
- Never say "conversion" — say "when someone buys" or "turning a visitor into a customer"
- Never say "funnel stages" — say "steps in the journey"
- Never say "nurture sequence" — say "follow-up emails"
- Never say "upsell" / "downsell" / "order bump" — say "add-on", "one-time offer", or "extra offer after checkout"
- Never say "CTA" — say "button" or "next step"
- Never say "above the fold" — say "first thing they see"
- Say "your audience" or "your people" not "target market" or "ICP"
- Say "their journey" not "the funnel"

INTAKE PROCESS — ask ONE question at a time, in this order:
1. Ask what their main goal is — are they trying to grow their email list, sell a course, fill a program, book discovery calls, or something else?
2. Ask who their audience is — who are they trying to help? What's going on for that person right now?
3. Ask how people will first find them or enter the journey. Give examples: a free download (like a guide or checklist), a webinar or masterclass, a challenge, a quiz, a free training, or going straight to a sales page.
4. Based on their entry point, ask what they're giving away or offering at that step — what's the name or topic?
5. Ask what they want people to do next after they sign up or attend — do they have a product or service to sell? What is it, what's it called, and roughly what does it cost?
6. Ask how many follow-up emails they want to send before pitching their offer — or ask if they want guidance on this.
7. Ask what the emails should focus on — building trust? Teaching something? Sharing their story? A mix?
8. Ask if they have anything extra to offer after someone buys — a bonus add-on, a one-time deal, or an upgrade.
9. Ask if there's any other step in the journey that's important to them — a discovery call, a community, a membership, anything like that.
10. Ask a cleanup question: "Once someone buys, is there anything they should stop receiving — like the sales emails — so they don't get awkward messages after they've already become a customer?"
11. Confirm you have everything and say exactly: "Love it — I have everything I need to map your funnel! Give me a moment." Then output ONLY the JSON below.

FUNNEL STRATEGY GUIDANCE — share naturally in conversation when relevant:
- A 3–5 email nurture sequence before pitching is a good starting point for warm audiences; 5–7 for colder audiences
- Webinar or challenge funnels typically convert better because people get value upfront before the ask
- A freebie funnel works well for list building and is the simplest to start with
- Order bumps (add-ons at checkout) typically add 20–30% to average order value and are worth including
- The goal isn't to have the perfect funnel — it's to have a working one first

RULES:
- ONE question at a time — never stack multiple questions in one message
- Be warm, encouraging, and conversational — like a knowledgeable friend
- If they seem unsure, offer them 2–3 concrete options to choose from
- Use their actual product and audience language throughout — mirror it back to them
- When ready, say exactly: "Love it — I have everything I need to map your funnel! Give me a moment." Then output ONLY the JSON below.

OUTPUT FORMAT:
\`\`\`json
{
  "planName": "string",
  "goal": "string",
  "audience": "string",
  "stages": [
    {
      "id": 1,
      "type": "Entry Point|Nurture|Sales Page|Order Bump|Post-Purchase|Discovery Call|Upsell|Community|Other",
      "title": "string",
      "description": "string",
      "platform": "string or null",
      "emails": [
        { "number": 1, "subject": "string", "focus": "string", "timing": "string" }
      ],
      "actions": [
        { "type": "Tag|Sequence|Remove Tag|Remove Sequence|Notification|Other", "description": "string" }
      ],
      "offer": {
        "name": "string or null",
        "price": "string or null",
        "type": "Freebie|Tripwire|Core Offer|Order Bump|Upsell|Downsell|null"
      }
    }
  ],
  "cleanupSteps": ["string"],
  "totalEmails": 0,
  "estimatedLength": "string",
  "quickWins": ["string"],
  "notes": "string"
}
\`\`\`
After the JSON, one warm closing sentence only.`;

const SEARCH_PROMPT = `Search for any new GoHighLevel or general sales funnel trends, strategies, or tools released or discussed in the last 90 days. Focus on what's working for coaches and course creators. Return a brief plain-English summary. If nothing significant, say "No major updates found." Keep it under 150 words.`;

const PROMPTS = [
  "Grow my email list with a freebie and turn subscribers into buyers",
  "Fill my online course or program",
  "Book more discovery calls for my coaching",
  "Run a webinar or masterclass funnel",
  "Map out a full launch funnel from scratch",
];

const STAGE_COLORS = {
  "Entry Point":   { bg:"rgba(0,200,160,0.1)",   border:"#00C8A0", icon:"🚀" },
  "Nurture":       { bg:"rgba(244,84,122,0.1)",   border:"#F4547A", icon:"💌" },
  "Sales Page":    { bg:"rgba(107,53,200,0.12)",  border:"#6B35C8", icon:"💰" },
  "Order Bump":    { bg:"rgba(255,107,43,0.12)",  border:"#FF6B2B", icon:"⚡" },
  "Post-Purchase": { bg:"rgba(0,200,160,0.1)",    border:"#00C8A0", icon:"🎉" },
  "Discovery Call":{ bg:"rgba(59,130,246,0.12)",  border:"#3B82F6", icon:"📞" },
  "Upsell":        { bg:"rgba(168,85,247,0.12)",  border:"#A855F7", icon:"🔝" },
  "Community":     { bg:"rgba(107,53,200,0.12)",  border:"#6B35C8", icon:"👥" },
  "Other":         { bg:"rgba(255,255,255,0.04)", border:"#6B7280", icon:"📌" },
};

const OFFER_COLORS = {
  "Freebie":    { bg:"rgba(0,200,160,0.15)",  border:"#00C8A0", text:"#00C8A0" },
  "Tripwire":   { bg:"rgba(255,107,43,0.12)", border:"#FF6B2B", text:"#FF6B2B" },
  "Core Offer": { bg:"rgba(107,53,200,0.15)", border:"#6B35C8", text:"#C4A0FF" },
  "Order Bump": { bg:"rgba(255,107,43,0.12)", border:"#FF6B2B", text:"#FF6B2B" },
  "Upsell":     { bg:"rgba(168,85,247,0.15)", border:"#A855F7", text:"#D8B4FE" },
  "Downsell":   { bg:"rgba(244,84,122,0.12)", border:"#F4547A", text:"#F4547A" },
};

const ghlBg      = "#0D0D0D";
const ghlSurface = "#141414";
const ghlCard    = "#1A1A1A";
const ghlBorder  = "rgba(255,255,255,0.08)";
const ghlText    = "#F0EAF8";
const ghlMuted   = "rgba(240,234,248,0.45)";
const ghlPink    = "#F4547A";
const ghlPurple  = "#6B35C8";
const ghlOrange  = "#FF6B2B";

const sfGradient = "linear-gradient(135deg,#F4547A,#6B35C8)";
const pinkGrad   = "linear-gradient(135deg,#F4547A,#c73060)";
const purpleGrad = "linear-gradient(135deg,#6B35C8,#4A1A9E)";

const btn = (extra={}) => ({
  border:"none", borderRadius:8, padding:"10px 16px", cursor:"pointer",
  fontSize:13, fontFamily:"'DM Sans',sans-serif", color:"#fff",
  fontWeight:600, letterSpacing:"0.01em", ...extra
});

function encodeSpec(data){try{return btoa(encodeURIComponent(JSON.stringify(data)));}catch(e){return "";}}
function decodeSpec(str){try{return JSON.parse(decodeURIComponent(atob(str)));}catch(e){return null;}}
function getShareUrl(data){const e=encodeSpec(data);const base=window.location.href.split("?")[0];return `${base}?spec=${e}`;}

function SFLogo({size=32}){
  return <div style={{width:size,height:size,borderRadius:10,background:sfGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.4,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif",letterSpacing:"-0.02em",flexShrink:0}}>SF</div>;
}

function TopNav({onBack}){
  return(
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(13,13,13,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(107,53,200,0.2)",padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {onBack&&<button onClick={onBack} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"6px 12px",color:"rgba(240,234,248,0.5)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5,marginRight:4}} onMouseEnter={e=>{e.currentTarget.style.color=ghlText;e.currentTarget.style.borderColor="rgba(107,53,200,0.4)";}} onMouseLeave={e=>{e.currentTarget.style.color="rgba(240,234,248,0.5)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>← Dashboard</button>}
        <SFLogo size={32}/>
        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:16,fontWeight:700,color:ghlText,letterSpacing:"-0.01em"}}>SaaSy Funnels</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"4px 6px",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{padding:"5px 14px",borderRadius:6,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:"transparent",color:ghlMuted}}>Kajabi</div>
        <div style={{padding:"5px 14px",borderRadius:6,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:sfGradient,color:"#fff"}}>GHL</div>
      </div>
    </div>
  );
}

function Dots(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"14px 18px",background:"rgba(255,255,255,0.04)",border:"1px solid "+ghlBorder,borderRadius:"0 18px 18px 18px"}}>
      {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:ghlPink,animation:"ghlBounce 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>)}
    </div>
  );
}

function Bubble({msg}){
  const u=msg.role==="user";
  return(
    <div style={{display:"flex",justifyContent:u?"flex-end":"flex-start",marginBottom:14,animation:"ghlFadeUp 0.3s ease forwards"}}>
      {!u&&<div style={{width:34,height:34,borderRadius:"50%",background:sfGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,marginTop:2,color:"#fff",fontWeight:700}}>✦</div>}
      <div style={{maxWidth:"72%",background:u?sfGradient:"rgba(255,255,255,0.05)",color:u?"#fff":ghlText,padding:"13px 18px",borderRadius:u?"18px 18px 4px 18px":"0 18px 18px 18px",fontSize:14.5,lineHeight:1.65,border:u?"none":"1px solid "+ghlBorder,boxShadow:u?"0 4px 20px rgba(244,84,122,0.25)":"none",whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif"}}>{msg.content}</div>
    </div>
  );
}

function EmailRow({email}){
  return(
    <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
      <div style={{minWidth:22,height:22,borderRadius:"50%",background:"rgba(244,84,122,0.2)",border:"1px solid rgba(244,84,122,0.5)",color:"#F4547A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:2}}>{email.number}</div>
      <div style={{flex:1,background:"rgba(244,84,122,0.06)",border:"1px solid rgba(244,84,122,0.15)",borderRadius:8,padding:"8px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:3}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:600,color:ghlText,lineHeight:1.4}}>{email.subject}</div>
          {email.timing&&<span style={{fontSize:10,color:ghlOrange,background:"rgba(255,107,43,0.12)",border:"1px solid rgba(255,107,43,0.3)",borderRadius:20,padding:"1px 7px",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{email.timing}</span>}
        </div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:ghlMuted,lineHeight:1.5}}>{email.focus}</div>
      </div>
    </div>
  );
}

function StageCard({stage,idx}){
  const c=STAGE_COLORS[stage.type]||STAGE_COLORS["Other"];
  const offerStyle=stage.offer?.type?OFFER_COLORS[stage.offer.type]:null;
  return(
    <div style={{background:ghlCard,border:`1px solid ${c.border}44`,borderRadius:14,overflow:"hidden",marginBottom:4,boxShadow:`0 4px 24px ${c.border}15`}}>
      <div style={{background:`linear-gradient(135deg,${c.border}22,${c.border}08)`,borderBottom:`2px solid ${c.border}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${c.border},${c.border}99)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,fontWeight:700,color:c.border,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2,fontFamily:"'DM Sans',sans-serif"}}>Stage {idx+1} · {stage.type}</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:ghlText}}>{stage.title}</div>
        </div>
        {stage.offer?.type&&offerStyle&&(
          <div style={{background:offerStyle.bg,border:`1px solid ${offerStyle.border}`,borderRadius:20,padding:"4px 10px",fontSize:10,color:offerStyle.text,fontFamily:"'DM Sans',sans-serif",fontWeight:700,flexShrink:0}}>
            {stage.offer.type}{stage.offer.price?` · ${stage.offer.price}`:""}
          </div>
        )}
      </div>
      <div style={{padding:"14px 16px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,margin:"0 0 12px",lineHeight:1.6}}>{stage.description}</p>
        {stage.offer?.name&&(
          <div style={{background:offerStyle?offerStyle.bg:"rgba(107,53,200,0.1)",border:`1px solid ${offerStyle?offerStyle.border:ghlPurple}55`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{stage.offer.type==="Freebie"?"🎁":stage.offer.type==="Core Offer"?"💎":stage.offer.type==="Order Bump"?"⚡":"🔝"}</span>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:offerStyle?offerStyle.text:"#C4A0FF",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{stage.offer.type||"Offer"}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:ghlText}}>{stage.offer.name}</div>
            </div>
          </div>
        )}
        {stage.emails?.length>0&&(
          <div style={{marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:"#F4547A",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>💌 {stage.emails.length} Email{stage.emails.length!==1?"s":""} in this stage</div>
            {stage.emails.map((email,i)=><EmailRow key={i} email={email}/>)}
          </div>
        )}
        {stage.actions?.length>0&&(
          <div style={{marginTop:8,paddingTop:8,borderTop:`1px dashed ${ghlBorder}`}}>
            <div style={{fontSize:10,fontWeight:700,color:ghlOrange,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>⚙ Behind the scenes</div>
            {stage.actions.map((action,i)=>(
              <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:ghlMuted,marginBottom:3,paddingLeft:8,borderLeft:"2px solid rgba(255,107,43,0.3)"}}>{action.description}</div>
            ))}
          </div>
        )}
        {stage.platform&&<div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.04)",border:"1px solid "+ghlBorder,borderRadius:20,padding:"3px 10px",fontSize:11,color:ghlMuted,fontFamily:"'DM Sans',sans-serif"}}>📍 {stage.platform}</div>}
      </div>
    </div>
  );
}

function FunnelMap({data}){
  const stages=data.stages||[];
  return(
    <div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{display:"inline-block",background:sfGradient,color:"#fff",borderRadius:100,padding:"5px 18px",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>✦ Funnel Map · {stages.length} Stage{stages.length!==1?"s":""}</div>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:20,color:ghlText,margin:"0 0 6px"}}>{data.planName}</h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:ghlMuted,margin:"0 0 8px"}}>{data.goal}</p>
        <div style={{display:"inline-flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {data.totalEmails>0&&<span style={{fontSize:12,color:"#F4547A",fontFamily:"'DM Sans',sans-serif"}}>💌 {data.totalEmails} emails total</span>}
          {data.estimatedLength&&<span style={{fontSize:12,color:ghlOrange,fontFamily:"'DM Sans',sans-serif"}}>⏱ {data.estimatedLength}</span>}
        </div>
      </div>
      {data.audience&&(
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,200,160,0.3)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,lineHeight:1.6}}>
          👥 <strong style={{color:ghlText}}>Your audience:</strong> {data.audience}
        </div>
      )}
      {stages.map((stage,i)=>(
        <div key={stage.id}>
          <StageCard stage={stage} idx={i}/>
          {i<stages.length-1&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"6px 0"}}>
              <div style={{width:2,height:14,background:"rgba(196,160,255,0.2)"}}/>
              <div style={{fontSize:11,color:"rgba(196,160,255,0.4)",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>↓</div>
              <div style={{width:2,height:14,background:"rgba(196,160,255,0.2)"}}/>
            </div>
          )}
        </div>
      ))}
      {data.cleanupSteps?.length>0&&(
        <div style={{marginTop:16,background:"rgba(255,60,60,0.06)",border:"1px solid rgba(255,60,60,0.2)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#FF6B6B",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>🧹 Cleanup — once someone buys</div>
          {data.cleanupSteps.map((step,i)=><div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,marginBottom:4,paddingLeft:8,borderLeft:"2px solid rgba(255,60,60,0.3)"}}>{step}</div>)}
        </div>
      )}
      {data.quickWins?.length>0&&(
        <div style={{marginTop:16,background:"rgba(0,200,160,0.06)",border:"1px solid rgba(0,200,160,0.2)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#00C8A0",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>⚡ Quick wins to implement first</div>
          {data.quickWins.map((win,i)=>(
            <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,marginBottom:4,display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:"#00C8A0",flexShrink:0}}>✓</span>{win}
            </div>
          ))}
        </div>
      )}
      {data.notes&&(
        <div style={{marginTop:16,background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.3)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#C4A0FF",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>📝 Notes for your builder</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,lineHeight:1.6}}>{data.notes}</div>
        </div>
      )}
    </div>
  );
}

function buildHTML(data){
  const stages=data.stages||[];
  const stagesHTML=stages.map((stage,i)=>{
    const c=STAGE_COLORS[stage.type]||STAGE_COLORS["Other"];
    const emailsHTML=stage.emails?.length?`<div style="margin:10px 0 4px;"><div style="font-size:10px;font-weight:bold;color:#F4547A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">💌 ${stage.emails.length} Email${stage.emails.length!==1?"s":""}</div>${stage.emails.map(e=>`<div style="display:flex;gap:8px;margin-bottom:5px;"><div style="min-width:20px;height:20px;border-radius:50%;background:rgba(244,84,122,0.2);color:#F4547A;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;flex-shrink:0;">${e.number}</div><div style="flex:1;background:rgba(244,84,122,0.06);border:1px solid rgba(244,84,122,0.15);border-radius:6px;padding:7px 10px;"><div style="font-size:12px;font-weight:600;color:#F0EAF8;">${e.subject}${e.timing?` <span style="font-size:10px;color:#FF6B2B;">(${e.timing})</span>`:""}</div><div style="font-size:11px;color:rgba(240,234,248,0.5);margin-top:2px;">${e.focus}</div></div></div>`).join("")}</div>`:"";
    const offerHTML=stage.offer?.name?`<div style="background:rgba(107,53,200,0.15);border:1px solid rgba(107,53,200,0.3);border-radius:8px;padding:8px 12px;margin-bottom:10px;"><span style="font-size:10px;font-weight:bold;color:#C4A0FF;text-transform:uppercase;display:block;margin-bottom:2px;">${stage.offer.type||"Offer"}</span><span style="font-size:13px;font-weight:600;color:#F0EAF8;">${stage.offer.name}${stage.offer.price?` · ${stage.offer.price}`:""}</span></div>`:"";
    const actionsHTML=stage.actions?.length?`<div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.08);">${stage.actions.map(a=>`<div style="font-size:11.5px;color:rgba(240,234,248,0.45);margin-bottom:3px;padding-left:8px;border-left:2px solid rgba(255,107,43,0.3);">⚙ ${a.description}</div>`).join("")}</div>`:"";
    const connector=i<stages.length-1?`<div style="text-align:center;padding:8px 0;font-size:14px;color:rgba(196,160,255,0.3);">↓</div>`:"";
    return `<div style="background:#1A1A1A;border:1px solid ${c.border}44;border-radius:12px;overflow:hidden;margin-bottom:4px;"><div style="background:linear-gradient(135deg,${c.border}22,${c.border}08);border-bottom:2px solid ${c.border};padding:12px 16px;display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:8px;background:${c.border};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${c.icon}</div><div><div style="font-size:10px;font-weight:bold;color:${c.border};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:1px;">Stage ${i+1} · ${stage.type}</div><div style="font-size:14px;font-weight:bold;color:#F0EAF8;">${stage.title}</div></div></div><div style="padding:12px 14px;"><p style="font-size:12.5px;color:rgba(240,234,248,0.5);margin:0 0 10px;line-height:1.6;">${stage.description}</p>${offerHTML}${emailsHTML}${actionsHTML}</div></div>${connector}`;
  }).join("");
  const cleanupHTML=data.cleanupSteps?.length?`<div style="margin-top:16px;background:rgba(255,60,60,0.06);border:1px solid rgba(255,60,60,0.2);border-radius:10px;padding:12px 14px;"><div style="font-size:10px;font-weight:bold;color:#FF6B6B;text-transform:uppercase;margin-bottom:8px;">🧹 Cleanup — once someone buys</div>${data.cleanupSteps.map(s=>`<div style="font-size:12px;color:rgba(240,234,248,0.5);margin-bottom:3px;padding-left:8px;border-left:2px solid rgba(255,60,60,0.3);">${s}</div>`).join("")}</div>`:"";
  const winsHTML=data.quickWins?.length?`<div style="margin-top:12px;background:rgba(0,200,160,0.06);border:1px solid rgba(0,200,160,0.2);border-radius:10px;padding:12px 14px;"><div style="font-size:10px;font-weight:bold;color:#00C8A0;text-transform:uppercase;margin-bottom:8px;">⚡ Quick wins</div>${data.quickWins.map(w=>`<div style="font-size:12px;color:rgba(240,234,248,0.5);margin-bottom:3px;">✓ ${w}</div>`).join("")}</div>`:"";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${data.planName} — GHL Funnel Plan</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><style>body{font-family:'DM Sans',sans-serif;background:#0D0D0D;margin:0;padding:30px;color:#F0EAF8;max-width:720px;margin:0 auto;}@media print{body{background:#fff;color:#0A0A0A;}}</style></head><body><div style="display:inline-block;background:linear-gradient(135deg,#F4547A,#6B35C8);color:#fff;border-radius:100px;padding:5px 16px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;font-weight:bold;">✦ SaaSy Funnels · GHL Funnel Map</div><h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;margin:4px 0;color:#F0EAF8;">${data.planName}</h1><p style="color:rgba(240,234,248,0.5);margin-bottom:4px;">${data.goal}</p><p style="color:rgba(240,234,248,0.3);font-size:12px;margin-bottom:20px;">${data.totalEmails||0} emails · ${data.estimatedLength||""}</p>${stagesHTML}${cleanupHTML}${winsHTML}${data.notes?`<div style="margin-top:14px;background:rgba(107,53,200,0.1);border:1px solid rgba(107,53,200,0.3);border-radius:10px;padding:14px;font-size:13px;color:rgba(240,234,248,0.6);line-height:1.6;"><strong style="color:#F0EAF8;">📝 Notes:</strong><br/>${data.notes}</div>`:""}<p style="margin-top:32px;font-size:11px;color:rgba(196,160,255,0.3);text-align:center;">Generated by SaaSy Funnels · GHL Funnel Planner · Powered by Claude</p></body></html>`;
}

export default function App(){
  const navigate=useNavigate();
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [started,setStarted]=useState(false);
  const [wfData,setWfData]=useState(null);
  const [loadingUpdates,setLoadingUpdates]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const [copied,setCopied]=useState(false);
  const [viewingShared,setViewingShared]=useState(false);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);
  const historyRef=useRef([]);
  const systemPromptRef=useRef(BASE_SYSTEM_PROMPT);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const spec=params.get("spec");
    if(spec){const d=decodeSpec(spec);if(d){setWfData(d);setViewingShared(true);setStarted(true);}}
    fetchUpdates();
  },[]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const fetchUpdates=async()=>{
    setLoadingUpdates(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true",...(import.meta.env.VITE_ANTHROPIC_API_KEY?{"x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY}:{})},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:SEARCH_PROMPT}]})});
      const data=await res.json();
      const text=data.content?.filter(b=>b.type==="text").map(b=>b.text).join(" ")||"";
      if(text&&!text.includes("No major updates")){systemPromptRef.current=BASE_SYSTEM_PROMPT+`\n\nRECENT FUNNEL STRATEGY UPDATES:\n${text.trim()}`;}
    }catch(e){}
    setLoadingUpdates(false);
  };

  const parseJSON=text=>{try{const m=text.match(/```json\s*([\s\S]*?)```/);if(m)return JSON.parse(m[1]);}catch(e){}return null;};

  const callClaude=async history=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true",...(import.meta.env.VITE_ANTHROPIC_API_KEY?{"x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY}:{})},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,system:systemPromptRef.current,messages:history.map(m=>({role:m.role,content:m.content}))})});
    const d=await r.json();
    return d.content?.[0]?.text||"Something went wrong — please try again.";
  };

  const send=async text=>{
    const userMsg={role:"user",content:text};
    const newHist=[...historyRef.current,userMsg];
    historyRef.current=newHist;
    setMessages(prev=>[...prev,userMsg]);
    setLoading(true);
    try{
      const reply=await callClaude(newHist);
      const aMsg={role:"assistant",content:reply};
      historyRef.current=[...newHist,aMsg];
      setMessages(prev=>[...prev,aMsg]);
      const parsed=parseJSON(reply);
      if(parsed){setWfData(parsed);setShareUrl(getShareUrl(parsed));}
    }catch(e){setMessages(prev=>[...prev,{role:"assistant",content:"Something went wrong — please try again."}]);}
    setLoading(false);
    inputRef.current?.focus();
  };

  const start=async text=>{setStarted(true);await send(text);};
  const reset=()=>{setMessages([]);setInput("");setStarted(false);setWfData(null);setShareUrl("");setCopied(false);setViewingShared(false);historyRef.current=[];window.history.replaceState({},"",window.location.pathname);};
  const downloadHTML=()=>{if(!wfData)return;const blob=new Blob([buildHTML(wfData)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${(wfData.planName||"funnel").replace(/\s+/g,"-")}-ghl-funnel-plan.html`;a.click();URL.revokeObjectURL(url);};
  const downloadPDF=()=>{if(!wfData)return;const w=window.open("","_blank");w.document.write(buildHTML(wfData));w.document.close();w.onload=()=>w.print();};
  const copyShareLink=()=>{navigator.clipboard.writeText(shareUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),3000);});};

  const displayMsgs=messages.map(m=>{
    if(m.role==="assistant"&&m.content.includes("```json")){
      const before=m.content.split("```json")[0].trim();
      const after=m.content.split("```").slice(-1)[0].trim();
      return {...m,content:[before,after].filter(Boolean).join("\n\n")};
    }
    return m;
  });

  return(
    <div style={{minHeight:"100vh",background:ghlBg,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes ghlBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
        @keyframes ghlFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ghlFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ghlPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        textarea:focus{outline:none} textarea{resize:none} input:focus{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${ghlPurple};border-radius:2px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        .ghl-prompt-btn:hover{border-color:${ghlPink}!important;background:rgba(244,84,122,0.08)!important;}
        .ghl-prompt-btn:hover .ghl-arrow{color:${ghlPink}!important;}
      `}</style>
      <TopNav onBack={()=>navigate("/")}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px 0"}}>
        <div style={{textAlign:"center",marginBottom:30,animation:"ghlFadeIn 0.6s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(244,84,122,0.12)",border:"1px solid rgba(244,84,122,0.3)",color:ghlPink,padding:"6px 16px",borderRadius:100,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,fontWeight:700}}>
            <span>🗺</span> GHL Funnel Planner
          </div>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,fontWeight:700,color:ghlText,margin:"0 0 8px",lineHeight:1.15}}>
            {viewingShared?`Shared: ${wfData?.planName}`:"Let's map out your funnel"}
          </h1>
          <p style={{color:ghlMuted,fontSize:15,margin:0,maxWidth:440,fontFamily:"'DM Sans',sans-serif"}}>
            {viewingShared?"Your client shared this funnel plan with you for DFY support.":"No jargon. No overwhelm. Your funnel, mapped clearly — one question at a time."}
          </p>
          {loadingUpdates&&<div style={{marginTop:10,fontSize:12,color:ghlMuted,animation:"ghlPulse 1.5s ease infinite",fontFamily:"'DM Sans',sans-serif"}}>↻ Checking for latest funnel strategies...</div>}
        </div>

        <div style={{width:"100%",maxWidth:680,background:ghlSurface,border:"1px solid "+ghlBorder,borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",height:started?"calc(100vh - 240px)":"auto",minHeight:started?400:"auto",animation:"ghlFadeIn 0.5s ease",boxShadow:"0 8px 40px rgba(107,53,200,0.15)"}}>
          {viewingShared&&wfData?(
            <>
              <div style={{flex:1,overflowY:"auto"}}><FunnelMap data={wfData}/></div>
              <div style={{padding:"12px 16px 16px",borderTop:"1px solid "+ghlBorder,display:"flex",gap:8,flexWrap:"wrap",background:ghlSurface}}>
                <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purpleGrad,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
                <button onClick={downloadPDF} style={{...btn(),flex:1,minWidth:130,background:pinkGrad,boxShadow:"0 4px 12px rgba(244,84,122,0.3)"}}>↓ Download / Print PDF</button>
                <button onClick={reset} style={{...btn(),background:"transparent",color:ghlMuted,border:"1px solid "+ghlBorder}}>Start New</button>
              </div>
            </>
          ):!started?(
            <div style={{padding:"32px 28px 28px"}}>
              <p style={{color:ghlMuted,fontSize:14.5,marginTop:0,marginBottom:20,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>What kind of funnel do you want to plan? Pick a common one or describe it yourself:</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {PROMPTS.map((p,i)=>(
                  <button key={i} onClick={()=>start(p)} className="ghl-prompt-btn" style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+ghlBorder,borderRadius:10,padding:"12px 16px",textAlign:"left",cursor:"pointer",fontSize:14,color:ghlText,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
                    <span className="ghl-arrow" style={{color:ghlPurple,fontSize:15,transition:"color 0.15s"}}>→</span> {p}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(input.trim())start(input.trim());}}}
                  placeholder="Or describe your funnel idea..." rows={2}
                  style={{flex:1,border:"1px solid "+ghlBorder,borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"rgba(255,255,255,0.04)",color:ghlText,lineHeight:1.5}}/>
                <button onClick={()=>input.trim()&&start(input.trim())} style={{...btn(),background:sfGradient,padding:"12px 18px",fontSize:18,boxShadow:"0 4px 12px rgba(244,84,122,0.3)"}}>→</button>
              </div>
            </div>
          ):(
            <>
              <div style={{flex:1,overflowY:"auto",padding:"24px 20px 12px"}}>
                {displayMsgs.map((m,i)=><Bubble key={i} msg={m}/>)}
                {loading&&(
                  <div style={{display:"flex",marginBottom:12}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:sfGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,color:"#fff",fontWeight:700}}>✦</div>
                    <Dots/>
                  </div>
                )}
                {wfData&&(
                  <div style={{animation:"ghlFadeUp 0.4s ease",marginTop:8,background:"rgba(255,255,255,0.02)",border:"1px solid "+ghlBorder,borderRadius:14,overflow:"hidden"}}>
                    <FunnelMap data={wfData}/>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              {wfData?(
                <>
                  <div style={{padding:"12px 16px 8px",borderTop:"1px solid "+ghlBorder,display:"flex",gap:8,flexWrap:"wrap",background:ghlSurface}}>
                    <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purpleGrad,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
                    <button onClick={downloadPDF} style={{...btn(),flex:1,minWidth:130,background:pinkGrad,boxShadow:"0 4px 12px rgba(244,84,122,0.3)"}}>↓ Download / Print PDF</button>
                    <button onClick={reset} style={{...btn(),background:"transparent",color:ghlMuted,border:"1px solid "+ghlBorder}}>Start Over</button>
                  </div>
                  <div style={{padding:"0 16px 16px",background:ghlSurface}}>
                    <div style={{background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.25)",borderRadius:12,padding:"14px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#C4A0FF",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>🗺 Want us to build this funnel for you?</div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,margin:"0 0 10px",lineHeight:1.5}}>Copy the link below and send it to the SaaSy Funnels team — we'll build the whole thing and have it ready to go.</p>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{flex:1,background:"rgba(0,0,0,0.3)",border:"1px solid "+ghlBorder,borderRadius:8,padding:"9px 12px",fontSize:12,color:ghlMuted,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shareUrl}</div>
                        <button onClick={copyShareLink} style={{...btn(),background:copied?"linear-gradient(135deg,#00C8A0,#009B7A)":sfGradient,whiteSpace:"nowrap",padding:"9px 16px",transition:"background 0.3s",boxShadow:"0 4px 12px rgba(244,84,122,0.2)"}}>{copied?"✓ Copied!":"Copy Link"}</button>
                      </div>
                    </div>
                  </div>
                </>
              ):(
                <div style={{padding:"8px 16px 16px",borderTop:"1px solid "+ghlBorder,display:"flex",gap:8,alignItems:"flex-end",background:ghlSurface}}>
                  <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(!input.trim()||loading)return;const t=input.trim();setInput("");send(t);}}}
                    placeholder="Type your answer..." rows={2} disabled={loading}
                    style={{flex:1,border:"1px solid "+ghlBorder,borderRadius:10,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"rgba(255,255,255,0.04)",color:ghlText,lineHeight:1.5,opacity:loading?0.5:1}}/>
                  <button onClick={()=>{if(!input.trim()||loading)return;const t=input.trim();setInput("");send(t);}} disabled={loading||!input.trim()}
                    style={{...btn(),background:loading||!input.trim()?"rgba(107,53,200,0.3)":sfGradient,padding:"12px 18px",fontSize:18,cursor:loading||!input.trim()?"not-allowed":"pointer",boxShadow:loading||!input.trim()?"none":"0 4px 12px rgba(244,84,122,0.3)"}}>→</button>
                </div>
              )}
            </>
          )}
        </div>

        <p style={{fontSize:11.5,color:"rgba(196,160,255,0.3)",marginTop:14,marginBottom:20,textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>
          Powered by Claude · Built for GHL users · SaaSy Funnels
        </p>
      </div>
    </div>
  );
}
