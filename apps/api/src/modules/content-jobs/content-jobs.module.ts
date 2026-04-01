import { Module, forwardRef } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { QueueModule } from '../queue/queue.module';
import { ContentGenerationProviderFactory } from './content-generation-provider.factory';
import { ContentJobsController } from './content-jobs.controller';
import { ContentJobsService } from './content-jobs.service';
import { GenericContentGenerationProvider } from './providers/generic-content-generation.provider';
import { ManualContentGenerationProvider } from './providers/manual-content-generation.provider';
import { SeowritingContentGenerationProvider } from './providers/seowriting-content-generation.provider';

@Module({
  imports: [LogsModule, forwardRef(() => QueueModule)],
  controllers: [ContentJobsController],
  providers: [
    ContentJobsService,
    ContentGenerationProviderFactory,
    ManualContentGenerationProvider,
    GenericContentGenerationProvider,
    SeowritingContentGenerationProvider
  ],
  exports: [ContentJobsService, ContentGenerationProviderFactory]
})
export class ContentJobsModule {}
