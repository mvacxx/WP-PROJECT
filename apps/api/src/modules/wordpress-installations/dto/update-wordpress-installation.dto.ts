import { PartialType } from '@nestjs/mapped-types';
import { CreateWordpressInstallationDto } from './create-wordpress-installation.dto';

export class UpdateWordpressInstallationDto extends PartialType(CreateWordpressInstallationDto) {}
