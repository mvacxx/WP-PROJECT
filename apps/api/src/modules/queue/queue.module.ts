import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [LogsModule],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService]
})
export class QueueModule {}
