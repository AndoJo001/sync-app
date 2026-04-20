import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className='p-8 bg-indigo-deep'>
      <p>Connecté en tant que : {user?.email}</p>
      <button onClick={handleLogout} className='pt-4 py-2 px-4 bg-violet-cta text-white rounded-xl cursor-pointer'>
        Se déconnecter
      </button>
    </div>
  )
}