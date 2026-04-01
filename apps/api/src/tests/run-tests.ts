import * as assert from 'node:assert/strict';
import { ProvisioningMethod, ProvisioningStatus } from '@prisma/client';
import { assertProvisioningTransition } from '../modules/wordpress-installations/provisioning-status-machine';
import { ProvisioningStrategyFactory } from '../modules/wordpress-installations/provisioning-strategy.factory';
import { ManualProvisioningStrategy } from '../modules/wordpress-installations/strategies/manual-provisioning.strategy';
import { SoftaculousProvisioningStrategy } from '../modules/wordpress-installations/strategies/softaculous-provisioning.strategy';
import { SshWpCliProvisioningStrategy } from '../modules/wordpress-installations/strategies/ssh-wp-cli-provisioning.strategy';
import { ContentGenerationProviderFactory } from '../modules/content-jobs/content-generation-provider.factory';
import { GenericContentGenerationProvider } from '../modules/content-jobs/providers/generic-content-generation.provider';
import { ManualContentGenerationProvider } from '../modules/content-jobs/providers/manual-content-generation.provider';
import { SeowritingContentGenerationProvider } from '../modules/content-jobs/providers/seowriting-content-generation.provider';

function runProvisioningStatusTests(): void {
  assert.doesNotThrow(() =>
    assertProvisioningTransition(ProvisioningStatus.pending, ProvisioningStatus.running)
  );
  assert.doesNotThrow(() =>
    assertProvisioningTransition(ProvisioningStatus.running, ProvisioningStatus.completed)
  );
  assert.doesNotThrow(() =>
    assertProvisioningTransition(ProvisioningStatus.running, ProvisioningStatus.failed)
  );
  assert.doesNotThrow(() =>
    assertProvisioningTransition(ProvisioningStatus.failed, ProvisioningStatus.running)
  );
  assert.throws(() =>
    assertProvisioningTransition(ProvisioningStatus.completed, ProvisioningStatus.running)
  );
}

function runStrategyFactoryTests(): void {
  const factory = new ProvisioningStrategyFactory(
    new ManualProvisioningStrategy(),
    new SshWpCliProvisioningStrategy(),
    new SoftaculousProvisioningStrategy()
  );

  assert.equal(factory.resolve(ProvisioningMethod.manual).method, ProvisioningMethod.manual);
  assert.equal(factory.resolve(ProvisioningMethod.ssh_wp_cli).method, ProvisioningMethod.ssh_wp_cli);
  assert.equal(factory.resolve(ProvisioningMethod.softaculous_api).method, ProvisioningMethod.softaculous_api);
  assert.throws(() => factory.resolve('unsupported' as ProvisioningMethod));
}

function runContentProviderFactoryTests(): void {
  const factory = new ContentGenerationProviderFactory(
    new ManualContentGenerationProvider(),
    new GenericContentGenerationProvider(),
    new SeowritingContentGenerationProvider()
  );

  assert.equal(factory.resolve('manual').provider, 'manual');
  assert.equal(factory.resolve('generic').provider, 'generic');
  assert.equal(factory.resolve('seowriting').provider, 'seowriting');
  assert.throws(() => factory.resolve('unsupported' as never));
}

runProvisioningStatusTests();
runStrategyFactoryTests();
runContentProviderFactoryTests();
console.log('All API unit checks passed.');
