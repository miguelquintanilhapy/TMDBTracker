// esse arquivo é um "porteiro" das rotas protegidas
// antes de qualquer rota privada ser executada, passa por aqui primeiro

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // pega o token que vem no cabeçalho da requisição
  const authHeader = req.headers.authorization

  // se não veio token nenhum, barra na hora
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não informado' })
    return
  }

  // separa o token do "Bearer "
  const token = authHeader.split(' ')[1]

  try {
    // verifica se o token é válido e não expirou
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload
    // coloca os dados do usuário dentro do req pra usar nas rotas
    req.user = decoded
    next() // libera pra continuar
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}