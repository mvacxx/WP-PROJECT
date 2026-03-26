import { Injectable } from '@nestjs/common';
import { LogLevel, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  private toJsonValue(
    metadata?: Record<string, unknown>
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    return metadata as Prisma.InputJsonValue | undefined;
  }

  createSystemLog(dto: CreateSystemLogDto) {
    return this.prisma.systemLog.create({
      data: {
        ...dto,
        metadata: this.toJsonValue(dto.metadata)
      }
    });
  }

  createContentLog(jobId: string, level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    return this.prisma.contentLog.create({
      data: {
        jobId,
        level,
        message,
        metadata: this.toJsonValue(metadata)
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
