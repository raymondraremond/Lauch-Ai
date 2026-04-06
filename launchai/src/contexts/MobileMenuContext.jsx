import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const MobileMenuContext = createContext()

export function MobileMenuProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  // Automatically close sidebar when navigating to a new page
  useEffect(() => {
    closeSidebar()
  }, [location.pathname])

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isSidebarOpen])

  return (
    <MobileMenuContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext)
  if (!context) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider')
  }
  return context
}
