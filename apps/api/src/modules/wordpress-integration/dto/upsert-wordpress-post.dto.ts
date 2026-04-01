import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseWordpressRequestDto } from './base-wordpress-request.dto';

export class UpsertWordpressPostDto extends BaseWordpressRequestDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsIn(['draft', 'publish', 'future', 'pending', 'private'])
  status?: 'draft' | 'publish' | 'future' | 'pending' | 'private';

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categories?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tags?: number[];
}
