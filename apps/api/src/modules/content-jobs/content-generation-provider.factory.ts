import { Injectable, NotImplementedException } from '@nestjs/common';
import { ContentProvider } from '@prisma/client';
import { ContentGenerationProviderStrategy } from './interfaces/content-generation-provider.interface';
import { GenericContentGenerationProvider } from './providers/generic-content-generation.provider';
import { ManualContentGenerationProvider } from './providers/manual-content-generation.provider';
import { SeowritingContentGenerationProvider } from './providers/seowriting-content-generation.provider';

@Injectable()
export class ContentGenerationProviderFactory {
  constructor(
    private readonly manualProvider: ManualContentGenerationProvider,
    private readonly genericProvider: GenericContentGenerationProvider,
    private readonly seowritingProvider: SeowritingContentGenerationProvider
  ) {}

  resolve(provider: ContentProvider): ContentGenerationProviderStrategy {
    const strategy = [this.manualProvider, this.genericProvider, this.seowritingProvider].find(
      (item) => item.provider === provider
    );

    if (!strategy) {
      throw new NotImplementedException(`Content generation provider "${provider}" is not implemented`);
    }

    return strategy;
  }
}
