import { BadRequestException } from '@nestjs/common';
import { ProvisioningStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { assertProvisioningTransition } from './provisioning-status-machine';

describe('assertProvisioningTransition', () => {
  it('allows valid transitions', () => {
    expect(() => assertProvisioningTransition(ProvisioningStatus.pending, ProvisioningStatus.running)).not.toThrow();
    expect(() => assertProvisioningTransition(ProvisioningStatus.running, ProvisioningStatus.completed)).not.toThrow();
    expect(() => assertProvisioningTransition(ProvisioningStatus.running, ProvisioningStatus.failed)).not.toThrow();
    expect(() => assertProvisioningTransition(ProvisioningStatus.failed, ProvisioningStatus.running)).not.toThrow();
  });

  it('rejects invalid transitions', () => {
    expect(() =>
      assertProvisioningTransition(ProvisioningStatus.completed, ProvisioningStatus.running)
    ).toThrowError(BadRequestException);
    expect(() => assertProvisioningTransition(ProvisioningStatus.pending, ProvisioningStatus.completed)).toThrowError(
      BadRequestException
    );
  });
});
