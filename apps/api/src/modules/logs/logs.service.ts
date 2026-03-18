import { Injectable } from '@nestjs/common';
import { LogLevel } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  createSystemLog(dto: CreateSystemLogDto) {
    return this.prisma.systemLog.create({
      data: {
        ...dto,
        metadata: dto.metadata
      }
    });
  }

  createContentLog(jobId: string, level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    return this.prisma.contentLog.create({
      data: {
        jobId,
        level,
        message,
        metadata
      }
    });
  }

  findSystemLogs(query: PaginationQueryDto, projectId?: string) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    return this.prisma.systemLog.findMany({
      where: {
        projectId
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }

  findContentLogs(jobId: string) {
    return this.prisma.contentLog.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
