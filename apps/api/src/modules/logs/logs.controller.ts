import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('system')
  createSystemLog(@Body() dto: CreateSystemLogDto) {
    return this.logsService.createSystemLog(dto);
  }

  @Get('system')
  findSystemLogs(@Query() query: PaginationQueryDto, @Query('projectId') projectId?: string) {
    return this.logsService.findSystemLogs(query, projectId);
  }

  @Get('content/:jobId')
  findContentLogs(@Param('jobId') jobId: string) {
    return this.logsService.findContentLogs(jobId);
  }
}
