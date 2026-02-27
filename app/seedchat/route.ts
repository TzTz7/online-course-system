import { sql } from '@/lib/db';
import type { Category, User } from '@/lib/definitions';

async function createChatMessagesTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS chat_messages_category_id ON chat_messages(category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS chat_messages_created_at ON chat_messages(created_at DESC)`;
}

async function seedChatMessages() {
  // 获取所有分类作为频道
  const categories = await sql<Category[]>`
    SELECT id, name, slug, description, icon, sort_order, created_at
    FROM categories
    ORDER BY sort_order ASC
  `;

  // 获取所有用户
  const users = await sql<User[]>`
    SELECT id, email, name, avatar, role, status
    FROM users
  `;

  if (categories.length === 0) {
    console.log('No categories found, please run /seed first');
    return { message: 'No categories found' };
  }

  if (users.length === 0) {
    console.log('No users found, please run /seed first');
    return { message: 'No users found' };
  }

  // 为每个分类创建一些示例消息
  const mockMessages: { user_id: string; category_id: string; content: string; created_at: Date }[] = [];

  const sampleContents: Record<string, string[]> = {
    '计算机科学': [
      '大家最近在学习什么编程语言？',
      '推荐一本算法入门书籍给大家',
      '有人知道怎么优化递归算法吗？',
      '今天学习了栈和队列，感觉收获很大',
      '数据结构真的是编程的基础啊',
    ],
    '数学': [
      '高等数学真的很难理解',
      '有没有同学一起复习期中考试？',
      '求导法则这块有点混淆',
      '线性代数矩阵运算有技巧吗？',
      '老师讲的那道积分题有人懂了吗？',
    ],
    '人工智能': [
      '机器学习和深度学习有什么区别？',
      '推荐一些AI学习资源',
      '神经网络反向传播算法好难懂',
      '有人在学Transformer吗？',
      'AI绘画真的太强大了',
    ],
    '网络工程': [
      'TCP/IP协议栈要怎么学习？',
      '网络安全需要注意哪些方面？',
      '路由器和交换机的区别是什么？',
      '有人配置过防火墙吗？',
      '5G技术会带来哪些变革？',
    ],
    '软件工程': [
      '敏捷开发流程是怎么样的？',
      '代码审查有什么好处？',
      '如何提高团队协作效率？',
      '单元测试应该怎么写？',
      '项目管理有哪些好的实践？',
    ],
    '数据科学': [
      'Python数据分析用什么库？',
      '大数据技术栈有哪些？',
      '如何进行数据清洗和预处理？',
      '推荐一些数据分析实战项目',
      '机器学习特征工程重要吗？',
    ],
  };

  // 为每个分类生成消息
  for (const category of categories) {
    const contents = sampleContents[category.name] || [
      '大家好！',
      '今天有什么学习计划吗？',
      '欢迎新同学！',
    ];

    // 每个分类生成 3-5 条消息
    const msgCount = Math.min(contents.length, Math.floor(Math.random() * 3) + 3);
    
    for (let i = 0; i < msgCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      mockMessages.push({
        user_id: randomUser.id,
        category_id: category.id,
        content: contents[i],
        created_at: new Date(Date.now() - (msgCount - i) * 60000 * 10), // 10分钟前开始
      });
    }
  }

  // 批量插入消息
  for (const msg of mockMessages) {
    await sql`
      INSERT INTO chat_messages (user_id, category_id, content, created_at)
      VALUES (${msg.user_id}, ${msg.category_id}, ${msg.content}, ${msg.created_at})
    `;
  }

  return {
    message: 'Chat messages seeded successfully',
    categoriesCount: categories.length,
    usersCount: users.length,
    messagesCount: mockMessages.length,
  };
}

export async function GET() {
  try {
    await createChatMessagesTable();
    const result = await seedChatMessages();
    
    return Response.json(result);
  } catch (error) {
    console.error('Seed chat error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
