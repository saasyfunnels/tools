import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const tools = [
  {
    id: 'ghl-page-builder',
    platform: 'GHL',
    name: 'Page Builder',
    tagline: 'Design any page or funnel from scratch — or populate a template with your content.',
    icon: '🎨',
    accent: '#F4547A',
    accentSoft: 'rgba(244,84,122,0.12)',
    accentBorder: 'rgba(244,84,122,0.25)',
    chips: ['Opt-in pages', 'Sales pages', 'Webinar funnels', 'Template population'],
    path: '/ghl-page-builder',
    status: 'live',
  },
  {
    id: 'kajabi-page-builder',
    platform: 'Kajabi',
    name: 'Page Builder',
    tagline: 'Design any Kajabi landing page or funnel — or map your content into a purchased template.',
    icon: '🎨',
    accent: '#6B35C8',
    accentSoft: 'rgba(107,53,200,0.12)',
    accentBorder: 'rgba(107,53,200,0.25)',
    chips: ['Opt-in pages', 'Sales pages', 'Webinar funnels', 'Template population'],
    path: '/kajabi-page-builder',
    status: 'live',
  },
  {
    id: 'ghl-workflow-builder',
    platform: 'GHL',
    name: 'Workflow Builder',
    tagline: 'Plan your GHL automation workflows through conversation — get a visual brief to hand off.',
    icon: '⚡',
    accent: '#FF6B2B',
    accentSoft: 'rgba(255,107,43,0.12)',
    accentBorder: 'rgba(255,107,43,0.25)',
    chips: ['Email sequences', 'Lead nurture', 'Sales workflows', 'Onboarding flows'],
    path: '/ghl-workflow-builder',
    status: 'live',
  },
  {
    id: 'kajabi-automation-builder',
    platform: 'Kajabi',
    name: 'Automation Builder',
    tagline: 'Map out your Kajabi automations through conversation — get a clear build brief for your team.',
    icon: '⚡',
    accent: '#00C8A0',
    accentSoft: 'rgba(0,200,160,0.12)',
    accentBorder: 'rgba(0,200,160,0.25)',
    chips: ['Sequences', 'Pipelines', 'Course automations', 'Membership flows'],
    path: '/kajabi-automation-builder',
    status: 'live',
  },
  {
    id: 'ghl-funnel-planner',
    platform: 'GHL',
    name: 'Funnel Planner',
    tagline: 'Plan your complete GHL sales funnel strategy through conversation — every stage mapped out.',
    icon: '🗺',
    accent: '#3B82F6',
    accentSoft: 'rgba(59,130,246,0.12)',
    accentBorder: 'rgba(59,130,246,0.25)',
    chips: ['Funnel strategy', 'Email sequences', 'Offer mapping', 'Full funnel view'],
    path: '/ghl-funnel-planner',
    status: 'live',
  },
  {
    id: 'kajabi-funnel-planner',
    platform: 'Kajabi',
    name: 'Funnel Planner',
    tagline: 'Plan your complete Kajabi funnel strategy — from freebie to offer, every step mapped out.',
    icon: '🗺',
    accent: '#A855F7',
    accentSoft: 'rgba(168,85,247,0.12)',
    accentBorder: 'rgba(168,85,247,0.25)',
    chips: ['Funnel strategy', 'Kajabi pipelines', 'Offer mapping', 'Full funnel view'],
    path: '/kajabi-funnel-planner',
    status: 'live',
  },
  {
    id: 'ghl-site-builder',
    platform: 'GHL',
    name: 'Site Builder',
    tagline: 'Design a complete GHL website — homepage, about, services, and more — in one conversation.',
    icon: '🌐',
    accent: '#F59E0B',
    accentSoft: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.25)',
    chips: ['Homepage', 'About page', 'Services', 'Contact'],
    path: '/ghl-site-builder',
    status: 'coming-soon',
  },
  {
    id: 'kajabi-site-builder',
    platform: 'Kajabi',
    name: 'Site Builder',
    tagline: 'Design your full Kajabi website — every page planned and briefed in a single session.',
    icon: '🌐',
    accent: '#EC4899',
    accentSoft: 'rgba(236,72,153,0.12)',
    accentBorder: 'rgba(236,72,153,0.25)',
    chips: ['Homepage', 'About page', 'Coaching page', 'Blog'],
    path: '/kajabi-site-builder',
    status: 'coming-soon',
  },
]

