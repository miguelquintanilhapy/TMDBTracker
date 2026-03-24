// aqui eu defino os "formatos" dos dados que vão circular pela aplicação
// é tipo um contrato: se é um User, tem que ter esses campos

// formato de um usuário no banco
export interface User {
  id: number
  name: string
  email: string
  password_hash: string // a senha nunca fica salva direto, sempre criptografada
  created_at: Date
}

// formato de um favorito salvo pelo usuário
export interface Favorite {
  id: number
  user_id: number
  tmdb_id: number // o id do filme/série lá no TMDB
  media_type: 'movie' | 'tv' // só aceita esses dois valores
  title: string
  poster_path: string | null // pode não ter imagem
  genre_ids: number[] // lista de ids de gêneros
  vote_average: number
  created_at: Date
}

// formato do histórico de filmes assistidos
export interface WatchHistory {
  id: number
  user_id: number
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  user_rating: number | null // usuário pode não ter dado nota ainda
  watched_at: Date
}

// o que fica guardado dentro do token JWT depois do login
export interface JwtPayload {
  userId: number
  email: string
}

// formato de um filme vindo da API do TMDB
export interface TmdbMovie {
  id: number
  title: string
  overview: string // sinopse
  poster_path: string | null
  backdrop_path: string | null // imagem de fundo
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
}

// formato de uma série vindo da API do TMDB
// bem parecido com filme, mas tem name e first_air_date em vez de title e release_date
export interface TmdbSeries {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
}

// formato genérico de resposta de busca do TMDB
// o <T> significa que funciona tanto pra filme quanto pra série
export interface TmdbSearchResult<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

// isso aqui estende o tipo padrão do Express
// serve pra poder usar req.user em qualquer rota sem o TypeScript reclamar
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}