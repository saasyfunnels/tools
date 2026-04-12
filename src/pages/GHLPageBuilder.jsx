import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_SYSTEM_PROMPT = `You are a landing page and funnel design specialist working for SaaSy Funnels by Meg Burrage. You help coaches, course creators, and online business owners design beautiful, high-converting landing pages and funnel pages.

Your role is to walk the client through a warm, friendly intake conversation — one question at a time — then output a full visual HTML page design they can share with the SaaSy Funnels team to build.

You represent SaaSy Funnels by Meg Burrage. Your tone is warm, encouraging, plain-spoken, and a little bit sassy. You are talking to non-technical online business owners who may not know design or marketing jargon.

CONVERSION PRINCIPLES — always design with these in mind:
- Every page should have ONE clear goal and ONE primary CTA — no competing CTAs
- Above-the-fold section must hook immediately: speak to the pain/desire, show the outcome, make the CTA obvious
- Social proof should appear early — testimonials, results, logos, numbers
- Use urgency and specificity where appropriate (real deadlines, real numbers)
- Remove friction: fewer form fields, one ask, clear next step
- Mobile-first thinking: assume 70%+ of traffic is mobile

PAGE TYPES you can design:
- Opt-in / Lead magnet page
- Sales page (short or long form)
- Webinar registration page
- VSL (Video Sales Letter) page
- Thank you / confirmation page
- Webinar confirmation / replay page
- Application / discovery call page
- Waitlist page
- Challenge registration page
- Upsell / order bump page

FUNNEL FLOW KNOWLEDGE:
- Webinar funnel: Registration → Confirmation (reference what they registered for + add to calendar) → Reminder sequence → Replay page
- Lead magnet funnel: Opt-in → Thank you (deliver + set expectations for email) → Nurture sequence
- Sales funnel: Sales page → Order form → Thank you / access page
- Discovery call funnel: Application → Thank you (what to expect next) → Booking confirmation
- Challenge funnel: Registration → Confirmation → Daily challenge pages → Sales page at end

INTAKE PROCESS — ask ONE question at a time, in this order:
1. Ask what the page is for — give them examples (opt-in, sales, webinar reg, thank you, VSL, etc.)
2. Ask if this is a single page or part of a multi-page funnel — if multi-page, plan all pages upfront
3. Ask about their niche and who the page is for (be specific: who is the ideal person landing on this page, what are they struggling with, what outcome do they want?)
4. Ask about the ONE goal of this page — what do you want the visitor to do? (one CTA only)
5. Ask about their brand voice — bold and direct? Warm and nurturing? Fun and irreverent? Professional and polished?

BRANDING INTAKE — offer all options, ask which they prefer:
a) Upload a screenshot of their existing site — you'll extract the aesthetic
b) Upload a style guide PDF or doc
c) Manually enter hex colours and font preferences
d) Link to an inspiration site they love (accept a URL and say you'll pull from it)
e) No existing branding — ask 3-4 quick vibe questions and recommend a palette + fonts before designing

VIBE QUESTIONS (if no branding):
- Adjectives: Pick 3 words that describe your brand vibe (e.g. bold, warm, playful, luxe, minimal, earthy, clinical, feminine, edgy)
- Colour instinct: Any colours you love or hate?
- Inspiration brands (not in your niche): Any brands whose look you love — even outside your industry?
- Light or dark: Do you lean toward light/airy or dark/moody?

CONTENT INTAKE — offer both options:
a) Upload a doc or paste their own copy — use their exact copy in the design
b) Request placeholder copy — generate relevant, niche-specific placeholder copy (NOT generic Lorem Ipsum). Use their niche, offer, and brand voice to write real-feeling headlines, subheads, and body copy. Label clearly as [PLACEHOLDER — TO BE REPLACED].

IMAGE INTAKE — offer both options:
a) Upload their own images (photos, headshots, product shots, mockups)
b) Request image suggestions — describe what images would work in each section and what to source/create

CONVERSION FLAGS — flag these issues warmly and offer to proceed anyway:
- Two CTAs on one page: "Heads up — having two different calls to action on one page usually splits attention and hurts conversions. What's the ONE thing you want them to do?"
- No social proof: "Most high-converting pages have some social proof above the fold or early on — do you have any testimonials, results, or credibility markers we can include?"
- Too many form fields: "Every extra field on an opt-in form reduces conversions. Do we really need [field] or can we keep it to just name + email?"
- Long copy for a cold audience: "For cold traffic (people who don't know you yet), shorter pages often convert better. Want me to design a lean version?"

MULTI-PAGE PLANNING:
If the client wants a funnel, plan ALL pages upfront before designing:
- List all pages needed
- Describe how they connect (what happens after each step)
- Note any shared elements (header, footer, colour palette)
- Design each page as a separate section in the output

When you have all information needed, say exactly:
"Perfect — I have everything I need to design your page! Let me put this together now."

Then output ONLY the JSON below — wrapped in triple-backtick json and triple-backtick markers exactly as shown. No other text after the closing triple-backtick.

OUTPUT FORMAT:
\`\`\`json
{
  "projectName": "string",
  "pageType": "string",
  "isMultiPage": true,
  "niche": "string",
  "targetAudience": "string",
  "brandVoice": "string",
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "fonts": {
    "headline": "string",
    "body": "string"
  },
  "pages": [
    {
      "id": 1,
      "name": "string",
      "pageType": "string",
      "goal": "string",
      "cta": "string",
      "sections": [
        {
          "id": 1,
          "type": "Hero|Social Proof|Benefits|About|Offer Details|FAQ|CTA|Footer|Video|Countdown|Testimonials|Guarantee|Confirmation|Replay",
          "headline": "string",
          "subheadline": "string or null",
          "body": "string or null",
          "cta": "string or null",
          "imageNote": "string or null",
          "designNote": "string or null",
          "isPlaceholder": true
        }
      ],
      "conversionNotes": "string"
    }
  ],
  "brandPaletteExplanation": "string or null",
  "overallNotes": "string",
  "teamBriefing": "string"
}
\`\`\`
After the JSON, one warm closing sentence only.`;

