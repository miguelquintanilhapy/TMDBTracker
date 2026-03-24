import { Pool } from 'pg'
import { env } from './env'

export const db = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

db.on('error', (err) => {
  console.error('Unexpected DB error:', err)
  process.exit(-1)
})

export async function checkDbConnection(): Promise<void> {
  const client = await db.connect()
  client.release()
  console.log('✅ Database connected')
}