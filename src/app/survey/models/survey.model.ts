import { AttachmentDownload } from '@app/models/warning.model';
import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { DateRange } from '@app/shared/models/date-range.model';
import { JsonGeometry } from '@app/sig/models/geometry';
import { MapModelItem } from '@shared/components/details-map/details-map.component';

export enum SurveyStateEnum {
  TEST = 'TEST',
  DRAFT = 'DRAFT',
  TRANSMITTED = 'TRANSMITTED'
}

export enum SurveyProcessingStatusEnum {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  FAILURE = 'FAILURE',
  SUCCESS_WITH_ERRORS = 'SUCCESS_WITH_ERRORS'
}

export const TRANSLATIONS_LIST_SURVEY_PROCESSING_STATUS = [
  { key: 'NOT_AVAILABLE', value: 'enum.survey-processing-status.not-available' },
  { key: 'PENDING', value: 'enum.survey-processing-status.pending' },
  { key: 'FINISHED', value: 'enum.survey-processing-status.finished' },
  { key: 'FAILURE', value: 'enum.survey-processing-status.failure' },
  { key: 'SUCCESS_WITH_ERRORS', value: 'enum.survey-processing-status.success-with-errors' }
];

export const TRANSLATIONS_LIST_SURVEY_TRANSMISSION_STATUS = [
  { key: 'NOT_AVAILABLE', value: 'enum.survey-processing-status.not-available' },
  { key: 'PENDING', value: 'enum.survey-processing-status.pending' },
  { key: 'FINISHED', value: 'enum.survey-processing-status.finished' },
  { key: 'FAILURE', value: 'enum.survey-processing-status.failure' }
];

export enum SurveyTypeEnum {
  TEST = 'TEST',
  DEPOSIT = 'DEPOSIT'
};

export enum SurveyFileComplianceAnalysisState {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PENDING = 'PENDING',
  COMPLIANT = 'COMPLIANT',
  NOT_COMPLIANT = 'NOT_COMPLIANT'
}

export const TRANSLATIONS_LIST_SURVEY_COMPLIANT_STATUS = [
  { key: 'NOT_AVAILABLE', value: 'survey.status.not-available' },
  { key: 'PENDING', value: 'survey.status.pending' },
  { key: 'COMPLIANT', value: 'survey.status.compliant' },
  { key: 'NOT_COMPLIANT', value: 'survey.status.not-compliant' }
];

export enum SurveyTransmissionStatus {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  FAILURE = 'FAILURE'
}

export enum SurveyIssuerType {
  OWNER = 'OWNER',
  PRODUCER = 'PRODUCER'
}

export enum SurveyCoordinatesOrder {
  XYZ = 'XYZ',
  LAT_LONG_Z = 'LAT_LONG_Z',
  LONG_LAT_Z = 'LONG_LAT_Z'
}

export enum SurveyZDirection {
  ALTITUDE = 'ALTITUDE',
  DEPTH = 'DEPTH'
}

export enum SurveyVerticalRef {
  ZERO_HYDRO = 'ZERO_HYDRO',
  AVERAGE_LEVEL = 'AVERAGE_LEVEL',
  ZERO_ALTI = 'ZERO_ALTI',
  INSTANT_SEA_LEVEL = 'INSTANT_SEA_LEVEL',
  OTHER = 'OTHER'
}

export enum SurveyActivity {
  PARTICIPATORY_BATHYMETRY = 'PARTICIPATORY_BATHYMETRY',
  EXCAVATION_GEOPHYSICAL = 'EXCAVATION_GEOPHYSICAL',
  MARINE_SCIENTIFIC_RESEARCH = 'MARINE_SCIENTIFIC_RESEARCH',
  PUBLIC_SERVICE = 'PUBLIC_SERVICE',
  OTHER = 'OTHER'
}

export enum SurveyBroadcastRestriction {
  WITHOUT_BROADCAST_RESTRICTION = 'WITHOUT_BROADCAST_RESTRICTION',
  THREE_YEARS = 'THREE_YEARS',
  TEN_YEARS = 'TEN_YEARS'
}

export const TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION = {
  [SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION]: 'enum.survey-broadcast-restriction.without-broadcast-restriction',
  [SurveyBroadcastRestriction.THREE_YEARS]: 'enum.survey-broadcast-restriction.3-years',
  [SurveyBroadcastRestriction.TEN_YEARS]: 'enum.survey-broadcast-restriction.10-years'
};

