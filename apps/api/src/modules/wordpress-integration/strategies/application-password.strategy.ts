import { BadRequestException, Injectable } from '@nestjs/common';
import {
  WordpressAuthContext,
  WordpressAuthMethod,
  WordpressAuthStrategy
} from '../interfaces/wordpress-auth-strategy.interface';

@Injectable()
export class ApplicationPasswordStrategy implements WordpressAuthStrategy {
  supports(method: WordpressAuthMethod): boolean {
    return method === 'application_password';
  }

  buildHeaders(context: WordpressAuthContext): Record<string, string> {
    if (!context.username || !context.applicationPassword) {
      throw new BadRequestException('username and applicationPassword are required for application_password auth');
    }

    const token = Buffer.from(`${context.username}:${context.applicationPassword}`).toString('base64');

    return {
      Authorization: `Basic ${token}`
    };
  }
}
