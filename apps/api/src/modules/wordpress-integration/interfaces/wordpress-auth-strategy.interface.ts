export type WordpressAuthMethod = 'application_password' | 'bearer_token';

export type WordpressAuthContext = {
  method: WordpressAuthMethod;
  username?: string;
  applicationPassword?: string;
  bearerToken?: string;
};

export interface WordpressAuthStrategy {
  supports(method: WordpressAuthMethod): boolean;
  buildHeaders(context: WordpressAuthContext): Record<string, string>;
}
