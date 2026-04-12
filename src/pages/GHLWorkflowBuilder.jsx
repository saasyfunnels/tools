import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_SYSTEM_PROMPT = `You are a GoHighLevel (GHL) workflow specialist helping small business owners build automation workflows. Have a warm, conversational intake — no jargon, no overwhelm. Ask ONE question at a time.

INTAKE PROCESS:
1. Ask what they want to automate
2. Find out what kicks it off (the trigger)
3. Find out what should happen — keep asking "what happens next?" until they're done
4. Identify any if/then branches or conditions
5. Identify any timing/wait steps
6. ALWAYS ask a cleanup question before finishing intake — something like: "When someone completes the goal of this workflow (e.g. buys, books, joins, cancels), is there anything that should be cleaned up automatically? For example: removing them from a waitlist, unsubscribing from a sales sequence, removing an old tag, or stopping another workflow?" Prompt them to think about tags, sequences, and pipeline stages that might be left behind. Then include the appropriate cleanup steps — Goal Event for sequence exit, Remove Contact Tag, Remove from Workflow — in the output. Default to including cleanup if they're unsure.
7. Ask about personalization tokens
8. Confirm the goal

MULTI-WORKFLOW DETECTION — this is critical:
Some requests naturally require more than one GHL workflow. Detect this when the user describes:
- Different actions based on which product/plan/option was purchased
- Things that should happen at different points in time (e.g. after a sequence ends)
- Separate triggers for different stages (purchase → sequence end → upsell)
- Branch paths that each need their own sequence or follow-up
When you detect this, map out ALL the workflows needed — including how they link together via tags.

GHL WORKFLOW TRIGGERS (use only these — never invent triggers that don't exist):
Contact: Contact Created, Contact Tag (added/removed), Contact Changed, Birthday Reminder, Custom Date Reminder, Note Added, Task Added, Task Completed, Contact Engagement Score
Events: Form Submitted, Survey Submitted, Trigger Link Clicked, Facebook Lead Form Submitted, TikTok Form Submitted, LinkedIn Lead Form Submitted, Google Lead Form Submitted, Quiz Submitted, Funnel/Website PageView, Video Tracking, Email Events, Customer Replied, Conversation AI Trigger, Inbound Webhook, Scheduler, Custom Trigger, Number Validation, New Review Received, External Tracking Event, Click To WhatsApp Ads
Appointments: Customer Booked Appointment, Appointment Status, Service Booking, Rental Booking
Opportunities: Opportunity Created, Opportunity Status Changed, Opportunity Changed, Pipeline Stage Changed, Stale Opportunities
Courses: New Signup, Lesson Started, Lesson Completed, Category Started, Category Completed, Product Started, Product Completed, Offer Access Granted, Offer Access Removed, Product Access Granted, Product Access Removed, User Login
Payments: Payment Received, Order Form Submission, Order Submitted, Invoice, Subscription, Documents & Contracts, Estimates, Refund, Coupon Code Applied, Coupon Code Redeemed, Coupon Code Expired
Ecommerce: Shopify Order Placed, Order Fulfilled, Abandoned Checkout, Product Review Submitted
Social/Community: Facebook Comment on Post, Instagram Comment on Post, TikTok Comment on Video, Group Access Granted, Group Access Revoked, Private Channel Access Granted/Revoked, Community Leaderboard Level Changed
Other: Certificates Issued, Transcript Generated, Affiliate Created, New Affiliate Sales, Start IVR Trigger

GHL WORKFLOW ACTIONS (use only these):
Contact: Create Contact, Find Contact, Update Contact Field, Add Contact Tag, Remove Contact Tag, Assign to User, Remove Assigned User, Edit Conversation, Disable/Enable DND, Add Note, Add Task, Copy Contact, Delete Contact, Modify Engagement Score, Add/Remove Followers
Communication: Send Email, Send SMS, Send Slack Message, Call, Messenger, Instagram DM, Manual Action, GMB Messaging, Send Internal Notification, Send Review Request, Conversation AI, Facebook Interactive Messenger, Instagram Interactive Messenger, Reply in Comments, WhatsApp, Send Live Chat Message
Data: Webhook/Custom Webhook, Google Sheets
Logic/Flow: If Else, Wait Step, Goal Event, Split (A/B test), Update Custom Value, Go To (another workflow), Remove from Workflow, Arrays, Drip Mode, Text Formatter, Custom Code
AI: AI Prompt (GPT-3), Conversation AI
Appointments: Update Appointment Status, Generate One Time Booking Link
Opportunities: Create/Update Opportunity, Remove Opportunity
Payments: Stripe One-Time Charge, Send Invoice, Send Documents and Contracts
Marketing: Add to Google Analytics, Add to Google AdWords, Add/Remove Custom Audience (Facebook), Facebook Conversion API
Affiliates: Add to Affiliate Manager, Update Affiliate, Add/Remove from Affiliate Campaign
Courses: Course Grant Offer, Course Revoke Offer
IVR: Gather Input on Call, Play Message, Connect to Call, End Call, Record Voicemail
Communities: Grant Group Access, Revoke Group Access

RULES:
- ONE question at a time — never stack questions
- Plain English only — say "what kicks it off" not "trigger"
- Be warm and encouraging
- HONESTY GUARDRAIL: Only recommend triggers and actions from the lists above. If something can't be done natively in GHL, say so warmly and suggest the nearest alternative or flag that a third-party tool like Zapier/Make would be needed. Never invent GHL features that don't exist.
- For multi-workflow scenarios, map ALL workflows before outputting the JSON — make the linking logic between them explicit
- CONSOLIDATION PRINCIPLE: Where multiple paths share the same trigger type, consolidate into ONE workflow with If/Else branching rather than creating separate workflows. Only use separate workflows when the triggers are genuinely different, or when the logic is too complex to branch cleanly. Example: three welcome sequences for three payment plans should be ONE workflow with If/Else checking which tag is present — not three separate workflows. Fewer workflows = easier for clients to manage.
- When ready, say exactly: "Great — I have everything I need! Let me put your workflow plan together." Then output ONLY the JSON below.

OUTPUT FORMAT — single OR multi-workflow (choose based on what's needed):
\`\`\`json
{
  "planName": "string",
  "goal": "string",
  "isMultiWorkflow": true,
  "workflows": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "trigger": {
        "type": "string",
        "description": "string",
        "filters": "string or null"
      },
      "steps": [
        {
          "id": 1,
          "type": "string",
          "title": "string",
          "detail": "string",
          "timing": "string or null",
          "tokens": [],
          "branches": [
            { "condition": "string", "path": "string", "leadsTo": "string" }
          ]
        }
      ],
      "linkedByTag": "string or null",
      "leadsToWorkflow": "number or null"
    }
  ],
  "tags": [
    { "name": "string", "purpose": "string" }
  ],
  "notes": "string"
}
\`\`\`
After the JSON, one warm closing sentence only.`;

