import { BadRequestException, Injectable } from '@nestjs/common';
import { ApplicationPasswordStrategy } from './strategies/application-password.strategy';
import { BearerTokenStrategy } from './strategies/bearer-token.strategy';
import { WordpressAuthContext, WordpressAuthMethod } from './interfaces/wordpress-auth-strategy.interface';

@Injectable()
export class WordpressAuthFactory {
  constructor(
    private readonly applicationPasswordStrategy: ApplicationPasswordStrategy,
    private readonly bearerTokenStrategy: BearerTokenStrategy
  ) {}

  buildAuthHeaders(context: WordpressAuthContext): Record<string, string> {
    const strategies = [this.applicationPasswordStrategy, this.bearerTokenStrategy];
    const strategy = strategies.find((item) => item.supports(context.method as WordpressAuthMethod));

    if (!strategy) {
      throw new BadRequestException(`Unsupported WordPress auth method: ${context.method}`);
    }

    return strategy.buildHeaders(context);
  }
}
