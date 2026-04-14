// card reutilizável de filme — aparece na home, busca e favoritos

'use client'

import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Movie } from '../lib/api'

interface Props {
  movie: Movie
  onFavorite?: (movie: Movie) => void
  isFavorited?: boolean
}

const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'

export default function MovieCard({ movie, onFavorite, isFavorited }: Props) {
  const router = useRouter()

  return (
    <div
      style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      style={{ transition: 'transform .2s', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* poster */}
      <div
        style={{
          position: 'relative',
          height: 200,
          background: movie.poster_path
            ? `url(${TMDB_IMAGE}${movie.poster_path}) center/cover`
            : 'linear-gradient(135deg,#1a2a4a,#0d1a30)',
          borderRadius: 8,
        }}
        onClick={() => router.push(`/filme/${movie.id}`)}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.85) 0%,transparent 60%)', borderRadius: 8 }} />

        {/* rating */}
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.7)', border: '1px solid #333', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: '#f5c518' }}>
          ★ {movie.vote_average.toFixed(1)}
        </div>

        {/* botão favoritar */}
        {onFavorite && (
          <button
            onClick={e => { e.stopPropagation(); onFavorite(movie) }}
            style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Heart size={14} fill={isFavorited ? '#e50914' : 'none'} color={isFavorited ? '#e50914' : '#aaa'} />
          </button>
        )}
      </div>

      {/* info */}
      <div style={{ padding: '10px 2px 0' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {movie.title}
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>
          {movie.release_date?.slice(0, 4)}
        </div>
      </div>
    </div>
  )
}