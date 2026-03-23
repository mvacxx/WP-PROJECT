import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from '../../common/guards/admin-api-key.guard';
import { BaseWordpressRequestDto } from './dto/base-wordpress-request.dto';
import { ListWordpressPostsDto } from './dto/list-wordpress-posts.dto';
import { UpdateWordpressPostDto } from './dto/update-wordpress-post.dto';
import { UpsertWordpressPageDto } from './dto/upsert-wordpress-page.dto';
import { WordpressIntegrationService } from './wordpress-integration.service';

@UseGuards(AdminApiKeyGuard)
@Controller('wordpress-integration')
export class WordpressIntegrationController {
  constructor(private readonly wordpressIntegrationService: WordpressIntegrationService) {}

  @Post('test-connection')
  testConnection(@Body() dto: BaseWordpressRequestDto) {
    return this.wordpressIntegrationService.testConnection(dto);
  }

  @Post('posts/list')
  listPosts(@Body() dto: ListWordpressPostsDto) {
    return this.wordpressIntegrationService.listPosts(dto);
  }

  @Patch('posts/:postId')
  updatePost(@Param('postId', ParseIntPipe) postId: number, @Body() dto: UpdateWordpressPostDto) {
    return this.wordpressIntegrationService.updatePost(postId, dto);
  }

  @Post('pages/upsert')
  upsertPage(@Body() dto: UpsertWordpressPageDto) {
    return this.wordpressIntegrationService.upsertPage(dto);
  }
}
