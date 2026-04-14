// todas as chamadas pro nosso backend ficam aqui centralizadas

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// injeta o token JWT automaticamente em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

// tipos de resposta da API
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
}

export interface Series {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
}

export interface Genre {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
}