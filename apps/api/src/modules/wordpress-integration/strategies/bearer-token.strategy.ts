import { BadRequestException, Injectable } from '@nestjs/common';
import {
  WordpressAuthContext,
  WordpressAuthMethod,
  WordpressAuthStrategy
} from '../interfaces/wordpress-auth-strategy.interface';

@Injectable()
export class BearerTokenStrategy implements WordpressAuthStrategy {
  supports(method: WordpressAuthMethod): boolean {
    return method === 'bearer_token';
  }

  buildHeaders(context: WordpressAuthContext): Record<string, string> {
    if (!context.bearerToken) {
      throw new BadRequestException('bearerToken is required for bearer_token auth');
    }

    return {
      Authorization: `Bearer ${context.bearerToken}`
    };
  }
}
