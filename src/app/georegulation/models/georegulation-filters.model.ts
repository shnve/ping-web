import { GeoregulationActivity, GeoregulationStatusEnum, GeoregulationType } from '@app/georegulation/models/georegulation.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceBase } from '@app/models/maritime-service.model';

export const defaultValuesGeoregulationTableFilter: GeoregulationTableFilterValues = {
  service: null,
  status: GeoregulationStatusEnum.PUBLISHED,
  mainNumberYear: null,
  mainNumberText: null,
  mainNumberAuthorities: [],
  mainNumberDate: null,
  type: null,
  activities: [],
  entities: [],
  isPublic: null,
  isNew: null,
  isExpired: null,
};

export interface GeoregulationTableFilterValues {
  service?: MaritimeService,
  status?: GeoregulationStatusEnum;
  mainNumberYear?: number,
  mainNumberText?: string,
  mainNumberAuthorities?: MaritimeServiceBase[],
  mainNumberDate?: Date,
  type?: GeoregulationType,
  activities?: GeoregulationActivity[],
  entities?: MaritimeEntityBase[],
  isPublic?: boolean,
  isNew?: boolean,
  isExpired?: boolean,
}

export type GeoregulationTableAdvancedFilterValues = GeoregulationTableFilterValues;

export interface GeoregulationMapFilterValues {
  displayTypes?: GeoregulationDisplayType[];
  concernedActivities?: GeoregulationActivity[];
  period?: {
    startDate?: Date,
    endDate?: Date
  };
  publishDate?: Date;
  disableFilter?: boolean;
}

export type GeoregulationMapAdvancedFilterValues = Pick<GeoregulationMapFilterValues, 'concernedActivities' | 'period' | 'publishDate'>;

export enum GeoregulationDisplayType {
  PERMANENT = 'PERMANENT',
  TEMPORARY = 'TEMPORARY',
  ALL_TERRITORIAL_SEA = 'ALL_TERRITORIAL_SEA',
  NOT_ALL_TERRITORIAL_SEA = 'NOT_ALL_TERRITORIAL_SEA',
  SEASONAL_PERIOD = 'SEASONAL_PERIOD',
  NOT_SEASONAL_PERIOD = 'NOT_SEASONAL_PERIOD'
}

export const defaultValuesGeoregulationMapFilter: GeoregulationMapFilterValues = {
  displayTypes: [
    GeoregulationDisplayType.ALL_TERRITORIAL_SEA,
    GeoregulationDisplayType.NOT_ALL_TERRITORIAL_SEA,
    GeoregulationDisplayType.PERMANENT,
    GeoregulationDisplayType.TEMPORARY,
    GeoregulationDisplayType.NOT_SEASONAL_PERIOD,
    GeoregulationDisplayType.SEASONAL_PERIOD
  ],
  concernedActivities: [],
  period: {
    startDate: null,
    endDate: null
  },
  publishDate: null
};

export type GeoregulationDisplayTypeOption = { code: GeoregulationDisplayType, text: string };