const SEARCH_PROMPT = `Search for any new GoHighLevel workflow triggers, actions, or automation features released or announced in the last 90 days. Return a brief plain-English summary of anything new. If nothing significant is found, say "No major updates found." Keep it under 150 words.`;

const PROMPTS = [
  "Follow up with new leads automatically",
  "Remind clients about upcoming appointments",
  "Nurture people who didn't book after an inquiry",
  "Send different onboarding based on which plan they bought",
  "Re-engage contacts who've gone quiet",
];

const STEP_COLORS = {
  "Send Email":            { bg:"#EDE5FF", border:"#6B35C8", icon:"✉️" },
  "Send SMS":              { bg:"#FFE5F3", border:"#D4006A", icon:"💬" },
  "Wait Step":             { bg:"#FFF4E0", border:"#E07B00", icon:"⏱" },
  "Add Contact Tag":       { bg:"#E5F6FF", border:"#0077B6", icon:"🏷" },
  "Remove Contact Tag":    { bg:"#FFE8E8", border:"#C0392B", icon:"🏷" },
  "If Else":               { bg:"#FFF8E1", border:"#B8860B", icon:"🔀" },
  "Create/Update Opportunity": { bg:"#E5FFE9", border:"#1B7E33", icon:"📋" },
  "Pipeline Stage Changed":{ bg:"#E5FFE9", border:"#1B7E33", icon:"📋" },
  "Send Internal Notification": { bg:"#E5F0FF", border:"#1A5FB4", icon:"🔔" },
  "Course Grant Offer":    { bg:"#E5FFE9", border:"#1B7E33", icon:"🎁" },
  "Course Revoke Offer":   { bg:"#FFE5E5", border:"#C0392B", icon:"🚫" },
  "Assign to User":        { bg:"#F0E5FF", border:"#7B2FBE", icon:"👤" },
  "Add Task":              { bg:"#FFF0E5", border:"#B85C00", icon:"✅" },
  "Goal Event":            { bg:"#E5FFE9", border:"#1B7E33", icon:"🎯" },
  "Go To":                 { bg:"#F0E5FF", border:"#7B2FBE", icon:"➡️" },
  "Webhook/Custom Webhook":{ bg:"#E5F0FF", border:"#1A5FB4", icon:"🔗" },
  "Conversation AI":       { bg:"#EDE5FF", border:"#6B35C8", icon:"🤖" },
  "Manual Action":         { bg:"#FFF4E0", border:"#E07B00", icon:"👋" },
  "Send Review Request":   { bg:"#FFFDE5", border:"#B8A000", icon:"⭐" },
  "Trigger":               { bg:"#FFE5E5", border:"#C0392B", icon:"⚡" },
  "default":               { bg:"#F0F0F0", border:"#888888", icon:"▶️" },
};

