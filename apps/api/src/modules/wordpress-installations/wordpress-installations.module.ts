import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { ProvisioningStrategyFactory } from './provisioning-strategy.factory';
import { ManualProvisioningStrategy } from './strategies/manual-provisioning.strategy';
import { SoftaculousProvisioningStrategy } from './strategies/softaculous-provisioning.strategy';
import { SshWpCliProvisioningStrategy } from './strategies/ssh-wp-cli-provisioning.strategy';
import { WordpressInstallationsController } from './wordpress-installations.controller';
import { WordpressInstallationsService } from './wordpress-installations.service';

@Module({
  imports: [LogsModule],
  controllers: [WordpressInstallationsController],
  providers: [
    WordpressInstallationsService,
    ProvisioningStrategyFactory,
    ManualProvisioningStrategy,
    SshWpCliProvisioningStrategy,
    SoftaculousProvisioningStrategy
  ],
  exports: [WordpressInstallationsService]
})
export class WordpressInstallationsModule {}
