import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function JoinSpaceModal({ onClose, onJoined }) {
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)

  async function handleJoin(e) {
    e.preventDefault()
    setError(null)

    const { data: space, error: findError } = await supabase
      .from('spaces')
      .select('id')
      .eq('access_code', code.toUpperCase())
      .single()

    if (findError || !space) { setError('Code invalide'); return }

    const { error: joinError } = await supabase
      .from('space_members')
      .insert({ space_id: space.id, user_id: user.id })

    if (joinError) { setError('Tu es déjà membre de cet espace'); return }

    onJoined()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(54,59,108,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#eaedfe', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ color: '#363b6c', fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>Rejoindre un espace</h3>

        {error && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Code d'accès (ex: AB12CD)"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #c6c9e7', fontSize: '14px', outline: 'none', background: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#363b6c', border: '1px solid #c6c9e7', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#7c75d8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
              Rejoindre
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}