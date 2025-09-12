import { Phone } from '@app/models/pro-user.model';
import { AttachmentDownload, WarningReference } from '@app/models/warning.model';
import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { MapModelItem } from '@app/shared/components/details-map/details-map.component';
import { DateRange } from '@app/shared/models/date-range.model';
import { JsonFeature } from '@app/sig/models/geometry';
import { SurveyDetection } from '@app/survey/models/survey.model';
import Feature from 'ol/Feature';
import { Affair, InfosourceRecipient } from './infosource-table.model';

export interface MapInfosource {
  id: string;
  geometries: Array<Feature>;
  number?: string;
}

export interface InfosourcePart {
  description: string;
  internationalDescription: string;
  localisation: Array<Feature>;
  object?: Map<{ key: string }, { value: any }>;
  dateRanges?: Array<DateRange>;
  geometries?: Array<Feature>;
}

export interface InfosourceFeaturePart {
  information?: InfosourceInformation;
  typeDetails?: Array<string>;
  dateRanges?: Array<DateRange>;
  geometries: Array<Feature>;
}

export interface InfosourcePartForm extends Omit<InfosourcePart, 'description' | 'internationalDescription'> {
  information: InfosourceInformation;
}

export type InfosourcePartFormMainInfo = Pick<InfosourcePartForm, 'information'>;

export interface JsonInfosourcePart extends Omit<InfosourcePart, 'localisation'> {
  localisation: Array<JsonFeature>;
}

export interface InfosourceJsonFeaturePart {
  geometries: Array<any>;
}

export interface Infosource {
  id?: string;
  number: string;
  nature: InfosourceNature;
  status: InfosourceStatus;
  comment: string;
  rejectComment?: string;
  creationDate: Date;
  lastUpdate: Date;
  validationTime: Date;
  timezone: string;
  issuingServiceId?: string;
  issuingServiceUserId?: string;
  issuingPublicUserId?: string;
  issuingUserFirstname?: string;
  issuingUserLastname?: string;
  issuingUserEmail?: string;
  issuingUserMobilePhoneNumber?: string;
  issuingUserPhoneNumber?: string;
  issuingUserPhoneNumbers?: Phone[];
  issuingServiceName?: string;
  canBeTransfered: boolean;
  attachments?: Array<AttachmentDownload>;
  tags?: Array<string>;
  canBeAddedToFolder?: boolean;
  surveyDetections?: SurveyDetection[];
}

export interface InfosourceWithParts extends Infosource, MapModelItem {
  object?: Map<{ key: string }, { value: any }>;
  featureParts: Array<InfosourcePart>;
  recipients: Array<InfosourceRecipient>;
  affairs?: Array<Affair>;
  producedNauticalInformations?: Array<string>;
  concernedMaritimeEntities?: Array<string>;
  tags?: Array<string>;
}

export interface InfosourceReference {
  id: string;
  number: string;
  nature: InfosourceNature;
  creationDate: Date;
  lastUpdate: Date;
  validationTime: Date;
  timezone: string;
  issuingUserFirstname: string;
  issuingUserLastname: string;
  issuingServiceName: string;
  attachments: Array<AttachmentDownload>;
  featureParts: Array<InfosourcePart>;
  warnings?: Array<WarningReference>;
  warningsTP?: Array<WarningReference>;
}

export interface InfosourceWithJsonParts extends Omit<InfosourceWithParts, 'featureParts'> {
  featureParts: Array<JsonInfosourcePart>;
}

export interface InfosourceAdminWithJsonParts extends InfosourceWithJsonParts { }

export interface InfosourceDateRange {
  start?: string;
  end?: string;
}

export interface Tag {
  id?: string;
  value: string;
  maritimeServiceId: string;
}

export enum InfosourceNature {
  HAZARD_REPORT = 'HAZARD_REPORT',
  OTHER_REPORT = 'OTHER_REPORT',
  ACTIVITY_FORECAST = 'ACTIVITY_FORECAST',
  MAP_ANOMALY = 'MAP_ANOMALY',
  PUBLICATION_ANOMALY = 'PUBLICATION_ANOMALY',
  FUTURE_INFORMATION = 'FUTURE_INFORMATION',
  LIGHTHOUSE_AND_BEACON = 'LIGHTHOUSE_AND_BEACON',
  GEOREGULATION = 'GEOREGULATION',
  SURVEY_TRANSMISSION = 'SURVEY_TRANSMISSION',
  BATHY = 'BATHY'
}

export enum InfosourceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  OPENED = 'OPENED',
  REJECTED = 'REJECTED',
  TAKEN = 'TAKEN'
}

export enum MarkupType {
  LIGHTHOUSE = 'LIGHTHOUSE',
  BUOY = 'BUOY',
  TURRET_BEACON = 'TURRET_BEACON',
  OTHER = 'OTHER'
}

