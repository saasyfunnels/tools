import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Theme tokens ────────────────────────────────────────────────────────────
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

const btn = (extra = {}) => ({
  border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer",
  fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: "#fff",
  fontWeight: 600, letterSpacing: "0.01em", ...extra,
});

// ─── System prompt ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are a landing page and funnel design specialist working for SaaSy Funnels by Meg Burrage. You help coaches, course creators, and online business owners design beautiful, high-converting landing pages and funnel pages.

Your role is to walk the client through a warm, friendly intake conversation — one question at a time — then output a complete, self-contained HTML page they can view in a browser, share with their team, and hand off for building.

You represent SaaSy Funnels by Meg Burrage. Your tone is warm, encouraging, plain-spoken, and a little bit sassy. You are talking to non-technical online business owners.

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
- Webinar funnel: Registration → Confirmation → Reminder sequence → Replay page
- Lead magnet funnel: Opt-in → Thank you (deliver + set expectations) → Nurture sequence
- Sales funnel: Sales page → Order form → Thank you / access page
- Discovery call funnel: Application → Thank you → Booking confirmation
- Challenge funnel: Registration → Confirmation → Daily challenge pages → Sales page

CONVERSATION RULES — STRICT, NO EXCEPTIONS:
- ONE QUESTION PER MESSAGE, ALWAYS. Before sending any reply, count your questions. If you have more than one, delete all but the first. Wait for the client to answer before asking the next. This is a hard constraint with zero exceptions.
- Acknowledgements must be five words or fewer — no extended praise, no emojis, no cheerleading.
- Where questions have clear options, list them as labelled choices (a, b, c).
- COPY and IMAGES are always asked as SEPARATE questions — never combined.
- Never say things like "I love working with this audience" or "Perfect choice!" — be warm but extremely brief.

INTAKE PROCESS — one question at a time, strictly in order. Ask each, wait for answer, then continue:
1. What is the page for? Give examples: opt-in page, sales page, webinar registration, VSL, discovery call, waitlist.
2. Single page or multi-page funnel? If multi-page, plan all pages upfront before designing.
3. Who is this page for — niche, who they are, what they struggle with, what outcome they want.
4. PAGE-TYPE SPECIFIC QUESTIONS — ask ALL that apply for the page type, one at a time:
   - For WEBINAR pages: What is the webinar title or topic? When is it (date + time + timezone)? How long? Live or pre-recorded?
   - For SALES pages: What is the offer name and price? What are the main benefits or modules?
   - For OPT-IN pages: What is the lead magnet name? What do they get?
   - For DISCOVERY CALL pages: What is the call about? Any qualifying questions you want to ask?
   - For VSL pages: What is the main offer being pitched in the video?
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
If the client wants a funnel, plan ALL pages upfront before designing any:
- List all pages needed
- Describe how they connect
- Note shared elements (header, footer, colour palette)
- Output each as a separate complete HTML page in the JSON below

When you have all information needed, say exactly:
"Perfect — I have everything I need to design your page! Let me put this together now."

Then output ONLY valid JSON wrapped in triple-backtick json markers. No other text after the closing marker.

