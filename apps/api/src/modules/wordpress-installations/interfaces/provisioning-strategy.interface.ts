import { ProvisioningMethod, ProvisioningStatus } from '@prisma/client';

export type ProvisioningExecutionContext = {
  id: string;
  projectId: string;
  method: ProvisioningMethod;
  status: ProvisioningStatus;
  wpSiteUrl: string | null;
  wpAdminUrl: string | null;
  wpUsername: string | null;
  wpApplicationPassword: string | null;
  sshHost: string | null;
  sshPort: number | null;
  sshUsername: string | null;
  sshPrivateKey: string | null;
  timezone: string | null;
  permalinkStructure: string | null;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProvisioningExecutionResult = {
  message: string;
  metadata?: Record<string, unknown>;
};

export interface ProvisioningStrategy {
  readonly method: ProvisioningMethod;
  execute(context: ProvisioningExecutionContext): Promise<ProvisioningExecutionResult>;
}
