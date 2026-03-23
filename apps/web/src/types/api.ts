export type Project = {
  id: string;
  name: string;
  domain: string;
  niche: string;
  language: string;
  desiredTheme?: string | null;
  initialPages: string[];
  defaultPlugins: string[];
  installationType: string;
  status: 'draft' | 'provisioning' | 'ready' | 'failed' | 'paused';
  wordpressConnection: 'unknown' | 'connected' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export type ProjectListResponse = {
  data: Project[];
  total: number;
};

export type ContentJob = {
  id: string;
  projectId: string;
  title: string;
  keyword: string;
  provider: string;
  status:
    | 'pending'
    | 'sending_to_generation'
    | 'generated'
    | 'posted_to_wordpress'
    | 'review_pending'
    | 'published'
    | 'failed';
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WordpressInstallation = {
  id: string;
  projectId: string;
  method: 'ssh_wp_cli' | 'softaculous_api' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed';
  wpSiteUrl?: string | null;
  wpAdminUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SystemLog = {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  createdAt: string;
};
