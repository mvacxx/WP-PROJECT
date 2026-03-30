import { BadRequestException, Injectable } from '@nestjs/common';
import { ProvisioningMethod } from '@prisma/client';
import {
  ProvisioningExecutionContext,
  ProvisioningExecutionResult,
  ProvisioningStrategy
} from '../interfaces/provisioning-strategy.interface';

@Injectable()
export class ManualProvisioningStrategy implements ProvisioningStrategy {
  readonly method = ProvisioningMethod.manual;

  async execute(context: ProvisioningExecutionContext): Promise<ProvisioningExecutionResult> {
    if (!context.wpSiteUrl) {
      throw new BadRequestException('Manual provisioning requires wpSiteUrl');
    }

    return {
      message: 'Manual provisioning confirmed',
      metadata: {
        wpSiteUrl: context.wpSiteUrl
      }
    };
  }
}
