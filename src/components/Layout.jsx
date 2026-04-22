import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Layout({ children, showBack = false, title = 'Sync', subtitle = null }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-indigo-deep px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {showBack && (
            <>
              <button
                onClick={() => navigate('/')}
                className="text-periwinkle text-sm cursor-pointer hover:text-lavender transition-colors"
              >
                ← Espaces
              </button>
              <span className="text-periwinkle/30">|</span>
            </>
          )}
          <div>
            <h1 className="text-lavender font-semibold text-base leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-violet-soft text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="text-violet-soft text-xs hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-periwinkle border border-violet-soft/30 rounded-lg cursor-pointer hover:text-lavender transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}