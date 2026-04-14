// controller de favoritos — salva, lista e remove filmes/séries favoritos do usuário

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { db } from '../config/database'
import { recommendationService } from '../services/recommendation.service'

// formato esperado ao adicionar um favorito
const favoriteSchema = z.object({
  tmdb_id: z.number(),
  media_type: z.enum(['movie', 'tv']),
  title: z.string(),
  poster_path: z.string().nullable().optional(),
  genre_ids: z.array(z.number()).default([]),
  vote_average: z.number().default(0),
})

export const favoritesController = {
  // lista todos os favoritos do usuário
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { media_type } = req.query
      let query = 'SELECT * FROM favorites WHERE user_id = $1'
      const params: (number | string)[] = [req.user!.userId]

      // filtra por tipo se informado (?media_type=movie ou ?media_type=tv)
      if (media_type) {
        query += ' AND media_type = $2'
        params.push(String(media_type))
      }

      query += ' ORDER BY created_at DESC'
      const { rows } = await db.query(query, params)
      res.json(rows)
    } catch (err) { next(err) }
  },

  // adiciona um filme ou série aos favoritos
  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = favoriteSchema.parse(req.body)
      const userId = req.user!.userId

      // verifica se já está nos favoritos pra não duplicar
      const { rows: existing } = await db.query(
        'SELECT id FROM favorites WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3',
        [userId, data.tmdb_id, data.media_type]
      )
      if (existing.length > 0) {
        res.status(409).json({ error: 'Já está nos favoritos' })
        return
      }

      const { rows } = await db.query(
        `INSERT INTO favorites (user_id, tmdb_id, media_type, title, poster_path, genre_ids, vote_average)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, data.tmdb_id, data.media_type, data.title, data.poster_path ?? null, data.genre_ids, data.vote_average]
      )
      res.status(201).json(rows[0])
    } catch (err) { next(err) }
  },

  // remove um favorito pelo id
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await db.query(
        'DELETE FROM favorites WHERE user_id = $1 AND id = $2',
        [req.user!.userId, req.params.id]
      )
      res.status(204).send()
    } catch (err) { next(err) }
  },

  // retorna recomendações personalizadas baseadas nos favoritos do usuário
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mediaType = (req.query.media_type as 'movie' | 'tv') || 'movie'
      const result = await recommendationService.getForUser(req.user!.userId, mediaType)
      res.json(result)
    } catch (err) { next(err) }
  },
}