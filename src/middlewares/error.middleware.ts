// esse arquivo captura qualquer erro que acontecer na aplicação
// em vez de cada rota tratar o erro separado, tudo cai aqui no final

import { Request, Response, NextFunction } from 'express'
import { ZodError, ZodIssue } from 'zod'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {

  // loga o erro no terminal com data e hora
  console.error(`[${new Date().toISOString()}] Erro:`, err)

  // se for erro de validação do Zod (campo faltando, formato errado, etc)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Erro de validação',
      details: err.issues.map((e: ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // qualquer outro erro genérico
  res.status(500).json({ error: 'Erro interno do servidor' })
}