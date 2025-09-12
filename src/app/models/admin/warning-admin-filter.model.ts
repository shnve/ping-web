import { Serie } from '../serie.model';

export const defaultValuesTableAdminFilter: TableAdminFilterValues = {
  serie: null,
  period: {
    startDate: null,
    endDate: null
  },
  todo: false,
  subAreaIds: [],
  generalCategory: null,
  detailsCategories: [],
  warningNumber: null,
  modelName: null,
  localityOrInformation: '',
  referenceNumber: '',
  concernedMaritimeEntityIds: [],
  entityCoverIds: [],
  folderIds: []
};

export interface TableAdminFilterValues {
  serie?: Serie;
  period?: {
    startDate?: Date,
    endDate?: Date
  };
  todo?: boolean;
  subAreaIds?: Array<string>;
  generalCategory?: string;
  detailsCategories?: Array<string>;
  warningNumber?: string;
  modelName?: string;
  localityOrInformation?: string;
  referenceNumber?: string;
  concernedMaritimeEntityIds?: Array<string>;
  entityCoverIds?: Array<string>;
  folderIds?: Array<string>;
}

export type TableAdminAdvancedFilterValues = Pick<
  TableAdminFilterValues, 
  'period' | 'todo' |
  'warningNumber' | 'modelName' | 'localityOrInformation' | 'subAreaIds' |
  'generalCategory' | 'detailsCategories' | 'referenceNumber' | 'concernedMaritimeEntityIds' | 'folderIds' | 'entityCoverIds'
>;
