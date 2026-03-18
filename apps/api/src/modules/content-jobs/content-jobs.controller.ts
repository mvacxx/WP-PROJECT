import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminApiKeyGuard } from '../../common/guards/admin-api-key.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ContentJobsService } from './content-jobs.service';
import { CreateContentJobDto } from './dto/create-content-job.dto';
import { UpdateContentJobStatusDto } from './dto/update-content-job-status.dto';

@UseGuards(AdminApiKeyGuard)
@Controller('content-jobs')
export class ContentJobsController {
  constructor(private readonly contentJobsService: ContentJobsService) {}

  @Post()
  create(@Body() dto: CreateContentJobDto) {
    return this.contentJobsService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @Query('projectId') projectId?: string) {
    return this.contentJobsService.findAll(query, projectId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateContentJobStatusDto) {
    return this.contentJobsService.updateStatus(id, dto);
  }
}
