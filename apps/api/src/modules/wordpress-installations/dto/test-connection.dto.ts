import { IsString, IsUrl } from 'class-validator';

export class TestWordpressConnectionDto {
  @IsUrl({ require_tld: false })
  wpSiteUrl!: string;

  @IsString()
  username!: string;

  @IsString()
  appPassword!: string;
}
