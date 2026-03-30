import { NotImplementedException } from '@nestjs/common';
import { ProvisioningMethod } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { ProvisioningStrategyFactory } from './provisioning-strategy.factory';
import { ManualProvisioningStrategy } from './strategies/manual-provisioning.strategy';
import { SoftaculousProvisioningStrategy } from './strategies/softaculous-provisioning.strategy';
import { SshWpCliProvisioningStrategy } from './strategies/ssh-wp-cli-provisioning.strategy';

describe('ProvisioningStrategyFactory', () => {
  const factory = new ProvisioningStrategyFactory(
    new ManualProvisioningStrategy(),
    new SshWpCliProvisioningStrategy(),
    new SoftaculousProvisioningStrategy()
  );

  it('resolves manual strategy', () => {
    const strategy = factory.resolve(ProvisioningMethod.manual);
    expect(strategy.method).toBe(ProvisioningMethod.manual);
  });

  it('resolves ssh wp-cli strategy', () => {
    const strategy = factory.resolve(ProvisioningMethod.ssh_wp_cli);
    expect(strategy.method).toBe(ProvisioningMethod.ssh_wp_cli);
  });

  it('throws for unsupported strategy', () => {
    expect(() => factory.resolve('unsupported' as ProvisioningMethod)).toThrowError(NotImplementedException);
  });
});
