import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Builder from './pages/Builder.jsx'
import Copilot from './pages/Copilot.jsx'
import Companion from './pages/Companion.jsx'
import SettingsPage from './pages/Settings.jsx'
import Deploy from './pages/Deploy.jsx'
import InfoPage from './pages/Info.jsx'

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
        <Route path="/settings"    element={<SettingsPage />} />
        <Route path="/deploy"      element={<Deploy />} />
        <Route path="/privacy"     element={<InfoPage />} />
        <Route path="/terms"       element={<InfoPage />} />
        <Route path="/changelog"   element={<InfoPage />} />
        {/* Catch-all: Redirect to Landing, but could be used for 404 in the future */}
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
