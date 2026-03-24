import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(255)
  domain!: string;

  @IsString()
  @MaxLength(120)
  niche!: string;

  @IsString()
  @MaxLength(20)
  language!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  desiredTheme?: string;

  @IsArray()
  @IsString({ each: true })
  initialPages!: string[];

  @IsArray()
  @IsString({ each: true })
  defaultPlugins!: string[];

  @IsString()
  @MaxLength(80)
  installationType!: string;
}
