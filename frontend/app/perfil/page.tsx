// página de perfil do usuário com estatísticas

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Heart, Film, Tv } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../lib/api'

export default function Perfil() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, filmes: 0, series: 0 })
  const [recentFavorites, setRecentFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const TMDB_POSTER = 'https://image.tmdb.org/t/p/w500'

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/login'); return }
    setUser(JSON.parse(stored))
    load()
  }, [])

  async function load() {
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        api.get('/favorites?media_type=movie'),
        api.get('/favorites?media_type=tv'),
      ])
      const filmes = moviesRes.data.length
      const series = seriesRes.data.length
      setStats({ total: filmes + series, filmes, series })
      setRecentFavorites([...moviesRes.data, ...seriesRes.data]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
      )
    } catch {} finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar />

      <div style={{ padding: '40px 32px', maxWidth: 800, margin: '0 auto' }}>

        {/* header do perfil */}
        <div style={{ background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 12, padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#b8070f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{user.name}</h1>
                <p style={{ fontSize: 14, color: '#666' }}>{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, padding: '8px 16px', color: '#888', fontSize: 13, cursor: 'pointer' }}
            >
              <LogOut size={14} /> sair
            </button>
          </div>
        </div>

        {/* estatísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: <Heart size={20} color="#e50914" />, num: stats.total, label: 'total de favoritos' },
            { icon: <Film size={20} color="#378add" />, num: stats.filmes, label: 'filmes salvos' },
            { icon: <Tv size={20} color="#1d9e75" />, num: stats.series, label: 'séries salvas' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* favoritos recentes */}
        <div style={{ background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 12, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>adicionados recentemente</h2>
            <span onClick={() => router.push('/favoritos')} style={{ fontSize: 13, color: '#e50914', cursor: 'pointer' }}>ver todos →</span>
          </div>

          {loading ? (
            <div style={{ color: '#666', fontSize: 14 }}>carregando...</div>
          ) : recentFavorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#666', fontSize: 14 }}>
              nenhum favorito ainda —{' '}
              <span onClick={() => router.push('/')} style={{ color: '#e50914', cursor: 'pointer' }}>descobrir filmes</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentFavorites.map(fav => (
                <div
                  key={fav.id}
                  onClick={() => router.push(`/filme/${fav.tmdb_id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: '#13131f', borderRadius: 8, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1a2e')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#13131f')}
                >
                  <div style={{
                    width: 40,
                    height: 56,
                    borderRadius: 4,
                    flexShrink: 0,
                    background: fav.poster_path ? `url(${TMDB_POSTER}${fav.poster_path}) center/cover` : 'linear-gradient(135deg,#1a2a4a,#0d1a30)',
                    border: '1px solid #2a2a3e',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fav.title}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{fav.media_type === 'movie' ? 'filme' : 'série'}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f5c518', flexShrink: 0 }}>
                    ★ {Number(fav.vote_average).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}