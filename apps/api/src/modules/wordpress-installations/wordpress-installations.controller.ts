import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProvisioningStatus, WordpressConnectionStatus } from '@prisma/client';
import { CreateWordpressInstallationDto } from './dto/create-wordpress-installation.dto';
import { TestWordpressConnectionDto } from './dto/test-connection.dto';
import { UpdateWordpressInstallationDto } from './dto/update-wordpress-installation.dto';
import { WordpressInstallationsService } from './wordpress-installations.service';

@Controller('wordpress-installations')
export class WordpressInstallationsController {
  constructor(private readonly wordpressInstallationsService: WordpressInstallationsService) {}

  @Post()
  create(@Body() dto: CreateWordpressInstallationDto) {
    return this.wordpressInstallationsService.create(dto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.wordpressInstallationsService.findByProject(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWordpressInstallationDto) {
    return this.wordpressInstallationsService.update(id, dto);
  }

  @Patch(':id/status/:status')
  updateStatus(@Param('id') id: string, @Param('status') status: ProvisioningStatus) {
    return this.wordpressInstallationsService.updateStatus(id, status);
  }

  @Post('test-connection')
  async testConnection(@Body() dto: TestWordpressConnectionDto) {
    const result = await this.wordpressInstallationsService.testConnection(dto);

    return {
      ...result,
      connectionStatus: result.connected ? WordpressConnectionStatus.connected : WordpressConnectionStatus.failed
    };
  }

  @Patch('project/:projectId/connection/:status')
  markProjectConnection(
    @Param('projectId') projectId: string,
    @Param('status') status: WordpressConnectionStatus
  ) {
    return this.wordpressInstallationsService.markConnection(projectId, status);
  }
}
