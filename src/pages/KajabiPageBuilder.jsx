import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Theme tokens (Kajabi light) ──────────────────────────────────────────────
const kjBg      = "#FAFAFA";
const kjSurface = "#FFFFFF";
const kjCard    = "#F7F5FF";
const kjBorder  = "rgba(0,0,0,0.08)";
const kjText    = "#0A0A0A";
const kjMuted   = "rgba(0,0,0,0.45)";
const kjPink    = "#F4547A";
const kjPurple  = "#6B35C8";
const sfGradient = "linear-gradient(135deg,#F4547A,#6B35C8)";

const btn = (extra = {}) => ({
  border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer",
  fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: "#fff",
  fontWeight: 600, letterSpacing: "0.01em", ...extra,
});

// ─── System prompt ─────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are a landing page and funnel design specialist working for SaaSy Funnels by Meg Burrage. You help coaches, course creators, and online business owners design beautiful, high-converting landing pages and funnel pages specifically for the Kajabi platform.

Your role is to walk the client through a warm, friendly intake conversation — one question at a time — then output a complete, self-contained HTML page they can view in a browser, share with their team, and hand off for building in Kajabi.

You represent SaaSy Funnels by Meg Burrage. Your tone is warm, encouraging, plain-spoken, and a little bit sassy. You are talking to non-technical online business owners.

KAJABI-SPECIFIC KNOWLEDGE:
- Kajabi uses "Landing Pages" for standalone opt-in/sales pages (built in the Pages section)
- Kajabi Pipelines connect pages into funnels automatically
- Kajabi has limited custom code access — designs should favour standard section-based layouts
- Kajabi's theme engine supports custom CSS via the Theme Editor
- Common Kajabi page types: Landing Page, Checkout Page, Thank You Page, Webinar Registration

CONVERSION PRINCIPLES — always design with these in mind:
- Every page should have ONE clear goal and ONE primary CTA — no competing CTAs
- Above-the-fold section must hook immediately: speak to the pain/desire, show the outcome, make the CTA obvious
- Social proof should appear early — testimonials, results, logos, numbers
- Use urgency and specificity where appropriate (real deadlines, real numbers)
- Remove friction: fewer form fields, one ask, clear next step
- Mobile-first thinking: assume 70%+ of traffic is mobile

PAGE TYPES you can design for Kajabi:
- Opt-in / Lead magnet landing page
- Sales page (short or long form)
- Webinar registration page
- VSL (Video Sales Letter) page
- Thank you / confirmation page
- Webinar confirmation / replay page
- Application / discovery call page
- Waitlist page
- Challenge registration page
- Course or membership sales page

FUNNEL FLOW KNOWLEDGE:
- Webinar Pipeline: Registration page → Confirmation page → Replay page
- Lead Magnet Pipeline: Opt-in page → Thank you page → Email sequence
- Sales Pipeline: Sales page → Checkout → Thank you / access page
- Discovery Call Pipeline: Application → Thank you → Booking confirmation

CONVERSATION RULES — STRICT, NO EXCEPTIONS:
- ONE QUESTION PER MESSAGE, ALWAYS. Before sending any reply, count your questions. If you have more than one, delete all but the first. Wait for the client to answer before asking the next. This is a hard constraint with zero exceptions.
- Acknowledgements must be five words or fewer — no extended praise, no emojis, no cheerleading.
- Where questions have clear options, list them as labelled choices (a, b, c).
- COPY and IMAGES are always asked as SEPARATE questions — never combined.
- Never say things like "I love working with this audience" or "Perfect choice!" — be warm but extremely brief.

INTAKE PROCESS — one question at a time, strictly in order. Ask each, wait for answer, then continue:
1. What is the page for? Give examples: opt-in page, sales page, webinar registration, VSL, discovery call, waitlist.
2. Single page or multi-page pipeline? If multi-page, plan all pages upfront before designing.
3. Who is this page for — niche, who they are, what they struggle with, what outcome they want.
4. PAGE-TYPE SPECIFIC QUESTIONS — ask ALL that apply, one at a time:
   - For WEBINAR pages: What is the webinar title or topic? When is it (date + time + timezone)? How long? Live or pre-recorded? NOTE: Only ask live/pre-recorded if the user gave a specific date and time. If they have already indicated it is on-demand or selected time slots, that question is already answered — do NOT ask it.
   - For SALES pages: What is the offer name and price? What are the main benefits or modules?
   - For OPT-IN pages: What is the lead magnet name? What do they get?
   - For DISCOVERY CALL pages: What is the call about? Any qualifying questions?
   - For VSL pages: What is the main offer being pitched?
5. For opt-in/registration pages: What information to collect from registrants?
   a) Name + email only
   b) Name + email + phone
   c) Something else — tell me
6. Brand voice — pick one: a) Warm and nurturing, b) Bold and direct, c) Fun and irreverent, d) Professional and polished, e) Empowering and confident.

BRANDING INTAKE — one question, let them pick:
a) Upload a screenshot of my site or style guide (they can attach a file using the 📎 button)
b) Paste my hex colours and font names
c) Share a URL — you'll try to pull colours from it (note: may not work for all sites)
d) No branding yet — ask me vibe questions and recommend a palette

IMPORTANT: When the user says "screenshot" or "upload", remind them to use the 📎 attachment button in the chat to attach their image — do NOT ask them for a URL instead.

