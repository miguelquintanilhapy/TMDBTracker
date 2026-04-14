// controller de autenticação — cuida do registro e login do usuário

import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '../config/database'
import { env } from '../config/env'

// formato esperado pro registro
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

// formato esperado pro login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = registerSchema.parse(req.body)

      // verifica se o email já está cadastrado
      const { rows: existing } = await db.query(
        'SELECT id FROM users WHERE email = $1', [email]
      )
      if (existing.length > 0) {
        res.status(409).json({ error: 'Email já cadastrado' })
        return
      }

      // criptografa a senha antes de salvar
      const password_hash = await bcrypt.hash(password, 12)
      const { rows } = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name, email, password_hash]
      )

      // gera o token JWT pra já deixar o usuário logado
      const user = rows[0]
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
      )

      res.status(201).json({ user, token })
    } catch (err) {
      next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body)

      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      const user = rows[0]

      // verifica se o usuário existe e se a senha está correta
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        res.status(401).json({ error: 'Email ou senha inválidos' })
        return
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
      )

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token,
      })
    } catch (err) {
      next(err)
    }
  },

  // retorna os dados do usuário logado
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rows } = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [req.user!.userId]
      )
      res.json(rows[0])
    } catch (err) {
      next(err)
    }
  },
}