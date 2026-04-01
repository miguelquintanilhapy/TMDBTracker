// controller de filmes — recebe as requisições e chama o serviço do TMDB

import { Request, Response, NextFunction } from 'express'
import { tmdbService } from '../services/tmdb.service'

export const moviesController = {
  // busca filmes pelo nome via query param ?q=nome
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, page } = req.query
      if (!q) {
        res.status(400).json({ error: 'Informe o parâmetro "q" para buscar' })
        return
      }
      const result = await tmdbService.searchMovies(String(q), Number(page) || 1)
      res.json(result)
    } catch (err) { next(err) }
  },

  // detalhes de um filme pelo id
  async getDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movie = await tmdbService.getMovieDetails(Number(req.params.id))
      res.json(movie)
    } catch (err) { next(err) }
  },

  // filmes em alta na semana
  async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tmdbService.getTrending('movie', 'week')
      res.json(result)
    } catch (err) { next(err) }
  },

  // filmes que vão lançar em breve
  async getUpcoming(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page } = req.query
      const result = await tmdbService.getUpcomingMovies(Number(page) || 1)
      res.json(result)
    } catch (err) { next(err) }
  },

  // filmes filtrados por gênero
  async getByGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page } = req.query
      const result = await tmdbService.getMoviesByGenre(Number(req.params.genreId), Number(page) || 1)
      res.json(result)
    } catch (err) { next(err) }
  },

  // lista todos os gêneros disponíveis
  async getGenres(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tmdbService.getMovieGenres()
      res.json(result)
    } catch (err) { next(err) }
  },
}