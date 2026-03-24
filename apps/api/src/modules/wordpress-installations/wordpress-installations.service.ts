import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProvisioningStatus, WordpressConnectionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SecretsService } from '../../common/secrets/secrets.service';
import { CreateWordpressInstallationDto } from './dto/create-wordpress-installation.dto';
import { UpdateWordpressInstallationDto } from './dto/update-wordpress-installation.dto';
import { TestWordpressConnectionDto } from './dto/test-connection.dto';

type SafeWordpressInstallation = {
  id: string;
  projectId: string;
  method: string;
  status: string;
  wpSiteUrl: string | null;
  wpAdminUrl: string | null;
  wpUsername: string | null;
  sshHost: string | null;
  sshPort: number | null;
  sshUsername: string | null;
  timezone: string | null;
  permalinkStructure: string | null;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hasWpApplicationPassword: boolean;
  hasSshPrivateKey: boolean;
};

@Injectable()
export class WordpressInstallationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly secretsService: SecretsService
  ) {}

  async create(dto: CreateWordpressInstallationDto): Promise<SafeWordpressInstallation> {
    const installation = await this.prisma.wordpressInstallation.create({
      data: {
        projectId: dto.projectId,
        method: dto.method,
        wpSiteUrl: dto.wpSiteUrl,
        wpAdminUrl: dto.wpAdminUrl,
        wpUsername: dto.wpUsername,
        wpApplicationPasswordEnc: dto.wpApplicationPassword
          ? this.secretsService.encrypt(dto.wpApplicationPassword)
          : undefined,
        sshHost: dto.sshHost,
        sshPort: dto.sshPort,
        sshUsername: dto.sshUsername,
        sshPrivateKeyEnc: dto.sshPrivateKey ? this.secretsService.encrypt(dto.sshPrivateKey) : undefined,
        timezone: dto.timezone,
        permalinkStructure: dto.permalinkStructure
      }
    });

    return this.toSafeInstallation(installation);
  }

  async findByProject(projectId: string): Promise<SafeWordpressInstallation[]> {
    const installations = await this.prisma.wordpressInstallation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return installations.map((item) => this.toSafeInstallation(item));
  }

  async update(id: string, dto: UpdateWordpressInstallationDto): Promise<SafeWordpressInstallation> {
    await this.ensureExists(id);

    const installation = await this.prisma.wordpressInstallation.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        method: dto.method,
        wpSiteUrl: dto.wpSiteUrl,
        wpAdminUrl: dto.wpAdminUrl,
        wpUsername: dto.wpUsername,
        wpApplicationPasswordEnc: dto.wpApplicationPassword
          ? this.secretsService.encrypt(dto.wpApplicationPassword)
          : undefined,
        sshHost: dto.sshHost,
        sshPort: dto.sshPort,
        sshUsername: dto.sshUsername,
        sshPrivateKeyEnc: dto.sshPrivateKey ? this.secretsService.encrypt(dto.sshPrivateKey) : undefined,
        timezone: dto.timezone,
        permalinkStructure: dto.permalinkStructure
      } as Prisma.WordpressInstallationUncheckedUpdateInput
    });

    return this.toSafeInstallation(installation);
  }

  async updateStatus(id: string, status: ProvisioningStatus): Promise<SafeWordpressInstallation> {
    await this.ensureExists(id);

    const installation = await this.prisma.wordpressInstallation.update({
      where: { id },
      data: { status }
    });

    return this.toSafeInstallation(installation);
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

  private toSafeInstallation(installation: {
    id: string;
    projectId: string;
    method: string;
    status: string;
    wpSiteUrl: string | null;
    wpAdminUrl: string | null;
    wpUsername: string | null;
    wpApplicationPasswordEnc: string | null;
    sshHost: string | null;
    sshPort: number | null;
    sshUsername: string | null;
    sshPrivateKeyEnc: string | null;
    timezone: string | null;
    permalinkStructure: string | null;
    lastSyncAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): SafeWordpressInstallation {
    return {
      id: installation.id,
      projectId: installation.projectId,
      method: installation.method,
      status: installation.status,
      wpSiteUrl: installation.wpSiteUrl,
      wpAdminUrl: installation.wpAdminUrl,
      wpUsername: installation.wpUsername,
      sshHost: installation.sshHost,
      sshPort: installation.sshPort,
      sshUsername: installation.sshUsername,
      timezone: installation.timezone,
      permalinkStructure: installation.permalinkStructure,
      lastSyncAt: installation.lastSyncAt,
      createdAt: installation.createdAt,
      updatedAt: installation.updatedAt,
      hasWpApplicationPassword: !!installation.wpApplicationPasswordEnc,
      hasSshPrivateKey: !!installation.sshPrivateKeyEnc
    };
  }
}
