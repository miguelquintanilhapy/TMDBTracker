// navbar fixa com busca ao vivo e link pro perfil

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import api, { Movie } from '../lib/api'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/movies/search?q=${query}`)
        setResults(data.results.slice(0, 5))
        setOpen(true)
      } catch {}
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <nav style={{
      background: '#0d0d14',
      borderBottom: '1px solid #1e1e2e',
      padding: '0 32px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div
        onClick={() => router.push('/')}
        style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', cursor: 'pointer', color: '#fff' }}
      >
        cine<span style={{ color: '#e50914' }}>track</span>
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {['início', 'filmes', 'séries', 'favoritos'].map((item, i) => (
          <span
            key={item}
            onClick={() => router.push(['/', '/filmes', '/series', '/favoritos'][i])}
            style={{ fontSize: 13, color: '#888', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >{item}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* busca com dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <div style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a3e',
            borderRadius: 20,
            padding: '7px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: 220,
          }}>
            <Search size={14} color="#555" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="buscar filmes, séries..."
              style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: '100%' }}
            />
            {query && <X size={14} color="#555" style={{ cursor: 'pointer' }} onClick={() => { setQuery(''); setOpen(false) }} />}
          </div>

          {open && results.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              background: '#0d0d18',
              border: '1px solid #2a2a3e',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              {results.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => { router.push(`/filme/${movie.id}`); setOpen(false); setQuery('') }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#13131f')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 13, color: '#e8e8f0' }}>{movie.title}</span>
                  <span style={{ fontSize: 11, color: '#f5c518' }}>★ {movie.vote_average.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              onClick={() => router.push('/perfil')}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#b8070f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {user.name[0].toUpperCase()}
            </div>
            <span onClick={logout} style={{ fontSize: 12, color: '#555', cursor: 'pointer' }}>sair</span>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >entrar</button>
        )}
      </div>
    </nav>
  )
}