export const TRANSLATIONS_LIST_SURVEY_ACTIVITY = {
  [SurveyActivity.PARTICIPATORY_BATHYMETRY]: 'enum.survey-activity.participatory-bathymetry-activities',
  [SurveyActivity.EXCAVATION_GEOPHYSICAL]: 'enum.survey-activity.excavation-geophysical-activities',
  [SurveyActivity.MARINE_SCIENTIFIC_RESEARCH]: 'enum.survey-activity.marine-scientific-research-activities',
  [SurveyActivity.PUBLIC_SERVICE]: 'enum.survey-activity.public-service-activities',
  [SurveyActivity.OTHER]: 'enum.survey-activity.other-activities'
};

export const TRANSLATIONS_LIST_SURVEY_ACTIVITY_BROADCAST_GROUP = [
  {
    key: SurveyActivity.PARTICIPATORY_BATHYMETRY, value: TRANSLATIONS_LIST_SURVEY_ACTIVITY[SurveyActivity.PARTICIPATORY_BATHYMETRY],
    items: [
      { key: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION] },
    ]
  },
  {
    key: SurveyActivity.EXCAVATION_GEOPHYSICAL, value: TRANSLATIONS_LIST_SURVEY_ACTIVITY[SurveyActivity.EXCAVATION_GEOPHYSICAL],
    items: [
      { key: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION] },
      { key: SurveyBroadcastRestriction.THREE_YEARS, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.THREE_YEARS] },
      { key: SurveyBroadcastRestriction.TEN_YEARS, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.TEN_YEARS] },
    ]
  },
  {
    key: SurveyActivity.MARINE_SCIENTIFIC_RESEARCH, value: TRANSLATIONS_LIST_SURVEY_ACTIVITY[SurveyActivity.MARINE_SCIENTIFIC_RESEARCH],
    items: [
      { key: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION] },
      { key: SurveyBroadcastRestriction.THREE_YEARS, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.THREE_YEARS] },
    ]
  },
  {
    key: SurveyActivity.PUBLIC_SERVICE, value: TRANSLATIONS_LIST_SURVEY_ACTIVITY[SurveyActivity.PUBLIC_SERVICE],
    items: [
      { key: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION] },
      { key: SurveyBroadcastRestriction.THREE_YEARS, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.THREE_YEARS] },
    ]
  },
  {
    key: SurveyActivity.OTHER, value: TRANSLATIONS_LIST_SURVEY_ACTIVITY[SurveyActivity.OTHER],
    items: [
      { key: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION] },
      { key: SurveyBroadcastRestriction.THREE_YEARS, value: TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION[SurveyBroadcastRestriction.THREE_YEARS] },
    ]
  },
];

export enum SurveyFileStatisticFields {
  NW_CORNER = 'NW_CORNER',
  SE_CORNER = 'SE_CORNER',
  NUMBER_OF_PROBES = 'NUMBER_OF_PROBES',
  SHORTEST_PROBE = 'SHORTEST_PROBE',
  DEEPEST_PROBE = 'DEEPEST_PROBE'
}

export enum SurveyFileAnalysisError {
  EXCEED_ATTEMPTS_OR_WRONG_SEPARATOR = 'EXCEED_ATTEMPTS_OR_WRONG_SEPARATOR',
  WRONG_NB_OF_SEPARATOR = 'WRONG_NB_OF_SEPARATOR',
  NOT_NUMERIC_VALUE = 'NOT_NUMERIC_VALUE',
  OUT_OF_BOUNDS = 'OUT_OF_BOUNDS',
  FAILED_TO_RETRIEVE_STATS = 'FAILED_TO_RETRIEVE_STATS',
  FAILED_TO_ANALYZE = 'FAILED_TO_ANALYZE',
  FAILED_TO_ANALYZE_FILE_IN_ARCHIVE = 'FAILED_TO_ANALYZE_FILE_IN_ARCHIVE'
}

