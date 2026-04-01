import { Injectable } from '@nestjs/common';
import { ContentProvider } from '@prisma/client';
import {
  ContentGenerationProviderStrategy,
  ContentGenerationRequest,
  ContentGenerationResult
} from '../interfaces/content-generation-provider.interface';

@Injectable()
export class ManualContentGenerationProvider implements ContentGenerationProviderStrategy {
  readonly provider = ContentProvider.manual;

  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    return {
      providerJobId: `manual-${request.contentJobId}`,
      providerPayload: { provider: this.provider, mode: 'human-review' },
      normalizedContent: {
        title: request.title,
        body: `Manual draft requested for keyword: ${request.keyword}`
      }
    };
  }
}
