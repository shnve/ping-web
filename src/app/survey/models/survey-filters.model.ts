import MaritimeService from '@app/models/maritime-service.model';
import { SurveyProcessingStatusEnum, SurveyStateEnum } from './survey.model';

export const defaultValuesSurveyTableFilter: SurveyTableFilterValues = {
  service: null,
  state: SurveyStateEnum.DRAFT,
  identifier: null,
  nameAndLocation: null,
  period: {
    startDate: null,
    endDate: null
  },
  transmissionPeriod: {
    startDate: null,
    endDate: null
  },
  shomId: null,
  producerOrganization: null,
  ownerOrganization: null,
  notCompliant: false,
  transmissionStatus: null,
  expectedDeletionDate: null,
  briInternalComment: null
};

export interface SurveyTableFilterValues {
  service?: MaritimeService;
  state?: SurveyStateEnum;
  identifier?: string;
  nameAndLocation?: string;
  period?: {
    startDate?: Date;
    endDate?: Date;
  };
  transmissionPeriod?: {
    startDate?: Date;
    endDate?: Date;
  };
  shomId? :string;
  producerOrganization?: string;
  ownerOrganization?: string;
  notCompliant?: boolean;
  transmissionStatus?: SurveyProcessingStatusEnum;
  expectedDeletionDate?: Date;
  briInternalComment?: string;
}

export type SurveyTableAdvancedFilterValues = SurveyTableFilterValues;

