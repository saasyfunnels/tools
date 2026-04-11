import { useNavigate } from 'react-router-dom'

export default function GHLWorkflowBuilder() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#0D0D0D', fontFamily:"'DM Sans',sans-serif", color:'#F0EAF8' }}>
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(13,13,13,0.95)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(107,53,200,0.2)',
        padding:'0 24px', height:56,
        display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('/')} style={{
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:8, padding:'6px 12px', color:'rgba(240,234,248,0.5)',
            fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            marginRight:4,
          }}>← Dashboard</button>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#F4547A,#6B35C8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>SF</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#F0EAF8' }}>SaaSy Funnels</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'4px 6px', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding:'5px 14px', borderRadius:6, fontSize:13, fontWeight:600, color:'rgba(240,234,248,0.45)' }}>Kajabi</div>
          <div style={{ padding:'5px 14px', borderRadius:6, fontSize:13, fontWeight:600, background:'linear-gradient(135deg,#F4547A,#6B35C8)', color:'#fff' }}>GHL</div>
        </div>
      </nav>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 56px)', flexDirection:'column', gap:16, padding:24 }}>
        <div style={{ fontSize:40 }}>⚡</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#F0EAF8' }}>GHL Workflow Builder</div>
        <div style={{ fontSize:14, color:'rgba(240,234,248,0.45)', textAlign:'center', maxWidth:400, lineHeight:1.6 }}>
          This tool is being migrated to Vercel. It will be live here shortly.
        </div>
        <button onClick={() => navigate('/')} style={{
          marginTop:16, background:'linear-gradient(135deg,#F4547A,#6B35C8)',
          color:'#fff', border:'none', borderRadius:10, padding:'12px 28px',
          fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
        }}>← Back to Dashboard</button>
      </div>
    </div>
  )
}
