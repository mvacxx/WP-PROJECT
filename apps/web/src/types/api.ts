export type Project = {
  id: string;
  name: string;
  domain: string;
  niche: string;
  language: string;
  desiredTheme?: string | null;
  initialPages: string[];
  defaultPlugins: string[];
  installationType: 'vps' | 'shared_hosting' | 'cloud' | 'manual';
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
  provider: 'seowriting' | 'manual' | 'generic';
  providerJobId?: string | null;
  providerStatus: 'queued' | 'processing' | 'completed' | 'failed' | 'unknown';
  targetPublishMode: 'manual_review' | 'auto_publish' | 'scheduled';
  attemptCount: number;
  lastAttemptAt?: string | null;
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
  hasWpApplicationPassword: boolean;
  hasSshPrivateKey: boolean;
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
