import { sql } from '@/lib/db';
import type { Category } from '@/lib/definitions';

export async function GET() {
  try {
    const channels = await sql<Category[]>`
      SELECT id, name, slug, description, icon, sort_order, created_at
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `;

    return Response.json({ channels });
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return Response.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