VIBE QUESTIONS (only if option e) — ask one at a time:
- Pick 3 words that describe your brand vibe (bold, warm, playful, luxe, minimal, earthy, clinical, feminine, edgy, etc.)
- Any colours you love or hate?
- Any brands whose look you love — even outside your industry?
- Light and airy or dark and moody?

COPY INTAKE — standalone question:
Do you have copy ready, or should I write placeholder copy?
a) I have copy — paste it and I'll use your exact words
b) Write me placeholder copy — niche-specific, clearly marked [PLACEHOLDER]

IMAGE INTAKE — separate standalone question AFTER copy:
What about images?
a) I have images — describe what you have and where they should go
b) Use placeholder image boxes — I'll add real images later (or use AI generation)

CONVERSION FLAGS — flag these warmly and offer to proceed anyway:
- Two CTAs: "Heads up — two CTAs on one page usually splits attention and hurts conversions. What's the ONE thing you want them to do?"
- No social proof: "Most high-converting pages have social proof early on — do you have any testimonials, results, or credibility markers?"
- Too many form fields: "Every extra field reduces conversions. Do we really need [field] or can we keep it to name + email?"

MULTI-PAGE PLANNING:
If the client wants a pipeline, plan ALL pages upfront before designing any:
- List all pages needed
- Describe how they connect via Kajabi Pipeline
- Note shared elements (header, footer, colour palette)
- Output each as a separate complete HTML page in the JSON below

When you have all information needed, say exactly:
"Perfect — I have everything I need to design your page! Let me put this together now."

Then output ONLY valid JSON wrapped in triple-backtick json markers. No other text after the closing marker.

OUTPUT FORMAT:
\`\`\`json
{
  "projectName": "string",
  "platform": "Kajabi",
  "isMultiPage": false,
  "niche": "string",
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "fonts": {
    "headline": "Google Font name",
    "body": "Google Font name"
  },
  "pages": [
    {
      "id": 1,
      "name": "string",
      "slug": "page-name-kebab",
      "pageType": "string",
      "goal": "string",
      "html": "FULL SELF-CONTAINED HTML STRING HERE"
    }
  ]
}
\`\`\`

HTML GENERATION RULES — follow these precisely:

1. STRUCTURE: Each page's "html" value must be a complete <!DOCTYPE html>...</html> document. Escape all double quotes inside the JSON string as \\". Escape newlines as \\n.

2. FONTS: Always import from Google Fonts in the <head>. Use the fonts specified in the palette. Kajabi commonly uses clean, modern sans-serifs — DM Sans, Inter, Lato, Montserrat work well.

3. COLOURS: Apply the palette throughout. Primary = main CTAs and key headings. Secondary = section backgrounds, cards. Accent = highlights, badges, underlines.

4. IMAGE PLACEHOLDERS: Never use <img> tags unless the user provided real image URLs. Instead use:
<div class="img-placeholder" data-label="Description of image needed" style="background:linear-gradient(135deg,#palette-secondary,#palette-primary22);border:2px dashed #palette-primary55;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#palette-primary;font-family:body-font,sans-serif;min-height:280px;">
  <div style="font-size:32px;">🖼</div>
  <div style="font-size:13px;font-weight:600;opacity:0.7;">IMAGE: Description of image needed</div>
</div>

5. KAJABI-APPROPRIATE SECTIONS: Design pages that would translate naturally to Kajabi's section-based builder. Use:
- Clean hero sections with strong headline + subheadline + CTA
- Benefit grids (2-3 columns on desktop, stacked on mobile)
- Testimonial sections (card style or pull-quote style)
- About/credibility section with image placeholder
- FAQ accordions (visual, not functional — show first item open)
- Clear CTA sections with high contrast
- Simple, clean footer
Kajabi pages tend to be cleaner and lighter than GHL pages — lean into this.

6. IMAGES — MANDATORY: Every page MUST have at least 3-4 image placeholders spread throughout. Place them:
- Hero section: full-width or split-layout hero image
- About/host section: headshot or personal brand photo
- Mid-page: supporting lifestyle or result image
- Testimonials: small avatar placeholder per testimonial
Use the img-placeholder div format for ALL of these. Label them descriptively.

7. COLOURS — STRICT RULES:
- ALL buttons must use palette primary colour as background — never blue, green, or any off-palette colour
- ALL links and accents must use palette colours only
- No random white circles, grey boxes, or decorative shapes in unspecified colours
- Section backgrounds use palette.background and palette.secondary only

8. MOBILE: Include a <style> block with @media (max-width: 768px) rules. Columns stack, font sizes reduce, padding tightens.

9. CTA BUTTONS: palette.primary background, border-radius:40px, padding:16px 40px, font-weight:700, color:#fff.

10. COPY: If the user has copy, use it exactly. If placeholder, write specific niche-appropriate copy with <!-- PLACEHOLDER --> comments. Never write generic "Lorem ipsum".

11. FOOTER: Minimal footer: SaaSy Funnels watermark, muted colour, centered.

12. MULTI-PAGE: Each page is a complete standalone HTML document with the same palette and fonts.`;

const PROMPTS = [
  "Design a Kajabi opt-in page for my lead magnet",
  "Design a Kajabi webinar registration page",
  "Design a Kajabi sales page for my course or program",
  "Design a Kajabi discovery call application page",
  "Design a full Kajabi pipeline funnel",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseJSON(text) {
  try {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) return JSON.parse(m[1].trim());
    const s = text.indexOf("{"); const e = text.lastIndexOf("}");
    if (s > -1 && e > s) return JSON.parse(text.slice(s, e + 1));
  } catch { return null; }
  return null;
}

