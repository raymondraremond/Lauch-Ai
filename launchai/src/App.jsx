import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AuthCallbackPage from './pages/AuthCallbackPage.jsx'

const Auth = lazy(() => import('./pages/Auth.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Builder = lazy(() => import('./pages/Builder.jsx'))
const Copilot = lazy(() => import('./pages/Copilot.jsx'))
const Companion = lazy(() => import('./pages/Companion.jsx'))
const SettingsPage = lazy(() => import('./pages/Settings.jsx'))
const Deploy = lazy(() => import('./pages/Deploy.jsx'))
const InfoPage = lazy(() => import('./pages/Info.jsx'))
const CritiquePage = lazy(() => import('./pages/CritiquePage.jsx'))
const LiveApp = lazy(() => import('./pages/LiveApp.jsx'))

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // During OAuth callbacks, the hash contains tokens that Supabase is processing.
  // Never redirect to /auth while this is happening — the user IS authenticating.
  const isOAuthCallback = window.location.hash.includes('access_token=')

  if (loading || (isOAuthCallback && !user)) return <PageLoader />

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

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
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"            element={<Landing />} />
            <Route path="/auth"        element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Public/Hybrid Routes */}
            <Route path="/onboarding"  element={<Onboarding />} />
            <Route path="/privacy"     element={<InfoPage />} />
            <Route path="/terms"       element={<InfoPage />} />
            <Route path="/changelog"   element={<InfoPage />} />
            <Route path="/critique"    element={<CritiquePage />} />
            <Route path="/p/:id"       element={<LiveApp />} />

            {/* Private Routes */}
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder"     element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/copilot"     element={<ProtectedRoute><Copilot /></ProtectedRoute>} />
            <Route path="/companion"   element={<ProtectedRoute><Companion /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/deploy"      element={<ProtectedRoute><Deploy /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