OUTPUT FORMAT:
\`\`\`json
{
  "projectName": "string",
  "platform": "GHL",
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

2. FONTS: Always import from Google Fonts in the <head>. Use the fonts specified in the palette.

3. COLOURS: Apply the palette throughout. Primary = main CTAs and key headings. Secondary = section backgrounds, cards. Accent = highlights, badges, underlines.

4. IMAGE PLACEHOLDERS: Never use <img> tags unless the user provided real image URLs. Instead use:
<div class="img-placeholder" data-label="Description of image needed" style="background:linear-gradient(135deg,#palette-secondary,#palette-primary22);border:2px dashed #palette-primary55;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#palette-primary;font-family:body-font,sans-serif;min-height:280px;">
  <div style="font-size:32px;">🖼</div>
  <div style="font-size:13px;font-weight:600;opacity:0.7;">IMAGE: Description of image needed</div>
</div>

5. SECTIONS: Design with genuine creative flair. Each section should feel purposeful and distinct. You may use:
- Full-bleed gradient hero with large headline and CTA button
- Diagonal or curved section dividers (clip-path or SVG)
- Dark testimonial strips contrasting with light sections
- Bold stat/number blocks
- Card grids for benefits or features
- Countdown timer visual (static, styled)
- Video embed placeholder (styled black box with play button overlay)
- Speaker/host bio section with image placeholder
- Social proof logos row

6. IMAGES — MANDATORY: Every page MUST have at least 3-4 image placeholders spread throughout the page. Place them:
- Hero section: full-width or split-layout hero image (lifestyle, product, or speaker photo)
- About/host section: headshot or personal brand photo
- Mid-page: supporting lifestyle or result image
- Any testimonial or social proof section: include small avatar placeholders per testimonial
Use the img-placeholder div format specified above for ALL of these. Label them descriptively.

7. COLOURS — STRICT RULES:
- ALL buttons on the page must use the palette primary colour as background — never use blue, green, or any colour not in the palette
- ALL links and accents must use palette colours only
- Section background alternation: use palette.background and palette.secondary only
- Never invent colours not in the palette
- No random white circles, grey boxes, or decorative shapes in unspecified colours

8. MOBILE: Include a <style> block with @media (max-width: 768px) rules. Columns stack, font sizes reduce, padding tightens.

9. CTA BUTTONS: Style with palette.primary as background, border-radius:40px, padding:16px 40px, font-weight:700, color:#fff.

10. COPY: If the user has copy, use it exactly. If placeholder, write specific niche-appropriate copy clearly marked with <!-- PLACEHOLDER --> HTML comments. Never write generic "Lorem ipsum".

11. FOOTER: Every page ends with a minimal footer: SaaSy Funnels watermark in small text, muted colour, centered.

12. MULTI-PAGE: Each page is a complete standalone HTML document. They share the same palette and fonts but are independent files.`;

// ─── Prompts ──────────────────────────────────────────────────────────────────
const PROMPTS = [
  "Design a lead magnet opt-in page for my freebie",
  "Design a webinar registration + confirmation page funnel",
  "Design a sales page for my online course or program",
  "Design a VSL (video sales letter) page",
  "Design a discovery call application page",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    // Match: a) text, a. text, - text, • text, * text, 1. text
    const m = line.match(/^\s*(?:[a-e][.):]|[-•*]|\d+[.)]|[A-E][.)]|\*\*)\s+(.{3,80}?)(?:\*\*)?$/);
    if (m) {
      // Clean up any trailing ** or punctuation
      let chip = m[1].trim().replace(/\*\*$/,'').trim();
      // Skip lines that are just instructions or too long
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
      background: "rgba(13,13,13,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(107,53,200,0.2)",
      padding: "0 24px", height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "6px 12px", color: "rgba(240,234,248,0.5)",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", gap: 5, marginRight: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ghlText; e.currentTarget.style.borderColor = "rgba(107,53,200,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,234,248,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >← Dashboard</button>
        )}
        <SFLogo size={32} />
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: ghlText }}>SaaSy Funnels</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "4px 6px", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: "transparent", color: ghlMuted }}>Kajabi</div>
        <div style={{ padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: sfGradient, color: "#fff" }}>GHL</div>
      </div>
    </div>
  );
}

