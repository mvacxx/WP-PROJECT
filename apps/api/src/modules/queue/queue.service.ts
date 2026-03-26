import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { CONTENT_GENERATION_QUEUE } from './queue.constants';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection: IORedis;
  private readonly contentQueue: Queue;

  constructor(private readonly configService: ConfigService) {
    this.connection = new IORedis(this.configService.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: null
    });
    this.contentQueue = new Queue(CONTENT_GENERATION_QUEUE, {
      connection: this.connection
    });
  }

  async enqueueContentGeneration(
    name: string,
    payload: { contentJobId?: string; [key: string]: unknown },
    options?: JobsOptions
  ): Promise<void> {
    await this.contentQueue.add(name, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      jobId: payload.contentJobId,
      removeOnComplete: true,
      removeOnFail: false,
      ...options
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.contentQueue.close();
    await this.connection.quit();
  }
}
