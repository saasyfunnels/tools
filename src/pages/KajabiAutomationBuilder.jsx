import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_SYSTEM_PROMPT = `You are a Kajabi automation specialist helping coaches and course creators plan their Kajabi automations through a warm, friendly conversation — no tech jargon, no overwhelm.

You represent SaaSy Funnels by Meg Burrage. Your tone is warm, encouraging, plain-spoken, and a little bit sassy. You are talking to non-technical Kajabi users.

KAJABI AUTOMATION LANGUAGE — always use these plain English terms:
- Never say "trigger" — say "what kicks it off" or "what starts it"
- Never say "action" — say "what happens next"
- Never say "conditional" — say "only if" or "but only when"
- Kajabi calls them "Automations" not "workflows"
- The logic is WHEN this happens → THEN do this → ONLY IF this condition is met

CRITICAL KAJABI KNOWLEDGE — read carefully before advising anyone:

CHECKOUT & ACCESS — how Kajabi handles purchases:
When someone buys a paid offer through Kajabi checkout, Kajabi automatically handles access and login credentials. This is NOT an automation — it happens natively. You NEVER suggest "grant offer" after a purchase trigger. After a purchase, automations are used for things like adding to an email sequence, adding a tag, or registering for an event.

GRANT OFFER — what it actually means:
"Grant offer" is a THEN action used to give someone FREE access to a product without them paying. It is NOT related to paid purchases. Common uses:
1. FREE OPT-IN FLOW: When a form is submitted → Grant offer (Kajabi automatically sends system login email with credentials)
2. REWARD/BONUS: When a course is completed → Grant offer (give a bonus course as a reward)
3. MANUAL GIFT: Giving a client complimentary access to something
Grant offer always triggers Kajabi's system-generated offer grant email with login details automatically.

COMPLETE LIST OF WHEN TRIGGERS:
Offers: Offer is purchased / Offer is purchased as a gift / Gift is redeemed / Offer is granted / Recurring payment cancellation initiated or completed / Subscription payment successful / Subscription payment failed / Subscription cancellation initiated / Subscription cancellation complete / Payment plan complete
Assessments: Assessment is completed
Certificates: Certificate is sent
Tags: Tag is added / Tag is removed
Email Broadcasts: Email broadcast is opened / Link in email broadcast is clicked
Email Sequences: Email sequence is completed / Email sequence email is sent / Email sequence email is opened / Email sequence email is clicked
Events: Event is registered
Forms: Form is submitted
Activity: Person has been inactive for 7, 30, 60, or 90 days
Lessons: Lesson is completed
Quizzes: Quiz is completed / Quiz is failed / Quiz is passed
Social Media (Growth/Pro): Instagram comment is received / Any Instagram comment received / Facebook comment received / Any Facebook comment received
Coaching: Coaching session completed / All coaching sessions completed / Coaching sessions remaining / Additional coaching sessions purchased / Coaching upcoming invoice due date / Coaching invoice overdue

COMPLETE LIST OF THEN ACTIONS:
Offers: Grant an offer / Revoke an offer / Deactivate from offer (removes access AND stops payments) / Send an offer / Action by pricing option
Email Sequences: Subscribe to an email sequence / Unsubscribe from an email sequence
Events: Register to an event / Deregister from an event
Tags: Add a tag / Remove a tag
Emails: Send an email (one-off transactional email)
Coupons: Send a single-use coupon
Certificates: Send a certificate
Social Media: Send an Instagram direct message / Send an Instagram reply / Send a Facebook direct message / Send a Facebook reply
Coaching: Cancel coaching sessions / Remove coaching sessions / Send coaching invoice reminder / Send coaching session survey
Community: Send Community DM / Add a member to a private channel / Remove a member from private channel / Post in channel

COMPLETE LIST OF ONLY IF FILTERS (Growth/Pro plans only):
Contact: Is subscribed / Is a customer / Is hidden / Has a hard-bounced delivery / Excluded from mailing
Contact Activity: Contact added in the last / Contact added before the last
Customer Activity: Customer joined in the last / Customer visited a page in the last / Customer has not visited a page in the last
Email Engagement: Healthy contacts (0-90 days) / Passive contacts (91-180 days) / Unengaged (181-270 days) / Inactive (270+ days)
Email Activity: Delivered/not delivered email in last / Opened/not opened email in last / Clicked/not clicked email in last
Forms: Submitted any of these forms / Has not submitted form
Assessments: Completed / Passed / Failed any of these assessments
Products: Owns / Does not own / Previously owned product
Offers: Has / Does not have / Previously owned / Canceling offer
Coupons: Used any of these coupon codes
Email Broadcasts: Sent/not sent / Opened/not opened / Clicked/not clicked / Bounced/not bounced / Dropped/not dropped broadcast
Email Sequences: Subscribed / Not subscribed to email sequence
Events: Registered / Not registered to event
Tags: Has any of these tags / Has all of these tags / Does not have tags
Default Fields: Name / Email / Phone / Address / City / State / Country / Zip Code / Business Number contains
Custom Fields: Any custom form fields unique to the site

PLAN LIMITS:
Basic plan: Basic automations only — no Only If filters, no dedicated Automations tab in Marketing
Growth + Pro plans: Full Advanced Automations — Only If filters, branches, wait nodes, up to 5 branches per automation, up to 10 flows per automation

WHERE AUTOMATIONS LIVE IN KAJABI:
- Inside an Offer (Sales → Offers → select offer → Automations)
- Inside a Course Lesson (Products → select course → select lesson → Automations)
- Inside a Form (Marketing → Forms → select form → Automations)
- Inside an Event (Marketing → Events → select event → Automations)
- Inside an Email Campaign (Marketing → Email Campaigns → select campaign → Automations)
- In the dedicated Automations tab (Marketing → Automations) — Growth/Pro only

INTAKE PROCESS — ask ONE question at a time:
1. Ask what they want to automate in plain English
2. Find out what kicks it off — use the WHEN trigger list above to identify the right one
3. Find out what should happen first — use the THEN action list above
4. Ask about timing — should anything wait before the next step (wait nodes available in Automations 2.0)
5. Keep asking "what happens next?" until they're done
6. ALWAYS ask a cleanup question before finishing intake — something like: "When someone completes the goal of this automation (e.g. buys, joins, cancels, finishes a sequence), is there anything that should be cleaned up automatically? For example: removing a waitlist tag, unsubscribing from a sales sequence, removing an old tag, or revoking access they no longer need?" Prompt them to think about tags and sequences that might be left behind. Then include the appropriate cleanup steps — Unsubscribe from email sequence, Remove a tag, Revoke offer — as additional Then actions or a separate clump. Default to including cleanup if they're unsure.
7. Ask if there are any "only if" situations (and flag if they need Growth/Pro)
8. Ask if they want to personalise anything with the member's first name or other details
9. Ask which Kajabi plan they're on (Basic, Growth, or Pro) so you can flag if anything needs upgrading
10. Confirm the overall goal

MULTI-AUTOMATION DETECTION — critical:
Some requests naturally require more than one Kajabi automation clump working together. Detect this when the user describes:
- Different actions based on which product/pricing option was purchased
- Things that should happen at different points in a journey (e.g. after a sequence ends → upsell)
- Separate "When" triggers for different stages of the same goal
- Conditional paths that each need their own sequence or follow-up
When you detect this, plan ALL the clumps needed upfront — including how they link (usually via tags) — before asking further questions.

RULES:
- ONE question at a time — never stack questions
- Plain English only — use Kajabi's "When/Then/Only If" language naturally
- Be warm and encouraging
- Never suggest "grant offer" after a paid purchase trigger — that's wrong
- If something requires Growth/Pro, gently flag it
- Kajabi automations are separate "clumps" set in different places — make this clear when relevant
- HONESTY GUARDRAIL: Only ever recommend triggers and actions from the exact lists above. If a user's request cannot be fulfilled using those options, tell them warmly and honestly — say something like "That's a great idea, but Kajabi's automations can't do that on their own — here's what we can do instead..." and offer the closest native alternative. If a workaround needs a third-party tool like Zapier or Make, say so clearly rather than inventing a Kajabi-native solution that doesn't exist. Never suggest triggers or actions that aren't in the lists above.
- CONSOLIDATION PRINCIPLE: Where multiple paths share the same trigger type, consolidate into ONE automation clump with Only If branching rather than creating separate clumps. Only use separate clumps when the triggers are genuinely different. Example: different welcome sequences for different pricing options should be ONE clump with Only If checking which tag is present — not separate clumps per plan. Fewer clumps = easier for clients to manage and find in Kajabi.
- When you have everything, say exactly: "Brilliant — I have everything I need! Let me put your Kajabi automation plan together." Then output ONLY the JSON below.

OUTPUT FORMAT (when ready) — use planName at the top level, and include all clumps even if there are many:
\`\`\`json
{
  "planName": "string",
  "goal": "string",
  "planRequired": "Basic|Growth|Pro",
  "isMultiClump": true,
  "clumps": [
    {
      "id": 1,
      "title": "string",
      "location": "string (e.g. Inside your Form / Inside your Offer / Inside your Course - Lesson 1)",
      "when": {
        "trigger": "string",
        "description": "string"
      },
      "steps": [
        {
          "id": 1,
          "type": "Email Sequence|One-off Email|Grant Offer|Revoke Offer|Deactivate Offer|Tag|Wait|Event|Community|Coaching|Coupon|Certificate|Social",
          "title": "string",
          "detail": "string",
          "timing": "string or null",
          "tokens": []
        }
      ],
      "onlyIf": {
        "condition": "string",
        "ifYes": "string",
        "ifNo": "string"
      },
      "linkedByTag": "string or null",
      "leadsToClump": "number or null"
    }
  ],
  "tags": [
    { "name": "string", "purpose": "string" }
  ],
  "personalization": [],
  "planNotes": "string",
  "notes": "string"
}
\`\`\`
After the JSON, one warm closing sentence only.`;

