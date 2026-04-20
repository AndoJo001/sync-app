import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function CreateSpaceModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    const code = generateCode()

    const { data, error: spaceError } = await supabase
      .from('spaces')
      .insert({ name, access_code: code, owner_id: user.id })
      .select()
      .single()

    if (spaceError) { setError(spaceError.message); return }

    await supabase
      .from('space_members')
      .insert({ space_id: data.id, user_id: user.id })

    onCreated()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(54,59,108,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#eaedfe', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ color: '#363b6c', fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>Créer un espace</h3>

        {error && <p style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nom de l'espace"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #c6c9e7', fontSize: '14px', outline: 'none', background: '#fff' }}
          />
          <p style={{ fontSize: '12px', color: '#a8a3e3' }}>Un code d'accès unique sera généré automatiquement</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#363b6c', border: '1px solid #c6c9e7', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#7c75d8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}