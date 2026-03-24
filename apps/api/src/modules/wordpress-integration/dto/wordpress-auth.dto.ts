import { IsIn, IsOptional, IsString } from 'class-validator';
import { WordpressAuthMethod } from '../interfaces/wordpress-auth-strategy.interface';

export class WordpressAuthDto {
  @IsIn(['application_password', 'bearer_token'])
  method!: WordpressAuthMethod;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  applicationPassword?: string;

  @IsOptional()
  @IsString()
  bearerToken?: string;
}
