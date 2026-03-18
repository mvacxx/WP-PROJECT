import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProvisioningStatus, WordpressConnectionStatus, WordpressInstallation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWordpressInstallationDto } from './dto/create-wordpress-installation.dto';
import { UpdateWordpressInstallationDto } from './dto/update-wordpress-installation.dto';
import { TestWordpressConnectionDto } from './dto/test-connection.dto';

@Injectable()
export class WordpressInstallationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWordpressInstallationDto): Promise<WordpressInstallation> {
    return this.prisma.wordpressInstallation.create({
      data: dto as Prisma.WordpressInstallationUncheckedCreateInput
    });
  }

  async findByProject(projectId: string): Promise<WordpressInstallation[]> {
    return this.prisma.wordpressInstallation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, dto: UpdateWordpressInstallationDto): Promise<WordpressInstallation> {
    await this.ensureExists(id);

    return this.prisma.wordpressInstallation.update({
      where: { id },
      data: dto as Prisma.WordpressInstallationUncheckedUpdateInput
    });
  }

  async updateStatus(id: string, status: ProvisioningStatus): Promise<WordpressInstallation> {
    await this.ensureExists(id);

    return this.prisma.wordpressInstallation.update({
      where: { id },
      data: { status }
    });
  }

  async testConnection(dto: TestWordpressConnectionDto): Promise<{ connected: boolean; statusCode?: number }> {
    const basicToken = Buffer.from(`${dto.username}:${dto.appPassword}`).toString('base64');
    const response = await fetch(`${dto.wpSiteUrl}/wp-json/wp/v2/posts?per_page=1`, {
      headers: {
        Authorization: `Basic ${basicToken}`
      }
    });

    return {
      connected: response.ok,
      statusCode: response.status
    };
  }

  async markConnection(projectId: string, status: WordpressConnectionStatus): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { wordpressConnection: status }
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.wordpressInstallation.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('WordPress installation not found');
    }
  }
}
