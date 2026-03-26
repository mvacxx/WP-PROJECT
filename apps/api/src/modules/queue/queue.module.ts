import { Module, forwardRef } from '@nestjs/common';
import { ContentJobsModule } from '../content-jobs/content-jobs.module';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [forwardRef(() => ContentJobsModule)],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService]
})
export class QueueModule {}
