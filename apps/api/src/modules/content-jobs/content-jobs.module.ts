import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { QueueModule } from '../queue/queue.module';
import { ContentJobsController } from './content-jobs.controller';
import { ContentJobsService } from './content-jobs.service';

@Module({
  imports: [LogsModule, QueueModule],
  controllers: [ContentJobsController],
  providers: [ContentJobsService],
  exports: [ContentJobsService]
})
export class ContentJobsModule {}
