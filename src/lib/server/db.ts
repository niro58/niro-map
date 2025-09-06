import { Client } from 'pg'
import { env } from '$env/dynamic/private';
export const clientPg = new Client({
    user: env.DB_USER,
    password: env.DB_PASS,
    host: env.DB_HOST,
    port: env.DB_PORT ? parseInt(env.DB_PORT) : 5432,
    database: env.DB_NAME,
})
clientPg.connect();