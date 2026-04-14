// página de favoritos do usuário

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../lib/api'

const TMDB_POSTER = 'https://image.tmdb.org/t/p/w500'

export default function Favoritos() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'filmes' | 'series'>('filmes')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    load()
  }, [tab])

  async function load() {
    setLoading(true)
    try {
      const [favRes, recRes] = await Promise.all([
        api.get(`/favorites?media_type=${tab === 'filmes' ? 'movie' : 'tv'}`),
        api.get(`/favorites/recommendations?media_type=${tab === 'filmes' ? 'movie' : 'tv'}`),
      ])
      setFavorites(favRes.data)
      setRecommendations(recRes.data.results?.slice(0, 5) || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  async function handleRemove(id: number) {
    try {
      await api.delete(`/favorites/${id}`)
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar />

      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>meus favoritos</h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>filmes e séries que você salvou</p>

        {/* tabs filmes / séries */}
        <div style={{ display: 'flex', background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 32 }}>
          {(['filmes', 'series'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: tab === t ? '#1e1e2e' : 'transparent', color: tab === t ? '#fff' : '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: '#666', fontSize: 14 }}>carregando...</div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
            <p style={{ color: '#666', fontSize: 15 }}>nenhum favorito ainda</p>
            <button
              onClick={() => router.push('/')}
              style={{ marginTop: 16, background: '#e50914', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >descobrir filmes</button>
          </div>
        ) : (
          <>
            {/* grid de favoritos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 48 }}>
              {favorites.map(fav => (
                <div key={fav.id} style={{ position: 'relative', cursor: 'pointer' }}>
                  <div
                    onClick={() => router.push(`/filme/${fav.tmdb_id}`)}
                    style={{
                      height: 220,
                      borderRadius: 8,
                      background: fav.poster_path ? `url(${TMDB_POSTER}${fav.poster_path}) center/cover` : 'linear-gradient(135deg,#1a2a4a,#0d1a30)',
                      border: '1px solid #2a2a3e',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.7) 0%,transparent 50%)' }} />
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.7)', border: '1px solid #333', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: '#f5c518' }}>
                      ★ {Number(fav.vote_average).toFixed(1)}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(fav.id) }}
                      style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.7)', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} color="#e50914" />
                    </button>
                  </div>
                  <div style={{ padding: '8px 2px 0' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fav.title}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* recomendações baseadas nos favoritos */}
            {recommendations.length > 0 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>recomendados pra você</h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>baseado nos seus gêneros favoritos</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
                  {recommendations.map((m: any) => (
                    <div
                      key={m.id}
                      onClick={() => router.push(`/filme/${m.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{
                        height: 200,
                        borderRadius: 8,
                        background: m.poster_path ? `url(${TMDB_POSTER}${m.poster_path}) center/cover` : 'linear-gradient(135deg,#1a2a4a,#0d1a30)',
                        border: '1px solid #2a2a3e',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.7)', border: '1px solid #333', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: '#f5c518' }}>
                          ★ {Number(m.vote_average).toFixed(1)}
                        </div>
                      </div>
                      <div style={{ padding: '8px 2px 0', fontSize: 13, fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.title || m.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}