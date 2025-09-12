export enum FilterSelectOptionType {
  TYPE = 'TYPE',
  AREAS = 'AREAS',
  MAIN_SERVICE = 'MAIN_SERVICE',
  ADDITIONAL_SERVICES = 'ADDITIONAL_SERVICES'
}

export interface FilterSelectOption {
  id: string;
  name: string;
  internationalName: string;
}

export interface MaritimeEntityFilterValues {
  filterType: FilterSelectOptionType;
  selectedAreasValues: FilterSelectOption[];
  selectedTypeValues: string[];
  selectedMainService: string;
  selectedAdditionalServices: string[];
  nameValue: string;
}
