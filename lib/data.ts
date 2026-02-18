import { sql } from './db';
import type { User } from './definitions';

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
      SELECT id, email, password, name, avatar, role, status, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