const getStepColor = (type) => {
  for (const [key, val] of Object.entries(STEP_COLORS)) {
    if (type?.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return STEP_COLORS.default;
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

function TagPill({ tag }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EDE5FF",border:"1.5px solid #6B35C8",borderRadius:20,padding:"4px 12px",fontSize:11,color:"#4A1A9E",fontFamily:"monospace",marginRight:6,marginBottom:4}}>
      <span style={{fontSize:13}}>🏷</span> {tag.name}
      {tag.purpose && <span style={{color:"#8A6FBF",fontSize:10}}>— {tag.purpose}</span>}
    </div>
  );
}

function StepCard({ step, idx }) {
  const c = getStepColor(step.type);
  return (
    <div style={{background:c.bg,border:`2px solid ${c.border}`,borderRadius:12,padding:"12px 16px",position:"relative",marginBottom:4}}>
      <div style={{position:"absolute",top:-10,left:12,background:c.border,color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:"bold"}}>{idx+1}</div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
        <span style={{fontSize:16}}>{c.icon}</span>
        <span style={{fontSize:10,fontWeight:"bold",color:c.border,textTransform:"uppercase",letterSpacing:"0.06em"}}>{step.type}</span>
        {step.timing&&<span style={{marginLeft:"auto",fontSize:10,background:"#fff",border:`1px solid ${c.border}`,color:c.border,borderRadius:20,padding:"1px 7px"}}>{step.timing}</span>}
      </div>
      <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold",color:"#1E0A4A",marginBottom:3}}>{step.title}</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:11.5,color:"#3D2B6B",lineHeight:1.5}}>{step.detail}</div>
      {step.branches?.length>0&&(
        <div style={{marginTop:8,display:"flex",gap:6}}>
          {step.branches.map((b,i)=>(
            <div key={i} style={{flex:1,background:"rgba(255,255,255,0.7)",border:`1px solid ${c.border}`,borderRadius:8,padding:"6px 8px"}}>
              <div style={{fontSize:9,fontWeight:"bold",color:c.border,marginBottom:2}}>{b.condition}</div>
              <div style={{fontSize:11,color:"#1E0A4A"}}>{b.path}</div>
              {b.leadsTo&&<div style={{fontSize:10,color:"#7B5EA7",marginTop:2,fontStyle:"italic"}}>→ {b.leadsTo}</div>}
            </div>
          ))}
        </div>
      )}
      {step.tokens?.length>0&&(
        <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:3}}>
          {step.tokens.map((t,i)=><span key={i} style={{fontSize:9.5,background:"#fff",border:`1px solid ${c.border}`,color:c.border,borderRadius:4,padding:"1px 5px",fontFamily:"monospace"}}>{t}</span>)}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ wf, idx, total, allWorkflows }) {
  const WF_COLORS = [
    ["#4A1A9E","#EDE5FF"],["#D4006A","#FFE5F3"],["#1B7E33","#E5FFE9"],
    ["#0077B6","#E5F6FF"],["#E07B00","#FFF4E0"],["#7B2FBE","#F0E5FF"],
  ];
  const [accent, lightBg] = WF_COLORS[idx % WF_COLORS.length];
  const linkedWorkflow = wf.leadsToWorkflow ? allWorkflows.find(w=>w.id===wf.leadsToWorkflow) : null;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"stretch"}}>
      <div style={{background:"#fff",border:`2px solid ${accent}`,borderRadius:16,overflow:"hidden",boxShadow:`0 4px 20px ${accent}22`}}>
        {/* Header */}
        <div style={{background:lightBg,borderBottom:`2px solid ${accent}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:"bold",flexShrink:0}}>W{wf.id}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:"bold",color:"#1E0A4A"}}>{wf.name}</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:11.5,color:"#5A4080",marginTop:2}}>{wf.description}</div>
          </div>
          {wf.linkedByTag&&(
            <div style={{background:"#fff",border:`1.5px solid ${accent}`,borderRadius:20,padding:"4px 10px",fontSize:10,color:accent,fontFamily:"monospace",fontWeight:"bold"}}>
              🏷 {wf.linkedByTag}
            </div>
          )}
        </div>

        <div style={{padding:"14px 16px"}}>
          {/* Trigger */}
          <div style={{background:"#FFF0E5",border:"1.5px solid #E07B00",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:"bold",color:"#E07B00",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>⚡ What kicks it off</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold",color:"#1E0A4A"}}>{wf.trigger.type}</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:11.5,color:"#5A3A10",marginTop:2}}>{wf.trigger.description}</div>
            {wf.trigger.filters&&<div style={{fontSize:11,color:"#E07B00",marginTop:4,fontStyle:"italic"}}>Filter: {wf.trigger.filters}</div>}
          </div>

          {/* Arrow */}
          <div style={{textAlign:"center",fontSize:12,color:"#C4A8F0",marginBottom:8,fontStyle:"italic"}}>then…</div>

          {/* Steps */}
          {wf.steps?.map((step,i)=>(
            <div key={step.id}>
              <StepCard step={step} idx={i}/>
              {i<wf.steps.length-1&&<div style={{textAlign:"center",fontSize:11,color:"#C4A8F0",margin:"3px 0",fontStyle:"italic"}}>↓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Link to next workflow */}
      {linkedWorkflow&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"8px 0"}}>
          <div style={{width:2,height:16,background:"#C4A8F0"}}/>
          <div style={{background:"#EDE5FF",border:"1.5px solid #6B35C8",borderRadius:20,padding:"5px 16px",fontSize:11,color:"#4A1A9E",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
            🏷 adds tag → triggers <strong>W{linkedWorkflow.id}: {linkedWorkflow.name}</strong>
          </div>
          <div style={{width:2,height:16,background:"#C4A8F0"}}/>
          <div style={{fontSize:16,color:"#6B35C8",lineHeight:1}}>▼</div>
        </div>
      )}
    </div>
  );
}

function WorkflowPlan({ data }) {
  const isMulti = data.isMultiWorkflow && data.workflows?.length > 1;
  const workflows = data.workflows || [];

  return (
    <div style={{padding:"24px 20px"}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{display:"inline-block",background:purple,color:"#fff",borderRadius:100,padding:"6px 20px",fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
          {isMulti ? `✦ ${workflows.length}-Workflow Plan` : "✦ Workflow Map"}
        </div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:20,color:"#1E0A4A",margin:"0 0 6px"}}>{data.planName}</h2>
        <p style={{fontFamily:"Georgia,serif",fontSize:13.5,color:"#5A4080",margin:0}}>{data.goal}</p>
      </div>

      {/* Multi-workflow explainer */}
      {isMulti&&(
        <div style={{background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:10,padding:"12px 16px",marginBottom:20,fontFamily:"Georgia,serif",fontSize:13,color:"#5A4080",lineHeight:1.6}}>
          💡 <strong>This plan uses {workflows.length} connected workflows.</strong> Each runs independently in GHL and is linked to the next via tags — the recommended way to build complex automations. Build them in the order shown below.
        </div>
      )}

      {/* Tags overview for multi-workflow */}
      {isMulti&&data.tags?.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Tags used to connect these workflows</div>
          <div>{data.tags.map((t,i)=><TagPill key={i} tag={t}/>)}</div>
        </div>
      )}

      {/* Workflows */}
      {workflows.map((wf,i)=>(
        <WorkflowCard key={wf.id} wf={wf} idx={i} total={workflows.length} allWorkflows={workflows}/>
      ))}

      {/* Written spec */}
      <div style={{marginTop:28,background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:14,padding:"20px 22px"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:16,color:"#1E0A4A",margin:"0 0 16px"}}>📄 Full Workflow Spec</h3>

        {[["Plan Name",data.planName],["Goal",data.goal]].map(([l,v])=>(
          <div key={l} style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{l}</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:14,color:"#1E0A4A"}}>{v}</div>
          </div>
        ))}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
            {isMulti ? `The ${workflows.length} Workflows` : "Steps in Order"}
          </div>
          {workflows.map((wf,wi)=>(
            <div key={wf.id} style={{background:"#fff",border:"1.5px solid #DDD0F5",borderRadius:10,padding:"14px 16px",marginBottom:10}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:13.5,fontWeight:"bold",color:"#1E0A4A",marginBottom:4}}>
                Workflow {wf.id}: {wf.name}
                {wf.linkedByTag&&<span style={{fontFamily:"monospace",fontSize:11,color:"#6B35C8",marginLeft:8,fontWeight:"normal"}}>triggered by tag: {wf.linkedByTag}</span>}
              </div>
              <div style={{fontSize:11.5,color:"#E07B00",marginBottom:6}}>⚡ {wf.trigger.type} — {wf.trigger.description}</div>
              {wf.steps?.map((s,si)=>(
                <div key={s.id} style={{display:"flex",gap:10,marginBottom:6}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"#6B35C8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:"bold",flexShrink:0,marginTop:2}}>{si+1}</div>
                  <div>
                    <div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold",color:"#1E0A4A"}}>{s.title} <span style={{fontWeight:"normal",color:"#6B35C8"}}>({s.type})</span></div>
                    <div style={{fontFamily:"Georgia,serif",fontSize:11.5,color:"#3D2B6B",lineHeight:1.5}}>{s.detail}</div>
                    {s.timing&&<div style={{fontSize:11,color:"#8A6FBF"}}>⏱ {s.timing}</div>}
                    {s.branches?.map((b,bi)=>(
                      <div key={bi} style={{fontSize:11,color:"#B8860B",fontStyle:"italic",marginTop:2}}>
                        🔀 {b.condition} → {b.path}{b.leadsTo?` (→ ${b.leadsTo})`:""}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {wf.leadsToWorkflow&&(
                <div style={{marginTop:8,fontSize:11.5,color:"#6B35C8",fontStyle:"italic",paddingTop:8,borderTop:"1px dashed #DDD0F5"}}>
                  → Leads to Workflow {wf.leadsToWorkflow} via tag
                </div>
              )}
            </div>
          ))}
        </div>

        {data.tags?.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:"bold",color:"#6B35C8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Tags Used</div>
            {data.tags.map((t,i)=>(
              <div key={i} style={{fontSize:13,color:"#1E0A4A",marginBottom:4,fontFamily:"Georgia,serif"}}>
                <span style={{fontFamily:"monospace",background:"#EDE5FF",border:"1px solid #6B35C8",color:"#4A1A9E",borderRadius:4,padding:"1px 6px",fontSize:11}}>{t.name}</span> — {t.purpose}
              </div>
            ))}
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
  const workflows = data.workflows || [];
  const WF_ACCENTS = ["#4A1A9E","#D4006A","#1B7E33","#0077B6","#E07B00","#7B2FBE"];

  const wfHTML = workflows.map((wf,i) => {
    const accent = WF_ACCENTS[i % WF_ACCENTS.length];
    const stepsHTML = (wf.steps||[]).map((s,si) => {
      const branchHTML = s.branches?.length ? `<div style="margin-top:6px;display:flex;gap:6px;">${s.branches.map(b=>`<div style="flex:1;background:rgba(255,255,255,0.7);border:1px solid ${accent};border-radius:6px;padding:6px 8px;font-size:11px;"><b style="color:${accent};display:block;margin-bottom:2px;">${b.condition}</b>${b.path}${b.leadsTo?`<br/><i style="color:#7B5EA7;">→ ${b.leadsTo}</i>`:""}</div>`).join("")}</div>` : "";
      return `<div style="display:flex;gap:10px;margin-bottom:8px;"><div style="width:20px;height:20px;border-radius:50%;background:${accent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;flex-shrink:0;">${si+1}</div><div style="flex:1;border:1.5px solid ${accent};border-radius:8px;padding:10px 12px;background:#F8F4FF;"><div style="font-size:12px;font-weight:bold;color:${accent};text-transform:uppercase;margin-bottom:3px;">${s.type}${s.timing?` · ${s.timing}`:""}</div><div style="font-size:14px;font-weight:bold;color:#1E0A4A;margin-bottom:2px;">${s.title}</div><div style="font-size:12px;color:#3D2B6B;line-height:1.5;">${s.detail}</div>${branchHTML}</div></div>`;
    }).join('<div style="text-align:center;font-size:11px;color:#C4A8F0;margin:2px 0;">↓</div>');
    return `<div style="border:2px solid ${accent};border-radius:14px;overflow:hidden;margin-bottom:20px;"><div style="background:#F8F4FF;border-bottom:2px solid ${accent};padding:14px 18px;display:flex;align-items:center;gap:12px;"><div style="width:34px;height:34px;border-radius:8px;background:${accent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;flex-shrink:0;">W${wf.id}</div><div><div style="font-size:15px;font-weight:bold;color:#1E0A4A;">${wf.name}</div><div style="font-size:11.5px;color:#5A4080;margin-top:2px;">${wf.description}</div></div>${wf.linkedByTag?`<div style="margin-left:auto;background:#fff;border:1.5px solid ${accent};border-radius:20px;padding:4px 10px;font-size:10px;color:${accent};font-family:monospace;font-weight:bold;">🏷 ${wf.linkedByTag}</div>`:""}</div><div style="padding:14px 16px;"><div style="background:#FFF0E5;border:1.5px solid #E07B00;border-radius:8px;padding:10px 12px;margin-bottom:12px;"><div style="font-size:10px;font-weight:bold;color:#E07B00;text-transform:uppercase;margin-bottom:3px;">⚡ What kicks it off</div><div style="font-size:13px;font-weight:bold;color:#1E0A4A;">${wf.trigger.type}</div><div style="font-size:11.5px;color:#5A3A10;margin-top:2px;">${wf.trigger.description}</div>${wf.trigger.filters?`<div style="font-size:11px;color:#E07B00;margin-top:4px;font-style:italic;">Filter: ${wf.trigger.filters}</div>`:""}</div><div style="text-align:center;font-size:11px;color:#C4A8F0;margin-bottom:8px;font-style:italic;">then…</div>${stepsHTML}</div></div>${wf.leadsToWorkflow?`<div style="text-align:center;padding:4px 0 12px;font-size:12px;color:#6B35C8;font-family:Georgia,serif;font-style:italic;">🏷 adds tag → triggers <b>W${wf.leadsToWorkflow}</b></div>`:""}`;
  }).join("");

  const tagsHTML = data.tags?.length ? `<div style="margin-bottom:20px;"><div style="font-size:11px;font-weight:bold;color:#6B35C8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Tags connecting these workflows</div>${data.tags.map(t=>`<span style="display:inline-block;background:#EDE5FF;border:1.5px solid #6B35C8;border-radius:20px;padding:4px 12px;font-size:11px;color:#4A1A9E;font-family:monospace;margin-right:6px;margin-bottom:4px;">🏷 ${t.name} — ${t.purpose}</span>`).join("")}</div>` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${data.planName} — GHL Workflow Plan</title><style>body{font-family:Georgia,serif;background:#F8F4FF;margin:0;padding:30px;color:#1E0A4A;max-width:720px;margin:0 auto;}@media print{body{background:#fff;}}</style></head><body><div style="display:inline-block;background:linear-gradient(135deg,#4A1A9E,#6B35C8);color:#fff;border-radius:100px;padding:5px 16px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">✦ SaaSy Funnels · GHL ${data.isMultiWorkflow?`${workflows.length}-Workflow Plan`:"Workflow Map"}</div><h1 style="font-size:24px;margin:4px 0;">${data.planName}</h1><p style="color:#5A4080;margin-bottom:20px;">${data.goal}</p>${data.isMultiWorkflow?`<div style="background:#fff;border:1.5px solid #DDD0F5;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#5A4080;line-height:1.6;">💡 <strong>This plan uses ${workflows.length} connected workflows</strong>, linked by tags. Build them in the order shown below.</div>`:""}${tagsHTML}${wfHTML}${data.notes?`<div style="background:#EDE5FF;border:1.5px solid #6B35C8;border-radius:10px;padding:14px;font-size:13px;color:#3D2B6B;line-height:1.6;margin-top:16px;"><strong>📝 Notes for your builder:</strong><br/>${data.notes}</div>`:""}<p style="margin-top:32px;font-size:11px;color:#9B7FD4;text-align:center;">Generated by SaaSy Funnels · GHL Workflow Builder · Powered by Claude</p></body></html>`;
}

export default function App() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [wfData, setWfData] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(BASE_SYSTEM_PROMPT);
  const [ghlUpdates, setGhlUpdates] = useState(null);
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
    fetchGHLUpdates();
  },[]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const fetchGHLUpdates = async () => {
    setLoadingUpdates(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY||""},body:JSON.stringify({model:"claude-sonnet-4-5-20250929",max_tokens:400,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:SEARCH_PROMPT}]})});
      const data=await res.json();
      const text=data.content?.filter(b=>b.type==="text").map(b=>b.text).join(" ")||"";
      if(text&&!text.includes("No major updates")){setGhlUpdates(text.trim());setSystemPrompt(BASE_SYSTEM_PROMPT+`\n\nRECENT GHL UPDATES:\n${text.trim()}`);}
    } catch(e){}
    setLoadingUpdates(false);
  };

  const parseJSON=text=>{try{const m=text.match(/```json\s*([\s\S]*?)```/);if(m)return JSON.parse(m[1]);}catch(e){}return null;};

  const callClaude=async history=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY||""},body:JSON.stringify({model:"claude-sonnet-4-5-20250929",max_tokens:3000,system:systemPrompt,messages:history.map(m=>({role:m.role,content:m.content}))})});
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
  const downloadHTML=()=>{if(!wfData)return;const blob=new Blob([buildHTML(wfData)],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${(wfData.planName||"workflow").replace(/\s+/g,"-")}-ghl-plan.html`;a.click();URL.revokeObjectURL(url);};
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

  const wfCount = wfData?.workflows?.length || 1;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#F4547A 0%,#E8839A 50%,#c96fa0 100%)",fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px 0"}}>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-6px);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        textarea:focus{outline:none} textarea{resize:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#6B35C8;border-radius:2px}
      `}</style>

      <div style={{width:"100%",maxWidth:680,display:"flex",justifyContent:"flex-start",marginBottom:8,animation:"fadeIn 0.4s ease"}}>
        <button onClick={()=>navigate("/")} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",backdropFilter:"blur(8px)"}}>← Dashboard</button>
      </div>

      <div style={{textAlign:"center",marginBottom:28,animation:"fadeIn 0.6s ease"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:purple,color:"#fff",padding:"7px 18px",borderRadius:100,fontSize:12,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14,boxShadow:"0 4px 16px rgba(107,53,200,0.35)"}}>
          <span>✦</span> GHL Workflow Builder
        </div>
        <h1 style={{fontSize:28,fontWeight:"normal",color:"#fff",margin:"0 0 8px",lineHeight:1.2}}>
          {viewingShared?`Shared: ${wfData?.planName}`:"Tell me what you want to automate"}
        </h1>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:15,margin:0,maxWidth:440}}>
          {viewingShared?"Your client shared this workflow plan with you for DFY support.":"No tech knowledge needed — describe it in plain English and I'll plan the whole thing."}
        </p>
        {loadingUpdates&&<div style={{marginTop:10,fontSize:12,color:"rgba(255,255,255,0.75)",animation:"pulse 1.5s ease infinite"}}>↻ Checking for latest GHL updates...</div>}
        {ghlUpdates&&!loadingUpdates&&<div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#fff"}}><span>✓</span> Updated with latest GHL features</div>}
      </div>

      <div style={{width:"100%",maxWidth:680,background:"#fff",borderRadius:20,boxShadow:"0 8px 40px rgba(30,10,74,0.2)",overflow:"hidden",display:"flex",flexDirection:"column",height:started?"calc(100vh - 200px)":"auto",minHeight:started?400:"auto",animation:"fadeIn 0.5s ease"}}>

        {viewingShared&&wfData?(
          <>
            <div style={{flex:1,overflowY:"auto"}}><WorkflowPlan data={wfData}/></div>
            <div style={{padding:"12px 16px 16px",borderTop:"1px solid #EDE5FF",display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purple,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
              <button onClick={downloadPDF}  style={{...btn(),flex:1,minWidth:130,background:pink,boxShadow:"0 4px 12px rgba(212,0,106,0.3)"}}>↓ Download / Print PDF</button>
              <button onClick={reset} style={{...btn(),background:"#fff",color:"#1E0A4A",border:"1.5px solid #DDD0F5"}}>Start New</button>
            </div>
          </>
        ):!started?(
          <div style={{padding:"32px 28px 28px"}}>
            <p style={{color:"#1E0A4A",fontSize:14.5,marginTop:0,marginBottom:20,lineHeight:1.6}}>What are you trying to automate? Pick a common one or describe it yourself:</p>
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
              {wfData&&(
                <div style={{animation:"fadeUp 0.4s ease",marginTop:8,background:"#F8F4FF",border:"1.5px solid #DDD0F5",borderRadius:16,overflow:"hidden"}}>
                  <WorkflowPlan data={wfData}/>
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
                      📋 Want us to build {wfCount>1?`these ${wfCount} workflows`:"this"} for you?
                    </div>
                    <p style={{fontFamily:"Georgia,serif",fontSize:13,color:"#3D2B6B",margin:"0 0 10px",lineHeight:1.5}}>Copy the link below and send it to the SaaSy Funnels team — we'll build {wfCount>1?"the full workflow system":"it"} and have it ready to go.</p>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{flex:1,background:"#fff",border:"1.5px solid #DDD0F5",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#5A4080",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shareUrl}</div>
                      <button onClick={copyShareLink} style={{...btn(),background:copied?"linear-gradient(135deg,#1B7E33,#2ECC71)":purple,whiteSpace:"nowrap",padding:"9px 16px",transition:"background 0.3s",boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>{copied?"✓ Copied!":"Copy Link"}</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!wfData&&(
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
      <p style={{fontSize:11.5,color:"rgba(255,255,255,0.7)",marginTop:14,marginBottom:20,textAlign:"center"}}>Powered by Claude · Built for GHL users · SaaSy Funnels</p>
    </div>
  );
}