function extractChips(text) {
  const lines = text.split("\n");
  const chips = [];
  for (const line of lines) {
    const m = line.match(/^\s*(?:[a-e][.):]|[-•*]|\d+[.)]|[A-E][.)]|\*\*)\s+(.{3,80}?)(?:\*\*)?$/);
    if (m) {
      let chip = m[1].trim().replace(/\*\*$/,'').trim();
      if (chip.length >= 3 && chip.length <= 75) chips.push(chip);
    }
  }
  return chips.length >= 2 && chips.length <= 6 ? chips : [];
}

function stripJSON(content) {
  let c = content.replace(/```[\s\S]*?```/g, "").trim();
  const keys = ["projectName", "pageType", "isMultiPage", "pages", "palette"];
  if (keys.some(k => c.includes('"' + k + '"'))) {
    const s = c.indexOf("{"); const e = c.lastIndexOf("}");
    if (s > -1 && e > s) c = (c.slice(0, s) + c.slice(e + 1)).trim();
  }
  return c.replace(/^json\s*/i, "").trim() || "✦ Your page design is ready — see below!";
}

// ─── UI Components ─────────────────────────────────────────────────────────────
function SFLogo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: sfGradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "#fff",
      fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.02em", flexShrink: 0,
    }}>SF</div>
  );
}

function TopNav({ onBack }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(250,250,250,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      padding: "0 24px", height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8, padding: "6px 12px", color: kjMuted,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", gap: 5, marginRight: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = kjText; e.currentTarget.style.borderColor = "rgba(107,53,200,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = kjMuted; e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; }}
          >← Dashboard</button>
        )}
        <SFLogo size={32} />
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: kjText }}>SaaSy Funnels</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.04)", borderRadius: 8, padding: "4px 6px", border: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: sfGradient, color: "#fff" }}>Kajabi</div>
        <div style={{ padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: "transparent", color: kjMuted }}>GHL</div>
      </div>
    </div>
  );
}

