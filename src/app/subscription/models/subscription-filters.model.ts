import { SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';

export const defaultValuesSubscriptionTableFilter: SubscriptionTableFilterValues = {
  type: SubscriptionTypeEnum.WARNING
};

export interface SubscriptionTableFilterValues {
  type: SubscriptionTypeEnum;
}
