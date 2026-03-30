import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { ContentJobsService } from '../content-jobs/content-jobs.service';
import { CONTENT_GENERATION_JOB, CONTENT_GENERATION_QUEUE } from './queue.constants';

@Injectable()
export class QueueProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueProcessor.name);
  private readonly connection: IORedis;
  private worker?: Worker;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ContentJobsService))
    private readonly contentJobsService: ContentJobsService
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

        await this.contentJobsService.markSendingToGeneration(contentJobId, job.attemptsMade + 1);
        await this.contentJobsService.markGenerated(contentJobId, {
          providerJobId: `stub-${job.id}`,
          providerPayload: {
            provider: 'stub',
            completedAt: new Date().toISOString()
          },
          normalizedContent: {
            title: 'Generated title placeholder',
            body: 'Generated content placeholder'
          }
        });
      },
      { connection: this.connection }
    );

    this.worker.on('failed', async (job, error) => {
      if (!job?.data?.contentJobId) return;

      try {
        await this.contentJobsService.markFailed(job.data.contentJobId, error.message, job.attemptsMade);
      } catch (handlerError) {
        this.logger.error(
          `Failed to mark job ${job.data.contentJobId} as failed: ${
            handlerError instanceof Error ? handlerError.message : String(handlerError)
          }`
        );
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    await this.connection.quit();
  }
}
