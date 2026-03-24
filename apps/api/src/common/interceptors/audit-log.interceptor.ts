import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogLevel } from '@prisma/client';
import { LogsService } from '../../modules/logs/logs.service';
import { RequestActor } from '../interfaces/request-actor.interface';

type AuditRequest = {
  method: string;
  originalUrl: string;
  actor?: RequestActor;
  body?: unknown;
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditRequest>();

    if (!this.shouldAudit(request.method, request.originalUrl)) {
      return next.handle();
    }

    const startedAt = Date.now();

    return next.handle().pipe(
      tap(async () => {
        try {
          await this.logsService.createSystemLog({
            source: 'audit',
            level: LogLevel.info,
            message: `${request.method} ${request.originalUrl}`,
            metadata: {
              actor: request.actor ?? { type: 'system', id: 'unknown' },
              durationMs: Date.now() - startedAt
            }
          });
        } catch (error) {
          this.logger.warn(`Failed to persist audit log: ${error instanceof Error ? error.message : String(error)}`);
        }
      })
    );
  }

  private shouldAudit(method: string, url: string): boolean {
    const auditableMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
    if (!auditableMethods.includes(method.toUpperCase())) {
      return false;
    }

    if (url.includes('/health')) {
      return false;
    }

    return true;
  }
}
