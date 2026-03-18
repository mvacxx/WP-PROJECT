import { ContentJob, Project, ProjectListResponse, SystemLog, WordpressInstallation } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_API_KEY ? { 'x-admin-api-key': ADMIN_API_KEY } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listProjects() {
    return request<ProjectListResponse>('/projects');
  },

  createProject(payload: {
    name: string;
    domain: string;
    niche: string;
    language: string;
    desiredTheme?: string;
    initialPages: string[];
    defaultPlugins: string[];
    installationType: string;
  }) {
    return request<Project>('/projects', { method: 'POST', body: payload });
  },

  getProject(projectId: string) {
    return request<Project>(`/projects/${projectId}`);
  },

  updateProject(projectId: string, payload: Partial<Project>) {
    return request<Project>(`/projects/${projectId}`, { method: 'PATCH', body: payload });
  },

  listProjectInstallations(projectId: string) {
    return request<WordpressInstallation[]>(`/wordpress-installations/project/${projectId}`);
  },

  createInstallation(payload: {
    projectId: string;
    method: 'ssh_wp_cli' | 'softaculous_api' | 'manual';
    wpSiteUrl?: string;
    wpAdminUrl?: string;
    wpUsername?: string;
    wpApplicationPasswordEnc?: string;
    sshHost?: string;
    sshPort?: number;
    sshUsername?: string;
    sshPrivateKeyEnc?: string;
    timezone?: string;
    permalinkStructure?: string;
  }) {
    return request<WordpressInstallation>('/wordpress-installations', { method: 'POST', body: payload });
  },

  updateInstallationStatus(installationId: string, status: 'pending' | 'running' | 'completed' | 'failed') {
    return request<WordpressInstallation>(`/wordpress-installations/${installationId}/status/${status}`, {
      method: 'PATCH'
    });
  },

  listContentJobs(projectId: string) {
    return request<ContentJob[]>(`/content-jobs?projectId=${projectId}`);
  },

  createContentJob(payload: {
    projectId: string;
    title: string;
    keyword: string;
    provider: string;
    scheduledAt?: string;
  }) {
    return request<ContentJob>('/content-jobs', { method: 'POST', body: payload });
  },

  listSystemLogs(projectId: string) {
    return request<SystemLog[]>(`/logs/system?projectId=${projectId}`);
  }
};
