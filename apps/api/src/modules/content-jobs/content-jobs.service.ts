import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import {
  ContentJobStatus,
  LogLevel,
  Prisma,
  ProviderJobStatus,
  TargetPublishMode
} from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { CONTENT_GENERATION_JOB } from '../queue/queue.constants';
import { QueueService } from '../queue/queue.service';
import { assertContentJobTransition } from './content-job-status-machine';
import { CreateContentJobDto } from './dto/create-content-job.dto';
import { UpdateContentJobStatusDto } from './dto/update-content-job-status.dto';

@Injectable()
export class ContentJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService
  ) {}

  private toJsonValue(
    value?: Record<string, unknown>
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    return value as Prisma.InputJsonValue | undefined;
  }

  async create(dto: CreateContentJobDto) {
    const projectExists = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      select: { id: true }
    });

    if (!projectExists) {
      throw new NotFoundException('Project not found');
    }


    const existingJob = await this.prisma.contentJob.findFirst({
      where: {
        projectId: dto.projectId,
        title: dto.title,
        keyword: dto.keyword,
        status: {
          in: [
            ContentJobStatus.pending,
            ContentJobStatus.sending_to_generation,
            ContentJobStatus.generated,
            ContentJobStatus.posted_to_wordpress,
            ContentJobStatus.review_pending
          ]
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingJob) {
      await this.logsService.createContentLog(existingJob.id, LogLevel.warn, 'Duplicate content job prevented', {
        projectId: dto.projectId,
        title: dto.title,
        keyword: dto.keyword
      });

      return existingJob;
    }

    const job = await this.prisma.contentJob.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        keyword: dto.keyword,
        provider: dto.provider,
        targetPublishMode: dto.targetPublishMode ?? TargetPublishMode.manual_review,
        providerStatus: ProviderJobStatus.queued,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        status: ContentJobStatus.pending,
        attemptCount: 0
      }
    });

    await this.logsService.createContentLog(job.id, LogLevel.info, 'Content job created', {
      provider: dto.provider,
      targetPublishMode: dto.targetPublishMode ?? TargetPublishMode.manual_review
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

  async findByIdOrThrow(id: string) {
    const job = await this.prisma.contentJob.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Content job not found');
    }

    return job;
  }

  async updateStatus(id: string, dto: UpdateContentJobStatusDto) {
    const existing = await this.prisma.contentJob.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Content job not found');
    }

    assertContentJobTransition(existing.status, dto.status);

    const updated = await this.prisma.contentJob.update({
      where: { id },
      data: {
        status: dto.status,
        failureReason: dto.failureReason
      }
    });

    await this.logsService.createContentLog(id, LogLevel.info, 'Content job status updated', {
      from: existing.status,
      to: dto.status,
      failureReason: dto.failureReason
    });

    return updated;
  }

  async markSendingToGeneration(contentJobId: string, attempt: number) {
    const existing = await this.prisma.contentJob.findUnique({ where: { id: contentJobId } });
    if (!existing) {
      throw new NotFoundException('Content job not found');
    }

    assertContentJobTransition(existing.status, ContentJobStatus.sending_to_generation);

    await this.prisma.contentJob.update({
      where: { id: contentJobId },
      data: {
        status: ContentJobStatus.sending_to_generation,
        providerStatus: ProviderJobStatus.processing,
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date()
      }
    });

    await this.logsService.createContentLog(contentJobId, LogLevel.info, 'Job sent to generation provider', {
      from: existing.status,
      to: ContentJobStatus.sending_to_generation,
      attempt
    });
  }

  async markGenerated(
    contentJobId: string,
    payload: {
      providerJobId?: string;
      normalizedContent?: Record<string, unknown>;
      providerPayload?: Record<string, unknown>;
    }
  ) {
    const existing = await this.prisma.contentJob.findUnique({ where: { id: contentJobId } });
    if (!existing) {
      throw new NotFoundException('Content job not found');
    }

    assertContentJobTransition(existing.status, ContentJobStatus.generated);

    await this.prisma.contentJob.update({
      where: { id: contentJobId },
      data: {
        status: ContentJobStatus.generated,
        providerStatus: ProviderJobStatus.completed,
        providerJobId: payload.providerJobId,
        providerPayload: this.toJsonValue(payload.providerPayload),
        normalizedContent: this.toJsonValue(payload.normalizedContent)
      }
    });

    await this.logsService.createContentLog(contentJobId, LogLevel.info, 'Content generation completed', {
      from: existing.status,
      to: ContentJobStatus.generated,
      providerJobId: payload.providerJobId
    });
  }

  async markFailed(contentJobId: string, reason: string, attempt: number) {
    const existing = await this.prisma.contentJob.findUnique({ where: { id: contentJobId } });
    if (!existing) {
      throw new NotFoundException('Content job not found');
    }

    assertContentJobTransition(existing.status, ContentJobStatus.failed);

    await this.prisma.contentJob.update({
      where: { id: contentJobId },
      data: {
        status: ContentJobStatus.failed,
        providerStatus: ProviderJobStatus.failed,
        failureReason: reason,
        lastAttemptAt: new Date()
      }
    });

    await this.logsService.createContentLog(contentJobId, LogLevel.error, 'Queue processing failed', {
      from: existing.status,
      to: ContentJobStatus.failed,
      error: reason,
      attempt
    });
  }
}
