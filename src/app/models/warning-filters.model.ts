import { Serie, SerieType } from './serie.model';
import { GlobalWarningType } from './warning.model';


export const defaultValuesMapFilter: MapFilterValues = {
  displayTypes: [
    GlobalWarningType.NOTICE,
    SerieType.NAVAREA_NAVIGATIONAL_WARNING,
    SerieType.COASTAL_NAVIGATIONAL_WARNING,
    SerieType.LOCAL_NAVIGATIONAL_WARNING
  ],
  period: {
    startDate: null,
    endDate: null
  },
  publishDate: null
};

export const defaultValuesTableFilter: TableFilterValues = {
  subAreaIds: [],
  categories: [],
  concernedMaritimeEntityIds: [],
  entityCoverIds: [],
  period: {
    startDate: null,
    endDate: null
  },
  publishDate: null,
  reservationNumberAndYear: null,
};

export type WarningDisplayType = SerieType | GlobalWarningType;

export interface MapFilterValues {
  displayTypes?: WarningDisplayType[];
  period?: {
    startDate?: Date,
    endDate?: Date
  };
  publishDate?: Date;
  disableFilter?: boolean;
  serieId?: string;
}

export type MapAdvancedFilterValues = Pick<MapFilterValues, 'period' | 'publishDate'>;

export interface TableFilterValues {
  serie?: Serie;
  subAreaIds?: Array<string>;
  categories?: Array<string>;
  concernedMaritimeEntityIds?: Array<string>;
  entityCoverIds?: Array<string>;
  period?: {
    startDate?: Date,
    endDate?: Date
  };
  publishDate?: Date;
  disableFilter?: boolean;
  reservationNumberAndYear?: string;
}

export type TableAdvancedFilterValues = Pick<TableFilterValues, 'period' | 'publishDate' | 'subAreaIds' | 'categories' | 'concernedMaritimeEntityIds' | 'entityCoverIds' | 'reservationNumberAndYear'>;
