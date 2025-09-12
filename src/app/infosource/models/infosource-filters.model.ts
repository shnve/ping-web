import MaritimeService from '@app/models/maritime-service.model';
import { InfosourceState } from './infosource-table.model';

export const defaultValuesInfosourceTableFilter: InfosourceTableFilterValues = {
  rejected: false,
  archived: false,
  state: null,
  service: null,
  natures: null,
  maritimeEntityIds: null,
  tags: null,
  lastUpdatePeriod: {
    startDate: null,
    endDate: null
  },
  number: null,
  sendingPeriod: {
    startDate: null,
    endDate: null
  },
  sendingYear: null,
  recipientIds: null,
  affairNumber: null,
  serviceStatuses: null
};

export interface InfosourceTableFilterValues {
  rejected?: boolean;
  archived?: boolean;
  state?: InfosourceState;  // DRAFT,SENT,RECEIVED
  service?: MaritimeService;
  natures?: Array<string>;
  maritimeEntityIds?: Array<string>;
  tags?: Array<string>;
  lastUpdatePeriod?: {
    startDate?: Date,
    endDate?: Date
  };
  number?: string;
  sendingPeriod?: {
    startDate?: Date,
    endDate?: Date
  };
  sendingYear?: string;
  recipientIds?: Array<string>;
  affairNumber?: string;
  serviceStatuses?: Array<string>;
}

export type InfosourceTableAdvancedFilterValues = Pick<
  InfosourceTableFilterValues,
  'natures' | 'maritimeEntityIds' | 'tags' | 'lastUpdatePeriod' | 'number' | 'sendingPeriod'
    | 'sendingYear' | 'recipientIds' | 'affairNumber' | 'serviceStatuses' | 'rejected' | 'archived'
>;
