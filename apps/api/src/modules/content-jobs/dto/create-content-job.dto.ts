import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const contentProviders = ['seowriting', 'manual', 'generic'] as const;
const publishModes = ['manual_review', 'auto_publish', 'scheduled'] as const;

export class CreateContentJobDto {
  @IsString()
  projectId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(160)
  keyword!: string;

  @IsIn(contentProviders)
  provider!: (typeof contentProviders)[number];

  @IsOptional()
  @IsIn(publishModes)
  targetPublishMode?: (typeof publishModes)[number];

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
