import { Module } from '@nestjs/common';
import { WordpressInstallationsController } from './wordpress-installations.controller';
import { WordpressInstallationsService } from './wordpress-installations.service';

@Module({
  controllers: [WordpressInstallationsController],
  providers: [WordpressInstallationsService],
  exports: [WordpressInstallationsService]
})
export class WordpressInstallationsModule {}
