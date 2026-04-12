import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_SYSTEM_PROMPT = `You are a funnel strategy specialist helping Kajabi coaches and course creators plan their complete sales funnels through a warm, friendly conversation — one question at a time, no jargon, no overwhelm.

You represent SaaSy Funnels by Meg Burrage. Your tone is warm, encouraging, plain-spoken, and a little bit sassy. You're helping people who may have never built a funnel before.

KAJABI-SPECIFIC PLAIN ENGLISH RULES:
- Never say "lead magnet" — say "freebie" or "free thing you're giving away"
- Never say "opt-in" — say "sign-up" or "where they enter their details"
- Never say "conversion" — say "when someone buys" or "turning a visitor into a customer"
- Never say "nurture sequence" — say "follow-up emails" or "email sequence"
- Never say "upsell" / "downsell" / "order bump" — say "add-on", "one-time offer", or "extra offer after checkout"
- Never say "CTA" — say "button" or "next step"
- Say "your audience" or "your people" not "target market" or "ICP"
- Say "their journey" not "the funnel"
- Kajabi native tools: Offers, Products (courses, coaching, communities, podcasts), Landing Pages, Forms, Email Sequences, Events (webinars/masterclasses), Pipelines, Blog

INTAKE PROCESS — ask ONE question at a time, in this order:
1. Ask what their main goal is — growing their email list, selling a course, filling a coaching program, booking discovery calls, or something else?
2. Ask who their audience is — who are they trying to help? What's going on for that person right now?
3. Ask how people will first find them or enter the journey. Give Kajabi-native examples: a free download via a Kajabi form and landing page, a Kajabi Event (webinar or masterclass), a challenge, a quiz, a free mini-course, or going straight to a sales page.
4. Based on their entry point, ask what they're giving away or offering at that step — what's the name or topic?
5. Ask what they want people to do next — do they have a Kajabi offer to sell? What is it, what's it called, and roughly what does it cost?
6. Ask how many follow-up emails they want to send in their Kajabi email sequence before pitching — or ask if they want guidance on this.
7. Ask what the emails should focus on — building trust? Teaching something? Sharing their story? A mix?
8. Ask if they have anything extra to offer after someone buys — a bonus add-on, a one-time deal, or an upgrade to a higher-level program.
9. Ask if there's any other step in the journey — a discovery call page, a Kajabi community, a membership, anything else.
10. Ask a cleanup question: "Once someone buys, is there anything they should stop receiving — like the sales sequence — so they don't get awkward messages after they've already become a customer? In Kajabi, we can automatically unsubscribe them from the sales sequence and remove any waitlist tags."
11. Confirm you have everything and say exactly: "Love it — I have everything I need to map your funnel! Give me a moment." Then output ONLY the JSON below.

KAJABI FUNNEL STRATEGY GUIDANCE — share naturally when relevant:
- In Kajabi, a freebie funnel = a Form + Landing Page + Email Sequence + Offer. The form submission triggers "Grant Offer" for the free product, and the email sequence is triggered by form submission.
- For webinars, Kajabi Events are ideal — they handle registration pages, reminder emails, and replay access natively.
- Kajabi Pipelines can automate the whole flow visually, but you can also build it with individual pieces.
- A 3–5 email nurture sequence before pitching works well for warm audiences; 5–7 for colder audiences.
- Kajabi doesn't have a native order bump feature — you'd rely on post-purchase automations or a third-party tool for that.
- Cleanup automations in Kajabi after purchase: "Unsubscribe from email sequence" + "Remove a tag".

RULES:
- ONE question at a time — never stack multiple questions
- Be warm, encouraging, and conversational — like a knowledgeable friend
- If they seem unsure, offer 2–3 concrete options to choose from
- Use their actual product and audience language throughout — mirror it back to them
- Flag if anything they want isn't natively possible in Kajabi and suggest the workaround
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
      "type": "Entry Point|Nurture|Sales Page|Post-Purchase|Discovery Call|Upsell|Community|Other",
      "title": "string",
      "description": "string",
      "kajabiTool": "string or null",
      "emails": [
        { "number": 1, "subject": "string", "focus": "string", "timing": "string" }
      ],
      "automations": [
        { "when": "string", "then": "string", "note": "string or null" }
      ],
      "offer": {
        "name": "string or null",
        "price": "string or null",
        "type": "Freebie|Tripwire|Core Offer|Upsell|null"
      }
    }
  ],
  "cleanupSteps": ["string"],
  "totalEmails": 0,
  "estimatedLength": "string",
  "quickWins": ["string"],
  "kajabiNotes": "string or null",
  "notes": "string"
}
\`\`\`
After the JSON, one warm closing sentence only.`;

