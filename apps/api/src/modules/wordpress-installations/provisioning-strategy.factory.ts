import { Injectable, NotImplementedException } from '@nestjs/common';
import { ProvisioningMethod } from '@prisma/client';
import { ProvisioningStrategy } from './interfaces/provisioning-strategy.interface';
import { ManualProvisioningStrategy } from './strategies/manual-provisioning.strategy';
import { SoftaculousProvisioningStrategy } from './strategies/softaculous-provisioning.strategy';
import { SshWpCliProvisioningStrategy } from './strategies/ssh-wp-cli-provisioning.strategy';

@Injectable()
export class ProvisioningStrategyFactory {
  constructor(
    private readonly manualStrategy: ManualProvisioningStrategy,
    private readonly sshWpCliStrategy: SshWpCliProvisioningStrategy,
    private readonly softaculousStrategy: SoftaculousProvisioningStrategy
  ) {}

  resolve(method: ProvisioningMethod): ProvisioningStrategy {
    const strategy = [this.manualStrategy, this.sshWpCliStrategy, this.softaculousStrategy].find(
      (item) => item.method === method
    );

    if (!strategy) {
      throw new NotImplementedException(`Provisioning strategy not implemented for method "${method}"`);
    }

    return strategy;
  }
}
