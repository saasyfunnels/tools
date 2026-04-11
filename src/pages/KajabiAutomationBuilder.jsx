import { useNavigate } from 'react-router-dom'

export default function KajabiAutomationBuilder() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', fontFamily:"'DM Sans',sans-serif", color:'#0A0A0A' }}>
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(255,255,255,0.97)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid #E5E7EB',
        padding:'0 24px', height:56,
        display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('/')} style={{
            background:'#F9FAFB', border:'1px solid #E5E7EB',
            borderRadius:8, padding:'6px 12px', color:'#6B7280',
            fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            marginRight:4,
          }}>← Dashboard</button>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#F4547A,#6B35C8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>SF</div>
          <span style={{ fontSize:16, fontWeight:700, color:'#0A0A0A' }}>SaaSy Funnels</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:2, background:'#F3F4F6', borderRadius:8, padding:'4px 6px', border:'1px solid #E5E7EB' }}>
          <div style={{ padding:'5px 14px', borderRadius:6, fontSize:13, fontWeight:600, background:'#fff', color:'#0A0A0A', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>Kajabi</div>
          <div style={{ padding:'5px 14px', borderRadius:6, fontSize:13, fontWeight:600, color:'#6B7280' }}>GHL</div>
        </div>
      </nav>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 56px)', flexDirection:'column', gap:16, padding:24 }}>
        <div style={{ fontSize:40 }}>⚡</div>
        <div style={{ fontSize:28, fontWeight:700, color:'#0A0A0A' }}>Kajabi Automation Builder</div>
        <div style={{ fontSize:14, color:'#6B7280', textAlign:'center', maxWidth:400, lineHeight:1.6 }}>
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