const SEARCH_PROMPT = `Search for any new Kajabi features, funnel tools, or updates released or announced in the last 90 days. Focus on what's new for coaches and course creators. Return a brief plain-English summary. If nothing significant, say "No major updates found." Keep it under 150 words.`;

const PROMPTS = [
  "Grow my email list with a freebie and turn subscribers into buyers",
  "Fill my Kajabi course or coaching program",
  "Book more discovery calls for my coaching",
  "Run a webinar or masterclass funnel in Kajabi",
  "Map out a full launch funnel from scratch",
];

const STAGE_COLORS = {
  "Entry Point":   { bg:"#ECFDF3", border:"#16A34A", icon:"🚀" },
  "Nurture":       { bg:"#FEF3F8", border:"#F4547A", icon:"💌" },
  "Sales Page":    { bg:"#F3EEFF", border:"#6B35C8", icon:"💰" },
  "Post-Purchase": { bg:"#ECFDF3", border:"#16A34A", icon:"🎉" },
  "Discovery Call":{ bg:"#EFF6FF", border:"#2563EB", icon:"📞" },
  "Upsell":        { bg:"#FAF0FF", border:"#A855F7", icon:"🔝" },
  "Community":     { bg:"#F3EEFF", border:"#6B35C8", icon:"👥" },
  "Other":         { bg:"#F9FAFB", border:"#9CA3AF", icon:"📌" },
};

const OFFER_COLORS = {
  "Freebie":    { bg:"#ECFDF3", border:"#16A34A", text:"#166534" },
  "Tripwire":   { bg:"#FFF7ED", border:"#F97316", text:"#9A3412" },
  "Core Offer": { bg:"#F3EEFF", border:"#6B35C8", text:"#4C1D95" },
  "Upsell":     { bg:"#FAF0FF", border:"#A855F7", text:"#6B21A8" },
};

const kjPink        = "#F4547A";
const kjPurple      = "#6B35C8";
const kjBorder      = "#E5E7EB";
const kjBorderAccent= "#DDD0F5";
const kjText        = "#0A0A0A";
const kjMuted       = "#6B7280";
const kjSubtle      = "#F9FAFB";

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
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid "+kjBorder,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {onBack&&<button onClick={onBack} style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"6px 12px",color:"#6B7280",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5,marginRight:4}} onMouseEnter={e=>{e.currentTarget.style.color=kjText;e.currentTarget.style.borderColor=kjBorderAccent;}} onMouseLeave={e=>{e.currentTarget.style.color="#6B7280";e.currentTarget.style.borderColor="#E5E7EB";}}>← Dashboard</button>}
        <SFLogo size={32}/>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:700,color:kjText,letterSpacing:"-0.01em"}}>SaaSy Funnels</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2,background:"#F3F4F6",borderRadius:8,padding:"4px 6px",border:"1px solid "+kjBorder}}>
        <div style={{padding:"5px 14px",borderRadius:6,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:"#fff",color:kjText,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>Kajabi</div>
        <div style={{padding:"5px 14px",borderRadius:6,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",background:"transparent",color:kjMuted}}>GHL</div>
      </div>
    </div>
  );
}

function Dots(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"14px 18px",background:"#fff",border:"1px solid "+kjBorderAccent,borderRadius:"0 18px 18px 18px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:kjPurple,animation:"kjBounce 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>)}
    </div>
  );
}

