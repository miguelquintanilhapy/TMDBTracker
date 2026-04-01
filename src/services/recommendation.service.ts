// esse é o arquivo mais legal do projeto — o algoritmo de recomendação
// ele analisa os favoritos do usuário e sugere filmes/séries parecidos

import { db } from '../config/database'
import { tmdbService } from './tmdb.service'
import { Favorite } from '../types'

// tipo genérico pra aceitar tanto filme quanto série
type MediaItem = {
  id: number
  vote_average: number
  genre_ids: number[]
  [key: string]: unknown
}

export const recommendationService = {
  async getForUser(userId: number, mediaType: 'movie' | 'tv' = 'movie') {

    // busca todos os favoritos do usuário no banco
    const { rows: favorites } = await db.query<Favorite>(
      'SELECT * FROM favorites WHERE user_id = $1 AND media_type = $2',
      [userId, mediaType]
    )

    // se o usuário não tem favoritos ainda, retorna o que está em alta
    if (favorites.length === 0) {
      const trending = await tmdbService.getTrending(mediaType, 'week')
      return { source: 'trending', results: trending.results.slice(0, 10) }
    }

    // conta quantas vezes cada gênero aparece nos favoritos
    const genreCount: Record<number, number> = {}
    favorites.forEach((fav) => {
      fav.genre_ids.forEach((gid) => {
        genreCount[gid] = (genreCount[gid] || 0) + 1
      })
    })

    // pega os 3 gêneros mais frequentes
    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => Number(id))

    // guarda os ids dos favoritos pra não recomendar o que já está salvo
    const favoriteTmdbIds = new Set(favorites.map((f) => f.tmdb_id))

    // busca filmes/séries dos top 3 gêneros ao mesmo tempo (em paralelo)
    const results = await Promise.all(
      topGenres.map((genreId) =>
        mediaType === 'movie'
          ? tmdbService.getMoviesByGenre(genreId)
          : tmdbService.getSeriesByGenre(genreId)
      )
    )

    // junta tudo, remove duplicatas e remove o que já está nos favoritos
    const seen = new Set<number>()
    const recommendations = (results.flatMap((r) => r.results) as MediaItem[])
      .filter((item) => {
        if (favoriteTmdbIds.has(item.id) || seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
      .sort((a, b) => b.vote_average - a.vote_average) // ordena pelos mais bem avaliados
      .slice(0, 20) // retorna os 20 melhores

    return {
      source: 'personalizado',
      basedOnGenres: topGenres,
      results: recommendations,
    }
  },
}