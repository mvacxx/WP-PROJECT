import { ContentProvider } from '@prisma/client';

export type ContentGenerationRequest = {
  contentJobId: string;
  title: string;
  keyword: string;
};

export type ContentGenerationResult = {
  providerJobId: string;
  providerPayload: Record<string, unknown>;
  normalizedContent: Record<string, unknown>;
};

export interface ContentGenerationProviderStrategy {
  readonly provider: ContentProvider;
  generate(request: ContentGenerationRequest): Promise<ContentGenerationResult>;
}