export const TRANSLATIONS_LIST_COORDINATES_ORDER = [
  { key: SurveyCoordinatesOrder.XYZ, value: 'enum.survey-coordinates-order.x-y-z' },
  { key: SurveyCoordinatesOrder.LAT_LONG_Z, value: 'enum.survey-coordinates-order.lat-long-z' },
  { key: SurveyCoordinatesOrder.LONG_LAT_Z, value: 'enum.survey-coordinates-order.long-lat-z' }
];

export const TRANSLATIONS_LIST_Z_DIRECTION = [
  { key: SurveyZDirection.ALTITUDE, value: 'enum.survey-z-direction.altitude' },
  { key: SurveyZDirection.DEPTH, value: 'enum.survey-z-direction.depth' }
];

export const TRANSLATIONS_LIST_VERTICAL_REF = [
  { key: SurveyVerticalRef.ZERO_HYDRO, value: 'enum.survey-vertical-ref.zero-hydro' },
  { key: SurveyVerticalRef.AVERAGE_LEVEL, value: 'enum.survey-vertical-ref.average-level' },
  { key: SurveyVerticalRef.ZERO_ALTI, value: 'enum.survey-vertical-ref.zero-alti' },
  { key: SurveyVerticalRef.INSTANT_SEA_LEVEL, value: 'enum.survey-vertical-ref.instant-sea-level' },
  { key: SurveyVerticalRef.OTHER, value: 'enum.survey-vertical-ref.other' }
];

export const TRANSLATIONS_LIST_FILE_SEPARATOR = [
  { key: 'SPACE', value: 'enum.survey-file-separator.space' },
  { key: 'TAB', value: 'enum.survey-file-separator.tabulation' },
  { key: 'COMMA', value: 'enum.survey-file-separator.comma' },
  { key: 'SEMICOLON', value: 'enum.survey-file-separator.semicolon' }
];

export const TRANSLATIONS_LIST_SURVEY_ISSUER_TYPE = [
  { key: SurveyIssuerType.OWNER, value: 'enum.survey-issuer-type.owner' },
  { key: SurveyIssuerType.PRODUCER, value: 'enum.survey-issuer-type.producer' }
];

export const SURVEY_LIST_TRANSLATE = {
  'coordinatesOrder': TRANSLATIONS_LIST_COORDINATES_ORDER,
  'directionZ': TRANSLATIONS_LIST_Z_DIRECTION,
  'verticalRef': TRANSLATIONS_LIST_VERTICAL_REF,
  'fileSeparator': TRANSLATIONS_LIST_FILE_SEPARATOR,
}

export type SurveyFileStatistics = Map<{ key: SurveyFileStatisticFields }, { value: string }>;

export type SurveyFileCompliantAnalysisResult = Map<{ key: SurveyFileAnalysisError }, { value: string }>;

export type SurveyFilesExternalAnalysisResults = {
  filename: string;
  errors: Array<SurveyFileProcessingResultError>;
}

export enum SurveyDangerTypeOfValue {
  DEPTH = 'DEPTH',
  DIFFERENCE = 'DIFFERENCE'
}

export enum SurveyDangerNature {
  DEPTH = 'DEPTH'
}

export enum SurveyResultFailureMessage {
  MESSAGE_ERROR_ZIP = 'MESSAGE_ERROR_ZIP',
  MESSAGE_ERROR_DISK = 'MESSAGE_ERROR_DISK',
  MESSAGE_ERROR_INTERNAL = 'MESSAGE_ERROR_INTERNAL',
  MESSAGE_ERROR_SFTP = 'MESSAGE_ERROR_SFTP'
}

export enum SurveyFileProcessingResultError {
  MESSAGE_ERROR_INVALID_FILEPATH = 'MESSAGE_ERROR_INVALID_FILEPATH',
  MESSAGE_ERROR_NO_POINT = 'MESSAGE_ERROR_NO_POINT',
  MESSAGE_ERROR_TRANSFORM = 'MESSAGE_ERROR_TRANSFORM',
  MESSAGE_ERROR_FORMAT = 'MESSAGE_ERROR_FORMAT',
  MESSAGE_ERROR_ANY_ENC_IN_DIR = 'MESSAGE_ERROR_ANY_ENC_IN_DIR',
  MESSAGE_END_ERROR = 'MESSAGE_END_ERROR',
  MESSAGE_ERROR_NO_DEPARE = 'MESSAGE_ERROR_NO_DEPARE'
}