const PROMPTS = [
  "Design a lead magnet opt-in page for my freebie",
  "Design a webinar registration + confirmation page funnel",
  "Design a sales page for my online course or program",
  "Design a VSL (video sales letter) page",
  "Design a discovery call application page",
];

const SECTION_COLORS = {
  "Hero":         { bg:"rgba(244,84,122,0.12)",  border:"#F4547A",  icon:"🦸" },
  "Social Proof": { bg:"rgba(0,200,160,0.10)",   border:"#00C8A0",  icon:"⭐" },
  "Benefits":     { bg:"rgba(107,53,200,0.12)",  border:"#6B35C8",  icon:"✨" },
  "About":        { bg:"rgba(255,107,43,0.10)",  border:"#FF6B2B",  icon:"👤" },
  "Offer Details":{ bg:"rgba(255,107,43,0.12)",  border:"#FF6B2B",  icon:"📦" },
  "FAQ":          { bg:"rgba(107,53,200,0.10)",  border:"#9B35C8",  icon:"❓" },
  "CTA":          { bg:"rgba(244,84,122,0.15)",  border:"#F4547A",  icon:"🎯" },
  "Footer":       { bg:"rgba(255,255,255,0.04)", border:"#444",     icon:"📄" },
  "Video":        { bg:"rgba(107,53,200,0.12)",  border:"#6B35C8",  icon:"🎬" },
  "Countdown":    { bg:"rgba(255,107,43,0.12)",  border:"#FF6B2B",  icon:"⏱" },
  "Testimonials": { bg:"rgba(0,200,160,0.10)",   border:"#00C8A0",  icon:"💬" },
  "Guarantee":    { bg:"rgba(0,200,160,0.10)",   border:"#00C8A0",  icon:"🛡" },
  "Confirmation": { bg:"rgba(107,53,200,0.12)",  border:"#6B35C8",  icon:"✅" },
  "Replay":       { bg:"rgba(107,53,200,0.10)",  border:"#9B35C8",  icon:"▶️" },
};

// GHL dark theme tokens
const ghlBg      = "#0D0D0D";
const ghlSurface = "#111111";
const ghlCard    = "#161616";
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

function encodeSpec(data) { try { return btoa(encodeURIComponent(JSON.stringify(data))); } catch(e) { return ""; } }
function decodeSpec(str) { try { return JSON.parse(decodeURIComponent(atob(str))); } catch(e) { return null; } }
function getShareUrl(data) { const e=encodeSpec(data); const base=window.location.href.split("?")[0]; return `${base}?spec=${e}`; }

function SFLogo({ size=32 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:10, background:sfGradient,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*0.4, fontWeight:700, color:"#fff",
      fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.02em", flexShrink:0
    }}>SF</div>
  );
}

