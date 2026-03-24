import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestActor, RequestActorType } from '../interfaces/request-actor.interface';

type GuardRequest = {
  headers: Record<string, string | undefined>;
  actor?: RequestActor;
};

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<GuardRequest>();

    const requestedScope = this.readScope(request.headers['x-auth-scope']);
    const adminKey = request.headers['x-admin-api-key'];
    const systemKey = request.headers['x-system-api-key'];

    const expectedAdminKey = this.configService.get<string>('ADMIN_API_KEY');
    const expectedSystemKey = this.configService.get<string>('SYSTEM_API_KEY') ?? expectedAdminKey;

    const humanIsValid = !!expectedAdminKey && adminKey === expectedAdminKey;
    const systemIsValid = !!expectedSystemKey && systemKey === expectedSystemKey;

    if (requestedScope === 'human' && !humanIsValid) {
      throw new UnauthorizedException('Invalid admin credential');
    }

    if (requestedScope === 'system' && !systemIsValid) {
      throw new UnauthorizedException('Invalid system credential');
    }

    if (!requestedScope && !humanIsValid && !systemIsValid) {
      throw new UnauthorizedException('Missing or invalid authentication key');
    }

    if (humanIsValid) {
      request.actor = { type: 'human', id: 'admin_api_key' };
      return true;
    }

    if (systemIsValid) {
      request.actor = { type: 'system', id: 'system_api_key' };
      return true;
    }

    throw new UnauthorizedException('Authentication failed');
  }

  private readScope(rawScope?: string): RequestActorType | null {
    if (!rawScope) return null;
    if (rawScope !== 'human' && rawScope !== 'system') {
      throw new UnauthorizedException('Invalid x-auth-scope. Use human or system.');
    }

    return rawScope;
  }
}