const SEARCH_PROMPT = `Search for any new Kajabi automation features, triggers, or actions released or announced in the last 90 days. Return a brief plain-English summary of anything new. If nothing significant is found, say "No major updates found." Keep it under 150 words.`;

const PROMPTS = [
  "Give free course access when someone opts in",
  "Welcome new paying students automatically",
  "Follow up when a student completes a lesson",
  "Reward students who finish my course",
  "Re-engage members who've gone quiet",
  "Remove access when a subscription cancels",
];

const STEP_COLORS = {
  "Email Sequence": { bg:"#EDE5FF", border:"#6B35C8", icon:"📧" },
  "One-off Email":  { bg:"#F3E5FF", border:"#9B35C8", icon:"✉️" },
  "Grant Offer":    { bg:"#E5FFE9", border:"#1B7E33", icon:"🎁" },
  "Revoke Offer":   { bg:"#FFE5E5", border:"#C0392B", icon:"🚫" },
  "Deactivate Offer": { bg:"#FFE8E8", border:"#A93226", icon:"⛔" },
  "Tag":            { bg:"#E5F6FF", border:"#0077B6", icon:"🏷" },
  "Wait":           { bg:"#FFF4E0", border:"#E07B00", icon:"⏱" },
  "Event":          { bg:"#FFE5F3", border:"#D4006A", icon:"📅" },
  "Community":      { bg:"#F0E5FF", border:"#7B2FBE", icon:"👥" },
  "Coaching":       { bg:"#E5F0FF", border:"#1A5FB4", icon:"🎯" },
  "Coupon":         { bg:"#FFF4E0", border:"#E07B00", icon:"🎟" },
  "Certificate":    { bg:"#FFFDE5", border:"#B8A000", icon:"🏆" },
  "Social":         { bg:"#FFE5F3", border:"#D4006A", icon:"💬" },
};

