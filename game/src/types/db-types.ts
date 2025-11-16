import { Generated, ColumnType } from 'kysely';

// This interface defines the shape of your database.
// The keys are table names, and the values are table interfaces.
export interface DB {
  users: UsersTable;
  // Add other tables here, e.g.:
  // posts: PostsTable;
}

// Interface for the 'users' table
export interface UsersTable {
  // `Generated<T>` means the DB will generate this value (e.g., serial)
  id: Generated<number>;
  
  username: string;
  email: string;

  // `ColumnType<T, T_INSERT, T_UPDATE>` is for columns with different
  // types on insert/update (e.g., a default value).
  created_at: ColumnType<Date, string | undefined, never>;
}

/*
// Example for another table
export interface PostsTable {
  id: Generated<number>;
  title: string;
  body: string;
  user_id: number; // This will be our foreign key
  created_at: ColumnType<Date, string | undefined, never>;
}
*/