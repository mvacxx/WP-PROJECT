export type ProvisioningMethod = 'ssh_wp_cli' | 'softaculous_api' | 'manual';

export type ContentJobStatus =
  | 'pending'
  | 'sending_to_generation'
  | 'generated'
  | 'posted_to_wordpress'
  | 'review_pending'
  | 'published'
  | 'failed';
