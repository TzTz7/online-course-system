import { sql } from '@/lib/db';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, avatar, role, status
      FROM users
      ORDER BY name ASC
    `;

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
    }));

    return Response.json({ users: formattedUsers });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
