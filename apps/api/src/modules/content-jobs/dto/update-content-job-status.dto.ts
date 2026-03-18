import { ContentJobStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateContentJobStatusDto {
  @IsEnum(ContentJobStatus)
  status!: ContentJobStatus;

  @IsOptional()
  @IsString()
  failureReason?: string;
}
