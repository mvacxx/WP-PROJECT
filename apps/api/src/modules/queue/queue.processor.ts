import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentJobStatus, LogLevel } from '@prisma/client';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { LogsService } from '../logs/logs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CONTENT_GENERATION_JOB, CONTENT_GENERATION_QUEUE } from './queue.constants';

@Injectable()
export class QueueProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueProcessor.name);
  private readonly connection: IORedis;
  private worker?: Worker;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService
  ) {
    this.connection = new IORedis(this.configService.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: null
    });
  }

  onModuleInit(): void {
    this.worker = new Worker(
      CONTENT_GENERATION_QUEUE,
      async (job: Job<{ contentJobId: string }>) => {
        if (job.name !== CONTENT_GENERATION_JOB) {
          return;
        }

        const contentJobId = job.data.contentJobId;
        this.logger.log(`Processing content job ${contentJobId}`);

        await this.prisma.contentJob.update({
          where: { id: contentJobId },
          data: {
            status: ContentJobStatus.sending_to_generation
          }
        });

        await this.logsService.createContentLog(contentJobId, LogLevel.info, 'Job sent to generation provider', {
          queueJobId: job.id
        });
      },
      { connection: this.connection }
    );

    this.worker.on('failed', async (job, error) => {
      if (!job?.data?.contentJobId) return;

      await this.prisma.contentJob.update({
        where: { id: job.data.contentJobId },
        data: {
          status: ContentJobStatus.failed,
          failureReason: error.message
        }
      });

      await this.logsService.createContentLog(
        job.data.contentJobId,
        LogLevel.error,
        'Queue processing failed',
        { error: error.message }
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    await this.connection.quit();
  }
}
