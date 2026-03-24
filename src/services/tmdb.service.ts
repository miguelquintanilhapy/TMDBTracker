// esse arquivo é responsável por toda comunicação com a API do TMDB
// em vez de fazer requisições espalhadas pelo código, centralizo tudo aqui

import axios from 'axios'
import { env } from '../config/env'
import { TmdbMovie, TmdbSeries, TmdbSearchResult } from '../types'

// cria uma instância do axios já configurada com a url base e a api key
const tmdb = axios.create({
  baseURL: env.tmdb.baseUrl,
  params: {
    api_key: env.tmdb.apiKey,
    language: 'pt-BR', // resultados em português
  },
})

export const tmdbService = {
  // busca filmes pelo nome
  async searchMovies(query: string, page = 1): Promise<TmdbSearchResult<TmdbMovie>> {
    const { data } = await tmdb.get('/search/movie', { params: { query, page } })
    return data
  },

  // busca séries pelo nome
  async searchSeries(query: string, page = 1): Promise<TmdbSearchResult<TmdbSeries>> {
    const { data } = await tmdb.get('/search/tv', { params: { query, page } })
    return data
  },

  // detalhes completos de um filme pelo id
  async getMovieDetails(id: number): Promise<TmdbMovie & { genres: { id: number; name: string }[] }> {
    const { data } = await tmdb.get(`/movie/${id}`)
    return data
  },

  // detalhes completos de uma série pelo id
  async getSeriesDetails(id: number): Promise<TmdbSeries & { genres: { id: number; name: string }[] }> {
    const { data } = await tmdb.get(`/tv/${id}`)
    return data
  },

  // filmes e séries em alta (trending)
  async getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') {
    const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`)
    return data
  },

  // filmes que vão lançar em breve
  async getUpcomingMovies(page = 1): Promise<TmdbSearchResult<TmdbMovie>> {
    const { data } = await tmdb.get('/movie/upcoming', { params: { page } })
    return data
  },

  // filmes filtrados por gênero
  async getMoviesByGenre(genreId: number, page = 1): Promise<TmdbSearchResult<TmdbMovie>> {
    const { data } = await tmdb.get('/discover/movie', {
      params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
    })
    return data
  },

  // séries filtradas por gênero
  async getSeriesByGenre(genreId: number, page = 1): Promise<TmdbSearchResult<TmdbSeries>> {
    const { data } = await tmdb.get('/discover/tv', {
      params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
    })
    return data
  },

  // lista todos os gêneros de filmes
  async getMovieGenres(): Promise<{ genres: { id: number; name: string }[] }> {
    const { data } = await tmdb.get('/genre/movie/list')
    return data
  },

  // lista todos os gêneros de séries
  async getSeriesGenres(): Promise<{ genres: { id: number; name: string }[] }> {
    const { data } = await tmdb.get('/genre/tv/list')
    return data
  },

  // recomendações baseadas em um filme específico
  async getMovieRecommendations(id: number): Promise<TmdbSearchResult<TmdbMovie>> {
    const { data } = await tmdb.get(`/movie/${id}/recommendations`)
    return data
  },

  // recomendações baseadas em uma série específica
  async getSeriesRecommendations(id: number): Promise<TmdbSearchResult<TmdbSeries>> {
    const { data } = await tmdb.get(`/tv/${id}/recommendations`)
    return data
  },

  // monta a url completa da imagem a partir do caminho parcial que o TMDB retorna
  getImageUrl(path: string | null): string | null {
    if (!path) return null
    return `${env.tmdb.imageBaseUrl}${path}`
  },
}