export interface InfosourceReportPublicUser {
  id?: string;
  localisation?: Feature[];
  date?: string;
  type?: MarkupType;
  objectName?: string;
  description?: string;
  objectFutureInfo?: string;
  attachmentIds?: Array<string>;
  attachmentFiles?: Array<CreationAttachment>;
  timezone?: string;
  mapNumber?: string;
  editionNumber?: string;
  lastPatchNumber?: string;
  issueReference?: string;
  upToDateAt?: string;
  chapterOrPage?: string;
  surveyPeriod?: DateRange;
  confidentialityInformation?: string;
  surveyDetections?: SurveyDetection[];
  nature?: InfosourceNature;
}

export interface InfosourceReportServiceUser extends InfosourceReportPublicUser {
  internalComment?: string;
  serviceId?: string;
  concernedMaritimeEntityIds?: Array<string>;
}

export interface InfosourceReportActivityForecast {
  id?: string;
  timezone: string;
  parts: Array<JsonInfosourcePart>;
  internalComment?: string;
  attachmentIds?: Array<string>;
  attachmentFiles?: Array<CreationAttachment>;
  serviceId?: string;
  concernedMaritimeEntityIds?: Array<string>;
}

export type InfosourceInformation = { [key: string]: string };

export enum InfosourceServiceStatus {
  INIT = 'INIT',
  READ = 'READ',
  ARCHIVE = 'ARCHIVE',
  TO_PROCESS = 'TO_PROCESS',
  PROCESSED = 'PROCESSED'
}

export enum InfosourceActionType {
  INIT = 'INIT',
  READ = 'READ',
  ARCHIVE = 'ARCHIVE',
  TO_PROCESS = 'TO_PROCESS'
}

export interface InfosourceStatusByService {
  serviceId: string;
  serviceName: string;
  actionType: string;
}

export enum BathyGeometryNature {
  DEPTH = 'DEPTH',
  SHOAL = 'SHOAL',
  WRECK = 'WRECK',
  OBSTRUCTION = 'OBSTRUCTION'
}

export enum InfosourceObjectMapKeys {
  MARKUP_TYPE = 'markupType',
  OBSERVATION_DATE = 'observationDate',
  OBJECT_NAME = 'objectName',
  MAP_NUMBER = 'mapNumber',
  EDITION_NUMBER = 'editionNumber',
  LAST_PATCH_NUMBER = 'lastPatchNumber',
  DATE_RANGES = 'dateRanges',
  ISSUE_REFERENCE = 'issueReference',
  UP_TO_DATE_AT = 'upToDateAt',
  CHAPTER_OR_PAGE = 'chapterOrPage',
  OBJECT_FUTURE_INFO = 'objectFutureInfo',
  INFORMATION = 'information',
  CONTACT = 'contact',
  INDICATION_INCIDENT_CODE = 'indication',
  LEVEL = 'level',
  NATURAL_NOTICE_CODE = 'naturalNoticeCode',
  TITLE_INCIDENT_CODE = 'incidentTitle',
  TITLE_CMS_CODE = 'cmsTitle',
  RECOVERY_TIME_CODE = 'recoveryTime',
  COMMENT = 'comment',
  COSTAL_SERVICE = 'costalService',
  TERRITORIAL_DIVISION = 'territorialDivision',
  PREVIOUS_NOTICE_NUMBER = 'previousNoticeNumber',
  GEOREGULATION_NUMBER = 'georegulationNumber',
  GEOREGULATION_TITLE = 'georegulationTitle',
  GEOREGULATION_TYPE = 'georegulationType',
  GEOREGULATION_ACTIVITIES = 'georegulationActivities',
  GEOREGULATION_ADDITIONAL_NUMBERS = 'georegulationAdditionalNumbers',
  GEOREGULATION_CALENDAR_PERIODS = 'georegulationCalendarPeriods',
  GEOREGULATION_SEASONAL_PERIODS = 'georegulationSeasonalPeriods',
  GEOREGULATION_MARITIME_ENTITY = 'georegulationMaritimeEntity',
  GEOREGULATION_SUMMARY = 'georegulationSummary',
  GEOREGULATION_PART_DETAILS = 'georegulationPartDetails',
  GEOREGULATION_PART_NUMBER = 'georegulationPartNumber',
  GEOREGULATION_PART_TYPES = 'georegulationPartTypes',
  GEOREGULATION_PART_INFORMATION = 'georegulationPartInformation',
  GEOREGULATION_PART_INTERNATIONAL_INFORMATION = 'georegulationPartInternationalInformation'
}

export enum InfosourceSurveyTransmissionObjectKeys {
  PING_ID = 'PING_ID',
  SHOM_ID = 'SHOM_ID',
  PRODUCER_ORGANIZATION = 'PRODUCER_ORGANIZATION',
  OWNER_ORGANIZATION = 'OWNER_ORGANIZATION',
  NAME_AND_LOCATION = 'NAME_AND_LOCATION',
  PERIOD = 'PERIOD',
  TRANSMISSION_DATE = 'TRANSMISSION_DATE',
  SURVEY_ID = 'SURVEY_ID'
}

