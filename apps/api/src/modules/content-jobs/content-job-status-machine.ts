import { BadRequestException } from '@nestjs/common';
import { ContentJobStatus } from '@prisma/client';

const allowedTransitions: Record<ContentJobStatus, ContentJobStatus[]> = {
  pending: ['sending_to_generation', 'failed'],
  sending_to_generation: ['generated', 'failed'],
  generated: ['posted_to_wordpress', 'review_pending', 'failed'],
  posted_to_wordpress: ['review_pending', 'published', 'failed'],
  review_pending: ['published', 'failed'],
  published: [],
  failed: ['pending', 'sending_to_generation']
};

export function assertContentJobTransition(from: ContentJobStatus, to: ContentJobStatus): void {
  if (from === to) return;

  if (!allowedTransitions[from].includes(to)) {
    throw new BadRequestException(`Invalid content job transition: ${from} -> ${to}`);
  }
}
