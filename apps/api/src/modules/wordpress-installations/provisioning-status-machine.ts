import { BadRequestException } from '@nestjs/common';
import { ProvisioningStatus } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<ProvisioningStatus, ProvisioningStatus[]> = {
  pending: [ProvisioningStatus.running, ProvisioningStatus.failed],
  running: [ProvisioningStatus.completed, ProvisioningStatus.failed],
  completed: [],
  failed: [ProvisioningStatus.running]
};

export function assertProvisioningTransition(from: ProvisioningStatus, to: ProvisioningStatus): void {
  if (from === to) {
    return;
  }

  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(`Invalid provisioning status transition from "${from}" to "${to}"`);
  }
}
