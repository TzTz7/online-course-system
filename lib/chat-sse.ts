// lib/chat-sse.ts

type Subscriber = (data: any) => void;

const subscribers = new Map<string, Set<Subscriber>>();

export function subscribe(categoryId: string, callback: Subscriber) {
  if (!subscribers.has(categoryId)) {
    subscribers.set(categoryId, new Set());
  }
  subscribers.get(categoryId)!.add(callback);
}

export function unsubscribe(categoryId: string, callback: Subscriber) {
  subscribers.get(categoryId)?.delete(callback);
}

export function broadcast(categoryId: string, message: any) {
  const categorySubscribers = subscribers.get(categoryId);
  if (categorySubscribers) {
    categorySubscribers.forEach(callback => callback(message));
  }
}

export function getSubscriberCount(categoryId: string): number {
  return subscribers.get(categoryId)?.size || 0;
}