export enum SurveyProcessingResultError {
  SRC_DIR_LIST_FILES_FAILURE = 'SRC_DIR_LIST_FILES_FAILURE',
  ZIP_FILENAME_NOT_MATCHING_PATTERN = 'ZIP_FILENAME_NOT_MATCHING_PATTERN',
  NO_ZIP_FILE_FOUND = 'NO_ZIP_FILE_FOUND',
  MISSING_FILE_ON_DISK = 'MISSING_FILE_ON_DISK',
  WRONG_IDFILE_PROVIDED = 'WRONG_IDFILE_PROVIDED',
  UNKNOWN_IDFILE = 'UNKNOWN_IDFILE',
  VIRUS_CHECK_FAILURE = 'VIRUS_CHECK_FAILURE',
  MALICIOUS_FILE_DETECTED = 'MALICIOUS_FILE_DETECTED',
  ZIP_CONTENT_FILES_LIST_FAILURE = 'ZIP_CONTENT_FILES_LIST_FAILURE',
  INVALID_ZIP_CONTENT = 'INVALID_ZIP_CONTENT',
  TARGET_DIR_LIST_XML_FILES_FAILURE = 'TARGET_DIR_LIST_XML_FILES_FAILURE',
  PARSE_XML_FAILURE = 'PARSE_XML_FAILURE',
  TARGET_DIR_LIST_GML_FILES_FAILURE = 'TARGET_DIR_LIST_GML_FILES_FAILURE',
  PARSE_GML_FAILURE = 'PARSE_GML_FAILURE',
  TARGET_DIR_LIST_CSV_FILES_FAILURE = 'TARGET_DIR_LIST_CSV_FILES_FAILURE',
  PARSE_CSV_FAILURE = 'PARSE_CSV_FAILURE'
}

export type SurveyExternalAnalysisResults = {
  globalErrorMessage?: SurveyResultFailureMessage;
  processingResultErrors?: SurveyProcessingResultError[];
  processingStatus: SurveyProcessingStatusEnum;
  surveyFilesExternalAnalysisResults?: SurveyFilesExternalAnalysisResults[];
  dangers?: SurveyDanger[];
  detections?: SurveyDetection[];
  enc?: SurveyEnc[];
  resultFiles?: AttachmentDownload[];
  receptionDate: Date;
  shouldBeReported?: boolean;
}

export type SurveyDanger = {
  geometry: JsonGeometry;
  nature: SurveyDangerNature,
  typeOfValue: SurveyDangerTypeOfValue,
  value: number
}

export type SurveyDetection = {
  geometry: JsonGeometry;
  depth: number,
  difference: number,
  color: number
}

export type SurveyEnc = {
  name: string,
  updateNumber: number,
  updateDate: Date,
  comments?: string;
}

export interface AttachmentSurveyResult {
  id: string;
  resultFileName: string;
  analyzedFileName: string;
}

export interface SurveyDetails extends MapModelItem {
  id?: string;
  identifier?: string;
  issuingUserFirstName: string;
  issuingUserLastName: string;
  nameAndLocation: string;
  goal: string;
  state: SurveyStateEnum;
  startDate?: Date;
  endDate?: Date;
  creationDate?: Date;
  lastUpdate?: Date;
  areaName: string;
  surveyIssuerTypes: SurveyIssuerType[];
  geographicFormat: boolean;
  epsg: string;
  coordinatesOrder: SurveyCoordinatesOrder;
  directionZ: SurveyZDirection;
  verticalRef: SurveyVerticalRef;
  fileSeparator: string;
  activityChoice: SurveyActivity;
  broadcastRestriction: SurveyBroadcastRestriction;
  confidentialityInformation?: string;
  externalAnalysisEnabled?: boolean;
  ownerOrganization: string;
  ownerEmail?: string;
  producerOrganization: string;
  technicalManagerEmail?: string;
  bathyAttachmentIds?: string[];
  bathyAttachmentFiles?: SurveyFile[];
  miscAttachmentIds?: string[];
  miscAttachmentFiles?: CreationAttachment[];
  technicalMetadataId: string;
  technicalMetadataFile: CreationAttachment;
  compliant?: SurveyFileComplianceAnalysisState;
  statistics?: SurveyFileStatistics;
  surveyExternalAnalysisResults?: SurveyExternalAnalysisResults;
  externalAnalysisInProgress: boolean;
  canBeReported: boolean;
  boundingBox?: JsonGeometry;
  briInternalComment?: string;
  issuingServiceName?: string;
}

