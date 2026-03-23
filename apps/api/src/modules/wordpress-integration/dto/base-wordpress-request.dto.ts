import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { WordpressAuthDto } from './wordpress-auth.dto';

export class BaseWordpressRequestDto {
  @IsUrl({ require_tld: false })
  @IsString()
  @IsNotEmpty()
  siteUrl!: string;

  @ValidateNested()
  @Type(() => WordpressAuthDto)
  auth!: WordpressAuthDto;
}
