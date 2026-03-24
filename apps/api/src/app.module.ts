import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.config';
import { AdminApiKeyGuard } from './common/guards/admin-api-key.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { HealthModule } from './health/health.module';
import { ContentJobsModule } from './modules/content-jobs/content-jobs.module';
import { LogsModule } from './modules/logs/logs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { QueueModule } from './modules/queue/queue.module';
import { WordpressInstallationsModule } from './modules/wordpress-installations/wordpress-installations.module';
import { WordpressIntegrationModule } from './modules/wordpress-integration/wordpress-integration.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    PrismaModule,
    HealthModule,
    LogsModule,
    QueueModule,
    ProjectsModule,
    WordpressInstallationsModule,
    WordpressIntegrationModule,
    ContentJobsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AdminApiKeyGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor
    }
  ]
})
export class AppModule {}
