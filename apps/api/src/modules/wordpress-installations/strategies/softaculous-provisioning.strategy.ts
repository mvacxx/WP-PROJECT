import { BadRequestException, Injectable } from '@nestjs/common';
import { ProvisioningMethod } from '@prisma/client';
import {
  ProvisioningExecutionContext,
  ProvisioningExecutionResult,
  ProvisioningStrategy
} from '../interfaces/provisioning-strategy.interface';

@Injectable()
export class SoftaculousProvisioningStrategy implements ProvisioningStrategy {
  readonly method = ProvisioningMethod.softaculous_api;

  async execute(context: ProvisioningExecutionContext): Promise<ProvisioningExecutionResult> {
    if (!context.wpSiteUrl || !context.wpUsername) {
      throw new BadRequestException('Softaculous provisioning requires wpSiteUrl and wpUsername');
    }

    return {
      message: 'Softaculous provisioning validated',
      metadata: {
        wpSiteUrl: context.wpSiteUrl,
        wpUsername: context.wpUsername
      }
    };
  }
}