function Dots({ msg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 18px", background: kjCard, border: "1px solid " + kjBorder, borderRadius: "0 18px 18px 18px", maxWidth: "72%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: kjPink, animation: "kjBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      {msg && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, color: kjMuted, fontStyle: "italic" }}>{msg}</div>}
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12, alignItems: "flex-end", gap: 8 }}>
      {!isUser && (
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: sfGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: "#fff", fontWeight: 700 }}>✦</div>
      )}
      <div style={{
        maxWidth: "72%", padding: "12px 16px",
        background: isUser ? sfGradient : kjCard,
        border: isUser ? "none" : "1px solid " + kjBorder,
        borderRadius: isUser ? "18px 18px 4px 18px" : "0 18px 18px 18px",
        fontSize: 14, color: isUser ? "#fff" : kjText, lineHeight: 1.65,
        fontFamily: "'DM Sans',sans-serif", whiteSpace: "pre-wrap",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function QuickChips({ text, onSelect }) {
  const chips = extractChips(text);
  if (!chips.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, marginLeft: 44 }}>
      {chips.map((chip, i) => (
        <button key={i} onClick={() => onSelect(chip)}
          style={{
            background: "#fff", border: `1px solid ${kjPurple}33`,
            borderRadius: 20, padding: "7px 14px", cursor: "pointer",
            fontSize: 13, color: kjText, fontFamily: "'DM Sans',sans-serif",
            fontWeight: 500, transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${kjPurple}0f`; e.currentTarget.style.borderColor = kjPurple; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = `${kjPurple}33`; }}
        >{chip}</button>
      ))}
    </div>
  );
}

// ─── Branding confirmation card ────────────────────────────────────────────────
function BrandingCard({ branding, onConfirm, onTweak, onWrong }) {
  const swatches = branding.colours?.slice(0, 6) || [];
  const fonts = branding.fonts?.slice(0, 3) || [];
  const googleFonts = branding.googleFonts?.slice(0, 3) || [];
  const allFonts = [...new Set([...googleFonts, ...fonts])].slice(0, 4);

  return (
    <div style={{ margin: "10px 0 10px 44px", background: "#fff", border: `1px solid ${kjPurple}22`, borderRadius: 14, overflow: "hidden", animation: "kjFadeUp 0.4s ease", boxShadow: "0 4px 20px rgba(107,53,200,0.08)" }}>
      <div style={{ background: `linear-gradient(135deg,${kjPurple}0f,${kjPink}08)`, borderBottom: `1px solid ${kjPurple}15`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>🎨</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: kjPurple, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans',sans-serif" }}>Brand detected</div>
          <div style={{ fontSize: 13, color: kjText, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{branding.title || branding.url}</div>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {swatches.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kjMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Colours found</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {swatches.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "#F9F9F9", border: "1px solid " + kjBorder, borderRadius: 8, padding: "5px 10px" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: c, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: kjMuted, fontFamily: "monospace" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {allFonts.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kjMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Fonts found</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allFonts.map((f, i) => (
                <div key={i} style={{ background: "#F9F9F9", border: "1px solid " + kjBorder, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: kjText, fontFamily: "'DM Sans',sans-serif" }}>{f}</div>
              ))}
            </div>
          </div>
        )}
        {branding.vibe && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kjMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>Vibe</div>
            <div style={{ display: "inline-block", background: `${kjPurple}0f`, border: `1px solid ${kjPurple}22`, borderRadius: 20, padding: "4px 14px", fontSize: 12, color: kjPurple, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{branding.vibe}</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          <button onClick={onConfirm} style={{ ...btn(), background: sfGradient, flex: 1, minWidth: 100, boxShadow: "0 4px 12px rgba(244,84,122,0.2)" }}>✓ Looks right — use this</button>
          <button onClick={onTweak} style={{ ...btn(), background: "transparent", border: `1px solid ${kjPurple}33`, color: kjPurple, flex: 1, minWidth: 100 }}>✏ Tweak it</button>
          <button onClick={onWrong} style={{ ...btn(), background: "transparent", border: "1px solid " + kjBorder, color: kjMuted }}>✕ Looks wrong</button>
        </div>
      </div>
    </div>
  );
}

// ─── Palette picker ─────────────────────────────────────────────────────────────
const PALETTE_OPTIONS = [
  { name: "Coral & Cream", primary: "#E8614A", secondary: "#FFF5F0", accent: "#2D2D2D", background: "#FFFFFF", text: "#1A1A1A", vibe: "Warm · Feminine · Inviting" },
  { name: "Deep Violet", primary: "#6B35C8", secondary: "#F3EEFF", accent: "#F4547A", background: "#FFFFFF", text: "#0D0B14", vibe: "Bold · Premium · Creative" },
  { name: "Ocean Teal", primary: "#0891B2", secondary: "#E0F7FA", accent: "#F59E0B", background: "#FFFFFF", text: "#0C1821", vibe: "Fresh · Trustworthy · Modern" },
  { name: "Forest & Gold", primary: "#2D6A4F", secondary: "#F0FAF5", accent: "#D4A017", background: "#FFFFFF", text: "#1A2E25", vibe: "Earthy · Natural · Premium" },
  { name: "Midnight Rose", primary: "#C2185B", secondary: "#FFF0F5", accent: "#FFB300", background: "#FFFFFF", text: "#1A000D", vibe: "Bold · Luxe · Dramatic" },
  { name: "Slate & Sky", primary: "#334155", secondary: "#F1F5F9", accent: "#3B82F6", background: "#FFFFFF", text: "#0F172A", vibe: "Professional · Clean · Minimal" },
  { name: "Peach Blossom", primary: "#F97316", secondary: "#FFF7ED", accent: "#7C3AED", background: "#FFFFFF", text: "#1C0A00", vibe: "Energetic · Fun · Warm" },
  { name: "Sage & Linen", primary: "#6B7C5E", secondary: "#F5F3EE", accent: "#C9A96E", background: "#FAF8F5", text: "#2C2C2C", vibe: "Calm · Organic · Mindful" },
];

function PalettePicker({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ margin: "10px 0 10px 44px", animation: "kjFadeUp 0.4s ease" }}>
      <div style={{ fontSize: 13, color: kjMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 12, lineHeight: 1.5 }}>
        Here are some palette options — pick one to start, or ask me to show different ones:
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PALETTE_OPTIONS.map((p, i) => (
          <div key={i}
            onClick={() => onSelect(p)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i ? "#fff" : kjCard,
              border: `1px solid ${hovered === i ? kjPurple + "44" : kjBorder}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              transition: "all 0.15s", transform: hovered === i ? "translateY(-1px)" : "none",
              boxShadow: hovered === i ? "0 4px 16px rgba(107,53,200,0.1)" : "none",
            }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
              {[p.primary, p.secondary, p.accent, p.background].map((c, ci) => (
                <div key={ci} style={{ flex: 1, height: 20, borderRadius: 4, background: c, border: "1px solid rgba(0,0,0,0.08)" }} />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: kjText, fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: kjMuted, fontFamily: "'DM Sans',sans-serif" }}>{p.vibe}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page output panel ─────────────────────────────────────────────────────────
function PageOutput({ projectData, onAddImages }) {
  const pages = projectData.pages || [];
  const [pageUrls, setPageUrls] = useState({});
  const [saving, setSaving] = useState({});
  const [saveErrors, setSaveErrors] = useState({});
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageProgress, setImageProgress] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);

  const getLocalUrl = (page) => {
    const blob = new Blob([page.html], { type: "text/html" });
    return URL.createObjectURL(blob);
  };

  const savePage = async (page) => {
    if (pageUrls[page.id]) return pageUrls[page.id];
    setSaving(prev => ({ ...prev, [page.id]: true }));
    setSaveErrors(prev => ({ ...prev, [page.id]: null }));
    try {
      const slug = `${projectData.projectName || "page"}-${page.slug || page.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const res = await fetch("/api/save-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: page.html, filename: slug }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setPageUrls(prev => ({ ...prev, [page.id]: data.url }));
        setSaveErrors(prev => ({ ...prev, [page.id]: null }));
        return data.url;
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (e) {
      console.error("Save failed:", e);
      setSaveErrors(prev => ({ ...prev, [page.id]: e.message }));
    } finally {
      setSaving(prev => ({ ...prev, [page.id]: false }));
    }
    return null;
  };

  useEffect(() => { pages.forEach(page => savePage(page)); }, []);

  const openPage = (page) => {
    const blob = new Blob([page.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const copyLink = async (page, idx) => {
    const url = pageUrls[page.id] || await savePage(page);
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 3000);
      });
    } else {
      navigator.clipboard.writeText("Use the ↓ download button to save this page.");
    }
  };

  const downloadPage = (page) => {
    const blob = new Blob([page.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(page.slug || page.name || "page").replace(/\s+/g, "-")}-kajabi.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddImages = async () => {
    setGeneratingImages(true);
    await onAddImages(setImageProgress, (updatedPages) => {
      setGeneratingImages(false);
      setImageProgress("");
      updatedPages.forEach(page => {
        setSaving(prev => ({ ...prev, [page.id]: true }));
        const slug = `${projectData.projectName || "page"}-${page.slug || page.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        fetch("/api/save-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: page.html, filename: slug }),
        }).then(r => r.json()).then(data => {
          if (data.success) setPageUrls(prev => ({ ...prev, [page.id]: data.url }));
        }).finally(() => setSaving(prev => ({ ...prev, [page.id]: false })));
      });
    });
  };

  return (
    <div style={{ padding: "20px 16px", animation: "kjFadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-block", background: sfGradient, color: "#fff", borderRadius: 100, padding: "5px 18px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
          {pages.length > 1 ? `✦ ${pages.length}-Page Pipeline` : "✦ Page Design Ready"}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 700, color: kjText, margin: "0 0 4px" }}>{projectData.projectName}</h2>
        {projectData.palette && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(projectData.palette).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, background: "#F9F9F9", border: "1px solid " + kjBorder, borderRadius: 8, padding: "4px 8px" }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: v, border: "1px solid rgba(0,0,0,0.1)" }} />
                <span style={{ fontSize: 10, color: kjMuted, fontFamily: "monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pages.map((page, i) => (
          <div key={page.id} style={{ background: "#fff", border: "1px solid " + kjBorder, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ background: `linear-gradient(135deg,${kjPurple}0f,${kjPink}08)`, borderBottom: "1px solid " + kjBorder, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: sfGradient, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>P{page.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: kjMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'DM Sans',sans-serif" }}>{page.pageType}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: kjText, fontFamily: "'Playfair Display',serif" }}>{page.name}</div>
              </div>
              {saving[page.id] && <div style={{ fontSize: 11, color: kjMuted, fontFamily: "'DM Sans',sans-serif" }}>Saving…</div>}
              {saveErrors[page.id] && !saving[page.id] && <div style={{ fontSize: 10, color: "#E53E3E", fontFamily: "'DM Sans',sans-serif" }}>Link unavailable — use ↓ to download</div>}
            </div>

            <div style={{ padding: "12px 14px", display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button onClick={() => openPage(page)} style={{ ...btn(), background: sfGradient, flex: 2, minWidth: 120, boxShadow: "0 4px 12px rgba(244,84,122,0.2)", fontSize: 12 }}>
                🔗 Open in new tab
              </button>
              <button onClick={() => copyLink(page, i)}
                style={{ ...btn(), background: copiedIdx === i ? "linear-gradient(135deg,#00C8A0,#009B7A)" : "transparent", border: `1px solid ${copiedIdx === i ? "#00C8A0" : kjPurple + "33"}`, color: copiedIdx === i ? "#fff" : kjPurple, flex: 1, minWidth: 80, fontSize: 12, transition: "all 0.3s" }}>
                {copiedIdx === i ? "✓ Copied" : "Copy link"}
              </button>
              <button onClick={() => downloadPage(page)} style={{ ...btn(), background: "transparent", border: "1px solid " + kjBorder, color: kjMuted, fontSize: 12 }}>↓</button>
            </div>

            {pageUrls[page.id] && (
              <div style={{ padding: "0 14px 12px" }}>
                <div style={{ background: "#F9F9F9", border: "1px solid " + kjBorder, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: kjMuted, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pageUrls[page.id]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Images */}
      <div style={{ marginTop: 16, background: `${kjPurple}08`, border: `1px solid ${kjPurple}22`, borderRadius: 12, padding: "14px 16px" }}>
        {generatingImages ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: kjPurple, fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>✦ Generating AI images…</div>
            <div style={{ fontSize: 12, color: kjMuted, fontFamily: "'DM Sans',sans-serif" }}>{imageProgress || "Reading your page design…"}</div>
            <div style={{ marginTop: 8, height: 3, background: `${kjPurple}22`, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: sfGradient, borderRadius: 2, animation: "kjProgress 2s ease-in-out infinite" }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: kjPurple, fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>✨ Want real images on your page?</div>
            <div style={{ fontSize: 12, color: kjMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 10, lineHeight: 1.5 }}>
              I can generate AI images for each placeholder — professional marketing photos that match your brand.
            </div>
            <button onClick={handleAddImages} style={{ ...btn(), background: sfGradient, width: "100%", boxShadow: "0 4px 12px rgba(244,84,122,0.15)" }}>
              ✦ Generate AI images for this page
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 10, background: "#F9F9F9", border: "1px solid " + kjBorder, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: kjMuted, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
          📋 <strong style={{ color: kjText }}>Ready to build?</strong> Copy any page link above and send it to the SaaSy Funnels team — we'll build it in Kajabi exactly as designed.
        </div>
      </div>
    </div>
  );
}

// ─── File upload ────────────────────────────────────────────────────────────────
function FileUploadArea({ onFiles, label, accept, multiple }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files) => {
    const results = [];
    for (const file of files) {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej();
        r.readAsDataURL(file);
      });
      results.push({ name: file.name, type: file.type, base64 });
    }
    onFiles(results);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles([...e.dataTransfer.files]); }}
      onClick={() => ref.current?.click()}
      style={{
        border: `2px dashed ${dragging ? kjPink : kjPurple + "44"}`,
        borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "center",
        background: dragging ? `${kjPink}08` : `${kjPurple}05`,
        transition: "all 0.15s",
      }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} style={{ display: "none" }}
        onChange={e => handleFiles([...e.target.files])} />
      <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: kjMuted }}>{label}</div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: `${kjPurple}66`, marginTop: 3 }}>Click or drag & drop</div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function KajabiPageBuilder() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [pendingBranding, setPendingBranding] = useState(null);
  const [showPalettePicker, setShowPalettePicker] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const loadingTimerRef = useRef(null);

  const LOADING_MSGS = [
    "Reading your brief…",
    "Thinking about your audience…",
    "Designing your Kajabi page…",
    "Writing your copy…",
    "Applying your branding…",
    "Checking conversion principles…",
    "Building the layout…",
    "Almost there…",
  ];

  const startLoadingMsgs = () => {
    let i = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    loadingTimerRef.current = setInterval(() => {
      i = Math.min(i + 1, LOADING_MSGS.length - 1);
      setLoadingMsg(LOADING_MSGS[i]);
    }, 3500);
  };
  const stopLoadingMsgs = () => { clearInterval(loadingTimerRef.current); setLoadingMsg(""); };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, pendingBranding, showPalettePicker]);
  useEffect(() => { if (started && !loading) inputRef.current?.focus(); }, [started, loading]);

  const send = async (text, files = []) => {
    if (loading) return;

    const urlPattern = /https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/;
    const looksLikeUrl = urlPattern.test(text) && (
      text.toLowerCase().includes("http") ||
      text.toLowerCase().includes("www.") ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(text.trim())
    );

    const userMsg = { role: "user", content: text, files };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingFiles([]);
    setShowUploadPanel(false);

    const buildContent = (msgText, msgFiles) => {
      if (!msgFiles?.length) return msgText;
      const parts = [{ type: "text", text: msgText || "Here are the files I mentioned." }];
      for (const f of msgFiles) {
        if (f.type?.startsWith("image/")) {
          parts.push({ type: "image", source: { type: "base64", media_type: f.type, data: f.base64 } });
        } else if (f.type === "application/pdf") {
          parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.base64 } });
        }
      }
      return parts;
    };

    if (looksLikeUrl && historyRef.current.length > 0) {
      setLoading(true);
      startLoadingMsgs();
      try {
        let targetUrl = text.trim();
        if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;
        const scrapeRes = await fetch("/api/fetch-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });
        const scraped = await scrapeRes.json();
        if (scraped.success && (scraped.colours?.length || scraped.fonts?.length)) {
          setPendingBranding({
            url: targetUrl,
            title: scraped.title,
            colours: scraped.colours,
            fonts: scraped.fonts,
            googleFonts: scraped.googleFonts,
            vibe: scraped.colours?.length > 3 ? "Detected from your site" : "Minimal palette detected",
            raw: scraped,
          });
          stopLoadingMsgs();
          setLoading(false);
          return;
        }
      } catch (e) { /* fall through */ }
      stopLoadingMsgs();
      setLoading(false);
    }

    setLoading(true);
    startLoadingMsgs();
    const newHist = [...historyRef.current, { role: "user", content: buildContent(text, files) }];
    historyRef.current = newHist;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 16000,
          system: BASE_SYSTEM_PROMPT,
          messages: newHist,
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Something went wrong.";

      const parsed = parseJSON(reply);
      if (parsed?.pages?.length) {
        setProjectData(parsed);
        historyRef.current = [...newHist, { role: "assistant", content: reply }];
        setMessages(prev => [...prev, { role: "assistant", content: "✦ Your page design is ready — see below!" }]);
      } else {
        historyRef.current = [...newHist, { role: "assistant", content: reply }];
        setMessages(prev => [...prev, { role: "assistant", content: stripJSON(reply) }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong — please try again." }]);
    }
    stopLoadingMsgs();
    setLoading(false);
    inputRef.current?.focus();
  };

  const confirmBranding = () => {
    if (!pendingBranding) return;
    const { colours, fonts, googleFonts, title, url } = pendingBranding;
    const top3 = colours?.slice(0, 3).join(", ") || "not found";
    const topFonts = [...(googleFonts || []), ...(fonts || [])].slice(0, 2).join(", ") || "not found";
    setMessages(prev => [...prev, { role: "assistant", content: `Great — I've grabbed your branding from ${title || url}. Colours: ${top3}. Fonts: ${topFonts}. I'll use these for your page design.` }]);
    const brandingContext = `The client's branding has been detected from ${url}. Use these exact details:\nColours found: ${colours?.slice(0, 6).join(", ")}\nGoogle Fonts found: ${googleFonts?.join(", ") || "none"}\nOther fonts found: ${fonts?.slice(0, 4).join(", ") || "none"}\nUse the most prominent colours as the palette. Pick the most distinctive Google Font as the headline font.`;
    historyRef.current = [...historyRef.current, { role: "assistant", content: brandingContext }];
    setPendingBranding(null);
    setTimeout(() => send("My branding looks correct — please continue to the next question."), 100);
  };

  const tweakBranding = () => {
    setPendingBranding(null);
    setMessages(prev => [...prev, { role: "assistant", content: "No problem — what would you like to change? You can paste specific hex colours, font names, or describe what doesn't look right." }]);
  };

  const wrongBranding = () => {
    setPendingBranding(null);
    setMessages(prev => [...prev, { role: "assistant", content: "Got it — let's try a different approach. Would you like to paste your hex colours directly, upload a screenshot, or let me recommend a palette based on your vibe?" }]);
  };

  const selectPalette = (palette) => {
    setShowPalettePicker(false);
    const msg = `I love the ${palette.name} palette — ${palette.vibe}. Let's use that.`;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    const paletteContext = `The client has chosen the "${palette.name}" colour palette:\nPrimary: ${palette.primary}\nSecondary: ${palette.secondary}\nAccent: ${palette.accent}\nBackground: ${palette.background}\nText: ${palette.text}\nUse these exact hex values in the page design.`;
    historyRef.current = [...historyRef.current, { role: "user", content: msg }];
    historyRef.current = [...historyRef.current, { role: "assistant", content: paletteContext }];
    setTimeout(() => send("Please continue to the next question — I've confirmed my palette choice.", []), 100);
  };

  const addAIImages = async (setProgress, onComplete) => {
    if (!projectData?.pages) { console.error("No project data"); return; }
    const updatedPages = projectData.pages.map(p => ({ ...p }));
    for (let pi = 0; pi < updatedPages.length; pi++) {
      const placeholderRegex = /data-label="([^"]+)"/g;
      let match;
      const placeholders = [];
      while ((match = placeholderRegex.exec(updatedPages[pi].html)) !== null) placeholders.push(match[1]);
      if (placeholders.length === 0) { setProgress(`Page ${pi + 1}: no placeholders found, skipping…`); continue; }
      for (let ii = 0; ii < placeholders.length; ii++) {
        const label = placeholders[ii];
        setProgress(`Page ${pi + 1} of ${updatedPages.length}: generating image ${ii + 1}/${placeholders.length}…`);
        try {
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: label, aspect_ratio: "16:9" }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const placeholderDivRegex = new RegExp(`<div class="img-placeholder"[^>]*data-label="${escapedLabel}"[^>]*>[\\s\\S]*?<\\/div>`, 'i');
            updatedPages[pi].html = updatedPages[pi].html.replace(placeholderDivRegex, `<img src="${data.url}" alt="${label}" style="width:100%;border-radius:12px;display:block;" />`);
          }
        } catch (e) { console.error("Image gen failed:", label, e); }
      }
    }
    setProjectData(prev => ({ ...prev, pages: updatedPages }));
    onComplete(updatedPages);
  };

  const start = async (text) => { setStarted(true); await send(text); };
  const reset = () => {
    setMessages([]); setInput(""); setStarted(false); setProjectData(null);
    setPendingFiles([]); setShowUploadPanel(false); setPendingBranding(null);
    setShowPalettePicker(false); historyRef.current = [];
  };

  const displayMsgs = messages.map(m => m.role !== "assistant" ? m : { ...m, content: stripJSON(m.content) });

  return (
    <div style={{ minHeight: "100vh", background: kjBg, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes kjBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
        @keyframes kjFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes kjFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes kjProgress{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
        textarea:focus{outline:none} textarea{resize:none} input:focus{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${kjPurple}44;border-radius:2px}
        .kj-prompt-btn:hover{border-color:${kjPink}!important;background:${kjPink}08!important;}
      `}</style>

      <TopNav onBack={() => navigate("/")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 30, animation: "kjFadeIn 0.6s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${kjPurple}10`, border: `1px solid ${kjPurple}25`, color: kjPurple, padding: "6px 16px", borderRadius: 100, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            <span>🎨</span> Kajabi Page Builder
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 30, fontWeight: 700, color: kjText, margin: "0 0 8px", lineHeight: 1.15 }}>
            Design your Kajabi page
          </h1>
          <p style={{ color: kjMuted, fontSize: 15, margin: 0, maxWidth: 440, fontFamily: "'DM Sans',sans-serif" }}>
            Answer a few quick questions — I'll design the full page, ready to view, share, and hand off.
          </p>
        </div>

        <div style={{
          width: "100%", maxWidth: 700,
          background: kjSurface,
          border: "1px solid " + kjBorder,
          borderRadius: 16, overflow: "hidden",
          display: "flex", flexDirection: "column",
          height: started ? "calc(100vh - 240px)" : "auto",
          minHeight: started ? 400 : "auto",
          animation: "kjFadeIn 0.5s ease",
          boxShadow: "0 4px 24px rgba(107,53,200,0.08)",
        }}>

          {!started ? (
            <div style={{ padding: "32px 28px 28px" }}>
              <p style={{ color: kjMuted, fontSize: 14.5, marginTop: 0, marginBottom: 20, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
                What do you want to design for Kajabi? Pick a type or describe it:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => start(p)} className="kj-prompt-btn" style={{
                    background: "#F9F9F9", border: "1px solid " + kjBorder,
                    borderRadius: 10, padding: "12px 16px", textAlign: "left", cursor: "pointer",
                    fontSize: 14, color: kjText, fontFamily: "'DM Sans',sans-serif",
                    lineHeight: 1.4, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                  }}>
                    <span style={{ color: kjPurple, fontSize: 15 }}>→</span> {p}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) start(input.trim()); } }}
                  placeholder="Or describe what you want to design…" rows={2}
                  style={{ flex: 1, border: "1px solid " + kjBorder, borderRadius: 10, padding: "12px 14px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "#F9F9F9", color: kjText, lineHeight: 1.5 }} />
                <button onClick={() => input.trim() && start(input.trim())} style={{ ...btn(), background: sfGradient, padding: "12px 18px", fontSize: 18, boxShadow: "0 4px 12px rgba(244,84,122,0.25)" }}>→</button>
              </div>
            </div>

          ) : projectData ? (
            <>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <PageOutput projectData={projectData} onAddImages={addAIImages} />
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{ borderTop: "1px solid " + kjBorder, paddingTop: 14, marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: kjMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}>
                      Want changes? Tell me what to adjust and I'll redesign.
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !loading) { const t = input.trim(); setInput(""); send(t, []); } } }}
                        placeholder="e.g. Make the hero darker, add more testimonials, change the font…" rows={2}
                        style={{ flex: 1, border: "1px solid " + kjBorder, borderRadius: 10, padding: "11px 14px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: "#F9F9F9", color: kjText, lineHeight: 1.5 }} />
                      <button onClick={() => { if (!input.trim() || loading) return; const t = input.trim(); setInput(""); setProjectData(null); send(t, []); }}
                        disabled={loading || !input.trim()}
                        style={{ ...btn(), background: loading || !input.trim() ? `${kjPurple}44` : sfGradient, padding: "12px 18px", fontSize: 18 }}>→</button>
                    </div>
                  </div>
                </div>
              </div>
            </>

          ) : (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 12px" }}>
                {displayMsgs.map((m, i) => (
                  <div key={i}>
                    <Bubble msg={m} />
                    {m.role === "assistant" && i === displayMsgs.length - 1 && !loading && !pendingBranding && !showPalettePicker && (
                      <QuickChips text={messages[i]?.content || ""} onSelect={t => send(t, [])} />
                    )}
                    {m.files?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, justifyContent: "flex-end" }}>
                        {m.files.map((f, fi) => (
                          <div key={fi} style={{ background: `${kjPurple}10`, border: `1px solid ${kjPurple}30`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: kjPurple, fontFamily: "'DM Sans',sans-serif" }}>📎 {f.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div style={{ display: "flex", marginBottom: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: sfGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, flexShrink: 0, color: "#fff", fontWeight: 700 }}>✦</div>
                    <Dots msg={loadingMsg} />
                  </div>
                )}

                {pendingBranding && !loading && (
                  <BrandingCard branding={pendingBranding} onConfirm={confirmBranding} onTweak={tweakBranding} onWrong={wrongBranding} />
                )}

                {showPalettePicker && !loading && (
                  <PalettePicker onSelect={selectPalette} />
                )}

                <div ref={bottomRef} />
              </div>

              {!projectData && (
                <div style={{ padding: "8px 16px 12px", borderTop: "1px solid " + kjBorder, background: kjSurface }}>
                  {showUploadPanel && (
                    <div style={{ marginBottom: 10, background: `${kjPurple}08`, border: `1px solid ${kjPurple}20`, borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: kjPurple, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Attach files</div>
                      <FileUploadArea label="Upload images, screenshots, or style guide PDFs" accept="image/*,application/pdf" multiple={true}
                        onFiles={files => { setPendingFiles(prev => [...prev, ...files]); setShowUploadPanel(false); }} />
                    </div>
                  )}
                  {pendingFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {pendingFiles.map((f, i) => (
                        <div key={i} style={{ background: `${kjPurple}10`, border: `1px solid ${kjPurple}30`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: kjPurple, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          📎 {f.name}
                          <button onClick={() => setPendingFiles(prev => prev.filter((_, pi) => pi !== i))} style={{ border: "none", background: "none", cursor: "pointer", color: kjMuted, fontSize: 12, padding: 0 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <button onClick={() => setShowUploadPanel(p => !p)} style={{ ...btn(), background: "transparent", color: kjMuted, border: "1px solid " + kjBorder, padding: "11px 14px", fontSize: 16, flexShrink: 0 }}>📎</button>
                    <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!input.trim() && !pendingFiles.length || loading) return; send(input.trim(), pendingFiles); } }}
                      placeholder="Type your answer…" rows={2} disabled={loading}
                      style={{ flex: 1, border: "1px solid " + kjBorder, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "#F9F9F9", color: kjText, lineHeight: 1.5, opacity: loading ? 0.5 : 1 }} />
                    <button onClick={() => { if ((!input.trim() && !pendingFiles.length) || loading) return; send(input.trim(), pendingFiles); }}
                      disabled={loading || (!input.trim() && !pendingFiles.length)}
                      style={{ ...btn(), background: loading || (!input.trim() && !pendingFiles.length) ? `${kjPurple}44` : sfGradient, padding: "12px 18px", fontSize: 18, cursor: loading || (!input.trim() && !pendingFiles.length) ? "not-allowed" : "pointer" }}>→</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {started && (
          <button onClick={reset} style={{ ...btn(), background: "transparent", color: kjMuted, border: "1px solid " + kjBorder, marginTop: 12, marginBottom: 20, fontSize: 12 }}>
            ← Start over
          </button>
        )}

        <p style={{ fontSize: 11.5, color: `${kjPurple}44`, marginTop: 8, marginBottom: 20, textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>
          Powered by Claude · Built for Kajabi users · SaaSy Funnels
        </p>
      </div>
    </div>
  );
}
