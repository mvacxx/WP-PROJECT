import { BadRequestException, Injectable } from '@nestjs/common';
import { ProvisioningMethod } from '@prisma/client';
import {
  ProvisioningExecutionContext,
  ProvisioningExecutionResult,
  ProvisioningStrategy
} from '../interfaces/provisioning-strategy.interface';

@Injectable()
export class SshWpCliProvisioningStrategy implements ProvisioningStrategy {
  readonly method = ProvisioningMethod.ssh_wp_cli;

  async execute(context: ProvisioningExecutionContext): Promise<ProvisioningExecutionResult> {
    if (!context.sshHost || !context.sshUsername || !context.sshPrivateKey) {
      throw new BadRequestException('SSH WP-CLI provisioning requires sshHost, sshUsername and sshPrivateKey');
    }

    return {
      message: 'SSH WP-CLI provisioning validated',
      metadata: {
        sshHost: context.sshHost,
        sshPort: context.sshPort ?? 22,
        sshUsername: context.sshUsername
      }
    };
  }
}