function TopNav({ onBack }) {
  return (
    <div style={{
      position:"sticky", top:0, zIndex:100,
      background:"rgba(13,13,13,0.95)", backdropFilter:"blur(12px)",
      borderBottom:"1px solid rgba(107,53,200,0.2)",
      padding:"0 24px", height:56,
      display:"flex", alignItems:"center", justifyContent:"space-between"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {onBack && (
          <button onClick={onBack} style={{
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:8, padding:"6px 12px", color:"rgba(240,234,248,0.5)",
            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            display:"flex", alignItems:"center", gap:5, marginRight:4,
            transition:"all 0.15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.color=ghlText;e.currentTarget.style.borderColor="rgba(107,53,200,0.4)";}}
          onMouseLeave={e=>{e.currentTarget.style.color="rgba(240,234,248,0.5)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}
          >← Dashboard</button>
        )}
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

function Dots() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"14px 18px",background:"rgba(255,255,255,0.04)",border:"1px solid "+ghlBorder,borderRadius:"0 18px 18px 18px"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:7,height:7,borderRadius:"50%",background:ghlPink,animation:"ghlBounce 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>
      ))}
    </div>
  );
}

function Bubble({ msg }) {
  const u = msg.role==="user";
  return (
    <div style={{display:"flex",justifyContent:u?"flex-end":"flex-start",marginBottom:14,animation:"ghlFadeUp 0.3s ease forwards"}}>
      {!u && (
        <div style={{width:34,height:34,borderRadius:"50%",background:sfGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,marginTop:2,color:"#fff",fontWeight:700}}>✦</div>
      )}
      <div style={{
        maxWidth:"72%",
        background: u ? sfGradient : "rgba(255,255,255,0.05)",
        color: u ? "#fff" : ghlText,
        padding:"13px 18px",
        borderRadius: u ? "18px 18px 4px 18px" : "0 18px 18px 18px",
        fontSize:14.5, lineHeight:1.65,
        border: u ? "none" : "1px solid "+ghlBorder,
        boxShadow: u ? "0 4px 20px rgba(244,84,122,0.25)" : "none",
        whiteSpace:"pre-wrap",
        fontFamily:"'DM Sans',sans-serif"
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function PaletteSwatch({ palette }) {
  if (!palette) return null;
  return (
    <div style={{display:"flex",gap:6,margin:"8px 0 4px",flexWrap:"wrap"}}>
      {Object.entries(palette).map(([k,v])=>(
        <div key={k} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.06)",border:"1px solid "+ghlBorder,borderRadius:6,padding:"4px 8px"}}>
          <div style={{width:14,height:14,borderRadius:3,background:v,border:"1px solid rgba(255,255,255,0.15)",flexShrink:0}}/>
          <span style={{fontSize:10,color:ghlMuted,fontFamily:"monospace"}}>{v}</span>
          <span style={{fontSize:10,color:ghlText,fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{k}</span>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ section }) {
  const c = SECTION_COLORS[section.type] || SECTION_COLORS["Footer"];
  return (
    <div style={{background:c.bg,border:`1px solid ${c.border}44`,borderRadius:12,padding:"14px 16px",marginBottom:10,position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:15}}>{c.icon}</span>
        <span style={{fontSize:10,fontWeight:700,color:c.border,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Sans',sans-serif"}}>{section.type}</span>
        {section.isPlaceholder&&(
          <span style={{marginLeft:"auto",fontSize:10,background:"rgba(255,107,43,0.15)",border:"1px solid rgba(255,107,43,0.4)",color:ghlOrange,borderRadius:20,padding:"2px 8px",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Placeholder copy</span>
        )}
      </div>
      <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:ghlText,marginBottom:5,lineHeight:1.3}}>{section.headline}</div>
      {section.subheadline&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:ghlText,marginBottom:6,lineHeight:1.45,opacity:0.7}}>{section.subheadline}</div>}
      {section.body&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:ghlMuted,lineHeight:1.6,marginBottom:6}}>{section.body}</div>}
      {section.cta&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:sfGradient,color:"#fff",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>
          → {section.cta}
        </div>
      )}
      {section.imageNote&&(
        <div style={{marginTop:8,background:"rgba(0,0,0,0.3)",border:`1px dashed ${c.border}55`,borderRadius:8,padding:"8px 12px",fontSize:12,color:c.border,fontFamily:"'DM Sans',sans-serif"}}>
          🖼 <strong>Image:</strong> {section.imageNote}
        </div>
      )}
      {section.designNote&&(
        <div style={{marginTop:6,background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.3)",borderRadius:8,padding:"7px 12px",fontSize:12,color:"#C4A0FF",fontFamily:"'DM Sans',sans-serif"}}>
          💡 <strong>Design note:</strong> {section.designNote}
        </div>
      )}
    </div>
  );
}

function PageCard({ page, idx, totalPages, palette }) {
  const PAGE_ACCENTS = [ghlPink, ghlPurple, "#00C8A0", ghlOrange, "#3B82F6", "#A855F7"];
  const accent = PAGE_ACCENTS[idx % PAGE_ACCENTS.length];
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{background:ghlCard,borderRadius:16,overflow:"hidden",boxShadow:`0 4px 24px ${accent}18`,marginBottom:20,border:`1px solid ${accent}44`}}>
      <div style={{background:`linear-gradient(135deg,${accent}22,${accent}0a)`,borderBottom:`1px solid ${accent}44`,padding:"14px 18px",cursor:totalPages>1?"pointer":"default",display:"flex",alignItems:"center",gap:12}} onClick={()=>totalPages>1&&setExpanded(e=>!e)}>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${accent},${accent}99)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>P{page.id}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,fontWeight:700,color:accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2,fontFamily:"'DM Sans',sans-serif"}}>📄 {page.pageType}</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:15,fontWeight:700,color:ghlText}}>{page.name}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:ghlMuted,marginTop:2}}>Goal: {page.goal}</div>
        </div>
        {totalPages>1&&<div style={{fontSize:14,color:ghlMuted,transition:"transform 0.2s",transform:expanded?"rotate(90deg)":"rotate(0deg)"}}>▶</div>}
      </div>

      {expanded&&(
        <div style={{padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 14px",border:"1px solid "+ghlBorder}}>
            <span style={{fontSize:14}}>🎯</span>
            <div>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:"#C4A0FF",textTransform:"uppercase",letterSpacing:"0.07em"}}>Primary CTA: </span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:ghlText}}>{page.cta}</span>
            </div>
          </div>

          {page.sections?.map((section,i)=>(
            <div key={section.id}>
              <SectionCard section={section}/>
              {i<page.sections.length-1&&<div style={{textAlign:"center",fontSize:11,color:"rgba(196,160,255,0.3)",margin:"4px 0",fontFamily:"'DM Sans',sans-serif"}}>↓ next section</div>}
            </div>
          ))}

          {page.conversionNotes&&(
            <div style={{marginTop:12,background:"rgba(255,107,43,0.1)",border:"1px solid rgba(255,107,43,0.3)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10,fontWeight:700,color:ghlOrange,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>💡 Conversion notes</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:ghlMuted,lineHeight:1.6}}>{page.conversionNotes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageDesign({ data }) {
  const isMulti = data.isMultiPage && data.pages?.length > 1;
  const pages = data.pages || [];

  return (
    <div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{display:"inline-block",background:sfGradient,color:"#fff",borderRadius:100,padding:"5px 18px",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
          {isMulti ? `✦ ${pages.length}-Page Funnel Design` : "✦ Page Design"}
        </div>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:ghlText,margin:"0 0 4px"}}>{data.projectName}</h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,margin:"0 0 10px"}}>{data.niche} · {data.targetAudience}</p>
        {data.palette&&<PaletteSwatch palette={data.palette}/>}
        {data.brandPaletteExplanation&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:ghlMuted,margin:"8px 0 0",fontStyle:"italic",lineHeight:1.5}}>{data.brandPaletteExplanation}</p>}
      </div>

      {isMulti&&(
        <div style={{background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.25)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,lineHeight:1.6}}>
          🗺 <strong style={{color:ghlText}}>This is a {pages.length}-page funnel.</strong> Each page is designed below. Click any page header to expand or collapse. Build them in the order shown — each connects to the next.
        </div>
      )}

      {pages.map((page,i)=>(
        <PageCard key={page.id} page={page} idx={i} totalPages={pages.length} palette={data.palette}/>
      ))}

      {data.teamBriefing&&(
        <div style={{marginTop:8,background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.3)",borderRadius:14,padding:"18px 20px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#C4A0FF",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>📋 Brief for the SaaSy Funnels Team</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{data.teamBriefing}</div>
        </div>
      )}

      {data.overallNotes&&(
        <div style={{marginTop:12,background:"rgba(255,255,255,0.03)",border:"1px solid "+ghlBorder,borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:ghlMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>Notes</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,lineHeight:1.6}}>{data.overallNotes}</div>
        </div>
      )}
    </div>
  );
}

