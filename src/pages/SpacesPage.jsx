import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CreateSpaceModal from '../components/CreateSpaceModal'
import JoinSpaceModal from '../components/JoinSpaceModal'

export default function SpacesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  async function fetchSpaces() {
    const { data } = await supabase
      .from('space_members')
      .select('space_id, spaces(id, name, owner_id)')
      .eq('user_id', user.id)
    if (data) setSpaces(data.map(d => d.spaces))
  }

  useEffect(() => {
    fetchSpaces()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eaedfe' }}>
      <header style={{ background: '#363b6c', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#eaedfe', fontSize: '20px', fontWeight: '600' }}>Sync</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#a8a3e3', fontSize: '13px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', background: 'transparent', color: '#c6c9e7', border: '1px solid #a8a3e3', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#363b6c', fontSize: '18px', fontWeight: '600' }}>Mes espaces</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowJoin(true)} style={{ padding: '8px 14px', background: 'transparent', color: '#7c75d8', border: '1px solid #7c75d8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              Rejoindre
            </button>
            <button onClick={() => setShowCreate(true)} style={{ padding: '8px 14px', background: '#7c75d8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              Créer un espace
            </button>
          </div>
        </div>

        {spaces.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#a8a3e3' }}>
            <p style={{ fontSize: '15px' }}>Aucun espace pour l'instant</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Crée un espace ou rejoins-en un avec un code</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {spaces.map(space => (
              <div
                key={space.id}
                onClick={() => navigate(`/space/${space.id}`)}
                style={{ background: '#fff', border: '1px solid #c6c9e7', borderRadius: '12px', padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <p style={{ color: '#363b6c', fontWeight: '500', fontSize: '15px' }}>{space.name}</p>
                  <p style={{ color: '#a8a3e3', fontSize: '12px', marginTop: '4px' }}>
                    {space.owner_id === user.id ? 'Administrateur' : 'Membre'}
                  </p>
                </div>
                <span style={{ color: '#7c75d8', fontSize: '18px' }}>→</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateSpaceModal onClose={() => setShowCreate(false)} onCreated={fetchSpaces} />}
      {showJoin && <JoinSpaceModal onClose={() => setShowJoin(false)} onJoined={fetchSpaces} />}
    </div>
  )
}