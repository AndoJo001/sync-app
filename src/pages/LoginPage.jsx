import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import logoImg from "../assets/logo_recadre.png"

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
  <div className="min-h-screen bg-indigo-deep flex justify-center items-center px-4">
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="text-center mb-6">
        {/* <h1 className="text-lavender text-3xl font-bold tracking-tight">Sync</h1> */}
        <img src={logoImg} className="w-40 mx-auto" />
        <p className="text-violet-soft text-sm mt-1">Connecte-toi à ton espace</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 py-2 px-3 rounded-lg">{error}</p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="py-2.5 px-3.5 rounded-xl border border-periwinkle text-sm outline-none bg-lavender focus:border-violet-cta transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-violet-cta text-white text-sm font-medium cursor-pointer mt-1"
          >
            Se connecter
          </button>
        </form>

        <p className="text-xs text-violet-soft mt-4 text-center">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-violet-cta font-medium">S'inscrire</Link>
        </p>
      </div>

    </div>
  </div>
)
}