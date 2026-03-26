import { Injectable, NotFoundException } from '@nestjs/common';
import {
  LogLevel,
  Prisma,
  ProvisioningMethod,
  ProvisioningStatus,
  WordpressConnectionStatus
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SecretsService } from '../../common/secrets/secrets.service';
import { LogsService } from '../logs/logs.service';
import { CreateWordpressInstallationDto } from './dto/create-wordpress-installation.dto';
import { UpdateWordpressInstallationDto } from './dto/update-wordpress-installation.dto';
import { TestWordpressConnectionDto } from './dto/test-connection.dto';
import { ProvisioningStrategyFactory } from './provisioning-strategy.factory';
import { assertProvisioningTransition } from './provisioning-status-machine';

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
    private readonly secretsService: SecretsService,
    private readonly logsService: LogsService,
    private readonly provisioningStrategyFactory: ProvisioningStrategyFactory
  ) {}

  async create(dto: CreateWordpressInstallationDto): Promise<SafeWordpressInstallation> {
    const existing = await this.prisma.wordpressInstallation.findFirst({
      where: {
        projectId: dto.projectId,
        method: dto.method,
        status: {
          in: [ProvisioningStatus.pending, ProvisioningStatus.running]
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existing) {
      return this.toSafeInstallation(existing);
    }

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
    const existing = await this.prisma.wordpressInstallation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('WordPress installation not found');
    }

    assertProvisioningTransition(existing.status, status);

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

  async provision(id: string): Promise<SafeWordpressInstallation> {
    const installation = await this.prisma.wordpressInstallation.findUnique({ where: { id } });
    if (!installation) {
      throw new NotFoundException('WordPress installation not found');
    }

    assertProvisioningTransition(installation.status, ProvisioningStatus.running);

    await this.prisma.wordpressInstallation.update({
      where: { id },
      data: { status: ProvisioningStatus.running }
    });

    try {
      const strategy = this.provisioningStrategyFactory.resolve(installation.method);
      const result = await strategy.execute(this.toProvisioningContext(installation));

      const updated = await this.prisma.wordpressInstallation.update({
        where: { id },
        data: {
          status: ProvisioningStatus.completed,
          lastSyncAt: new Date()
        }
      });

      await this.logsService.createSystemLog({
        projectId: installation.projectId,
        level: LogLevel.info,
        source: 'wordpress-provisioning',
        message: result.message,
        metadata: {
          installationId: installation.id,
          method: installation.method,
          ...result.metadata
        }
      });

      return this.toSafeInstallation(updated);
    } catch (error) {
      await this.prisma.wordpressInstallation.update({
        where: { id },
        data: { status: ProvisioningStatus.failed }
      });

      await this.logsService.createSystemLog({
        projectId: installation.projectId,
        level: LogLevel.error,
        source: 'wordpress-provisioning',
        message: error instanceof Error ? error.message : 'Provisioning failed',
        metadata: {
          installationId: installation.id,
          method: installation.method
        }
      });

      throw error;
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.wordpressInstallation.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('WordPress installation not found');
    }
  }

  private toProvisioningContext(installation: {
    id: string;
    projectId: string;
    method: ProvisioningMethod;
    status: ProvisioningStatus;
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
  }) {
    return {
      id: installation.id,
      projectId: installation.projectId,
      method: installation.method,
      status: installation.status,
      wpSiteUrl: installation.wpSiteUrl,
      wpAdminUrl: installation.wpAdminUrl,
      wpUsername: installation.wpUsername,
      wpApplicationPassword: installation.wpApplicationPasswordEnc
        ? this.secretsService.decrypt(installation.wpApplicationPasswordEnc)
        : null,
      sshHost: installation.sshHost,
      sshPort: installation.sshPort,
      sshUsername: installation.sshUsername,
      sshPrivateKey: installation.sshPrivateKeyEnc
        ? this.secretsService.decrypt(installation.sshPrivateKeyEnc)
        : null,
      timezone: installation.timezone,
      permalinkStructure: installation.permalinkStructure,
      lastSyncAt: installation.lastSyncAt,
      createdAt: installation.createdAt,
      updatedAt: installation.updatedAt
    };
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
