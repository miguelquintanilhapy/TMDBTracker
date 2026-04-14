// página home — hero dinâmico, filtro por gênero e cards em alta

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import Navbar from './components/Navbar'
import MovieCard from './components/MovieCard'
import api, { Movie, Genre } from './lib/api'

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/original'

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [filtered, setFiltered] = useState<Movie[]>([])
  const [hero, setHero] = useState<Movie | null>(null)
  const [favorited, setFavorited] = useState<Set<number>>(new Set())
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const [trendRes, genreRes] = await Promise.all([
          api.get('/movies/trending'),
          api.get('/movies/genres'),
        ])
        const movies = trendRes.data.results as Movie[]
        setTrending(movies)
        setFiltered(movies)
        setHero(movies[0])
        setGenres(genreRes.data.genres)
      } catch {}
    }
    load()
  }, [])

  async function filterByGenre(genreId: number | null) {
    setSelectedGenre(genreId)
    if (!genreId) { setFiltered(trending); return }
    try {
      const { data } = await api.get(`/movies/genre/${genreId}`)
      setFiltered(data.results)
    } catch {}
  }

  async function handleFavorite(movie: Movie) {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    try {
      if (favorited.has(movie.id)) {
        setFavorited(prev => { const s = new Set(prev); s.delete(movie.id); return s })
      } else {
        await api.post('/favorites', {
          tmdb_id: movie.id,
          media_type: 'movie',
          title: movie.title,
          poster_path: movie.poster_path,
          genre_ids: movie.genre_ids,
          vote_average: movie.vote_average,
        })
        setFavorited(prev => new Set(prev).add(movie.id))
      }
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar />

      {/* hero */}
      {hero && (
        <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
          {hero.backdrop_path && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `url(${TMDB_IMAGE}${hero.backdrop_path}) center/cover`,
              filter: 'brightness(0.35)',
            }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#0a0a0f 35%,transparent 80%)' }} />
          <div style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', maxWidth: 480 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(229,9,20,.15)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: '#e50914', fontWeight: 600, marginBottom: 16 }}>
              ★ em alta esta semana
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 12, color: '#fff' }}>
              {hero.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, color: '#888', alignItems: 'center' }}>
              <span style={{ color: '#f5c518', fontWeight: 700 }}>★ {hero.vote_average.toFixed(1)}</span>
              <span>{hero.release_date?.slice(0, 4)}</span>
            </div>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: 24, maxWidth: 400 }}>
              {hero.overview?.slice(0, 200)}...
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => router.push(`/filme/${hero.id}`)}
                style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                ver detalhes
              </button>
              <button
                onClick={() => handleFavorite(hero)}
                style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Heart size={16} fill={favorited.has(hero.id) ? '#e50914' : 'none'} color={favorited.has(hero.id) ? '#e50914' : '#fff'} />
                {favorited.has(hero.id) ? 'favoritado' : 'favoritar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* filtro por gênero */}
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>em alta agora</h2>
          <span onClick={() => router.push('/filmes')} style={{ fontSize: 13, color: '#e50914', cursor: 'pointer' }}>ver tudo →</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => filterByGenre(null)}
            style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${!selectedGenre ? '#e50914' : '#2a2a3e'}`, background: !selectedGenre ? '#e50914' : '#13131f', fontSize: 12, color: !selectedGenre ? '#fff' : '#aaa', cursor: 'pointer' }}
          >todos</button>
          {genres.slice(0, 8).map(g => (
            <button
              key={g.id}
              onClick={() => filterByGenre(g.id)}
              style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${selectedGenre === g.id ? '#e50914' : '#2a2a3e'}`, background: selectedGenre === g.id ? '#e50914' : '#13131f', fontSize: 12, color: selectedGenre === g.id ? '#fff' : '#aaa', cursor: 'pointer' }}
            >{g.name.toLowerCase()}</button>
          ))}
        </div>

        {/* grid de filmes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 48 }}>
          {filtered.slice(0, 10).map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onFavorite={handleFavorite}
              isFavorited={favorited.has(movie.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}