function FileUploadArea({ onFiles, label, accept, multiple }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files) => {
    const results = [];
    for (const file of files) {
      const base64 = await new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>res(r.result.split(",")[1]);
        r.onerror=()=>rej();
        r.readAsDataURL(file);
      });
      results.push({ name:file.name, type:file.type, base64 });
    }
    onFiles(results);
  };

  return (
    <div
      onDragOver={e=>{e.preventDefault();setDragging(true);}}
      onDragLeave={()=>setDragging(false)}
      onDrop={e=>{e.preventDefault();setDragging(false);handleFiles([...e.dataTransfer.files]);}}
      onClick={()=>ref.current?.click()}
      style={{
        border:`2px dashed ${dragging?ghlPink:"rgba(107,53,200,0.4)"}`,
        borderRadius:10,padding:"14px 16px",cursor:"pointer",textAlign:"center",
        background:dragging?"rgba(244,84,122,0.06)":"rgba(107,53,200,0.05)",
        transition:"all 0.15s",marginBottom:8
      }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} style={{display:"none"}}
        onChange={e=>handleFiles([...e.target.files])}/>
      <div style={{fontSize:20,marginBottom:4}}>📎</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted}}>{label}</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(196,160,255,0.4)",marginTop:3}}>Click or drag & drop</div>
    </div>
  );
}