function Bubble({msg}){
  const u=msg.role==="user";
  return(
    <div style={{display:"flex",justifyContent:u?"flex-end":"flex-start",marginBottom:14,animation:"kjFadeUp 0.3s ease forwards"}}>
      {!u&&<div style={{width:34,height:34,borderRadius:"50%",background:sfGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,marginTop:2,color:"#fff",fontWeight:700}}>✦</div>}
      <div style={{maxWidth:"72%",background:u?sfGradient:"#fff",color:u?"#fff":kjText,padding:"13px 18px",borderRadius:u?"18px 18px 4px 18px":"0 18px 18px 18px",fontSize:14.5,lineHeight:1.65,border:u?"none":"1px solid "+kjBorderAccent,boxShadow:u?"0 4px 16px rgba(244,84,122,0.2)":"0 1px 4px rgba(0,0,0,0.06)",whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif"}}>{msg.content}</div>
    </div>
  );
}

function EmailRow({email}){
  return(
    <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
      <div style={{minWidth:22,height:22,borderRadius:"50%",background:"rgba(244,84,122,0.1)",border:"1px solid rgba(244,84,122,0.3)",color:kjPink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:2}}>{email.number}</div>
      <div style={{flex:1,background:"rgba(244,84,122,0.04)",border:"1px solid rgba(244,84,122,0.12)",borderRadius:8,padding:"8px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:3}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:600,color:kjText,lineHeight:1.4}}>{email.subject}</div>
          {email.timing&&<span style={{fontSize:10,color:"#D97706",background:"#FFFBEB",border:"1px solid #F59E0B55",borderRadius:20,padding:"1px 7px",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{email.timing}</span>}
        </div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:kjMuted,lineHeight:1.5}}>{email.focus}</div>
      </div>
    </div>
  );
}

function AutomationRow({automation}){
  return(
    <div style={{marginBottom:6,background:"#FFFBEB",border:"1px solid #F59E0B44",borderRadius:8,padding:"8px 12px"}}>
      <div style={{fontSize:10,fontWeight:700,color:"#D97706",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3,fontFamily:"'DM Sans',sans-serif"}}>⚡ When: <span style={{fontWeight:400,color:kjText,textTransform:"none",letterSpacing:0}}>{automation.when}</span></div>
      <div style={{fontSize:10,fontWeight:700,color:kjPurple,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2,fontFamily:"'DM Sans',sans-serif"}}>→ Then: <span style={{fontWeight:400,color:kjText,textTransform:"none",letterSpacing:0}}>{automation.then}</span></div>
      {automation.note&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:kjMuted,marginTop:3,fontStyle:"italic"}}>{automation.note}</div>}
    </div>
  );
}

function StageCard({stage,idx}){
  const c=STAGE_COLORS[stage.type]||STAGE_COLORS["Other"];
  const offerStyle=stage.offer?.type?OFFER_COLORS[stage.offer.type]:null;
  return(
    <div style={{background:"#fff",border:"1px solid "+kjBorder,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
      <div style={{background:c.bg,borderBottom:`2px solid ${c.border}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:c.border,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,fontWeight:700,color:c.border,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2,fontFamily:"'DM Sans',sans-serif"}}>Stage {idx+1} · {stage.type}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:700,color:kjText}}>{stage.title}</div>
        </div>
        {stage.offer?.type&&offerStyle&&(
          <div style={{background:offerStyle.bg,border:`1px solid ${offerStyle.border}55`,borderRadius:20,padding:"4px 10px",fontSize:10,color:offerStyle.text,fontFamily:"'DM Sans',sans-serif",fontWeight:700,flexShrink:0}}>
            {stage.offer.type}{stage.offer.price?` · ${stage.offer.price}`:""}
          </div>
        )}
      </div>
      <div style={{padding:"14px 16px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,margin:"0 0 12px",lineHeight:1.6}}>{stage.description}</p>
        {stage.kajabiTool&&(
          <div style={{marginBottom:12,display:"inline-flex",alignItems:"center",gap:6,background:kjSubtle,border:"1px solid "+kjBorderAccent,borderRadius:20,padding:"4px 12px",fontSize:11,color:kjPurple,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>
            📍 {stage.kajabiTool}
          </div>
        )}
        {stage.offer?.name&&(
          <div style={{background:offerStyle?offerStyle.bg:"#F3EEFF",border:`1px solid ${offerStyle?offerStyle.border:kjPurple}44`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{stage.offer.type==="Freebie"?"🎁":stage.offer.type==="Core Offer"?"💎":"🔝"}</span>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:offerStyle?offerStyle.text:kjPurple,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{stage.offer.type||"Offer"}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:kjText}}>{stage.offer.name}{stage.offer.price?` — ${stage.offer.price}`:""}</div>
            </div>
          </div>
        )}
        {stage.emails?.length>0&&(
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:kjPink,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>💌 {stage.emails.length} Email{stage.emails.length!==1?"s":""} in this stage</div>
            {stage.emails.map((email,i)=><EmailRow key={i} email={email}/>)}
          </div>
        )}
        {stage.automations?.length>0&&(
          <div style={{marginTop:10}}>
            <div style={{fontSize:10,fontWeight:700,color:"#D97706",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>⚙ Kajabi automations at this stage</div>
            {stage.automations.map((auto,i)=><AutomationRow key={i} automation={auto}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelMap({data}){
  const stages=data.stages||[];
  return(
    <div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{display:"inline-block",background:sfGradient,color:"#fff",borderRadius:100,padding:"5px 18px",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>✦ Kajabi Funnel Map · {stages.length} Stage{stages.length!==1?"s":""}</div>
        <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:20,fontWeight:700,color:kjText,margin:"0 0 6px"}}>{data.planName}</h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:kjMuted,margin:"0 0 8px"}}>{data.goal}</p>
        <div style={{display:"inline-flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {data.totalEmails>0&&<span style={{fontSize:12,color:kjPink,fontFamily:"'DM Sans',sans-serif"}}>💌 {data.totalEmails} emails total</span>}
          {data.estimatedLength&&<span style={{fontSize:12,color:"#D97706",fontFamily:"'DM Sans',sans-serif"}}>⏱ {data.estimatedLength}</span>}
        </div>
      </div>
      {data.audience&&(
        <div style={{background:kjSubtle,border:"1px solid "+kjBorderAccent,borderRadius:10,padding:"12px 16px",marginBottom:20,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,lineHeight:1.6}}>
          👥 <strong style={{color:kjText}}>Your audience:</strong> {data.audience}
        </div>
      )}
      {stages.map((stage,i)=>(
        <div key={stage.id}>
          <StageCard stage={stage} idx={i}/>
          {i<stages.length-1&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"10px 0"}}>
              <div style={{width:2,height:14,background:kjBorderAccent}}/>
              <div style={{fontSize:11,color:kjMuted,fontStyle:"italic",fontFamily:"'DM Sans',sans-serif"}}>↓</div>
              <div style={{width:2,height:14,background:kjBorderAccent}}/>
            </div>
          )}
        </div>
      ))}
      {data.cleanupSteps?.length>0&&(
        <div style={{marginTop:16,background:"#FEF2F2",border:"1px solid #DC262633",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#DC2626",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>🧹 Cleanup — once someone buys</div>
          {data.cleanupSteps.map((step,i)=><div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,marginBottom:4,paddingLeft:8,borderLeft:"2px solid #DC262633"}}>{step}</div>)}
        </div>
      )}
      {data.quickWins?.length>0&&(
        <div style={{marginTop:12,background:"#ECFDF3",border:"1px solid #16A34A33",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#16A34A",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>⚡ Quick wins to implement first</div>
          {data.quickWins.map((win,i)=>(
            <div key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,marginBottom:4,display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{color:"#16A34A",flexShrink:0}}>✓</span>{win}
            </div>
          ))}
        </div>
      )}
      {data.kajabiNotes&&(
        <div style={{marginTop:12,background:"#FFFBEB",border:"1px solid #F59E0B44",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#D97706",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>💡 Kajabi notes for your builder</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,lineHeight:1.6}}>{data.kajabiNotes}</div>
        </div>
      )}
      {data.notes&&(
        <div style={{marginTop:12,background:kjSubtle,border:"1px solid "+kjBorderAccent,borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:kjPurple,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>📝 Notes for your builder</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,lineHeight:1.6}}>{data.notes}</div>
        </div>
      )}
    </div>
  );
}

function buildHTML(data){
  const stages=data.stages||[];
  const stagesHTML=stages.map((stage,i)=>{
    const c=STAGE_COLORS[stage.type]||STAGE_COLORS["Other"];
    const emailsHTML=stage.emails?.length?`<div style="margin:10px 0 4px;"><div style="font-size:10px;font-weight:bold;color:#F4547A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">💌 ${stage.emails.length} Email${stage.emails.length!==1?"s":""}</div>${stage.emails.map(e=>`<div style="display:flex;gap:8px;margin-bottom:5px;"><div style="min-width:20px;height:20px;border-radius:50%;background:rgba(244,84,122,0.1);color:#F4547A;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;flex-shrink:0;">${e.number}</div><div style="flex:1;background:rgba(244,84,122,0.04);border:1px solid rgba(244,84,122,0.12);border-radius:6px;padding:7px 10px;"><div style="font-size:12px;font-weight:600;color:#0A0A0A;">${e.subject}${e.timing?` <span style="font-size:10px;color:#D97706;">(${e.timing})</span>`:""}</div><div style="font-size:11px;color:#6B7280;margin-top:2px;">${e.focus}</div></div></div>`).join("")}</div>`:"";
    const offerHTML=stage.offer?.name?`<div style="background:#F3EEFF;border:1px solid #DDD0F5;border-radius:8px;padding:8px 12px;margin-bottom:10px;"><span style="font-size:10px;font-weight:bold;color:#6B35C8;text-transform:uppercase;display:block;margin-bottom:2px;">${stage.offer.type||"Offer"}</span><span style="font-size:13px;font-weight:600;color:#0A0A0A;">${stage.offer.name}${stage.offer.price?` — ${stage.offer.price}`:""}</span></div>`:"";
    const autoHTML=stage.automations?.length?`<div style="margin-top:8px;">${stage.automations.map(a=>`<div style="margin-bottom:5px;background:#FFFBEB;border:1px solid #F59E0B44;border-radius:6px;padding:7px 10px;font-size:11.5px;color:#6B7280;">⚡ ${a.when} → ${a.then}</div>`).join("")}</div>`:"";
    const toolHTML=stage.kajabiTool?`<div style="display:inline-block;background:#F9FAFB;border:1px solid #DDD0F5;border-radius:20px;padding:3px 10px;font-size:11px;color:#6B35C8;font-weight:600;margin-bottom:10px;">📍 ${stage.kajabiTool}</div><br/>`:"";
    const connector=i<stages.length-1?`<div style="text-align:center;padding:8px 0;font-size:14px;color:#9CA3AF;">↓</div>`:"";
    return `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.05);margin-bottom:4px;"><div style="background:${c.bg};border-bottom:2px solid ${c.border};padding:12px 16px;display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:8px;background:${c.border};color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${c.icon}</div><div><div style="font-size:10px;font-weight:bold;color:${c.border};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:1px;">Stage ${i+1} · ${stage.type}</div><div style="font-size:14px;font-weight:bold;color:#0A0A0A;">${stage.title}</div></div></div><div style="padding:12px 14px;"><p style="font-size:12.5px;color:#6B7280;margin:0 0 10px;line-height:1.6;">${stage.description}</p>${toolHTML}${offerHTML}${emailsHTML}${autoHTML}</div></div>${connector}`;
  }).join("");
  const cleanupHTML=data.cleanupSteps?.length?`<div style="margin-top:16px;background:#FEF2F2;border:1px solid #DC262633;border-radius:10px;padding:12px 14px;"><div style="font-size:10px;font-weight:bold;color:#DC2626;text-transform:uppercase;margin-bottom:8px;">🧹 Cleanup — once someone buys</div>${data.cleanupSteps.map(s=>`<div style="font-size:12px;color:#6B7280;margin-bottom:3px;padding-left:8px;border-left:2px solid #DC262633;">${s}</div>`).join("")}</div>`:"";
  const winsHTML=data.quickWins?.length?`<div style="margin-top:12px;background:#ECFDF3;border:1px solid #16A34A33;border-radius:10px;padding:12px 14px;"><div style="font-size:10px;font-weight:bold;color:#16A34A;text-transform:uppercase;margin-bottom:8px;">⚡ Quick wins</div>${data.quickWins.map(w=>`<div style="font-size:12px;color:#6B7280;margin-bottom:3px;">✓ ${w}</div>`).join("")}</div>`:"";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${data.planName} — Kajabi Funnel Plan</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet"/><style>body{font-family:'DM Sans',sans-serif;background:#FAFAFA;margin:0;padding:30px;color:#0A0A0A;max-width:720px;margin:0 auto;}@media print{body{background:#fff;}}</style></head><body><div style="display:inline-block;background:linear-gradient(135deg,#F4547A,#6B35C8);color:#fff;border-radius:100px;padding:5px 16px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;font-weight:bold;">✦ SaaSy Funnels · Kajabi Funnel Map</div><h1 style="font-size:24px;margin:4px 0;font-weight:700;color:#0A0A0A;">${data.planName}</h1><p style="color:#6B7280;margin-bottom:4px;">${data.goal}</p><p style="color:#9CA3AF;font-size:12px;margin-bottom:20px;">${data.totalEmails||0} emails · ${data.estimatedLength||""}</p>${stagesHTML}${cleanupHTML}${winsHTML}${data.notes?`<div style="margin-top:14px;background:#F3EEFF;border:1px solid #DDD0F5;border-radius:10px;padding:14px;font-size:13px;color:#4C1D95;line-height:1.6;"><strong>📝 Notes:</strong><br/>${data.notes}</div>`:""}<p style="margin-top:32px;font-size:11px;color:#9CA3AF;text-align:center;">Generated by SaaSy Funnels · Kajabi Funnel Planner · Powered by Claude</p></body></html>`;
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
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true",...(import.meta.env.VITE_ANTHROPIC_API_KEY?{"x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY}:{})},body:JSON.stringify({model:"claude-sonnet-4-5-20251001",max_tokens:400,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:SEARCH_PROMPT}]})});
      const data=await res.json();
      const text=data.content?.filter(b=>b.type==="text").map(b=>b.text).join(" ")||"";
      if(text&&!text.includes("No major updates")){systemPromptRef.current=BASE_SYSTEM_PROMPT+`\n\nRECENT KAJABI UPDATES:\n${text.trim()}`;}
    }catch(e){}
    setLoadingUpdates(false);
  };

  const parseJSON=text=>{try{const m=text.match(/```json\s*([\s\S]*?)```/);if(m)return JSON.parse(m[1]);}catch(e){}return null;};

  const callClaude=async history=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true",...(import.meta.env.VITE_ANTHROPIC_API_KEY?{"x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY}:{})},body:JSON.stringify({model:"claude-sonnet-4-5-20251001",max_tokens:3000,system:systemPromptRef.current,messages:history.map(m=>({role:m.role,content:m.content}))})});
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
  const downloadHTML=()=>{if(!wfData)return;const blob=new Blob([buildHTML(wfData)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${(wfData.planName||"funnel").replace(/\s+/g,"-")}-kajabi-funnel-plan.html`;a.click();URL.revokeObjectURL(url);};
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
    <div style={{minHeight:"100vh",background:"#FFFFFF",fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes kjBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
        @keyframes kjFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes kjFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes kjPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        textarea:focus{outline:none} textarea{resize:none} input:focus{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${kjPurple};border-radius:2px}
        ::-webkit-scrollbar-track{background:#F3F4F6}
        .kj-prompt-btn:hover{border-color:${kjPink}!important;background:rgba(244,84,122,0.04)!important;}
        .kj-prompt-btn:hover .kj-arrow{color:${kjPink}!important;}
      `}</style>
      <TopNav onBack={()=>navigate("/")}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px 0"}}>
        <div style={{textAlign:"center",marginBottom:30,animation:"kjFadeIn 0.6s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#F3EEFF",border:"1px solid "+kjBorderAccent,color:kjPurple,padding:"6px 16px",borderRadius:100,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,fontWeight:700}}>
            <span>🗺</span> Kajabi Funnel Planner
          </div>
          <h1 style={{fontFamily:"'DM Sans',sans-serif",fontSize:30,fontWeight:700,color:kjText,margin:"0 0 8px",lineHeight:1.15}}>
            {viewingShared?`Shared: ${wfData?.planName}`:"Let's map out your funnel"}
          </h1>
          <p style={{color:kjMuted,fontSize:15,margin:0,maxWidth:440,fontFamily:"'DM Sans',sans-serif"}}>
            {viewingShared?"Your client shared this funnel plan with you for DFY support.":"No jargon. No overwhelm. Your Kajabi funnel, mapped clearly — one question at a time."}
          </p>
          {loadingUpdates&&<div style={{marginTop:10,fontSize:12,color:kjMuted,animation:"kjPulse 1.5s ease infinite",fontFamily:"'DM Sans',sans-serif"}}>↻ Checking for latest Kajabi updates...</div>}
        </div>

        <div style={{width:"100%",maxWidth:680,background:"#FAFAFA",border:"1px solid "+kjBorder,borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",height:started?"calc(100vh - 240px)":"auto",minHeight:started?400:"auto",animation:"kjFadeIn 0.5s ease",boxShadow:"0 4px 24px rgba(0,0,0,0.07)"}}>
          {viewingShared&&wfData?(
            <>
              <div style={{flex:1,overflowY:"auto"}}><FunnelMap data={wfData}/></div>
              <div style={{padding:"12px 16px 16px",borderTop:"1px solid "+kjBorder,display:"flex",gap:8,flexWrap:"wrap",background:"#fff"}}>
                <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purpleGrad,boxShadow:"0 4px 12px rgba(107,53,200,0.2)"}}>↓ Download HTML</button>
                <button onClick={downloadPDF} style={{...btn(),flex:1,minWidth:130,background:pinkGrad,boxShadow:"0 4px 12px rgba(244,84,122,0.2)"}}>↓ Download / Print PDF</button>
                <button onClick={reset} style={{...btn(),background:"#fff",color:kjText,border:"1px solid "+kjBorder,boxShadow:"none"}}>Start New</button>
              </div>
            </>
          ):!started?(
            <div style={{padding:"32px 28px 28px"}}>
              <p style={{color:kjMuted,fontSize:14.5,marginTop:0,marginBottom:20,lineHeight:1.6}}>What kind of funnel do you want to plan? Pick a common one or describe it yourself:</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {PROMPTS.map((p,i)=>(
                  <button key={i} onClick={()=>start(p)} className="kj-prompt-btn" style={{background:"#fff",border:"1px solid "+kjBorder,borderRadius:10,padding:"12px 16px",textAlign:"left",cursor:"pointer",fontSize:14,color:kjText,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
                    <span className="kj-arrow" style={{color:kjPurple,fontSize:15,transition:"color 0.15s"}}>→</span> {p}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(input.trim())start(input.trim());}}}
                  placeholder="Or describe your funnel idea..." rows={2}
                  style={{flex:1,border:"1px solid "+kjBorder,borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"#fff",color:kjText,lineHeight:1.5}}/>
                <button onClick={()=>input.trim()&&start(input.trim())} style={{...btn(),background:sfGradient,padding:"12px 18px",fontSize:18,boxShadow:"0 4px 12px rgba(244,84,122,0.2)"}}>→</button>
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
                  <div style={{animation:"kjFadeUp 0.4s ease",marginTop:8,background:kjSubtle,border:"1px solid "+kjBorderAccent,borderRadius:14,overflow:"hidden"}}>
                    <FunnelMap data={wfData}/>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              {wfData?(
                <>
                  <div style={{padding:"12px 16px 8px",borderTop:"1px solid "+kjBorder,display:"flex",gap:8,flexWrap:"wrap",background:"#fff"}}>
                    <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purpleGrad,boxShadow:"0 4px 12px rgba(107,53,200,0.2)"}}>↓ Download HTML</button>
                    <button onClick={downloadPDF} style={{...btn(),flex:1,minWidth:130,background:pinkGrad,boxShadow:"0 4px 12px rgba(244,84,122,0.2)"}}>↓ Download / Print PDF</button>
                    <button onClick={reset} style={{...btn(),background:"#fff",color:kjText,border:"1px solid "+kjBorder,boxShadow:"none"}}>Start Over</button>
                  </div>
                  <div style={{padding:"0 16px 16px",background:"#fff"}}>
                    <div style={{background:kjSubtle,border:"1px solid "+kjBorderAccent,borderRadius:12,padding:"14px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:kjPurple,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>🗺 Want us to build this funnel for you?</div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:kjMuted,margin:"0 0 10px",lineHeight:1.5}}>Copy the link below and send it to the SaaSy Funnels team — we'll build the whole thing and have it ready to go.</p>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{flex:1,background:"#fff",border:"1px solid "+kjBorderAccent,borderRadius:8,padding:"9px 12px",fontSize:12,color:kjMuted,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shareUrl}</div>
                        <button onClick={copyShareLink} style={{...btn(),background:copied?"linear-gradient(135deg,#16A34A,#15803D)":sfGradient,whiteSpace:"nowrap",padding:"9px 16px",transition:"background 0.3s",boxShadow:"0 4px 12px rgba(107,53,200,0.2)"}}>{copied?"✓ Copied!":"Copy Link"}</button>
                      </div>
                    </div>
                  </div>
                </>
              ):(
                <div style={{padding:"8px 16px 16px",borderTop:"1px solid "+kjBorder,display:"flex",gap:8,alignItems:"flex-end",background:"#fff"}}>
                  <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(!input.trim()||loading)return;const t=input.trim();setInput("");send(t);}}}
                    placeholder="Type your answer..." rows={2} disabled={loading}
                    style={{flex:1,border:"1px solid "+kjBorder,borderRadius:10,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"#fff",color:kjText,lineHeight:1.5,opacity:loading?0.5:1}}/>
                  <button onClick={()=>{if(!input.trim()||loading)return;const t=input.trim();setInput("");send(t);}} disabled={loading||!input.trim()}
                    style={{...btn(),background:loading||!input.trim()?"#DDD0F5":sfGradient,padding:"12px 18px",fontSize:18,cursor:loading||!input.trim()?"not-allowed":"pointer",boxShadow:loading||!input.trim()?"none":"0 4px 12px rgba(244,84,122,0.2)"}}>→</button>
                </div>
              )}
            </>
          )}
        </div>

        <p style={{fontSize:11.5,color:"#9CA3AF",marginTop:14,marginBottom:20,textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>
          Powered by Claude · Built for Kajabi users · SaaSy Funnels
        </p>
      </div>
    </div>
  );
}
