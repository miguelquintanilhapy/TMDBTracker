// aqui ficam todas as rotas da aplicação
// é tipo um mapa: qual url chama qual controller

import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { moviesController } from '../controllers/movies.controller'
import { favoritesController } from '../controllers/favorites.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

// rotas de autenticação — abertas, qualquer um pode acessar
router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)
router.get('/auth/me', authMiddleware, authController.me) // essa precisa de login

// rotas de filmes — abertas, não precisa estar logado
router.get('/movies/search', moviesController.search)
router.get('/movies/trending', moviesController.getTrending)
router.get('/movies/upcoming', moviesController.getUpcoming)
router.get('/movies/genres', moviesController.getGenres)
router.get('/movies/genre/:genreId', moviesController.getByGenre)
router.get('/movies/:id', moviesController.getDetails)

// rotas de séries — abertas
router.get('/series/search', async (req, res, next) => {
  try {
    const { q, page } = req.query
    if (!q) { res.status(400).json({ error: 'Informe o parâmetro "q" para buscar' }); return }
    const { tmdbService } = await import('../services/tmdb.service')
    const result = await tmdbService.searchSeries(String(q), Number(page) || 1)
    res.json(result)
  } catch (err) { next(err) }
})
router.get('/series/trending', async (req, res, next) => {
  try {
    const { tmdbService } = await import('../services/tmdb.service')
    res.json(await tmdbService.getTrending('tv', 'week'))
  } catch (err) { next(err) }
})
router.get('/series/:id', async (req, res, next) => {
  try {
    const { tmdbService } = await import('../services/tmdb.service')
    res.json(await tmdbService.getSeriesDetails(Number(req.params.id)))
  } catch (err) { next(err) }
})

// rotas de favoritos — todas precisam de login (authMiddleware)
router.get('/favorites/recommendations', authMiddleware, favoritesController.getRecommendations)
router.get('/favorites', authMiddleware, favoritesController.list)
router.post('/favorites', authMiddleware, favoritesController.add)
router.delete('/favorites/:id', authMiddleware, favoritesController.remove)

export default router