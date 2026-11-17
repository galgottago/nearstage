import type { DemoSessionLike } from "@/domain/tickets";
import type { DemoOrder, MetaProfileLink, Review, VideoPost } from "@/domain/types";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class MemoryStorage implements KeyValueStorage {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.has(key) ? (this.items.get(key) ?? null) : null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

type SessionState = {
  orders: DemoOrder[];
  soldByEvent: Record<string, number>;
  metaByUser: Record<string, MetaProfileLink>;
  posts: VideoPost[];
  reviews: Review[];
};

export class DemoSession implements DemoSessionLike {
  static readonly KEY = "nearstage.demo.session.v1";
  private static browserSession: DemoSession | null = null;

  constructor(private readonly storage: KeyValueStorage) {}

  static subscribe(listener: () => void): () => void {
    if (typeof window === "undefined") {
      return () => undefined;
    }
    const notify = () => listener();
    window.addEventListener("nearstage-session", notify);
    window.addEventListener("storage", notify);
    return () => {
      window.removeEventListener("nearstage-session", notify);
      window.removeEventListener("storage", notify);
    };
  }

  /** Null on the server so the first client render matches the prerender. */
  static serverSnapshot(): null {
    return null;
  }

  static snapshot(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem(DemoSession.KEY) ?? "";
  }

  static memory(): DemoSession {
    return new DemoSession(new MemoryStorage());
  }

  static browser(): DemoSession {
    if (typeof window === "undefined") {
      throw new Error("DemoSession.browser() is only available in the browser.");
    }
    if (!this.browserSession) {
      this.browserSession = new DemoSession(window.localStorage);
    }
    return this.browserSession;
  }

  soldCount(eventId: string): number {
    return this.read().soldByEvent[eventId] ?? 0;
  }

  placeOrder(order: DemoOrder): void {
    const state = this.read();
    state.orders = [order, ...state.orders.filter((existing) => existing.id !== order.id)];
    state.soldByEvent[order.eventId] = (state.soldByEvent[order.eventId] ?? 0) + order.quantity;
    this.write(state);
  }

  orders(): DemoOrder[] {
    return this.read().orders;
  }

  meta(userId: string): MetaProfileLink | null {
    return this.read().metaByUser[userId] ?? null;
  }

  linkMeta(link: MetaProfileLink): void {
    const state = this.read();
    state.metaByUser[link.userId] = link;
    this.write(state);
  }

  clearMeta(userId: string): void {
    const state = this.read();
    delete state.metaByUser[userId];
    this.write(state);
  }

  addPost(post: VideoPost): void {
    const state = this.read();
    state.posts = [post, ...state.posts.filter((existing) => existing.id !== post.id)];
    this.write(state);
  }

  postsFor(eventId: string): VideoPost[] {
    return this.read().posts.filter((post) => post.eventId === eventId);
  }

  allPosts(): VideoPost[] {
    return this.read().posts;
  }

  addReview(review: Review): void {
    const state = this.read();
    state.reviews = [review, ...state.reviews.filter((existing) => existing.id !== review.id)];
    this.write(state);
  }

  reviewsFor(targetType: Review["targetType"], targetId: string): Review[] {
    return this.read().reviews.filter(
      (review) => review.targetType === targetType && review.targetId === targetId,
    );
  }

  private read(): SessionState {
    const raw = this.storage.getItem(DemoSession.KEY);
    if (!raw) {
      return this.empty();
    }
    try {
      const parsed = JSON.parse(raw) as Partial<SessionState>;
      return {
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        soldByEvent:
          parsed.soldByEvent && typeof parsed.soldByEvent === "object" ? parsed.soldByEvent : {},
        metaByUser:
          parsed.metaByUser && typeof parsed.metaByUser === "object" ? parsed.metaByUser : {},
        posts: Array.isArray(parsed.posts) ? parsed.posts : [],
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      };
    } catch {
      return this.empty();
    }
  }

  private write(state: SessionState): void {
    this.storage.setItem(DemoSession.KEY, JSON.stringify(state));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("nearstage-session"));
    }
  }

  private empty(): SessionState {
    return {
      orders: [],
      soldByEvent: {},
      metaByUser: {},
      posts: [],
      reviews: [],
    };
  }
}
