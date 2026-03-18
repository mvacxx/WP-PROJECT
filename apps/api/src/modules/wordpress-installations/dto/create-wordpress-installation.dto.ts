import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum ProvisioningMethodDto {
  ssh_wp_cli = 'ssh_wp_cli',
  softaculous_api = 'softaculous_api',
  manual = 'manual'
}

export class CreateWordpressInstallationDto {
  @IsString()
  projectId!: string;

  @IsEnum(ProvisioningMethodDto)
  method!: ProvisioningMethodDto;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  wpSiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  wpAdminUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  wpUsername?: string;

  @IsOptional()
  @IsString()
  wpApplicationPasswordEnc?: string;

  @IsOptional()
  @IsString()
  sshHost?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sshPort?: number;

  @IsOptional()
  @IsString()
  sshUsername?: string;

  @IsOptional()
  @IsString()
  sshPrivateKeyEnc?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  permalinkStructure?: string;
}