const platformColour = { GHL: '#FF6B2B', Kajabi: '#6B35C8' }
const platformBg = { GHL: 'rgba(255,107,43,0.12)', Kajabi: 'rgba(107,53,200,0.12)' }
const platformBorder = { GHL: 'rgba(255,107,43,0.3)', Kajabi: 'rgba(107,53,200,0.3)' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? tools : tools.filter(t => t.platform === filter)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      fontFamily: "'DM Sans', sans-serif",
      color: '#0A0A0A',
    }}>

      {/* Ambient background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(244,84,122,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(107,53,200,0.05) 0%, transparent 60%)',
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,250,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: '0 32px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #F4547A, #6B35C8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>SF</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#0A0A0A', lineHeight: 1.1 }}>SaaSy Funnels</div>
            <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Design & Construct</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>
          Powered by Claude
        </div>
      </nav>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '64px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56, animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(244,84,122,0.1)', border: '1px solid rgba(244,84,122,0.25)',
            color: '#F4547A', borderRadius: 100, padding: '5px 16px',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            ✦ Design & Construct Dashboard
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 54px)',
            fontWeight: 900, lineHeight: 1.05,
            color: '#0A0A0A',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            Think it.<br />
            Brief it.<br />
            <span style={{ background: 'linear-gradient(135deg, #F4547A, #6B35C8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Build it.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, maxWidth: 480 }}>
            AI-powered planning tools for GHL and Kajabi. Have a conversation, get a buildable brief — ready to hand off to your team.
          </p>
        </div>

        {/* Platform filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {['All', 'GHL', 'Kajabi'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 100,
              border: filter === f ? 'none' : '1px solid rgba(0,0,0,0.12)',
              background: filter === f ? 'linear-gradient(135deg, #F4547A, #6B35C8)' : 'rgba(0,0,0,0.04)',
              color: filter === f ? '#fff' : 'rgba(0,0,0,0.5)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Tool grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {filtered.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} onClick={() => tool.status === 'live' && navigate(tool.path)} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16,
            padding: '14px 28px',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 100,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C8A0', boxShadow: '0 0 8px #00C8A0' }} />
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>
              6 tools live · 2 coming soon
            </span>
          </div>
        </div>

      </main>
    </div>
  )
}

function ToolCard({ tool, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isComingSoon = tool.status === 'coming-soon'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && !isComingSoon ? '#FFFFFF' : '#F5F5F5',
        border: `1px solid ${hovered && !isComingSoon ? tool.accentBorder : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18,
        padding: '28px 24px 24px',
        cursor: isComingSoon ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered && !isComingSoon ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered && !isComingSoon ? `0 12px 40px ${tool.accentSoft}` : '0 2px 8px rgba(0,0,0,0.08)',
        opacity: isComingSoon ? 0.55 : 1,
        animation: `fadeUp 0.5s ${index * 0.07}s ease both`,
        display: 'flex', flexDirection: 'column', gap: 0,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Platform badge */}
          <div style={{
            background: platformBg[tool.platform],
            border: `1px solid ${platformBorder[tool.platform]}`,
            color: platformColour[tool.platform],
            borderRadius: 6, padding: '3px 10px',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {tool.platform}
          </div>
          {isComingSoon && (
            <div style={{
              background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)',
              color: 'rgba(0,0,0,0.35)', borderRadius: 6, padding: '3px 10px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Coming soon
            </div>
          )}
        </div>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: tool.accentSoft,
          border: `1px solid ${tool.accentBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
          transition: 'transform 0.2s',
          transform: hovered && !isComingSoon ? 'scale(1.08)' : 'scale(1)',
        }}>
          {tool.icon}
        </div>
      </div>

      {/* Name */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22, fontWeight: 700, color: '#0A0A0A',
        marginBottom: 8, lineHeight: 1.1,
      }}>
        {tool.name}
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 13.5, color: 'rgba(0,0,0,0.5)',
        lineHeight: 1.65, marginBottom: 20, flex: 1,
      }}>
        {tool.tagline}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
        {tool.chips.map(chip => (
          <div key={chip} style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 11, color: 'rgba(0,0,0,0.45)', fontWeight: 500,
          }}>
            {chip}
          </div>
        ))}
      </div>

      {/* CTA */}
      {!isComingSoon && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: hovered ? tool.accent : 'rgba(0,0,0,0.35)',
            transition: 'color 0.2s',
          }}>
            Open tool
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: hovered ? tool.accentSoft : 'rgba(0,0,0,0.04)',
            border: `1px solid ${hovered ? tool.accentBorder : 'rgba(0,0,0,0.08)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: hovered ? tool.accent : 'rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
            transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          }}>
            →
          </div>
        </div>
      )}
    </div>
  )
}