function buildHTML(data) {
  const pages = data.pages || [];

  const pagesHTML = pages.map((page, pi) => {
    const PAGE_ACCENTS = ["#F4547A","#6B35C8","#00C8A0","#FF6B2B","#3B82F6","#A855F7"];
    const accent = PAGE_ACCENTS[pi % PAGE_ACCENTS.length];

    const sectionsHTML = (page.sections||[]).map(s => {
      const sc = SECTION_COLORS[s.type]||SECTION_COLORS["Footer"];
      return `
        <div style="background:${sc.bg};border:1px solid ${sc.border}44;border-radius:12px;padding:16px 18px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:15px;">${sc.icon}</span>
            <span style="font-size:10px;font-weight:700;color:${sc.border};text-transform:uppercase;letter-spacing:0.08em;font-family:'DM Sans',sans-serif;">${s.type}</span>
            ${s.isPlaceholder?`<span style="margin-left:auto;font-size:10px;background:rgba(255,107,43,0.15);border:1px solid rgba(255,107,43,0.4);color:#FF6B2B;border-radius:20px;padding:2px 8px;font-family:'DM Sans',sans-serif;font-weight:600;">Placeholder copy</span>`:""}
          </div>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:700;color:#F0EAF8;margin-bottom:5px;line-height:1.3;">${s.headline}</div>
          ${s.subheadline?`<div style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(240,234,248,0.7);margin-bottom:6px;line-height:1.45;">${s.subheadline}</div>`:""}
          ${s.body?`<div style="font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(240,234,248,0.45);line-height:1.65;margin-bottom:6px;">${s.body}</div>`:""}
          ${s.cta?`<div style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#F4547A,#6B35C8);color:#fff;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;margin-top:5px;">→ ${s.cta}</div>`:""}
          ${s.imageNote?`<div style="margin-top:8px;background:rgba(0,0,0,0.3);border:1px dashed ${sc.border}55;border-radius:8px;padding:8px 12px;font-size:12px;color:${sc.border};font-family:'DM Sans',sans-serif;">🖼 <strong>Image needed:</strong> ${s.imageNote}</div>`:""}
          ${s.designNote?`<div style="margin-top:6px;background:rgba(107,53,200,0.1);border:1px solid rgba(107,53,200,0.3);border-radius:8px;padding:7px 12px;font-size:12px;color:#C4A0FF;font-family:'DM Sans',sans-serif;">💡 <strong>Design note:</strong> ${s.designNote}</div>`:""}
        </div>`;
    }).join('<div style="text-align:center;font-size:12px;color:rgba(196,160,255,0.3);margin:4px 0;">↓</div>');

    return `
      <div style="background:#161616;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px ${accent}18;margin-bottom:28px;border:1px solid ${accent}44;">
        <div style="background:linear-gradient(135deg,${accent}22,${accent}0a);border-bottom:1px solid ${accent}44;padding:16px 20px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${accent},${accent}99);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;font-family:'DM Sans',sans-serif;">P${page.id}</div>
          <div>
            <div style="font-size:10px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;font-family:'DM Sans',sans-serif;">📄 ${page.pageType}</div>
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:700;color:#F0EAF8;">${page.name}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(240,234,248,0.45);margin-top:2px;">Goal: ${page.goal}</div>
          </div>
        </div>
        <div style="padding:18px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 14px;border:1px solid rgba(255,255,255,0.08);">
            <span style="font-size:14px;">🎯</span>
            <span style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:#C4A0FF;text-transform:uppercase;letter-spacing:0.07em;">Primary CTA: </span>
            <span style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#F0EAF8;">${page.cta}</span>
          </div>
          ${sectionsHTML}
          ${page.conversionNotes?`<div style="margin-top:14px;background:rgba(255,107,43,0.1);border:1px solid rgba(255,107,43,0.3);border-radius:10px;padding:12px 14px;"><div style="font-size:10px;font-weight:700;color:#FF6B2B;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;font-family:'DM Sans',sans-serif;">💡 Conversion notes</div><div style="font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(240,234,248,0.45);line-height:1.6;">${page.conversionNotes}</div></div>`:""}
        </div>
      </div>`;
  }).join("");

  const paletteSwatchHTML = data.palette ? Object.entries(data.palette).map(([k,v])=>`<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:4px 8px;margin:3px;"><span style="width:14px;height:14px;border-radius:3px;background:${v};border:1px solid rgba(255,255,255,0.15);display:inline-block;"></span><span style="font-size:10px;color:rgba(240,234,248,0.45);font-family:monospace;">${v}</span><span style="font-size:10px;color:#F0EAF8;font-family:'DM Sans',sans-serif;text-transform:capitalize;">${k}</span></span>`).join("") : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${data.projectName} — Page Design · SaaSy Funnels</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/><style>body{font-family:'DM Sans',sans-serif;background:#0D0D0D;margin:0;padding:30px 16px;color:#F0EAF8;max-width:780px;margin:0 auto;}@media print{body{background:#0D0D0D;color:#F0EAF8;}}</style></head><body>
    <div style="display:inline-block;background:linear-gradient(135deg,#F4547A,#6B35C8);color:#fff;border-radius:100px;padding:5px 18px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;font-weight:700;">✦ SaaSy Funnels · GHL ${data.isMultiPage?`${pages.length}-Page Funnel Design`:"Page Design"}</div>
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;margin:4px 0 4px;color:#F0EAF8;">${data.projectName}</h1>
    <p style="color:rgba(240,234,248,0.45);margin-bottom:8px;font-size:14px;">${data.niche} · ${data.targetAudience}</p>
    ${paletteSwatchHTML?`<div style="margin-bottom:16px;">${paletteSwatchHTML}</div>`:""}
    ${data.brandPaletteExplanation?`<p style="font-size:12px;color:rgba(240,234,248,0.45);font-style:italic;margin-bottom:20px;line-height:1.5;">${data.brandPaletteExplanation}</p>`:""}
    ${data.isMultiPage&&pages.length>1?`<div style="background:rgba(107,53,200,0.1);border:1px solid rgba(107,53,200,0.3);border-radius:10px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:rgba(240,234,248,0.45);line-height:1.6;">🗺 <strong style="color:#F0EAF8;">This is a ${pages.length}-page funnel.</strong> Pages are shown below in order. Each connects to the next.</div>`:""}
    ${pagesHTML}
    ${data.teamBriefing?`<div style="background:rgba(107,53,200,0.1);border:1px solid rgba(107,53,200,0.3);border-radius:14px;padding:20px;margin-top:8px;"><div style="font-size:11px;font-weight:700;color:#C4A0FF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">📋 Brief for the SaaSy Funnels Team</div><div style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(240,234,248,0.45);line-height:1.7;white-space:pre-wrap;">${data.teamBriefing}</div></div>`:""}
    ${data.overallNotes?`<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-top:14px;"><div style="font-size:11px;font-weight:700;color:rgba(240,234,248,0.3);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;">Notes</div><div style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(240,234,248,0.45);line-height:1.6;">${data.overallNotes}</div></div>`:""}
    <p style="margin-top:40px;font-size:11px;color:rgba(196,160,255,0.3);text-align:center;">Generated by SaaSy Funnels · Page Builder · GHL · Powered by Claude</p>
  </body></html>`;
}

export default function App() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewingShared, setViewingShared] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const spec=params.get("spec");
    if(spec){const d=decodeSpec(spec);if(d){setPageData(d);setViewingShared(true);setStarted(true);}}
  },[]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const parseJSON = text => {
    // Try fenced ```json ... ``` block
    try { const m=text.match(/```json\s*([\s\S]*?)```/); if(m) return JSON.parse(m[1]); } catch(e){}
    // Try fenced ``` ... ``` block (no language tag)
    try { const m=text.match(/```\s*([\s\S]*?)```/); if(m) { const parsed=JSON.parse(m[1]); if(parsed.projectName) return parsed; } } catch(e){}
    // Try bare JSON starting with { and containing projectName
    try { const m=text.match(/(\{[\s\S]*"projectName"[\s\S]*\})/); if(m) return JSON.parse(m[1]); } catch(e){}
    // Try finding the first { to last } as JSON
    try { const start=text.indexOf("{"); const end=text.lastIndexOf("}"); if(start>-1&&end>start){ const parsed=JSON.parse(text.slice(start,end+1)); if(parsed.projectName) return parsed; } } catch(e){}
    return null;
  };

  const buildMessages = (history) => {
    return history.map(m => {
      if (m.role === "user" && m.files?.length) {
        const content = [];
        for (const f of m.files) {
          if (f.type.startsWith("image/")) {
            content.push({ type:"image", source:{ type:"base64", media_type:f.type, data:f.base64 }});
          } else if (f.type==="application/pdf") {
            content.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:f.base64 }});
          }
        }
        content.push({ type:"text", text:m.content });
        return { role:"user", content };
      }
      return { role:m.role, content:m.content };
    });
  };

  const fetchPageBranding = async (url) => {
    try {
      const res = await fetch("/api/fetch-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!data.success) return null;
      return data;
    } catch {
      return null;
    }
  };

  const extractUrl = (text) => {
    const match = text.match(/https?:\/\/[^\s]+|(?:www\.)[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
    if (!match) return null;
    const url = match[0];
    return url.startsWith("http") ? url : "https://" + url;
  };

  const callClaude = async history => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
    const headers = {
      "Content-Type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey
    };
    const r = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers,
      body:JSON.stringify({
        model:"claude-sonnet-4-5-20250929",
        max_tokens:4000,
        system:BASE_SYSTEM_PROMPT,
        messages:buildMessages(history)
      })
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const text = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Something went wrong — please try again.";
    return text;
  };

  const send = async (text, files=[]) => {
    const userMsg = { role:"user", content:text, files };
    let newHist = [...historyRef.current, userMsg];
    historyRef.current = newHist;
    setMessages(prev=>[...prev,userMsg]);
    setLoading(true);
    setPendingFiles([]);
    try {
      // If message contains a URL, fetch the page branding first and inject as context
      const url = extractUrl(text);
      if (url && (text.toLowerCase().includes("http") || text.toLowerCase().includes("www") || text.match(/\.[a-z]{2,}\//))) {
        const branding = await fetchPageBranding(url);
        if (branding && branding.success) {
          const brandingContext = `[PAGE FETCH RESULT for ${url}]
Title: ${branding.title || "unknown"}
Description: ${branding.description || "none"}
H1: ${branding.h1 || "none"}
Google Fonts detected: ${branding.googleFonts?.join(", ") || "none detected"}
Font families in CSS: ${branding.fonts?.slice(0,5).join(", ") || "none detected"}
Colours found: ${branding.colours?.slice(0,12).join(", ") || "none detected"}
[Use this data to describe the site's visual aesthetic, colour palette, and typography to the user. Identify the dominant colours and fonts. If colours or fonts are sparse, acknowledge that and ask the user to confirm or provide their brand details manually.]`;
          const contextMsg = { role:"user", content:brandingContext };
          const ackMsg = { role:"assistant", content:`Got it — I've pulled the page data for ${url}. Let me analyse the branding now.` };
          newHist = [...newHist, contextMsg, ackMsg];
          historyRef.current = newHist;
        }
      }
      const reply = await callClaude(newHist);
      // Strip JSON from the displayed message
      let displayReply = reply;
      // Remove ```json ... ``` blocks
      displayReply = displayReply.replace(/```json[\s\S]*?```/g, "").trim();
      // Remove bare { ... } JSON blocks that contain projectName
      if (displayReply.includes('"projectName"')) {
        const start = displayReply.indexOf("{");
        const end = displayReply.lastIndexOf("}");
        if (start > -1 && end > start) {
          displayReply = (displayReply.slice(0, start) + displayReply.slice(end + 1)).trim();
        }
      }
      // Remove "json" label that sometimes appears before the block
      displayReply = displayReply.replace(/^json\s*/i, "").trim();
      if (!displayReply) displayReply = "✦ Your page design is ready — see below!";
      const aMsg = { role:"assistant", content:displayReply };
      historyRef.current = [...newHist, {role:"assistant", content:reply}];
      setMessages(prev=>[...prev,aMsg]);
      const parsed = parseJSON(reply);
      if (parsed) { setPageData(parsed); setShareUrl(getShareUrl(parsed)); }
    } catch(e) {
      setMessages(prev=>[...prev,{role:"assistant",content:"Something went wrong — please try again."}]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const start = async text => { setStarted(true); await send(text); };
  const reset = () => { setMessages([]);setInput("");setStarted(false);setPageData(null);setShareUrl("");setCopied(false);setViewingShared(false);setPendingFiles([]);setShowUploadPanel(false);historyRef.current=[];window.history.replaceState({},"",window.location.pathname); };
  const downloadHTML = () => { if(!pageData)return; const blob=new Blob([buildHTML(pageData)],{type:"text/html"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${(pageData.projectName||"page").replace(/\s+/g,"-")}-ghl-design.html`; a.click(); URL.revokeObjectURL(url); };
  const downloadPDF = () => { if(!pageData)return; const w=window.open("","_blank"); w.document.write(buildHTML(pageData)); w.document.close(); w.onload=()=>w.print(); };
  const copyShareLink = () => { navigator.clipboard.writeText(shareUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),3000);}); };

  const displayMsgs = messages.map(m => {
    if (m.role==="assistant") {
      let content = m.content;
      // Strip ```json ... ``` blocks
      content = content.replace(/```json[\s\S]*?```/g, "").trim();
      // Strip bare JSON blocks
      if (content.includes('"projectName"')) {
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");
        if (start > -1 && end > start) {
          content = (content.slice(0, start) + content.slice(end + 1)).trim();
        }
      }
      // Strip leading "json" label
      content = content.replace(/^json\s*/i, "").trim();
      if (!content) content = "✦ Your page design is ready — see below!";
      return {...m, content};
    }
    return m;
  });

  const pageCount = pageData?.pages?.length || 1;

  return (
    <div style={{minHeight:"100vh",background:ghlBg,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes ghlBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
        @keyframes ghlFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ghlFadeIn{from{opacity:0}to{opacity:1}}
        textarea:focus{outline:none} textarea{resize:none} input:focus{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${ghlPurple};border-radius:2px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        .ghl-prompt-btn:hover{border-color:${ghlPink}!important;background:rgba(244,84,122,0.08)!important;}
        .ghl-prompt-btn:hover .ghl-arrow{color:${ghlPink}!important;}
      `}</style>

      <TopNav onBack={() => navigate("/")}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px 0"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:30,animation:"ghlFadeIn 0.6s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(244,84,122,0.12)",border:"1px solid rgba(244,84,122,0.3)",color:ghlPink,padding:"6px 16px",borderRadius:100,fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>
            <span>🎨</span> Page Builder
          </div>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,fontWeight:700,color:ghlText,margin:"0 0 8px",lineHeight:1.15}}>
            {viewingShared?`Shared: ${pageData?.projectName}`:"Design your page or funnel"}
          </h1>
          <p style={{color:ghlMuted,fontSize:15,margin:0,maxWidth:440,fontFamily:"'DM Sans',sans-serif"}}>
            {viewingShared?"Your client shared this page design for the SaaSy Funnels team to build.":"Answer a few quick questions — I'll design the full thing, ready to hand off."}
          </p>
        </div>

        {/* Main card */}
        <div style={{
          width:"100%",maxWidth:700,
          background:ghlSurface,
          border:"1px solid "+ghlBorder,
          borderRadius:16,overflow:"hidden",
          display:"flex",flexDirection:"column",
          height:started?"calc(100vh - 240px)":"auto",
          minHeight:started?400:"auto",
          animation:"ghlFadeIn 0.5s ease",
          boxShadow:"0 8px 40px rgba(107,53,200,0.15)"
        }}>
          {viewingShared&&pageData?(
            <>
              <div style={{flex:1,overflowY:"auto"}}><PageDesign data={pageData}/></div>
              <div style={{padding:"12px 16px 16px",borderTop:"1px solid "+ghlBorder,display:"flex",gap:8,flexWrap:"wrap",background:ghlSurface}}>
                <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purpleGrad,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
                <button onClick={downloadPDF}  style={{...btn(),flex:1,minWidth:130,background:pinkGrad,boxShadow:"0 4px 12px rgba(244,84,122,0.3)"}}>↓ Download / Print PDF</button>
                <button onClick={reset} style={{...btn(),background:"transparent",color:ghlMuted,border:"1px solid "+ghlBorder}}>Start New</button>
              </div>
            </>
          ):!started?(
            <div style={{padding:"32px 28px 28px"}}>
              <p style={{color:ghlMuted,fontSize:14.5,marginTop:0,marginBottom:20,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>What do you want to design? Pick a common type or describe it yourself:</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {PROMPTS.map((p,i)=>(
                  <button key={i} onClick={()=>start(p)} className="ghl-prompt-btn" style={{
                    background:"rgba(255,255,255,0.03)",border:"1px solid "+ghlBorder,
                    borderRadius:10,padding:"12px 16px",textAlign:"left",cursor:"pointer",
                    fontSize:14,color:ghlText,fontFamily:"'DM Sans',sans-serif",
                    lineHeight:1.4,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"
                  }}>
                    <span className="ghl-arrow" style={{color:ghlPurple,fontSize:15,transition:"color 0.15s"}}>→</span> {p}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(input.trim())start(input.trim());}}}
                  placeholder="Or describe what you want to design..." rows={2}
                  style={{flex:1,border:"1px solid "+ghlBorder,borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"rgba(255,255,255,0.04)",color:ghlText,lineHeight:1.5}}/>
                <button onClick={()=>input.trim()&&start(input.trim())} style={{...btn(),background:sfGradient,padding:"12px 18px",fontSize:18,boxShadow:"0 4px 12px rgba(244,84,122,0.3)"}}>→</button>
              </div>
            </div>
          ):(
            <>
              <div style={{flex:1,overflowY:"auto",padding:"24px 20px 12px"}}>
                {displayMsgs.map((m,i)=>(
                  <div key={i}>
                    <Bubble msg={m}/>
                    {m.files?.length>0&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10,justifyContent:"flex-end"}}>
                        {m.files.map((f,fi)=>(
                          <div key={fi} style={{background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.3)",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#C4A0FF",fontFamily:"'DM Sans',sans-serif"}}>
                            📎 {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading&&(
                  <div style={{display:"flex",marginBottom:12}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:sfGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,color:"#fff",fontWeight:700}}>✦</div>
                    <Dots/>
                  </div>
                )}
                {pageData&&(
                  <div style={{animation:"ghlFadeUp 0.4s ease",marginTop:8,background:"rgba(255,255,255,0.02)",border:"1px solid "+ghlBorder,borderRadius:14,overflow:"hidden"}}>
                    <PageDesign data={pageData}/>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              {pageData&&(
                <>
                  <div style={{padding:"12px 16px 8px",borderTop:"1px solid "+ghlBorder,display:"flex",gap:8,flexWrap:"wrap",background:ghlSurface}}>
                    <button onClick={downloadHTML} style={{...btn(),flex:1,minWidth:130,background:purpleGrad,boxShadow:"0 4px 12px rgba(107,53,200,0.3)"}}>↓ Download HTML</button>
                    <button onClick={downloadPDF}  style={{...btn(),flex:1,minWidth:130,background:pinkGrad,boxShadow:"0 4px 12px rgba(244,84,122,0.3)"}}>↓ Download / Print PDF</button>
                    <button onClick={reset} style={{...btn(),background:"transparent",color:ghlMuted,border:"1px solid "+ghlBorder}}>Start Over</button>
                  </div>
                  <div style={{padding:"0 16px 16px",background:ghlSurface}}>
                    <div style={{background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.25)",borderRadius:12,padding:"14px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#C4A0FF",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
                        📋 Want us to build {pageCount>1?`this ${pageCount}-page funnel`:"this page"} for you?
                      </div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:ghlMuted,margin:"0 0 10px",lineHeight:1.5}}>Copy the link below and send it to the SaaSy Funnels team — we'll build {pageCount>1?"the full funnel":"your page"} and have it ready to go.</p>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{flex:1,background:"rgba(0,0,0,0.3)",border:"1px solid "+ghlBorder,borderRadius:8,padding:"9px 12px",fontSize:12,color:ghlMuted,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shareUrl}</div>
                        <button onClick={copyShareLink} style={{...btn(),background:copied?"linear-gradient(135deg,#00C8A0,#009B7A)":sfGradient,whiteSpace:"nowrap",padding:"9px 16px",transition:"background 0.3s",boxShadow:"0 4px 12px rgba(244,84,122,0.2)"}}>{copied?"✓ Copied!":"Copy Link"}</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!pageData&&(
                <div style={{padding:"8px 16px 12px",borderTop:"1px solid "+ghlBorder,background:ghlSurface}}>
                  {showUploadPanel&&(
                    <div style={{marginBottom:10,background:"rgba(107,53,200,0.08)",border:"1px solid rgba(107,53,200,0.2)",borderRadius:12,padding:"14px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#C4A0FF",marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>Attach files to your message</div>
                      <FileUploadArea
                        label="Upload images, screenshots, or style guide PDFs"
                        accept="image/*,application/pdf"
                        multiple={true}
                        onFiles={files=>{setPendingFiles(prev=>[...prev,...files]);setShowUploadPanel(false);}}
                      />
                    </div>
                  )}
                  {pendingFiles.length>0&&(
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                      {pendingFiles.map((f,i)=>(
                        <div key={i} style={{background:"rgba(107,53,200,0.1)",border:"1px solid rgba(107,53,200,0.3)",borderRadius:6,padding:"3px 10px",fontSize:11,color:"#C4A0FF",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                          📎 {f.name}
                          <button onClick={()=>setPendingFiles(prev=>prev.filter((_,pi)=>pi!==i))} style={{border:"none",background:"none",cursor:"pointer",color:ghlMuted,fontSize:12,padding:0,lineHeight:1}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                    <button onClick={()=>setShowUploadPanel(p=>!p)} style={{...btn(),background:"transparent",color:ghlMuted,border:"1px solid "+ghlBorder,padding:"11px 14px",fontSize:16,flexShrink:0}} title="Attach files">📎</button>
                    <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(!input.trim()&&!pendingFiles.length||loading)return;const t=input.trim();setInput("");send(t,pendingFiles);}}}
                      placeholder="Type your answer..." rows={2} disabled={loading}
                      style={{flex:1,border:"1px solid "+ghlBorder,borderRadius:10,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:"rgba(255,255,255,0.04)",color:ghlText,lineHeight:1.5,opacity:loading?0.5:1}}/>
                    <button onClick={()=>{if((!input.trim()&&!pendingFiles.length)||loading)return;const t=input.trim();setInput("");send(t,pendingFiles);}} disabled={loading||(!input.trim()&&!pendingFiles.length)}
                      style={{...btn(),background:loading||(!input.trim()&&!pendingFiles.length)?"rgba(107,53,200,0.3)":sfGradient,padding:"12px 18px",fontSize:18,cursor:loading||(!input.trim()&&!pendingFiles.length)?"not-allowed":"pointer",boxShadow:loading||(!input.trim()&&!pendingFiles.length)?"none":"0 4px 12px rgba(244,84,122,0.3)"}}>→</button>
                  </div>
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
