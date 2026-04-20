import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-indigo-deep flex justify-center items-center'>
      <div className='w-full max-w-100 bg-lavender rounded-2xl p-8'>
        <h1 className='text-indigo-deep text-2xl font-semibold mb-1'>Sync</h1>
        <p className='text-violet-cta text-sm mb-6'>Connecte-toi à ton espace</p>

        {error && (
          <p className='text-[#e53e3e] text-[13px] mb-4 bg-[#fff5f5] py-2 px-3 rounded-lg'>
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className='py-2.5 px-3.5 rounded-lg border border-periwinkle text-sm outline-none bg-white' 
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className='py-2.5 px-3.5 rounded-lg border border-periwinkle text-sm outline-none bg-white' 
          />
          <button
            type="submit"
            className='p-2.5 rounded-lg bg-violet-cta text-white text-sm font-medium cursor-pointer'
          >
            Se connecter
          </button>
        </form>

        <p className='text-sm text-indigo-deep mt-4 text-center'>
          Pas encore de compte ?{' '}
          <Link to="/register" className='text-violet-cta font-medium'>S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}