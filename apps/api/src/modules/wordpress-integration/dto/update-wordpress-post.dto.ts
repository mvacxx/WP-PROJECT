import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseWordpressRequestDto } from './base-wordpress-request.dto';

export class UpdateWordpressPostDto extends BaseWordpressRequestDto {
  @IsOptional()
  @IsIn(['draft', 'publish', 'future', 'pending', 'private'])
  status?: 'draft' | 'publish' | 'future' | 'pending' | 'private';

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categories?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tags?: number[];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;
}
