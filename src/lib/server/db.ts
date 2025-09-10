import { Client } from 'pg'
import { env } from '$env/dynamic/private';



export let db: Client | undefined;
if (env.DB_HOST && env.DB_USER && env.DB_PASS && env.DB_NAME) {
    console.log("Connecting to database...");

    db = new Client({
        user: env.DB_USER,
        password: env.DB_PASS,
        host: env.DB_HOST,
        port: env.DB_PORT ? parseInt(env.DB_PORT) : 5432,
        database: env.DB_NAME,
    });
    db.connect();
}