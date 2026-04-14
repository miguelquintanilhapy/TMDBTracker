// página de detalhes do filme

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ArrowLeft, Star } from 'lucide-react'
import Navbar from '../../components/Navbar'
import MovieCard from '../../components/MovieCard'
import api, { Movie } from '../../lib/api'

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/original'
const TMDB_POSTER = 'https://image.tmdb.org/t/p/w500'

export default function FilmePage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/movies/${params.id}`)
        setMovie(data)
        const recRes = await api.get(`/movies/${params.id}/recommendations`).catch(() => ({ data: { results: [] } }))
        setRecommendations(recRes.data.results?.slice(0, 5) || [])
      } catch {} finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleFavorite() {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    try {
      await api.post('/favorites', {
        tmdb_id: movie.id,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        genre_ids: movie.genres?.map((g: any) => g.id) || [],
        vote_average: movie.vote_average,
      })
      setFavorited(true)
    } catch {}
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#666' }}>carregando...</div>
    </div>
  )

  if (!movie) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar />

      {/* backdrop */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        {movie.backdrop_path && (
          <div style={{ position: 'absolute', inset: 0, background: `url(${TMDB_IMAGE}${movie.backdrop_path}) center/cover`, filter: 'brightness(0.3)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#0a0a0f 0%,transparent 60%)' }} />
        <button
          onClick={() => router.back()}
          style={{ position: 'absolute', top: 24, left: 32, background: 'rgba(0,0,0,.6)', border: '1px solid #333', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> voltar
        </button>
      </div>

      {/* conteúdo */}
      <div style={{ padding: '0 32px', marginTop: -160, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 32, marginBottom: 48 }}>

          {/* poster */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 200,
              height: 300,
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid #2a2a3e',
              background: movie.poster_path ? `url(${TMDB_POSTER}${movie.poster_path}) center/cover` : 'linear-gradient(135deg,#1a2a4a,#0d1a30)',
            }} />
          </div>

          {/* info */}
          <div style={{ paddingTop: 100, flex: 1 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 12 }}>
              {movie.title}
            </h1>

            <div style={{ display: 'flex', gap: 20, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#f5c518', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={16} fill="#f5c518" /> {movie.vote_average?.toFixed(1)}
              </span>
              <span style={{ color: '#888', fontSize: 14 }}>{movie.release_date?.slice(0, 4)}</span>
              {movie.runtime && <span style={{ color: '#888', fontSize: 14 }}>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min</span>}
            </div>

            {/* gêneros */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {movie.genres?.map((g: any) => (
                <span key={g.id} style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid #2a2a3e', background: '#13131f', fontSize: 12, color: '#aaa' }}>
                  {g.name.toLowerCase()}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 15, color: '#aaa', lineHeight: 1.7, marginBottom: 24, maxWidth: 600 }}>
              {movie.overview}
            </p>

            <button
              onClick={handleFavorite}
              style={{ background: favorited ? '#13131f' : '#e50914', color: '#fff', border: favorited ? '1px solid #e50914' : 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Heart size={16} fill={favorited ? '#e50914' : 'none'} color="#fff" />
              {favorited ? 'favoritado' : 'adicionar aos favoritos'}
            </button>
          </div>
        </div>

        {/* recomendações */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>você também pode gostar</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              {recommendations.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}