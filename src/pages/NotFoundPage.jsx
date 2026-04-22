import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-indigo-deep flex flex-col items-center justify-center px-4">
      <h1 className="text-lavender text-6xl font-bold tracking-tight">404</h1>
      <p className="text-violet-soft text-sm mt-3 mb-8">Cette page n'existe pas</p>
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 bg-violet-cta text-white rounded-xl text-sm cursor-pointer"
      >
        Retour à l'accueil
      </button>
    </div>
  )
}