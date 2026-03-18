import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentJobStatus, LogLevel } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CONTENT_GENERATION_JOB } from '../queue/queue.constants';
import { QueueService } from '../queue/queue.service';
import { CreateContentJobDto } from './dto/create-content-job.dto';
import { UpdateContentJobStatusDto } from './dto/update-content-job-status.dto';

@Injectable()
export class ContentJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly queueService: QueueService
  ) {}

  async create(dto: CreateContentJobDto) {
    const projectExists = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      select: { id: true }
    });

    if (!projectExists) {
      throw new NotFoundException('Project not found');
    }

    const job = await this.prisma.contentJob.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        keyword: dto.keyword,
        provider: dto.provider,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        status: ContentJobStatus.pending
      }
    });

    await this.logsService.createContentLog(job.id, LogLevel.info, 'Content job created', {
      provider: dto.provider
    });

    await this.queueService.enqueueContentGeneration(CONTENT_GENERATION_JOB, {
      contentJobId: job.id
    });

    return job;
  }

  async findAll(query: PaginationQueryDto, projectId?: string) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    return this.prisma.contentJob.findMany({
      where: {
        projectId
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }

  async updateStatus(id: string, dto: UpdateContentJobStatusDto) {
    const exists = await this.prisma.contentJob.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Content job not found');
    }

    const updated = await this.prisma.contentJob.update({
      where: { id },
      data: {
        status: dto.status,
        failureReason: dto.failureReason
      }
    });

    await this.logsService.createContentLog(id, LogLevel.info, 'Content job status updated', {
      status: dto.status,
      failureReason: dto.failureReason
    });

    return updated;
  }
}
