import postgres from 'postgres';

export const sql = postgres(process.env.POSTGRES_URL!, { 
  ssl: 'require',
  max: 10,
});
