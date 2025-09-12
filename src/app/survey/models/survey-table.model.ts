import { SurveyFileComplianceAnalysisState } from './survey.model';

export interface TableSurvey {
  id: string;
  identifier: string;
  nameAndLocation: string;
  lastUpdate: Date;
  startDate: Date;
  endDate: Date;
  compliant: SurveyFileComplianceAnalysisState;
  expectedDeletionDate: Date;
  testProcessingStatus?: string;
  testProcessingDate?: Date;
  transmissionStatus?: string;
  lastUpdateTransmissionDate?: Date;
  shomId?: string;
  producerOrganization?: string;
  ownerOrganization?: string;
  briInternalComment?: string;
}