const purple = "linear-gradient(135deg,#4A1A9E,#6B35C8)";
const pink   = "linear-gradient(135deg,#D4006A,#F4547A)";
const btn = (extra={}) => ({ border:"none", borderRadius:10, padding:"11px 14px", cursor:"pointer", fontSize:13, fontFamily:"Georgia,serif", color:"#fff", ...extra });

function encodeSpec(data) { try { return btoa(encodeURIComponent(JSON.stringify(data))); } catch(e) { return ""; } }
function decodeSpec(str) { try { return JSON.parse(decodeURIComponent(atob(str))); } catch(e) { return null; } }
function getShareUrl(data) { const e=encodeSpec(data); const base=window.location.href.split("?")[0]; return `${base}?spec=${e}`; }

function Dots() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"14px 18px",background:"#fff",borderRadius:"18px 18px 18px 4px",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
      {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#6B35C8",animation:"bounce 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>)}
    </div>
  );
}

function Bubble({ msg }) {
  const u = msg.role==="user";
  return (
    <div style={{display:"flex",justifyContent:u?"flex-end":"flex-start",marginBottom:12,animation:"fadeUp 0.3s ease forwards"}}>
      {!u && <div style={{width:34,height:34,borderRadius:"50%",background:purple,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,marginTop:2,color:"#fff"}}>✦</div>}
      <div style={{maxWidth:"72%",background:u?purple:"#fff",color:u?"#fff":"#1E0A4A",padding:"13px 18px",borderRadius:u?"18px 18px 4px 18px":"18px 18px 18px 4px",fontSize:14.5,lineHeight:1.6,boxShadow:u?"0 2px 12px rgba(107,53,200,0.3)":"0 1px 4px rgba(0,0,0,0.08)",whiteSpace:"pre-wrap",fontFamily:"Georgia,serif"}}>
        {msg.content}
      </div>
    </div>
  );
}

function PlanBadge({ plan }) {
  const colors = { Basic:["#E5F6FF","#0077B6"], Growth:["#EDE5FF","#6B35C8"], Pro:["#FFE5F3","#D4006A"] };
  const [bg,border] = colors[plan]||colors.Basic;
  return <span style={{fontSize:11,background:bg,border:`1px solid ${border}`,color:border,borderRadius:20,padding:"3px 10px",fontWeight:"bold",display:"inline-block"}}>{plan} Plan Required</span>;
}

