// arquivo principal — é aqui que o servidor sobe
// ele junta tudo: middlewares, rotas, conexão com banco

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { checkDbConnection } from './config/database'
import routes from './routes'
import { errorHandler } from './middlewares/error.middleware'

const app = express()

// segurança básica
app.use(helmet())
app.use(cors())
app.use(express.json())

// limita 100 requisições por IP a cada 15 minutos
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
}))

// todas as rotas ficam sob /api
app.use('/api', routes)

// rota simples pra checar se o servidor está de pé
app.get('/health', (_, res) => res.json({ status: 'ok', env: env.nodeEnv }))

// captura todos os erros da aplicação — tem que ficar por último
app.use(errorHandler)

async function bootstrap(): Promise<void> {
  await checkDbConnection()
  app.listen(env.port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${env.port}`)
    console.log(`🎬 TMDB Tracker — ${env.nodeEnv}`)
  })
}

bootstrap()