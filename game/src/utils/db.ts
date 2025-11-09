import { Env } from '@/lib/env_config';
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI =  Env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Singleton class for MongoDB connection.
 */
export class MongoDB {
  private static instance: MongoDB;
  private conn: Mongoose | null = null;
  private promise: Promise<Mongoose> | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of the MongoDB class.
   * @returns The singleton instance of the MongoDB class.
   */
  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  /**
   * Connects to the MongoDB database if not already connected.
   * @returns A promise that resolves to the Mongoose connection.
   */
  public async getConnection(): Promise<Mongoose> {
    if (this.conn) {
      return this.conn;
    }

    if (!this.promise) {
      const opts = {
        dbName: 'Rubik_cube', // Explicitly specify your database name
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
        console.log("Connected to MongoDB database");
        return mongooseInstance;
      }).catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
    }

    try {
      this.conn = await this.promise;
    } catch (e) {
      this.promise = null;
      throw e;
    }

    return this.conn;
  }
}

const dbConnect = async (): Promise<Mongoose> => {
    const mongoDB = MongoDB.getInstance();
    return mongoDB.getConnection();
};

export default dbConnect;