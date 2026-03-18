import { LogLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSystemLogDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsEnum(LogLevel)
  level!: LogLevel;

  @IsString()
  source!: string;

  @IsString()
  message!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