function StepRow({ step, idx }) {
  const c = STEP_COLORS[step.type]||STEP_COLORS.Tag;
  return (
    <div style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
      <div style={{width:22,height:22,borderRadius:"50%",background:c.border,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:"bold",flexShrink:0,marginTop:2}}>{idx+1}</div>
      <div style={{flex:1,background:c.bg,border:`1.5px solid ${c.border}`,borderRadius:10,padding:"10px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
          <span style={{fontSize:15}}>{c.icon}</span>
          <span style={{fontSize:10,fontWeight:"bold",color:c.border,textTransform:"uppercase",letterSpacing:"0.06em"}}>{step.type}</span>
          {step.timing&&<span style={{marginLeft:"auto",fontSize:10,background:"#fff",border:`1px solid ${c.border}`,color:c.border,borderRadius:20,padding:"1px 7px"}}>{step.timing}</span>}
        </div>
        <div style={{fontFamily:"Georgia,serif",fontSize:13.5,fontWeight:"bold",color:"#1E0A4A",marginBottom:2}}>{step.title}</div>
        <div style={{fontFamily:"Georgia,serif",fontSize:12,color:"#3D2B6B",lineHeight:1.5}}>{step.detail}</div>
        {step.tokens?.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>{step.tokens.map((t,i)=><span key={i} style={{fontSize:10,background:"#fff",border:`1px solid ${c.border}`,color:c.border,borderRadius:4,padding:"1px 5px",fontFamily:"monospace"}}>{t}</span>)}</div>}
      </div>
    </div>
  );
}

function Clump({ clump, idx, total }) {
  const locationColors = [
    ["#FFF0E5","#E07B00"],["#EDE5FF","#6B35C8"],["#E5FFE9","#1B7E33"],
    ["#FFE5F3","#D4006A"],["#E5F6FF","#0077B6"],["#F0E5FF","#7B2FBE"],
  ];
  const [hbg, hborder] = locationColors[idx % locationColors.length];

  return (
    <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 16px rgba(30,10,74,0.08)",marginBottom:16}}>
      {/* Header */}
      <div style={{background:hbg,borderBottom:`2px solid ${hborder}`,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:hborder,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:"bold",flexShrink:0}}>{idx+1}</div>
        <div>
          <div style={{fontSize:10,fontWeight:"bold",color:hborder,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>📍 {clump.location}</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:"bold",color:"#1E0A4A"}}>{clump.title}</div>
        </div>
      </div>

      <div style={{padding:"14px 16px"}}>
        {/* When */}
        <div style={{background:"#FFF0E5",border:"1.5px solid #E07B00",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:"bold",color:"#E07B00",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>⚡ When this happens</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:13.5,fontWeight:"bold",color:"#1E0A4A",marginBottom:2}}>{clump.when.trigger}</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:12,color:"#5A3A10",lineHeight:1.4}}>{clump.when.description}</div>
        </div>

        {/* Arrow */}
        <div style={{textAlign:"center",fontSize:12,color:"#9B7FD4",margin:"6px 0",fontStyle:"italic"}}>then…</div>

        {/* Steps */}
        {clump.steps.map((step,i)=>(
          <div key={step.id}>
            <StepRow step={step} idx={i}/>
            {i < clump.steps.length-1 && <div style={{textAlign:"center",fontSize:11,color:"#C4A8F0",margin:"2px 0 6px",fontStyle:"italic"}}>and then…</div>}
          </div>
        ))}

        {/* Only If */}
        {clump.onlyIf && clump.onlyIf.condition && (
          <div style={{background:"#FFF8E1",border:"1.5px dashed #B8860B",borderRadius:10,padding:"12px 14px",marginTop:8}}>
            <div style={{fontSize:10,fontWeight:"bold",color:"#B8860B",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>🔀 Only If (Growth/Pro)</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold",color:"#1E0A4A",marginBottom:8}}>{clump.onlyIf.condition}</div>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,background:"#E5FFE9",border:"1.5px solid #1B7E33",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:10,fontWeight:"bold",color:"#1B7E33",marginBottom:3}}>✓ IF YES</div>
                <div style={{fontSize:12,color:"#1E0A4A",fontFamily:"Georgia,serif"}}>{clump.onlyIf.ifYes}</div>
              </div>
              <div style={{flex:1,background:"#FFE5E5",border:"1.5px solid #C0392B",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:10,fontWeight:"bold",color:"#C0392B",marginBottom:3}}>✗ IF NO</div>
                <div style={{fontSize:12,color:"#1E0A4A",fontFamily:"Georgia,serif"}}>{clump.onlyIf.ifNo}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TagPill({ tag }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EDE5FF",border:"1.5px solid #6B35C8",borderRadius:20,padding:"4px 12px",fontSize:11,color:"#4A1A9E",fontFamily:"monospace",marginRight:6,marginBottom:4}}>
      <span style={{fontSize:13}}>🏷</span> {tag.name}
      {tag.purpose && <span style={{color:"#8A6FBF",fontSize:10,fontFamily:"Georgia,serif"}}>— {tag.purpose}</span>}
    </div>
  );
}

function AutomationMap({ data }) {
  const planName = data.planName || data.automationName || "Automation Plan";
  const clumps = data.clumps || [];
  const isMulti = data.isMultiClump && clumps.length > 1;

  return (
    <div style={{padding:"24px 20px"}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{display:"inline-block",background:purple,color:"#fff",borderRadius:100,padding:"6px 20px",fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
          {isMulti ? `✦ ${clumps.length}-Automation Plan` : "✦ Kajabi Automation Map"}
        </div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:20,color:"#1E0A4A",margin:"0 0 6px"}}>{planName}</h2>
        <p style={{fontFamily:"Georgia,serif",fontSize:13.5,color:"#5A4080",margin:"0 0 10px"}}>{data.goal}</p>
        {data.planRequired&&<PlanBadge plan={data.planRequired}/>}
      </div>

      {/* How to read note */}
      <div style={{background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:10,padding:"12px 16px",marginBottom:20,fontFamily:"Georgia,serif",fontSize:13,color:"#5A4080",lineHeight:1.6}}>
        💡 <strong>{isMulti ? `This plan has ${clumps.length} automations working together.` : "How to read this:"}</strong> {isMulti ? "Each block below is a separate automation to create in Kajabi, linked together by tags. Build them in the order shown." : "Kajabi automations are set up in separate places across your account — not as one long chain. Each block below is a separate automation to create. Together they do the full job."}
      </div>

      {/* Tags overview for multi-clump */}
      {isMulti && data.tags?.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Tags used to connect these automations</div>
          <div>{data.tags.map((t,i)=><TagPill key={i} tag={t}/>)}</div>
        </div>
      )}

      {/* Clumps */}
      {clumps.map((clump, i)=>{
        const linkedClump = clump.leadsToClump ? clumps.find(c=>c.id===clump.leadsToClump) : null;
        return (
          <div key={clump.id}>
            <Clump clump={clump} idx={i} total={clumps.length}/>
            {linkedClump ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"4px 0 12px"}}>
                <div style={{width:2,height:14,background:"#C4A8F0"}}/>
                <div style={{background:"#EDE5FF",border:"1.5px solid #6B35C8",borderRadius:20,padding:"4px 14px",fontSize:11,color:"#4A1A9E",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                  🏷 {clump.linkedByTag ? `adds tag "${clump.linkedByTag}" →` : "links to"} <strong>Automation {linkedClump.id}: {linkedClump.title}</strong>
                </div>
                <div style={{width:2,height:14,background:"#C4A8F0"}}/>
                <div style={{fontSize:16,color:"#6B35C8",lineHeight:1}}>▼</div>
              </div>
            ) : i < clumps.length-1 && (
              <div style={{textAlign:"center",fontFamily:"Georgia,serif",fontSize:12,color:"#9B7FD4",fontStyle:"italic",margin:"-4px 0 12px"}}>↓ separately, another automation…</div>
            )}
          </div>
        );
      })}

      {/* Written spec */}
      <div style={{marginTop:24,background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:14,padding:"20px 22px"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:16,color:"#1E0A4A",margin:"0 0 16px"}}>📄 Full Automation Spec</h3>

        {[["Plan Name", data.planName || data.automationName],["Goal",data.goal]].map(([l,v])=>(
          <div key={l} style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{l}</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:14,color:"#1E0A4A"}}>{v}</div>
          </div>
        ))}

        {data.planRequired&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Kajabi Plan Required</div>
            <PlanBadge plan={data.planRequired}/>
            {data.planNotes&&<div style={{fontFamily:"Georgia,serif",fontSize:13,color:"#3D2B6B",marginTop:8,lineHeight:1.5}}>{data.planNotes}</div>}
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>The Automations to Build</div>
          {data.clumps.map((clump,i)=>(
            <div key={clump.id} style={{background:"#fff",border:"1.5px solid #DDD0F5",borderRadius:10,padding:"14px 16px",marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:"bold",color:"#9B7FD4",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Automation {i+1} — {clump.location}</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:13,color:"#E07B00",marginBottom:6}}>⚡ When: {clump.when.trigger} — {clump.when.description}</div>
              {clump.steps.map((s,si)=>(
                <div key={s.id} style={{fontFamily:"Georgia,serif",fontSize:13,color:"#1E0A4A",marginBottom:4,paddingLeft:8,borderLeft:"2px solid #DDD0F5"}}>
                  → {s.title} ({s.type}){s.timing?` — ${s.timing}`:""}
                  <div style={{fontSize:12,color:"#5A4080"}}>{s.detail}</div>
                </div>
              ))}
              {clump.onlyIf?.condition&&<div style={{fontFamily:"Georgia,serif",fontSize:12,color:"#B8860B",marginTop:8,fontStyle:"italic"}}>🔀 Only If: {clump.onlyIf.condition} → Yes: {clump.onlyIf.ifYes} / No: {clump.onlyIf.ifNo}</div>}
            </div>
          ))}
        </div>

        {data.tags?.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Tags Used to Connect Automations</div>
            {data.tags.map((t,i)=>(
              <div key={i} style={{fontSize:13,color:"#1E0A4A",marginBottom:4,fontFamily:"Georgia,serif"}}>
                <span style={{fontFamily:"monospace",background:"#EDE5FF",border:"1px solid #6B35C8",color:"#4A1A9E",borderRadius:4,padding:"1px 6px",fontSize:11}}>{t.name}</span> — {t.purpose}
              </div>
            ))}
          </div>
        )}
        {data.personalization?.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Personalisation Used</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{data.personalization.map((t,i)=><span key={i} style={{fontSize:12,background:"#EDE5FF",border:"1px solid #6B35C8",color:"#4A1A9E",borderRadius:4,padding:"3px 8px",fontFamily:"monospace"}}>{t}</span>)}</div>
          </div>
        )}

        {data.notes&&(
          <div>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Notes for Your Builder</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:13.5,color:"#3D2B6B",lineHeight:1.6,background:"#EDE5FF",border:"1.5px solid #6B35C8",borderRadius:10,padding:"14px"}}>{data.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildHTML(data) {
  const locationColors = ["#E07B00","#6B35C8","#1B7E33","#D4006A","#0077B6","#7B2FBE"];
  const clumpHTML = data.clumps.map((clump,i)=>{
    const col = locationColors[i%locationColors.length];
    const stepsHTML = clump.steps.map((s,si)=>{
      const sc = STEP_COLORS[s.type]||STEP_COLORS.Tag;
      return `<div style="display:flex;gap:10px;margin-bottom:8px;"><div style="width:20px;height:20px;border-radius:50%;background:${sc.border};color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;flex-shrink:0;">${si+1}</div><div style="flex:1;background:${sc.bg};border:1.5px solid ${sc.border};border-radius:8px;padding:10px 12px;"><div style="font-size:11px;font-weight:bold;color:${sc.border};text-transform:uppercase;margin-bottom:3px;">${sc.icon} ${s.type}${s.timing?` · ${s.timing}`:""}</div><div style="font-size:14px;font-weight:bold;color:#1E0A4A;margin-bottom:2px;">${s.title}</div><div style="font-size:12px;color:#3D2B6B;line-height:1.5;">${s.detail}</div></div></div>`;
    }).join('<div style="text-align:center;font-size:11px;color:#C4A8F0;margin:2px 0;font-style:italic;">and then…</div>');
    const onlyIfHTML = clump.onlyIf?.condition?`<div style="background:#FFF8E1;border:1.5px dashed #B8860B;border-radius:8px;padding:12px 14px;margin-top:8px;"><div style="font-size:10px;font-weight:bold;color:#B8860B;text-transform:uppercase;margin-bottom:6px;">🔀 Only If (Growth/Pro): ${clump.onlyIf.condition}</div><div style="display:flex;gap:8px;"><div style="flex:1;background:#E5FFE9;border:1.5px solid #1B7E33;border-radius:6px;padding:8px;font-size:12px;"><b style="color:#1B7E33;display:block;margin-bottom:3px;">✓ Yes</b>${clump.onlyIf.ifYes}</div><div style="flex:1;background:#FFE5E5;border:1.5px solid #C0392B;border-radius:6px;padding:8px;font-size:12px;"><b style="color:#C0392B;display:block;margin-bottom:3px;">✗ No</b>${clump.onlyIf.ifNo}</div></div></div>`:"";
    return `<div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(30,10,74,0.08);margin-bottom:16px;"><div style="background:#F8F4FF;border-bottom:2px solid ${col};padding:12px 16px;"><div style="font-size:10px;font-weight:bold;color:${col};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">📍 ${clump.location}</div><div style="font-size:15px;font-weight:bold;color:#1E0A4A;">${clump.title}</div></div><div style="padding:14px 16px;"><div style="background:#FFF0E5;border:1.5px solid #E07B00;border-radius:8px;padding:10px 12px;margin-bottom:10px;"><div style="font-size:10px;font-weight:bold;color:#E07B00;text-transform:uppercase;margin-bottom:4px;">⚡ When this happens</div><div style="font-size:14px;font-weight:bold;color:#1E0A4A;">${clump.when.trigger}</div><div style="font-size:12px;color:#5A3A10;margin-top:2px;">${clump.when.description}</div></div><div style="text-align:center;font-size:11px;color:#9B7FD4;margin:6px 0;font-style:italic;">then…</div>${stepsHTML}${onlyIfHTML}</div></div>${i<data.clumps.length-1?'<div style="text-align:center;font-size:12px;color:#9B7FD4;font-style:italic;margin:-4px 0 12px;">↓ separately, another automation…</div>':""}`;
  }).join("");
  const planColors = { Basic:["#E5F6FF","#0077B6"], Growth:["#EDE5FF","#6B35C8"], Pro:["#FFE5F3","#D4006A"] };
  const [pbg,pb] = planColors[data.planRequired]||planColors.Basic;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${data.automationName} — Kajabi Automation Map</title><style>body{font-family:Georgia,serif;background:#F8F4FF;margin:0;padding:30px;color:#1E0A4A;max-width:700px;margin:0 auto;}@media print{body{background:#fff;}}</style></head><body><div style="display:inline-block;background:linear-gradient(135deg,#4A1A9E,#6B35C8);color:#fff;border-radius:100px;padding:5px 16px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">✦ SaaSy Funnels · Kajabi Automation Map</div><h1 style="font-size:24px;margin:4px 0;">${data.automationName}</h1><p style="color:#5A4080;margin-bottom:10px;">${data.goal}</p><span style="font-size:11px;background:${pbg};border:1px solid ${pb};color:${pb};border-radius:20px;padding:3px 10px;font-weight:bold;display:inline-block;margin-bottom:20px;">${data.planRequired} Plan Required</span><div style="background:#fff;border:1.5px solid #DDD0F5;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#5A4080;line-height:1.6;">💡 <strong>How to read this:</strong> Each block below is a separate automation to create in different places inside Kajabi. Together they do the full job.</div>${clumpHTML}${data.notes?`<div style="background:#EDE5FF;border:1.5px solid #6B35C8;border-radius:10px;padding:14px;font-size:13px;color:#3D2B6B;line-height:1.6;margin-top:16px;"><strong>📝 Notes for your builder:</strong><br/>${data.notes}</div>`:""}<p style="margin-top:32px;font-size:11px;color:#9B7FD4;text-align:center;">Generated by SaaSy Funnels · Kajabi Automation Builder · Powered by Claude</p></body></html>`;
}

function OptInGate({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => { if(!name.trim()||!email.trim())return; setLoading(true); await onSubmit(name.trim(),email.trim()); setLoading(false); };
  return (
    <div style={{animation:"fadeUp 0.4s ease",margin:"8px 0",background:"linear-gradient(135deg,#F8F4FF,#EDE5FF)",border:"2px solid #6B35C8",borderRadius:16,padding:"24px 22px"}}>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:28,marginBottom:8}}>🎉</div>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1E0A4A",margin:"0 0 8px"}}>Your automation plan is ready!</h3>
        <p style={{fontFamily:"Georgia,serif",fontSize:13.5,color:"#5A4080",margin:0,lineHeight:1.5}}>Pop in your details and I'll generate your visual map and email you a copy to keep.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your first name" style={{border:"1.5px solid #DDD0F5",borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"Georgia,serif",color:"#1E0A4A",background:"#fff",outline:"none"}}/>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" type="email" style={{border:"1.5px solid #DDD0F5",borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"Georgia,serif",color:"#1E0A4A",background:"#fff",outline:"none"}}/>
        <button onClick={handleSubmit} disabled={loading||!name.trim()||!email.trim()} style={{...btn(),background:(!name.trim()||!email.trim())?"#D8C8F0":purple,padding:"13px",fontSize:14,boxShadow:"0 4px 12px rgba(107,53,200,0.3)",cursor:(!name.trim()||!email.trim())?"not-allowed":"pointer",opacity:loading?0.7:1}}>
          {loading?"Generating your map...":"Show me my automation map →"}
        </button>
      </div>
      <p style={{fontFamily:"Georgia,serif",fontSize:11.5,color:"#9B7FD4",textAlign:"center",margin:"12px 0 0"}}>No spam — just your automation plan. Promise! 💜</p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [wfData, setWfData] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [leadInfo, setLeadInfo] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(BASE_SYSTEM_PROMPT);
  const [kajabiUpdates, setKajabiUpdates] = useState(null);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewingShared, setViewingShared] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const spec=params.get("spec");
    if(spec){const d=decodeSpec(spec);if(d){setWfData(d);setViewingShared(true);setStarted(true);}}
    fetchKajabiUpdates();
  },[]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading,showGate]);

  const fetchKajabiUpdates = async () => {
    setLoadingUpdates(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY||""},body:JSON.stringify({model:"claude-sonnet-4-5-20250929",max_tokens:400,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:SEARCH_PROMPT}]})});
      const data=await res.json();
      const text=data.content?.filter(b=>b.type==="text").map(b=>b.text).join(" ")||"";
      if(text&&!text.includes("No major updates")){setKajabiUpdates(text.trim());setSystemPrompt(BASE_SYSTEM_PROMPT+`\n\nRECENT KAJABI UPDATES:\n${text.trim()}`);}
    } catch(e){}
    setLoadingUpdates(false);
  };

  const parseJSON=text=>{try{const m=text.match(/```json\s*([\s\S]*?)```/);if(m)return JSON.parse(m[1]);}catch(e){}return null;};

  const callClaude=async history=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY||""},body:JSON.stringify({model:"claude-sonnet-4-5-20250929",max_tokens:2000,system:systemPrompt,messages:history.map(m=>({role:m.role,content:m.content}))})});
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
      if(parsed){setPendingData(parsed);setShowGate(true);}
    }catch(e){setMessages(prev=>[...prev,{role:"assistant",content:"Something went wrong — please try again."}]);}
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleOptIn=async(name,email)=>{
    setLeadInfo({name,email});
    setShowGate(false);
    setWfData(pendingData);
    setShareUrl(getShareUrl(pendingData));
    try{
      await fetch("WEBHOOK_URL",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY||""},body:JSON.stringify({firstName:name,email,automationName:pendingData.automationName,goal:pendingData.goal,planRequired:pendingData.planRequired,source:"kajabi-automation-builder",shareUrl:getShareUrl(pendingData)})});
    }catch(e){}
  };

  const start=async text=>{setStarted(true);await send(text);};
  const reset=()=>{setMessages([]);setInput("");setStarted(false);setWfData(null);setPendingData(null);setShowGate(false);setLeadInfo(null);setShareUrl("");setCopied(false);setViewingShared(false);historyRef.current=[];window.history.replaceState({},"",window.location.pathname);};
  const downloadHTML=()=>{if(!wfData)return;const blob=new Blob([buildHTML(wfData)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${wfData.automationName.replace(/\s+/g,"-")}-kajabi-automation.html`;a.click();URL.revokeObjectURL(url);};
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

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F4547A 0%,#E8839A 50%,#c96fa0 100%)",fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px 0"}}>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-6px);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        textarea:focus{outline:none} textarea{resize:none} input:focus{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#6B35C8;border-radius:2px}
      `}</style>

      <div style={{width:"100%",maxWidth:660,display:"flex",justifyContent:"flex-start",marginBottom:8,animation:"fadeIn 0.4s ease"}}>
        <button onClick={()=>navigate("/")} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",backdropFilter:"blur(8px)"}}>← Dashboard</button>
      </div>

      <div style={{textAlign:"center",marginBottom:28,animation:"fadeIn 0.6s ease"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:purple,color:"#fff",padding:"7px 18px",borderRadius:100,fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14,boxShadow:"0 4px 16px rgba(107,53,200,0.35)"}}>
          <span>✦</span> Kajabi Automation Planner
        </div>
        <h1 style={{fontSize:28,fontWeight:"normal",color:"#fff",margin:"0 0 8px",lineHeight:1.2}}>
          {viewingShared?`Shared Automation: ${wfData?.automationName}`:"Plan your Kajabi automation"}
        </h1>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:15,margin:0,maxWidth:440}}>
          {viewingShared?"Your client shared this automation plan with you for DFY support.":"No tech knowledge needed — describe what you want and I'll plan it all out for you."}
        </p>
        {loadingUpdates&&<div style={{marginTop:10,fontSize:12,color:"rgba(255,255,255,0.75)",animation:"pulse 1.5s ease infinite"}}>↻ Checking for latest Kajabi updates...</div>}
        {kajabiUpdates&&!loadingUpdates&&<div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#fff"}}><span>✓</span> Updated with latest Kajabi features</div>}
      </div>

      <div style={{width:"100%",maxWidth:660,background:"#fff",borderRadius:20,boxShadow:"0 8px 40px rgba(30,10,74,0.2)",overflow:"hidden",display:"flex",flexDirection:"column",height:started?"calc(100vh - 200px)":"auto",minHeight:started?400:"auto",animation:"fadeIn 0.5s ease"}}>

        {viewingShared&&wfData?(
          <>
            <div style={{flex:1,overflowY:"auto"}}><AutomationMap data={wfData}/></div>
            <div style={{padding:"12px 16px 16px",borderTop:"1px solid #EDE5FF",display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purple,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
              <button onClick={downloadPDF}  style={{...btn(),flex:1,minWidth:130,background:pink,boxShadow:"0 4px 12px rgba(212,0,106,0.3)"}}>↓ Download / Print PDF</button>
              <button onClick={reset} style={{...btn(),background:"#fff",color:"#1E0A4A",border:"1.5px solid #DDD0F5"}}>Start New</button>
            </div>
          </>
        ):!started?(
          <div style={{padding:"32px 28px 28px"}}>
            <p style={{color:"#1E0A4A",fontSize:14.5,marginTop:0,marginBottom:20,lineHeight:1.6}}>What do you want to automate in Kajabi? Pick a common one or describe it yourself:</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {PROMPTS.map((p,i)=>(
                <button key={i} onClick={()=>start(p)} style={{background:"#fff",border:"1.5px solid #DDD0F5",borderRadius:12,padding:"12px 16px",textAlign:"left",cursor:"pointer",fontSize:14,color:"#1E0A4A",fontFamily:"Georgia,serif",lineHeight:1.4,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#6B35C8";e.currentTarget.style.background="#F3EEFF";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#DDD0F5";e.currentTarget.style.background="#fff";}}>
                  <span style={{color:"#6B35C8",fontSize:16}}>→</span> {p}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(input.trim())start(input.trim());}}}
                placeholder="Or describe what you want to automate..." rows={2}
                style={{flex:1,border:"1.5px solid #DDD0F5",borderRadius:12,padding:"12px 14px",fontSize:14,fontFamily:"Georgia,serif",background:"#fff",color:"#1E0A4A",lineHeight:1.5}}/>
              <button onClick={()=>input.trim()&&start(input.trim())} style={{...btn(),background:purple,padding:"12px 18px",fontSize:18,boxShadow:"0 4px 12px rgba(107,53,200,0.4)"}}>→</button>
            </div>
          </div>
        ):(
          <>
            <div style={{flex:1,overflowY:"auto",padding:"24px 20px 12px"}}>
              {displayMsgs.map((m,i)=><Bubble key={i} msg={m}/>)}
              {loading&&<div style={{display:"flex",marginBottom:12}}><div style={{width:34,height:34,borderRadius:"50%",background:purple,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,color:"#fff"}}>✦</div><Dots/></div>}
              {showGate&&!wfData&&<OptInGate onSubmit={handleOptIn}/>}
              {wfData&&(
                <div style={{animation:"fadeUp 0.4s ease",marginTop:8,background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:16,overflow:"hidden"}}>
                  {leadInfo&&<div style={{background:purple,color:"#fff",padding:"12px 20px",fontFamily:"Georgia,serif",fontSize:13.5}}>Hey {leadInfo.name}! Here's your automation plan — a copy is on its way to {leadInfo.email} 💜</div>}
                  <AutomationMap data={wfData}/>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {wfData&&(
              <>
                <div style={{padding:"12px 16px 8px",borderTop:"1px solid #EDE5FF",display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purple,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
                  <button onClick={downloadPDF}  style={{...btn(),flex:1,minWidth:130,background:pink,boxShadow:"0 4px 12px rgba(212,0,106,0.3)"}}>↓ Download / Print PDF</button>
                  <button onClick={reset} style={{...btn(),background:"#fff",color:"#1E0A4A",border:"1.5px solid #DDD0F5"}}>Start Over</button>
                </div>
                <div style={{padding:"0 16px 16px"}}>
                  <div style={{background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:12,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                      📋 Want us to build {wfData?.clumps?.length > 1 ? `these ${wfData.clumps.length} automations` : "this"} for you?
                    </div>
                    <p style={{fontFamily:"Georgia,serif",fontSize:13,color:"#3D2B6B",margin:"0 0 10px",lineHeight:1.5}}>Copy the link below and send it to the SaaSy Funnels team — we'll build {wfData?.clumps?.length > 1 ? "the full automation plan" : "your automation"} and have it ready to go.</p>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{flex:1,background:"#fff",border:"1.5px solid #DDD0F5",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#5A4080",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shareUrl}</div>
                      <button onClick={copyShareLink} style={{...btn(),background:copied?"linear-gradient(135deg,#1B7E33,#2ECC71)":purple,whiteSpace:"nowrap",padding:"9px 16px",transition:"background 0.3s",boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>{copied?"✓ Copied!":"Copy Link"}</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!wfData&&!showGate&&(
              <div style={{padding:"8px 16px 16px",borderTop:"1px solid #EDE5FF",display:"flex",gap:8,alignItems:"flex-end"}}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(!input.trim()||loading)return;const t=input.trim();setInput("");send(t);}}}
                  placeholder="Type your answer..." rows={2} disabled={loading}
                  style={{flex:1,border:"1.5px solid #DDD0F5",borderRadius:12,padding:"11px 14px",fontSize:14,fontFamily:"Georgia,serif",background:"#fff",color:"#1E0A4A",lineHeight:1.5,opacity:loading?0.6:1}}/>
                <button onClick={()=>{if(!input.trim()||loading)return;const t=input.trim();setInput("");send(t);}} disabled={loading||!input.trim()}
                  style={{...btn(),background:loading||!input.trim()?"#D8C8F0":purple,padding:"12px 18px",fontSize:18,cursor:loading||!input.trim()?"not-allowed":"pointer",boxShadow:loading||!input.trim()?"none":"0 4px 12px rgba(107,53,200,0.4)"}}>→</button>
              </div>
            )}
          </>
        )}
      </div>
      <p style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",marginTop:14,marginBottom:20,textAlign:"center"}}>Powered by Claude · Built for Kajabi users · SaaSy Funnels</p>
    </div>
  );
}
