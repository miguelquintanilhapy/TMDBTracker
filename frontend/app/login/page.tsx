// página de login e registro

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const payload = isLogin ? { email, password } : { name, email, password }
      const { data } = await api.post(endpoint, payload)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'algo deu errado, tente novamente')
    } finally {
      setLoading(false)
    }
  }

  const input = {
    width: '100%',
    background: '#13131f',
    border: '1px solid #2a2a3e',
    borderRadius: 6,
    padding: '10px 14px',
    color: '#e8e8f0',
    fontSize: 14,
    outline: 'none',
  } as React.CSSProperties

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
            cine<span style={{ color: '#e50914' }}>track</span>
          </div>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            {isLogin ? 'entre na sua conta' : 'crie sua conta grátis'}
          </p>
        </div>

        {/* card */}
        <div style={{ background: '#0d0d18', border: '1px solid #1e1e2e', borderRadius: 12, padding: 32 }}>

          {/* tabs */}
          <div style={{ display: 'flex', background: '#13131f', borderRadius: 8, padding: 4, marginBottom: 28 }}>
            {['entrar', 'cadastrar'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setError('') }}
                style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: isLogin === (i === 0) ? '#1e1e2e' : 'transparent', color: isLogin === (i === 0) ? '#fff' : '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >{tab}</button>
            ))}
          </div>

          {/* campos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500 }}>nome</label>
                <input style={input} placeholder="seu nome" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500 }}>email</label>
              <input style={input} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6, fontWeight: 500 }}>senha</label>
              <input style={input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>

          {/* erro */}
          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 6, fontSize: 13, color: '#e50914' }}>
              {error}
            </div>
          )}

          {/* botão */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#555' : '#e50914', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 24 }}
          >
            {loading ? 'aguarde...' : isLogin ? 'entrar' : 'criar conta'}
          </button>
        </div>
      </div>
    </div>
  )
}