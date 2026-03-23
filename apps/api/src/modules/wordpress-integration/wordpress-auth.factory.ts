import { BadRequestException, Injectable } from '@nestjs/common';
import {
  WordpressAuthContext,
  WordpressAuthMethod,
  WordpressAuthStrategy
} from './interfaces/wordpress-auth-strategy.interface';

@Injectable()
export class WordpressAuthFactory {
  constructor(private readonly strategies: WordpressAuthStrategy[]) {}

  buildAuthHeaders(context: WordpressAuthContext): Record<string, string> {
    const strategy = this.strategies.find((item) => item.supports(context.method as WordpressAuthMethod));

    if (!strategy) {
      throw new BadRequestException(`Unsupported WordPress auth method: ${context.method}`);
    }

    return strategy.buildHeaders(context);
  }
}
