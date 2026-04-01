import { Injectable } from '@nestjs/common';
import { ContentProvider } from '@prisma/client';
import {
  ContentGenerationProviderStrategy,
  ContentGenerationRequest,
  ContentGenerationResult
} from '../interfaces/content-generation-provider.interface';

@Injectable()
export class SeowritingContentGenerationProvider implements ContentGenerationProviderStrategy {
  readonly provider = ContentProvider.seowriting;

  async generate(request: ContentGenerationRequest): Promise<ContentGenerationResult> {
    return {
      providerJobId: `seowriting-${request.contentJobId}`,
      providerPayload: { provider: this.provider, status: 'simulated' },
      normalizedContent: {
        title: `${request.title} (SEO optimized)`,
        body: `SEO-focused content generated for "${request.keyword}".`
      }
    };
  }
}