export interface SurveyFile {
  id: string;
  attachment: CreationAttachment;
  bathy: boolean;
  compliant: SurveyFileComplianceAnalysisState;
  statistics: SurveyFileStatistics;
  compliantAnalysisResults: SurveyFileCompliantAnalysisResult;
  archive: boolean;
  filesInArchive: SurveyFileInArchive[];
}

export interface SurveyFileInArchive {
  id: string;
  filename: string;
  compliant: SurveyFileComplianceAnalysisState;
  statistics: SurveyFileStatistics;
  compliantAnalysisResults: SurveyFileCompliantAnalysisResult;
}

export interface SurveyWithAchievementPeriodMandatory {
  achievementPeriod: DateRange;
}

export interface SurveyBase extends Partial<Pick<SurveyWithAchievementPeriodMandatory, 'achievementPeriod'>> {
  id?: string;
  identifier?: string;
  nameAndLocation: string;
  areaId: string;
  geographicFormat: boolean;
  epsg: string;
  coordinatesOrder: SurveyCoordinatesOrder;
  directionZ: SurveyZDirection;
  verticalRef: SurveyVerticalRef;
  fileSeparator: string;
  bathyAttachmentIds?: string[];
  bathyAttachmentFiles?: CreationAttachment[];
  serviceId?: string;
}

export interface SurveyWithDates extends SurveyBase {
  startDate: Date;
  endDate: Date;
}

export interface SurveyDeposit extends SurveyWithDates {
  goal: string;
  surveyIssuerTypes: SurveyIssuerType[];
  externalAnalysisEnabled: boolean;
  activityChoice: SurveyActivity;
  broadcastRestriction: SurveyBroadcastRestriction;
  confidentialityInformation?: string;
  ownerOrganization: string;
  ownerEmail?: string;
  producerOrganization: string;
  technicalManagerEmail?: string;
  miscAttachmentIds?: string[];
  miscAttachmentFiles?: CreationAttachment[];
  technicalMetadataId: string;
  technicalMetadataFile: CreationAttachment;
  compliant: SurveyFileComplianceAnalysisState;
  transmissionStatus: SurveyTransmissionStatus;
}

export type SurveyDepositEdition = Omit<SurveyDeposit, 'startDate' | 'endDate' | 'identifier'> & SurveyWithAchievementPeriodMandatory;

export const defaultValuesSurveyDepositEdition: SurveyDepositEdition = {
  nameAndLocation: null,
  areaId: null,
  goal: null,
  surveyIssuerTypes: [],
  geographicFormat: true,
  epsg: null,
  coordinatesOrder: null,
  activityChoice: null,
  broadcastRestriction: null,
  confidentialityInformation: null,
  directionZ: null,
  verticalRef: null,
  fileSeparator: null,
  externalAnalysisEnabled: true,
  ownerOrganization: null,
  producerOrganization: null,
  bathyAttachmentIds: [],
  bathyAttachmentFiles: [],
  miscAttachmentIds: [],
  miscAttachmentFiles: [],
  technicalMetadataId: null,
  technicalMetadataFile: null,
  achievementPeriod: {
    dateStart: null,
    dateEnd: null
  },
  serviceId: null,
  compliant: SurveyFileComplianceAnalysisState.NOT_AVAILABLE,
  transmissionStatus: SurveyTransmissionStatus.NOT_AVAILABLE
}

export type SurveyTest = SurveyBase & Partial<Pick<SurveyWithDates, 'startDate' | 'endDate'>>;

export type SurveyTestEdition = Omit<SurveyTest, 'startDate' | 'endDate'> & Partial<Pick<SurveyWithAchievementPeriodMandatory, 'achievementPeriod'>>;

export const defaultValuesSurveyTestEdition: SurveyTestEdition = {
  nameAndLocation: null,
  areaId: null,
  geographicFormat: true,
  epsg: null,
  coordinatesOrder: null,
  directionZ: null,
  verticalRef: null,
  fileSeparator: null,
  bathyAttachmentIds: [],
  bathyAttachmentFiles: [],
  achievementPeriod: {
    dateStart: null,
    dateEnd: null
  },
  serviceId: null
}