function Dots({ msg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid " + ghlBorder, borderRadius: "0 18px 18px 18px", maxWidth: "72%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: ghlPink, animation: "ghlBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      {msg && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, color: ghlMuted, fontStyle: "italic" }}>{msg}</div>}
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
        background: isUser ? sfGradient : "rgba(255,255,255,0.04)",
        border: isUser ? "none" : "1px solid " + ghlBorder,
        borderRadius: isUser ? "18px 18px 4px 18px" : "0 18px 18px 18px",
        fontSize: 14, color: ghlText, lineHeight: 1.65,
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
            background: "rgba(255,255,255,0.04)", border: `1px solid ${ghlPurple}55`,
            borderRadius: 20, padding: "7px 14px", cursor: "pointer",
            fontSize: 13, color: ghlText, fontFamily: "'DM Sans',sans-serif",
            fontWeight: 500, transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(107,53,200,0.12)"; e.currentTarget.style.borderColor = ghlPurple; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = `${ghlPurple}55`; }}
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
    <div style={{ margin: "10px 0 10px 44px", background: ghlCard, border: `1px solid ${ghlPurple}44`, borderRadius: 14, overflow: "hidden", animation: "ghlFadeUp 0.4s ease" }}>
      <div style={{ background: `linear-gradient(135deg,${ghlPurple}22,${ghlPink}11)`, borderBottom: `1px solid ${ghlPurple}33`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>🎨</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: ghlPurple, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans',sans-serif" }}>Brand detected</div>
          <div style={{ fontSize: 13, color: ghlText, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{branding.title || branding.url}</div>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Colour swatches */}
        {swatches.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ghlMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Colours found</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {swatches.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: "1px solid " + ghlBorder, borderRadius: 8, padding: "5px 10px" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: c, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: ghlMuted, fontFamily: "monospace" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fonts */}
        {allFonts.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ghlMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Fonts found</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allFonts.map((f, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid " + ghlBorder, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: ghlText, fontFamily: "'DM Sans',sans-serif" }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vibe label */}
        {branding.vibe && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ghlMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>Vibe</div>
            <div style={{ display: "inline-block", background: `${ghlPurple}22`, border: `1px solid ${ghlPurple}44`, borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#C4A0FF", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
              {branding.vibe}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          <button onClick={onConfirm} style={{ ...btn(), background: sfGradient, flex: 1, minWidth: 100, boxShadow: "0 4px 12px rgba(244,84,122,0.25)" }}>
            ✓ Looks right — use this
          </button>
          <button onClick={onTweak} style={{ ...btn(), background: "transparent", border: `1px solid ${ghlPurple}55`, color: "#C4A0FF", flex: 1, minWidth: 100 }}>
            ✏ Tweak it
          </button>
          <button onClick={onWrong} style={{ ...btn(), background: "transparent", border: "1px solid " + ghlBorder, color: ghlMuted }}>
            ✕ Looks wrong
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Palette picker (no-brand flow) ────────────────────────────────────────────
const PALETTE_OPTIONS = [
  { name: "Coral & Cream", primary: "#E8614A", secondary: "#FFF5F0", accent: "#2D2D2D", background: "#FFFFFF", text: "#1A1A1A", vibe: "Warm · Feminine · Inviting" },
  { name: "Deep Violet", primary: "#6B35C8", secondary: "#F3EEFF", accent: "#F4547A", background: "#FFFFFF", text: "#0D0B14", vibe: "Bold · Premium · Creative" },
  { name: "Ocean Teal", primary: "#0891B2", secondary: "#E0F7FA", accent: "#F59E0B", background: "#FFFFFF", text: "#0C1821", vibe: "Fresh · Trustworthy · Modern" },
  { name: "Forest & Gold", primary: "#2D6A4F", secondary: "#F0FAF5", accent: "#D4A017", background: "#FFFFFF", text: "#1A2E25", vibe: "Earthy · Natural · Premium" },
  { name: "Midnight Rose", primary: "#C2185B", secondary: "#1A0A12", accent: "#FFB300", background: "#0D0208", text: "#F8F0F4", vibe: "Dark · Luxe · Dramatic" },
  { name: "Slate & Sky", primary: "#334155", secondary: "#F1F5F9", accent: "#3B82F6", background: "#FFFFFF", text: "#0F172A", vibe: "Professional · Clean · Minimal" },
  { name: "Peach Blossom", primary: "#F97316", secondary: "#FFF7ED", accent: "#7C3AED", background: "#FFFFFF", text: "#1C0A00", vibe: "Energetic · Fun · Warm" },
  { name: "Sage & Linen", primary: "#6B7C5E", secondary: "#F5F3EE", accent: "#C9A96E", background: "#FAF8F5", text: "#2C2C2C", vibe: "Calm · Organic · Mindful" },
];

function PalettePicker({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [showing, setShowing] = useState(8);

  return (
    <div style={{ margin: "10px 0 10px 44px", animation: "ghlFadeUp 0.4s ease" }}>
      <div style={{ fontSize: 13, color: ghlMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 12, lineHeight: 1.5 }}>
        Here are some palette options that might suit your vibe — pick one to start, or ask me to show more:
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PALETTE_OPTIONS.slice(0, showing).map((p, i) => (
          <div key={i}
            onClick={() => onSelect(p)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === i ? "rgba(255,255,255,0.06)" : ghlCard,
              border: `1px solid ${hovered === i ? ghlPurple + "66" : ghlBorder}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              transition: "all 0.15s", transform: hovered === i ? "translateY(-1px)" : "none",
            }}>
            {/* Mini palette preview */}
            <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
              {[p.primary, p.secondary, p.accent, p.background].map((c, ci) => (
                <div key={ci} style={{ flex: 1, height: 20, borderRadius: 4, background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: ghlText, fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: ghlMuted, fontFamily: "'DM Sans',sans-serif" }}>{p.vibe}</div>
          </div>
        ))}
      </div>
      {showing < PALETTE_OPTIONS.length && (
        <button onClick={() => setShowing(PALETTE_OPTIONS.length)}
          style={{ ...btn(), background: "transparent", border: "1px solid " + ghlBorder, color: ghlMuted, marginTop: 8, width: "100%", fontSize: 12 }}>
          Show more palettes
        </button>
      )}
    </div>
  );
}

// ─── Page output panel ─────────────────────────────────────────────────────────
function PageOutput({ projectData, onAddImages }) {
  const pages = projectData.pages || [];
  const [pageUrls, setPageUrls] = useState({}); // pageId → blob URL
  const [saving, setSaving] = useState({});
  const [saveErrors, setSaveErrors] = useState({});
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageProgress, setImageProgress] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Generate a local blob URL as immediate fallback
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

  // Auto-save all pages on mount
  useEffect(() => {
    pages.forEach(page => savePage(page));
  }, []);

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
      // Fallback: copy download instruction
      navigator.clipboard.writeText("Use the ↓ download button to save this page.");
    }
  };

  const downloadPage = (page) => {
    const blob = new Blob([page.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(page.slug || page.name || "page").replace(/\s+/g, "-")}-ghl.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddImages = async () => {
    setGeneratingImages(true);
    await onAddImages(setImageProgress, (updatedPages) => {
      setGeneratingImages(false);
      setImageProgress("");
      // Re-save updated pages
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
    <div style={{ padding: "20px 16px", animation: "ghlFadeUp 0.4s ease" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-block", background: sfGradient, color: "#fff", borderRadius: 100, padding: "5px 18px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
          {pages.length > 1 ? `✦ ${pages.length}-Page Funnel` : "✦ Page Design Ready"}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 700, color: ghlText, margin: "0 0 4px" }}>{projectData.projectName}</h2>
        {/* Palette swatches */}
        {projectData.palette && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(projectData.palette).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.04)", border: "1px solid " + ghlBorder, borderRadius: 8, padding: "4px 8px" }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: v, border: "1px solid rgba(255,255,255,0.15)" }} />
                <span style={{ fontSize: 10, color: ghlMuted, fontFamily: "monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pages.map((page, i) => (
          <div key={page.id} style={{ background: ghlCard, border: "1px solid " + ghlBorder, borderRadius: 12, overflow: "hidden" }}>
            {/* Page header */}
            <div style={{ background: `linear-gradient(135deg,${ghlPurple}22,${ghlPink}11)`, borderBottom: "1px solid " + ghlBorder, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: sfGradient, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "'DM Sans',sans-serif" }}>P{page.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: ghlMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'DM Sans',sans-serif" }}>{page.pageType}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: ghlText, fontFamily: "'Playfair Display',serif" }}>{page.name}</div>
              </div>
              {saving[page.id] && <div style={{ fontSize: 11, color: ghlMuted, fontFamily: "'DM Sans',sans-serif" }}>Saving…</div>}
              {saveErrors[page.id] && !saving[page.id] && <div style={{ fontSize: 10, color: "#FF6B6B", fontFamily: "'DM Sans',sans-serif" }}>Link unavailable — use ↓ to download</div>}
            </div>

            {/* Actions */}
            <div style={{ padding: "12px 14px", display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button onClick={() => openPage(page)}
                style={{ ...btn(), background: sfGradient, flex: 2, minWidth: 120, boxShadow: "0 4px 12px rgba(244,84,122,0.25)", fontSize: 12 }}>
                🔗 Open in new tab
              </button>
              <button onClick={() => copyLink(page, i)}
                style={{ ...btn(), background: copiedIdx === i ? "linear-gradient(135deg,#00C8A0,#009B7A)" : "transparent", border: `1px solid ${copiedIdx === i ? "#00C8A0" : ghlPurple + "55"}`, color: copiedIdx === i ? "#fff" : "#C4A0FF", flex: 1, minWidth: 80, fontSize: 12, transition: "all 0.3s" }}>
                {copiedIdx === i ? "✓ Copied" : "Copy link"}
              </button>
              <button onClick={() => downloadPage(page)}
                style={{ ...btn(), background: "transparent", border: "1px solid " + ghlBorder, color: ghlMuted, fontSize: 12 }}>
                ↓
              </button>
            </div>

            {/* URL display */}
            {pageUrls[page.id] && (
              <div style={{ padding: "0 14px 12px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid " + ghlBorder, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: ghlMuted, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pageUrls[page.id]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Images CTA */}
      <div style={{ marginTop: 16, background: `${ghlPurple}11`, border: `1px solid ${ghlPurple}33`, borderRadius: 12, padding: "14px 16px" }}>
        {generatingImages ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#C4A0FF", fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>✦ Generating AI images…</div>
            <div style={{ fontSize: 12, color: ghlMuted, fontFamily: "'DM Sans',sans-serif" }}>{imageProgress || "Reading your page design…"}</div>
            <div style={{ marginTop: 8, height: 3, background: "rgba(107,53,200,0.2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: sfGradient, borderRadius: 2, animation: "ghlProgress 2s ease-in-out infinite" }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#C4A0FF", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>✨ Want real images on your page?</div>
            <div style={{ fontSize: 12, color: ghlMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 10, lineHeight: 1.5 }}>
              I can generate AI images for each placeholder on your page — professional marketing photos that match your brand.
            </div>
            <button onClick={handleAddImages} style={{ ...btn(), background: sfGradient, width: "100%", boxShadow: "0 4px 12px rgba(244,84,122,0.2)" }}>
              ✦ Generate AI images for this page
            </button>
          </div>
        )}
      </div>

      {/* Share with team */}
      <div style={{ marginTop: 10, background: "rgba(255,255,255,0.02)", border: "1px solid " + ghlBorder, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: ghlMuted, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
          📋 <strong style={{ color: ghlText }}>Ready to build?</strong> Copy any page link above and send it to the SaaSy Funnels team — we'll build it in GHL exactly as designed.
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
        border: `2px dashed ${dragging ? ghlPink : "rgba(107,53,200,0.4)"}`,
        borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "center",
        background: dragging ? "rgba(244,84,122,0.06)" : "rgba(107,53,200,0.05)",
        transition: "all 0.15s", marginBottom: 8,
      }}
    >
      <input ref={ref} type="file" accept={accept} multiple={multiple} style={{ display: "none" }}
        onChange={e => handleFiles([...e.target.files])} />
      <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: ghlMuted }}>{label}</div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(196,160,255,0.4)", marginTop: 3 }}>Click or drag & drop</div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function GHLPageBuilder() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [pendingBranding, setPendingBranding] = useState(null); // scraped branding awaiting confirm
  const [showPalettePicker, setShowPalettePicker] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const loadingTimerRef = useRef(null);

  const LOADING_MSGS = [
    "Reading your brief…",
    "Thinking about your audience…",
    "Designing your sections…",
    "Writing your copy…",
    "Applying your branding…",
    "Checking conversion principles…",
    "Crafting the layout…",
    "Building the HTML…",
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

  // ── Core send function ──────────────────────────────────────────────────────
  const send = async (text, files = []) => {
    if (loading) return;

    // Check if this looks like a URL the user wants us to scrape
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

    // Build message content for API
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

    // If looks like URL and conversation is at branding step, try to scrape first
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
          // Show branding confirmation card
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
      } catch (e) {
        // Fall through to normal send if scrape fails
      }
      stopLoadingMsgs();
      setLoading(false);
    }

    // Normal AI send
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
      if (!res.ok) {
        console.error("API error:", res.status, JSON.stringify(data));
        setMessages(prev => [...prev, { role: "assistant", content: `API error ${res.status}: ${data?.error?.message || JSON.stringify(data)}` }]);
        stopLoadingMsgs(); setLoading(false); return;
      }
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

  // ── Branding card handlers ──────────────────────────────────────────────────
  const confirmBranding = () => {
    if (!pendingBranding) return;
    const { colours, fonts, googleFonts, title, url } = pendingBranding;
    const top3Colours = colours?.slice(0, 3).join(", ") || "not found";
    const topFonts = [...(googleFonts || []), ...(fonts || [])].slice(0, 2).join(", ") || "not found";
    const confirmMsg = `Great — I've grabbed your branding from ${title || url}. Colours: ${top3Colours}. Fonts: ${topFonts}. I'll use these for your page design.`;
    setMessages(prev => [...prev, { role: "assistant", content: confirmMsg }]);
    // Inject branding context into conversation
    const brandingContext = `The client's branding has been detected from ${url}. Use these exact details:
Colours found: ${colours?.slice(0, 6).join(", ")}
Google Fonts found: ${googleFonts?.join(", ") || "none"}
Other fonts found: ${fonts?.slice(0, 4).join(", ") || "none"}
Use the most prominent colours as the palette. Pick the most distinctive Google Font as the headline font.`;
    historyRef.current = [...historyRef.current, { role: "assistant", content: brandingContext }];
    setPendingBranding(null);
    // Continue conversation
    setTimeout(() => send("My branding looks correct — please continue to the next question."), 100);
  };

  const tweakBranding = () => {
    setPendingBranding(null);
    setMessages(prev => [...prev, { role: "assistant", content: "No problem — what would you like to change? You can paste specific hex colours, font names, or describe what doesn't look right." }]);
  };

  const wrongBranding = () => {
    setPendingBranding(null);
    setMessages(prev => [...prev, { role: "assistant", content: "Got it — let's try a different approach. Would you like to paste your hex colours directly, upload a screenshot of your site, or let me recommend a palette based on your vibe?" }]);
  };

  const selectPalette = (palette) => {
    setShowPalettePicker(false);
    const msg = `I love the ${palette.name} palette — ${palette.vibe}. Let's use that.`;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    const paletteContext = `The client has chosen the "${palette.name}" colour palette:
Primary: ${palette.primary}
Secondary: ${palette.secondary}
Accent: ${palette.accent}
Background: ${palette.background}
Text: ${palette.text}
Use these exact hex values in the page design.`;
    historyRef.current = [...historyRef.current, { role: "user", content: msg }];
    setTimeout(() => send("Please continue to the next question — I've confirmed my palette choice.", []), 100);
    historyRef.current = [...historyRef.current, { role: "assistant", content: paletteContext }];
  };

  // ── AI image generation ─────────────────────────────────────────────────────
  const addAIImages = async (setProgress, onComplete) => {
    if (!projectData?.pages) { console.error("No project data"); return; }
    const updatedPages = projectData.pages.map(p => ({ ...p }));

    for (let pi = 0; pi < updatedPages.length; pi++) {
      // Extract placeholder labels from current HTML
      const placeholderRegex = /data-label="([^"]+)"/g;
      let match;
      const placeholders = [];
      while ((match = placeholderRegex.exec(updatedPages[pi].html)) !== null) {
        placeholders.push(match[1]);
      }

      if (placeholders.length === 0) {
        setProgress(`Page ${pi + 1}: no image placeholders found, skipping…`);
        continue;
      }

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
            // Replace placeholder in the CURRENT html of this page (not stale closure)
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const placeholderDivRegex = new RegExp(
              `<div class="img-placeholder"[^>]*data-label="${escapedLabel}"[^>]*>[\\s\\S]*?<\\/div>`,
              'i'
            );
            updatedPages[pi].html = updatedPages[pi].html.replace(
              placeholderDivRegex,
              `<img src="${data.url}" alt="${label}" style="width:100%;border-radius:12px;display:block;" />`
            );
          } else {
            console.error("Image gen returned no URL:", data);
          }
        } catch (e) {
          console.error("Image gen failed for:", label, e);
        }
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

  const displayMsgs = messages.map(m => {
    if (m.role !== "assistant") return m;
    return { ...m, content: stripJSON(m.content) };
  });

  return (
    <div style={{ minHeight: "100vh", background: ghlBg, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes ghlBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
        @keyframes ghlFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ghlFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes ghlProgress{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
        textarea:focus{outline:none} textarea{resize:none} input:focus{outline:none}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${ghlPurple};border-radius:2px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
        .ghl-prompt-btn:hover{border-color:${ghlPink}!important;background:rgba(244,84,122,0.08)!important;}
        .ghl-prompt-btn:hover .ghl-arrow{color:${ghlPink}!important;}
      `}</style>

      <TopNav onBack={() => navigate("/")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 0" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30, animation: "ghlFadeIn 0.6s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(244,84,122,0.12)", border: "1px solid rgba(244,84,122,0.3)", color: ghlPink, padding: "6px 16px", borderRadius: 100, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            <span>🎨</span> Page Builder
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 30, fontWeight: 700, color: ghlText, margin: "0 0 8px", lineHeight: 1.15 }}>
            Design your page or funnel
          </h1>
          <p style={{ color: ghlMuted, fontSize: 15, margin: 0, maxWidth: 440, fontFamily: "'DM Sans',sans-serif" }}>
            Answer a few quick questions — I'll design the full page, ready to view, share, and hand off.
          </p>
        </div>

        {/* Main card */}
        <div style={{
          width: "100%", maxWidth: 700,
          background: ghlSurface,
          border: "1px solid " + ghlBorder,
          borderRadius: 16, overflow: "hidden",
          display: "flex", flexDirection: "column",
          height: started ? "calc(100vh - 240px)" : "auto",
          minHeight: started ? 400 : "auto",
          animation: "ghlFadeIn 0.5s ease",
          boxShadow: "0 8px 40px rgba(107,53,200,0.15)",
        }}>

          {/* ── Not started: prompt picker ── */}
          {!started ? (
            <div style={{ padding: "32px 28px 28px" }}>
              <p style={{ color: ghlMuted, fontSize: 14.5, marginTop: 0, marginBottom: 20, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
                What do you want to design? Pick a common type or describe it yourself:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => start(p)} className="ghl-prompt-btn" style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid " + ghlBorder,
                    borderRadius: 10, padding: "12px 16px", textAlign: "left", cursor: "pointer",
                    fontSize: 14, color: ghlText, fontFamily: "'DM Sans',sans-serif",
                    lineHeight: 1.4, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                  }}>
                    <span className="ghl-arrow" style={{ color: ghlPurple, fontSize: 15 }}>→</span> {p}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) start(input.trim()); } }}
                  placeholder="Or describe what you want to design…" rows={2}
                  style={{ flex: 1, border: "1px solid " + ghlBorder, borderRadius: 10, padding: "12px 14px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "rgba(255,255,255,0.04)", color: ghlText, lineHeight: 1.5 }} />
                <button onClick={() => input.trim() && start(input.trim())} style={{ ...btn(), background: sfGradient, padding: "12px 18px", fontSize: 18, boxShadow: "0 4px 12px rgba(244,84,122,0.3)" }}>→</button>
              </div>
            </div>

          ) : projectData ? (
            /* ── Output panel + continue conversation ── */
            <>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <PageOutput projectData={projectData} onAddImages={addAIImages} />
                {/* Continue conversation */}
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{ borderTop: "1px solid " + ghlBorder, paddingTop: 14, marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: ghlMuted, fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}>
                      Want changes? Tell me what to adjust and I'll redesign.
                    </div>
                    {displayMsgs.slice(-3).map((m, i) => m.role === "assistant" ? null : null)}
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !loading) { const t = input.trim(); setInput(""); send(t, []); } } }}
                        placeholder="e.g. Make the hero darker, add more testimonials, change the font…" rows={2}
                        style={{ flex: 1, border: "1px solid " + ghlBorder, borderRadius: 10, padding: "11px 14px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: "rgba(255,255,255,0.04)", color: ghlText, lineHeight: 1.5, opacity: loading ? 0.5 : 1 }} />
                      <button onClick={() => { if (!input.trim() || loading) return; const t = input.trim(); setInput(""); setProjectData(null); send(t, []); }}
                        disabled={loading || !input.trim()}
                        style={{ ...btn(), background: loading || !input.trim() ? "rgba(107,53,200,0.3)" : sfGradient, padding: "12px 18px", fontSize: 18 }}>→</button>
                    </div>
                  </div>
                </div>
              </div>
            </>

          ) : (
            /* ── Conversation ── */
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 12px" }}>
                {displayMsgs.map((m, i) => (
                  <div key={i}>
                    <Bubble msg={m} />
                    {m.role === "assistant" && i === displayMsgs.length - 1 && !loading && !pendingBranding && !showPalettePicker && (
                      <QuickChips text={messages[i]?.content || ""} onSelect={t => { setInput(""); send(t, []); }} />
                    )}
                    {m.files?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, justifyContent: "flex-end" }}>
                        {m.files.map((f, fi) => (
                          <div key={fi} style={{ background: "rgba(107,53,200,0.1)", border: "1px solid rgba(107,53,200,0.3)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#C4A0FF", fontFamily: "'DM Sans',sans-serif" }}>
                            📎 {f.name}
                          </div>
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

                {/* Branding confirmation card */}
                {pendingBranding && !loading && (
                  <BrandingCard
                    branding={pendingBranding}
                    onConfirm={confirmBranding}
                    onTweak={tweakBranding}
                    onWrong={wrongBranding}
                  />
                )}

                {/* Palette picker */}
                {showPalettePicker && !loading && (
                  <PalettePicker onSelect={selectPalette} />
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              {!projectData && (
                <div style={{ padding: "8px 16px 12px", borderTop: "1px solid " + ghlBorder, background: ghlSurface }}>
                  {showUploadPanel && (
                    <div style={{ marginBottom: 10, background: "rgba(107,53,200,0.08)", border: "1px solid rgba(107,53,200,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#C4A0FF", marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Attach files to your message</div>
                      <FileUploadArea
                        label="Upload images, screenshots, or style guide PDFs"
                        accept="image/*,application/pdf"
                        multiple={true}
                        onFiles={files => { setPendingFiles(prev => [...prev, ...files]); setShowUploadPanel(false); }}
                      />
                    </div>
                  )}
                  {pendingFiles.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {pendingFiles.map((f, i) => (
                        <div key={i} style={{ background: "rgba(107,53,200,0.1)", border: "1px solid rgba(107,53,200,0.3)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#C4A0FF", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                          📎 {f.name}
                          <button onClick={() => setPendingFiles(prev => prev.filter((_, pi) => pi !== i))} style={{ border: "none", background: "none", cursor: "pointer", color: ghlMuted, fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <button onClick={() => setShowUploadPanel(p => !p)}
                      style={{ ...btn(), background: "transparent", color: ghlMuted, border: "1px solid " + ghlBorder, padding: "11px 14px", fontSize: 16, flexShrink: 0 }} title="Attach files">📎</button>
                    <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!input.trim() && !pendingFiles.length || loading) return; send(input.trim(), pendingFiles); } }}
                      placeholder="Type your answer…" rows={2} disabled={loading}
                      style={{ flex: 1, border: "1px solid " + ghlBorder, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "rgba(255,255,255,0.04)", color: ghlText, lineHeight: 1.5, opacity: loading ? 0.5 : 1 }} />
                    <button
                      onClick={() => { if ((!input.trim() && !pendingFiles.length) || loading) return; send(input.trim(), pendingFiles); }}
                      disabled={loading || (!input.trim() && !pendingFiles.length)}
                      style={{ ...btn(), background: loading || (!input.trim() && !pendingFiles.length) ? "rgba(107,53,200,0.3)" : sfGradient, padding: "12px 18px", fontSize: 18, cursor: loading || (!input.trim() && !pendingFiles.length) ? "not-allowed" : "pointer" }}>→</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {started && (
          <button onClick={reset} style={{ ...btn(), background: "transparent", color: ghlMuted, border: "1px solid " + ghlBorder, marginTop: 12, marginBottom: 20, fontSize: 12 }}>
            ← Start over
          </button>
        )}

        <p style={{ fontSize: 11.5, color: "rgba(196,160,255,0.3)", marginTop: 8, marginBottom: 20, textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>
          Powered by Claude · Built for GHL users · SaaSy Funnels
        </p>
      </div>
    </div>
  );
}
