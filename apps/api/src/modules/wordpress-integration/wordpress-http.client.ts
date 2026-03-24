import { BadGatewayException, Injectable } from '@nestjs/common';
import {
  WordpressClient,
  WordpressPageUpsertPayload,
  WordpressPostQuery,
  WordpressPostUpdatePayload,
  WordpressRequestContext
} from './interfaces/wordpress-client.interface';
import { WordpressAuthFactory } from './wordpress-auth.factory';

@Injectable()
export class WordpressHttpClient implements WordpressClient {
  constructor(private readonly authFactory: WordpressAuthFactory) {}

  async testConnection(context: WordpressRequestContext): Promise<{ connected: boolean; statusCode: number }> {
    const response = await this.request(context, 'GET', '/posts?per_page=1');

    return {
      connected: response.ok,
      statusCode: response.status
    };
  }

  async listPosts(context: WordpressRequestContext, query: WordpressPostQuery): Promise<unknown> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.perPage) params.set('per_page', String(query.perPage));
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);

    const response = await this.request(context, 'GET', `/posts?${params.toString()}`);
    return response.json();
  }

  async updatePost(
    context: WordpressRequestContext,
    postId: number,
    payload: WordpressPostUpdatePayload
  ): Promise<unknown> {
    const response = await this.request(context, 'POST', `/posts/${postId}`, payload);
    return response.json();
  }

  async upsertPage(context: WordpressRequestContext, payload: WordpressPageUpsertPayload): Promise<unknown> {
    const pageQuery = new URLSearchParams();
    pageQuery.set('slug', payload.slug);
    pageQuery.set('per_page', '1');

    const findResponse = await this.request(context, 'GET', `/pages?${pageQuery.toString()}`);
    const pages = (await findResponse.json()) as Array<{ id: number }>;

    if (pages.length > 0) {
      const updateResponse = await this.request(context, 'POST', `/pages/${pages[0].id}`, payload);
      return updateResponse.json();
    }

    const createResponse = await this.request(context, 'POST', '/pages', payload);
    return createResponse.json();
  }

  private async request(
    context: WordpressRequestContext,
    method: 'GET' | 'POST',
    path: string,
    body?: unknown
  ): Promise<Response> {
    const baseUrl = context.siteUrl.replace(/\/$/, '');
    const headers = {
      'Content-Type': 'application/json',
      ...this.authFactory.buildAuthHeaders(context.auth)
    };

    const response = await fetch(`${baseUrl}/wp-json/wp/v2${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok && response.status >= 500) {
      throw new BadGatewayException(`WordPress request failed with status ${response.status}`);
    }

    return response;
  }
}