export const TRANSLATIONS_LIST_INFOSOURCE_OBJECT = [
  { key: InfosourceObjectMapKeys.INDICATION_INCIDENT_CODE, value: 'enum.infosource-indication-incident-code' },
  { key: InfosourceObjectMapKeys.RECOVERY_TIME_CODE, value: 'enum.infosource-recovery-time-code' },
  { key: InfosourceObjectMapKeys.NATURAL_NOTICE_CODE, value: 'enum.infosource-natural-notice-code' },
  { key: InfosourceObjectMapKeys.TITLE_INCIDENT_CODE, value: 'enum.infosource-title-incident-code' },
  { key: InfosourceObjectMapKeys.TITLE_CMS_CODE, value: 'enum.infosource-title-cms-code' }
];

export const TRANSLATIONS_LIST_INFOSOURCE_NATURE = [
  { key: 'HAZARD_REPORT', value: 'enum.infosource-nature.hazard-report' },
  { key: 'OTHER_REPORT', value: 'enum.infosource-nature.other-report' },
  { key: 'ACTIVITY_FORECAST', value: 'enum.infosource-nature.activity-forecast' },
  { key: 'MAP_ANOMALY', value: 'enum.infosource-nature.map-anomaly' },
  { key: 'PUBLICATION_ANOMALY', value: 'enum.infosource-nature.publication-anomaly' },
  { key: 'FUTURE_INFORMATION', value: 'enum.infosource-nature.future-information' },
  { key: 'LIGHTHOUSE_AND_BEACON', value: 'enum.infosource-nature.lighthouse-and-beacon' },
  { key: 'GEOREGULATION', value: 'enum.infosource-nature.georegulation' },
  { key: 'SURVEY_TRANSMISSION', value: 'enum.infosource-nature.survey-transmission' },
  { key: 'BATHY', value: 'enum.infosource-nature.bathy' }
];

export const TRANSLATIONS_LIST_INFOSOURCE_STATUS = [
  { key: 'DRAFT', value: 'enum.infosource-status.draft' },
  { key: 'SENT', value: 'enum.infosource-status.sent' },
  { key: 'OPENED', value: 'enum.infosource-status.opened' },
  { key: 'REJECTED', value: 'enum.infosource-status.rejected' },
  { key: 'TAKEN', value: 'enum.infosource-status.taken' }
];

export const TRANSLATIONS_LIST_INFOSOURCE_SERVICE_STATUS = [
  { key: 'INIT', value: 'enum.infosource-service-status.init' },
  { key: 'READ', value: 'enum.infosource-service-status.read' },
  { key: 'ARCHIVE', value: 'enum.infosource-service-status.archive' },
  { key: 'TO_PROCESS', value: 'enum.infosource-service-status.to_process' },
  { key: 'PROCESSED', value: 'enum.infosource-service-status.processed' }
];

export const LIST_INFOSOURCE_OBJECT_MAP_KEYS_TO_DISPLAY = [
  {
    nature: InfosourceNature.HAZARD_REPORT,
    objectMapKeys: [
      InfosourceObjectMapKeys.MARKUP_TYPE,
      InfosourceObjectMapKeys.OBSERVATION_DATE,
      InfosourceObjectMapKeys.OBJECT_NAME
    ]
  },
  {
    nature: InfosourceNature.OTHER_REPORT,
    objectMapKeys: [
      InfosourceObjectMapKeys.OBSERVATION_DATE
    ]
  },
  {
    nature: InfosourceNature.MAP_ANOMALY,
    objectMapKeys: [
      InfosourceObjectMapKeys.OBSERVATION_DATE,
      InfosourceObjectMapKeys.MAP_NUMBER,
      InfosourceObjectMapKeys.EDITION_NUMBER,
      InfosourceObjectMapKeys.LAST_PATCH_NUMBER
    ]
  },
  {
    nature: InfosourceNature.PUBLICATION_ANOMALY,
    objectMapKeys: [
      InfosourceObjectMapKeys.OBSERVATION_DATE,
      InfosourceObjectMapKeys.ISSUE_REFERENCE,
      InfosourceObjectMapKeys.UP_TO_DATE_AT,
      InfosourceObjectMapKeys.CHAPTER_OR_PAGE
    ]
  },
  {
    nature: InfosourceNature.FUTURE_INFORMATION,
    objectMapKeys: [
      InfosourceObjectMapKeys.OBJECT_FUTURE_INFO
    ]
  },
  {
    nature: InfosourceNature.ACTIVITY_FORECAST,
    objectMapKeys: [
      InfosourceObjectMapKeys.DATE_RANGES
    ]
  }
];
