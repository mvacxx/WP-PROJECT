import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { ApplicationPasswordStrategy } from './strategies/application-password.strategy';
import { BearerTokenStrategy } from './strategies/bearer-token.strategy';
import { WordpressAuthFactory } from './wordpress-auth.factory';
import { WordpressHttpClient } from './wordpress-http.client';
import { WordpressIntegrationController } from './wordpress-integration.controller';
import { WordpressIntegrationService } from './wordpress-integration.service';
import { WordpressAuthStrategy } from './interfaces/wordpress-auth-strategy.interface';

@Module({
  imports: [LogsModule],
  controllers: [WordpressIntegrationController],
  providers: [
    ApplicationPasswordStrategy,
    BearerTokenStrategy,
    {
      provide: WordpressAuthFactory,
      useFactory: (
        applicationPassword: ApplicationPasswordStrategy,
        bearerToken: BearerTokenStrategy
      ) => new WordpressAuthFactory([applicationPassword, bearerToken] as WordpressAuthStrategy[]),
      inject: [ApplicationPasswordStrategy, BearerTokenStrategy]
    },
    WordpressHttpClient,
    WordpressIntegrationService
  ],
  exports: [WordpressIntegrationService]
})
export class WordpressIntegrationModule {}
