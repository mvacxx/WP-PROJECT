import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const installationTypes = ['vps', 'shared_hosting', 'cloud', 'manual'] as const;

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

  @IsIn(installationTypes)
  installationType!: (typeof installationTypes)[number];
}
