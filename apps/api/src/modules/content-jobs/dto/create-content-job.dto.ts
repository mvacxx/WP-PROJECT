import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContentJobDto {
  @IsString()
  projectId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(160)
  keyword!: string;

  @IsString()
  @MaxLength(80)
  provider!: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
