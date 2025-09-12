import { AreaSelectOption } from '@app/facades/areas.facade';

export interface MaritimeServiceFilterValues {
  isTypeFiltered: boolean;
  selectedAreasValues: AreaSelectOption[];
  selectedTypeValues: string[];
  nameValue: string;
}
