import { Injectable } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { LogLevel } from '@prisma/client';
import { BaseWordpressRequestDto } from './dto/base-wordpress-request.dto';
import { ListWordpressPostsDto } from './dto/list-wordpress-posts.dto';
import { UpdateWordpressPostDto } from './dto/update-wordpress-post.dto';
import { UpsertWordpressPageDto } from './dto/upsert-wordpress-page.dto';
import { UpsertWordpressPostDto } from './dto/upsert-wordpress-post.dto';
import { WordpressHttpClient } from './wordpress-http.client';

@Injectable()
export class WordpressIntegrationService {
  constructor(
    private readonly wordpressClient: WordpressHttpClient,
    private readonly logsService: LogsService
  ) {}

  async testConnection(dto: BaseWordpressRequestDto) {
    const result = await this.wordpressClient.testConnection({
      siteUrl: dto.siteUrl,
      auth: dto.auth
    });

    await this.logsService.createSystemLog({
      source: 'wordpress-integration',
      level: result.connected ? LogLevel.info : LogLevel.warn,
      message: `WordPress connection test (${result.connected ? 'success' : 'failed'})`,
      metadata: {
        siteUrl: dto.siteUrl,
        statusCode: result.statusCode
      }
    });

    return result;
  }

  listPosts(dto: ListWordpressPostsDto) {
    return this.wordpressClient.listPosts(
      {
        siteUrl: dto.siteUrl,
        auth: dto.auth
      },
      {
        page: dto.page,
        perPage: dto.perPage,
        status: dto.status,
        search: dto.search
      }
    );
  }

  updatePost(postId: number, dto: UpdateWordpressPostDto) {
    return this.wordpressClient.updatePost(
      {
        siteUrl: dto.siteUrl,
        auth: dto.auth
      },
      postId,
      {
        status: dto.status,
        slug: dto.slug,
        categories: dto.categories,
        tags: dto.tags,
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt
      }
    );
  }


  upsertPost(dto: UpsertWordpressPostDto) {
    return this.wordpressClient.upsertPost(
      {
        siteUrl: dto.siteUrl,
        auth: dto.auth
      },
      {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        status: dto.status,
        categories: dto.categories,
        tags: dto.tags
      }
    );
  }

  upsertPage(dto: UpsertWordpressPageDto) {
    return this.wordpressClient.upsertPage(
      {
        siteUrl: dto.siteUrl,
        auth: dto.auth
      },
      {
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        status: dto.status
      }
    );
  }
}
