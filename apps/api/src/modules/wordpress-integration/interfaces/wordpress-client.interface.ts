import { WordpressAuthContext } from './wordpress-auth-strategy.interface';

export type WordpressRequestContext = {
  siteUrl: string;
  auth: WordpressAuthContext;
};

export type WordpressPostQuery = {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
};

export type WordpressPostUpdatePayload = {
  status?: 'draft' | 'publish' | 'future' | 'pending' | 'private';
  slug?: string;
  categories?: number[];
  tags?: number[];
  title?: string;
  content?: string;
  excerpt?: string;
};

export type WordpressPostUpsertPayload = {
  title: string;
  slug: string;
  content: string;
  status?: 'draft' | 'publish' | 'future' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
};

export type WordpressPageUpsertPayload = {
  title: string;
  slug: string;
  content: string;
  status?: 'draft' | 'publish';
};

export interface WordpressClient {
  testConnection(context: WordpressRequestContext): Promise<{ connected: boolean; statusCode: number }>;
  listPosts(context: WordpressRequestContext, query: WordpressPostQuery): Promise<unknown>;
  updatePost(context: WordpressRequestContext, postId: number, payload: WordpressPostUpdatePayload): Promise<unknown>;
  upsertPost(context: WordpressRequestContext, payload: WordpressPostUpsertPayload): Promise<unknown>;
  upsertPage(context: WordpressRequestContext, payload: WordpressPageUpsertPayload): Promise<unknown>;
}
