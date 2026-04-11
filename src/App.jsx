import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import GHLPageBuilder from './pages/GHLPageBuilder.jsx'
import KajabiPageBuilder from './pages/KajabiPageBuilder.jsx'
import GHLWorkflowBuilder from './pages/GHLWorkflowBuilder.jsx'
import KajabiAutomationBuilder from './pages/KajabiAutomationBuilder.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/ghl-page-builder" element={<GHLPageBuilder />} />
      <Route path="/kajabi-page-builder" element={<KajabiPageBuilder />} />
      <Route path="/ghl-workflow-builder" element={<GHLWorkflowBuilder />} />
      <Route path="/kajabi-automation-builder" element={<KajabiAutomationBuilder />} />
    </Routes>
  )
}
