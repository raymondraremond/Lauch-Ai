import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'

const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Builder = lazy(() => import('./pages/Builder.jsx'))
const Copilot = lazy(() => import('./pages/Copilot.jsx'))
const Companion = lazy(() => import('./pages/Companion.jsx'))
const SettingsPage = lazy(() => import('./pages/Settings.jsx'))
const Deploy = lazy(() => import('./pages/Deploy.jsx'))
const InfoPage = lazy(() => import('./pages/Info.jsx'))
const CritiquePage = lazy(() => import('./pages/CritiquePage.jsx'))

// Premium loading fallback for lazy-loaded routes
function PageLoader() {
  return (
    <div className="fixed inset-0 min-h-screen bg-void flex flex-col items-center justify-center font-body relative overflow-hidden z-50">
      <div className="grain-overlay"></div>
      <div className="mesh-glow opacity-30"></div>
      
      <div className="flex flex-col items-center gap-6 relative z-10 w-full animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-[6px] h-[6px] bg-accent rounded-[1px] animate-pulse"></div>
          <span className="font-display font-semibold text-[16px] text-primary tracking-wide">LaunchAI</span>
        </div>
        
        {/* Sleek progress bar container */}
        <div className="w-[120px] h-[2px] bg-dim rounded-full overflow-hidden">
          {/* Animated fill */}
          <div className="h-full bg-accent relative rounded-full w-full origin-left animate-[shimmer_1.5s_infinite_ease-in-out]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"></div>
          </div>
        </div>
        
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary mt-2 animate-pulse-dot">
          Loading Environment
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/critique"    element={<CritiquePage />} />
          {/* Catch-all: Redirect to Landing, but could be used for 404 in the future */}
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
