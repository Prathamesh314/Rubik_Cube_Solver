import {
    Kysely,
    PostgresDialect,
    sql,
    Transaction,
  } from 'kysely';
  import { Pool } from 'pg';
  import { DB } from '@/types/db-types';
  import { Env } from '@/lib/env_config';
  
  const dbConfig = {
    user: Env.POSTGRES_USER,
    host: Env.POSTGRES_HOST,
    database: Env.POSTGRES_DB_NAME,
    password: Env.POSTGRES_PASSWORD,
    port: Env.POSTGRES_PORT,
  };
  
  console.log('Db config: ', dbConfig);
  
  export const tables = {
    user: 'user', 
    friends: 'friends',  
    game_history: 'game_history',
  };
  
  export class Postgres {
    private static instance: Postgres;
    private db: Kysely<DB>;
    private pool: Pool;
    private isConnected = false;
    private isInitialized = false;
  
    private constructor() {
      this.pool = new Pool(dbConfig);
  
      const dialect = new PostgresDialect({ pool: this.pool });
  
      this.db = new Kysely<DB>({ dialect });
  
      console.log('Kysely instance created');
    }
  
    public static getInstance(): Postgres {
      if (!Postgres.instance) {
        Postgres.instance = new Postgres();
      }
      return Postgres.instance;
    }
  
    public getKyselyInstance(): Kysely<DB> {
      return this.db;
    }
  
    public async connectDb(): Promise<void> {
      if (this.isConnected) return;
  
      try {
        // Ensure required extensions (uuid via pgcrypto)
        await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(this.db);
  
        const result = await sql`SELECT NOW()`.execute(this.db);
        this.isConnected = true;
        console.log('Database connected successfully at:', (result.rows[0] as any).now);
      } catch (error) {
        console.error('Failed to connect to the database:', error);
        throw error;
      }
    }
  
    public async init(): Promise<void> {
        if (this.isInitialized) return;
      console.log('Initializing database schema...');
      try {
        // app_user
        await sql`
          CREATE TABLE IF NOT EXISTS ${sql.table(tables.user)} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            rating INTEGER NOT NULL DEFAULT 1000,
            total_wins INTEGER NOT NULL DEFAULT 0,
            total_games_played INTEGER NOT NULL DEFAULT 0,
            fastest_time_to_solve_cube DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT app_user_email_unique UNIQUE (email),
            CONSTRAINT app_user_username_unique UNIQUE (username)
          );
        `.execute(this.db);

        // friendship
        await sql`
          CREATE TABLE IF NOT EXISTS ${sql.table(tables.friends)} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            requester_id UUID NOT NULL REFERENCES ${sql.table(tables.user)} (id) ON DELETE CASCADE,
            addressee_id UUID NOT NULL REFERENCES ${sql.table(tables.user)} (id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'pending', -- consider ENUM later
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `.execute(this.db);

        // game_history
        await sql`
          CREATE TABLE IF NOT EXISTS ${sql.table(tables.game_history)} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES ${sql.table(tables.user)}(id) ON DELETE CASCADE,
            opponent_id UUID REFERENCES ${sql.table(tables.user)}(id) ON DELETE SET NULL,
            started_at TIMESTAMPTZ NOT NULL,
            ended_at TIMESTAMPTZ,
            winner_user_id UUID REFERENCES ${sql.table(tables.user)}(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `.execute(this.db);
      } catch (e) {
        console.error("Error in initializing tables: ", e)
      }

      this.isInitialized = true;
    }
  
    public async transaction<T>(callback: (trx: Transaction<DB>) => Promise<T>): Promise<T> {
      return this.db.transaction().execute(callback);
    }
  
    public connection(): Kysely<DB> {
      return this.getKyselyInstance();
    }
  }
  
  const getPostgresConn = async (): Promise<Postgres> => {
    const postgres = Postgres.getInstance();
    await postgres.connectDb();
    await postgres.init();
    return postgres;
  };
  
  export default getPostgresConn;
  