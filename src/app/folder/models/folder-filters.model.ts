import { FolderStatusEnum } from '@app/folder/models/folder.model';
import Area from '@app/models/area.model';
import MaritimeService from '@app/models/maritime-service.model';

export const defaultValuesFolderTableFilter: FolderTableFilterValues = {
  area: null,
  followerService: null,
  issuingService: null,
  status: FolderStatusEnum.OPEN,
  secondPartNumber: null,
  number: null,
  localityOrObject: null,
  areaIds: null,
  maritimeEntityIds: null,
  lastUpdatePeriod: {
    startDate: null,
    endDate: null
  },
  lastUpdateYear: null,
  studyId: null
};

export interface FolderTableFilterValues {
  area?: Area;
  followerService?: MaritimeService,
  issuingService?: string,
  status?: FolderStatusEnum;
  secondPartNumber?: string;
  number?: string;
  localityOrObject?: string;
  areaIds?: Array<string>;
  maritimeEntityIds?: Array<string>;
  lastUpdatePeriod?: {
    startDate?: Date,
    endDate?: Date
  };
  lastUpdateYear?: string;
  studyId?: string;
}

export type FolderTableAdvancedFilterValues = Omit<FolderTableFilterValues, 'area' | 'followerService'>;
