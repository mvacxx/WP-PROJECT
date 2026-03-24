import { IsIn, IsOptional, IsString } from 'class-validator';
import { BaseWordpressRequestDto } from './base-wordpress-request.dto';

export class UpsertWordpressPageDto extends BaseWordpressRequestDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsIn(['draft', 'publish'])
  status?: 'draft' | 'publish';
}
