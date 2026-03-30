export type RequestActorType = 'human' | 'system';

export type RequestActor = {
  type: RequestActorType;
  id: string;
};
