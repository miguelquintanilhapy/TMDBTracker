// esse arquivo cria todas as tabelas no banco de dados
// só precisa rodar uma vez com: npm run migration:run

import { db } from '../../config/database'

async function migrate(): Promise<void> {
  const client = await db.connect()

  try {
    await client.query('BEGIN')

    // tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // tabela de favoritos — ligada ao usuário
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tmdb_id INTEGER NOT NULL,
        media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
        title VARCHAR(500) NOT NULL,
        poster_path VARCHAR(500),
        genre_ids INTEGER[] DEFAULT '{}',
        vote_average DECIMAL(4,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tmdb_id, media_type)
      )
    `)

    // tabela de histórico de filmes assistidos
    await client.query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tmdb_id INTEGER NOT NULL,
        media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
        title VARCHAR(500) NOT NULL,
        poster_path VARCHAR(500),
        user_rating DECIMAL(3,1) CHECK (user_rating >= 0 AND user_rating <= 10),
        watched_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // índices pra deixar as buscas mais rápidas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_genre ON favorites USING GIN(genre_ids);
      CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);
    `)

    await client.query('COMMIT')
    console.log('✅ Tabelas criadas com sucesso')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Erro na migration:', err)
    throw err
  } finally {
    client.release()
    await db.end()
  }
}

migrate()