import { sql } from '@/lib/db';
import { auth } from '@/auth';
import { broadcast } from '@/lib/chat-sse';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return Response.json({ error: 'categoryId is required' }, { status: 400 });
    }

    const messages = await sql`
      SELECT 
        cm.id, 
        cm.user_id, 
        cm.category_id, 
        cm.content, 
        cm.created_at,
        u.id as u_id,
        u.name as u_name,
        u.avatar as u_avatar
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.category_id = ${categoryId}
      ORDER BY cm.created_at ASC
      LIMIT 100
    `;

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      user_id: msg.user_id,
      category_id: msg.category_id,
      content: msg.content,
      created_at: msg.created_at,
      user: {
        id: msg.u_id,
        name: msg.u_name,
        avatar: msg.u_avatar,
      },
    }));

    return Response.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId, content } = await req.json();

    if (!categoryId || !content?.trim()) {
      return Response.json({ error: 'categoryId and content are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO chat_messages (user_id, category_id, content)
      VALUES (${session.user.id}, ${categoryId}, ${content.trim()})
      RETURNING id, user_id, category_id, content, created_at
    `;

    const message = result[0];

    // 获取用户信息
    const userInfo = await sql`
      SELECT id, name, avatar FROM users WHERE id = ${session.user.id}
    `;

    const formattedMessage = {
      id: message.id,
      user_id: message.user_id,
      category_id: message.category_id,
      content: message.content,
      created_at: message.created_at,
      user: userInfo[0],
    };

    // 广播给所有订阅该频道的客户端
    broadcast(categoryId, formattedMessage);

    return Response.json(formattedMessage);
  } catch (error) {
    console.error('Failed to send message:', error);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
