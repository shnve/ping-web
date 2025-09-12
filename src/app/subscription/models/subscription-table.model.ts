import { Subscription } from '@app/subscription/models/subscription.model';

type TableSubscriptionBase = {
  title: string;
  creationDate: Date;
  areaName: string;
  areaInternationalName: string;
  maritimeServiceSubscriberName: string;
  maritimeServiceSubscriberInternationalName: string;
  sendingMail: boolean;
};

export type TableSubscription = Required<Pick<Subscription, 'id'>> & TableSubscriptionBase;

