import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  ServiceUnavailableException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WordpressClient,
  WordpressPageUpsertPayload,
  WordpressPostQuery,
  WordpressPostUpdatePayload,
  WordpressPostUpsertPayload,
  WordpressRequestContext
} from './interfaces/wordpress-client.interface';
import { WordpressAuthFactory } from './wordpress-auth.factory';

@Injectable()
export class WordpressHttpClient implements WordpressClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(
    private readonly authFactory: WordpressAuthFactory,
    private readonly configService: ConfigService
  ) {
    this.timeoutMs = this.configService.get<number>('WORDPRESS_HTTP_TIMEOUT_MS') ?? 15000;
    this.maxRetries = this.configService.get<number>('WORDPRESS_HTTP_MAX_RETRIES') ?? 2;
  }

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

  async upsertPost(context: WordpressRequestContext, payload: WordpressPostUpsertPayload): Promise<unknown> {
    const query = new URLSearchParams();
    query.set('slug', payload.slug);
    query.set('per_page', '1');

    const findResponse = await this.request(context, 'GET', `/posts?${query.toString()}`);
    const posts = (await findResponse.json()) as Array<{ id: number }>;

    if (posts.length > 0) {
      const updateResponse = await this.request(context, 'POST', `/posts/${posts[0].id}`, payload);
      return updateResponse.json();
    }

    const createResponse = await this.request(context, 'POST', '/posts', payload);
    return createResponse.json();
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
    const url = `${baseUrl}/wp-json/wp/v2${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.authFactory.buildAuthHeaders(context.auth)
    };
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });

        if (!response.ok) {
          if (this.shouldRetry(response.status) && attempt < this.maxRetries) {
            attempt += 1;
            await this.sleep(this.retryDelayMs(attempt));
            continue;
          }

          throw await this.toHttpException(response, path);
        }

        return response;
      } catch (error) {
        if (this.isAbortError(error)) {
          throw new GatewayTimeoutException(
            `WordPress request timed out after ${this.timeoutMs}ms (${path})`
          );
        }

        if (attempt < this.maxRetries) {
          attempt += 1;
          lastError = error;
          await this.sleep(this.retryDelayMs(attempt));
          continue;
        }

        throw new ServiceUnavailableException(
          `WordPress request failed after ${this.maxRetries + 1} attempts (${path})`
        );
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new ServiceUnavailableException(
      `WordPress request failed after retries (${path})`,
      lastError instanceof Error ? lastError.message : undefined
    );
  }

  private shouldRetry(status: number): boolean {
    return status === 429 || status >= 500;
  }

  private retryDelayMs(attempt: number): number {
    return Math.min(1000 * 2 ** (attempt - 1), 5000);
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }

  private async toHttpException(response: Response, path: string): Promise<HttpException> {
    let errorCode: string | undefined;
    let errorMessage = `WordPress request failed with status ${response.status} (${path})`;

    try {
      const payload = (await response.json()) as { code?: string; message?: string };
      errorCode = payload?.code;
      if (payload?.message) {
        errorMessage = `WordPress error: ${payload.message}`;
      }
    } catch {
      // response body might not be JSON
    }

    if (response.status >= 500) {
      return new BadGatewayException(errorCode ? `${errorMessage} [${errorCode}]` : errorMessage);
    }

    return new HttpException(
      errorCode ? `${errorMessage} [${errorCode}]` : errorMessage,
      response.status
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
