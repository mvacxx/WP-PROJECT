import { Injectable } from '@nestjs/common';
import { ContentProvider } from '@prisma/client';
import {
  ContentGenerationProviderStrategy,
  ContentGenerationRequest,
  ContentGenerationResult
} from '../interfaces/content-generation-provider.interface';

@Injectable()
export class GenericContentGenerationProvider implements ContentGenerationProviderStrategy {
  readonly provider = ContentProvider.generic;

  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    return {
      providerJobId: `generic-${request.contentJobId}`,
      providerPayload: { provider: this.provider, version: 'v1-stub' },
      normalizedContent: {
        title: `${request.title} | Generic`,
        body: `Generated generic content for keyword "${request.keyword}".`
      }
    };
  }
}
