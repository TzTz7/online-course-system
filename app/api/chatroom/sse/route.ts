import { subscribe, unsubscribe } from '@/lib/chat-sse';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return Response.json({ error: 'categoryId is required' }, { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // 订阅该频道的消息
        subscribe(categoryId, sendEvent);

        // 客户端断开时取消订阅
        req.signal.addEventListener('abort', () => {
          unsubscribe(categoryId, sendEvent);
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE error:', error);
    return Response.json({ error: 'SSE error' }, { status: 500 });
  }
}
