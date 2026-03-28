import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Builder from './pages/Builder.jsx'
import Copilot from './pages/Copilot.jsx'
import Companion from './pages/Companion.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/onboarding"  element={<Onboarding />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/builder"     element={<Builder />} />
        <Route path="/copilot"     element={<Copilot />} />
        <Route path="/companion"   element={<Companion />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
