import { Client } from 'pg'
import { env } from '$env/dynamic/private';


export class Database {
    static client: Client | undefined;

    static connect() {
        this.client = new Client({
            user: env.DB_USER,
            password: env.DB_PASS,
            host: env.DB_HOST,
            port: env.DB_PORT ? parseInt(env.DB_PORT) : 5432,
            database: env.DB_NAME,
        });
        this.client.connect();
    }
}

if (env.DB_HOST || env.DB_USER || env.DB_PASS || env.DB_NAME) {
    console.log("Connecting to database...");
    Database.connect();
}