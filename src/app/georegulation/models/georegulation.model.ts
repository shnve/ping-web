import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { AttachmentDownload } from '@app/models/warning.model';
import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { MapModelItem } from '@app/shared/components/details-map/details-map.component';
import { DateRange } from '@app/shared/models/date-range.model';
import { JsonFeature } from '@app/sig/models/geometry';
import Feature from 'ol/Feature';

export type CalendarPeriod = Required<Pick<DateRange, 'dateStart' | 'dateEnd'>>;

export interface SeasonalPeriod {
  dayStart?: number;
  monthStart?: number;
  dayEnd?: number;
  monthEnd?: number;
}

export interface SeasonalPeriodFormElement extends SeasonalPeriod {
  isInvalid: boolean;
}

export const monthsForMarkAsNew = [0, 3, 6, 12];

export type MarkNewDuringMonths = 0 | 3 | 6 | 12;

export interface MapGeoregulation extends MapModelItem {
  id: string;
  features: Array<JsonFeature>;
  mainNumber: string;
  type?: GeoregulationType;
  isTemporary: boolean;
  isNew: boolean;
}

export interface GeoregulationPart {
  features: Array<Feature>;
  types?: Array<GeoregulationPartType>;
  calendarPeriods?: Array<CalendarPeriod>;
  seasonalPeriods?: Array<SeasonalPeriod>;
  information: string;
  internationalInformation?: string;
  lengthVessel: number;
  choiceLengthVessel: GeoregulationPartRestrictionVessel;
  grossTonnageVessel: number;
  choiceGrossTonnageVessel: GeoregulationPartRestrictionVessel;
  unitsGrossTonnageVessel: GeoregulationPartUnitGrossTonnage;
  isCommercialShip: boolean;
}

export type GeoregulationPartTypes = Pick<GeoregulationPart, 'types'>;

export type GeoregulationPartInformation = { [key: string]: string };

export interface GeoregulationPartForm extends Omit<GeoregulationPart, 'seasonalPeriods' | 'information' | 'internationalInformation'> {
  seasonalPeriods?: Array<SeasonalPeriodFormElement>;
  informations: GeoregulationPartInformation;
}

export interface JsonGeoregulationPart extends Omit<GeoregulationPart, 'features'> {
  features: Array<JsonFeature>;
}

export const georegulationPartInitValues: GeoregulationPart = {
  features: [],
  calendarPeriods: [],
  seasonalPeriods: [],
  types: [],
  information: null,
  lengthVessel: null,
  choiceLengthVessel: null,
  grossTonnageVessel: null,
  choiceGrossTonnageVessel: null,
  unitsGrossTonnageVessel: null,
  isCommercialShip: false
};

export enum RestrictionLengthVessel {
  LENGTH_VESSEL = 'lengthVessel',
  CHOICE_LENGTH_VESSEL = 'choiceLengthVessel'
}

export enum RestrictionGrossTonnageVessel {
  GROSS_TONNAGE_VESSEL = 'grossTonnageVessel',
  CHOICE_GROSS_TONNAGE_VESSEL = 'choiceGrossTonnageVessel',
  UNITS_GROSS_TONNAGE_VESSEL = 'unitsGrossTonnageVessel'
}

export enum GeoregulationPartRestrictionVessel {
  GREATER_THAN = 'GREATER_THAN',
  GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
  LESS_THAN = 'LESS_THAN',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
}

export const TRANSLATIONS_LIST_GEOREGULATION_PART_RESTRICTION_VESSEL = {
  [GeoregulationPartRestrictionVessel.GREATER_THAN]: 'enum.georegulation-part-restrictions-vessel.greater_than',
  [GeoregulationPartRestrictionVessel.GREATER_OR_EQUAL]: 'enum.georegulation-part-restrictions-vessel.greater_or_equal',
  [GeoregulationPartRestrictionVessel.LESS_THAN]: 'enum.georegulation-part-restrictions-vessel.less_than',
  [GeoregulationPartRestrictionVessel.LESS_OR_EQUAL]: 'enum.georegulation-part-restrictions-vessel.less_or_equal'
};

export enum GeoregulationPartUnitGrossTonnage {
  UMS = 'UMS',
  TONNAGE = 'TONNAGE'
}

export const TRANSLATIONS_LIST_GEOREGULATION_PART_VESSEL_UNIT_TONNAGE = {
  [GeoregulationPartUnitGrossTonnage.UMS]: 'enum.georegulation-part-units-restriction-gross-tonnage-vessel.ums',
  [GeoregulationPartUnitGrossTonnage.TONNAGE]: 'enum.georegulation-part-units-restriction-gross-tonnage-vessel.tonnage'
};

export enum GeoregulationStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REPEALED = 'REPEALED'
}

export interface GeoregulationCreation {
  id?: string;
  serviceId: string;
  type: GeoregulationType;
  timezone: string;
  isTemporary: boolean;
  isAllTerritorialSea: boolean;
  isAnnouncedByAvurnavAvirade: boolean;
  maritimeEntityIds: Array<string>;
  mainNumber: GeoregulationNumber;
  additionalNumbers?: Array<GeoregulationNumber>;
  activities?: Array<GeoregulationActivity>;
  title?: string;
  internationalTitle?: string;
  summary?: string;
  internationalSummary?: string;
  internalComment?: string;
  attachmentIds?: Array<string>;
  attachmentFiles?: Array<CreationAttachment>;
  calendarPeriods?: Array<CalendarPeriod>;
  seasonalPeriods?: Array<SeasonalPeriod>;
  hasCoastlineLimit?: boolean;
  isPublic: boolean;
  markAsNewInMonths?: number;
  links?: Array<string>;
  parts: Array<JsonGeoregulationPart>;
  status: GeoregulationStatusEnum;
}

export const georegulationCreationInitValues: GeoregulationCreation = {
  id: null,
  serviceId: null,
  type: null,
  timezone: null,
  isTemporary: null,
  isAllTerritorialSea: false,
  isAnnouncedByAvurnavAvirade: false,
  maritimeEntityIds: [],
  mainNumber: {
    year: null,
    text: null,
    authorityIds: [],
    date: null
  },
  title: null,
  internationalTitle: null,
  summary: null,
  calendarPeriods: [],
  seasonalPeriods: [],
  hasCoastlineLimit: false,
  isPublic: null,
  markAsNewInMonths: 3,
  links: [],
  parts: [],
  status: GeoregulationStatusEnum.DRAFT
};

export interface GeoregulationNumber {
  year: number;
  text: string;
  authorityIds?: Array<string>;
  date?: string;
  authorities?: Array<MaritimeService>;
  authorityCodes?: Array<string>;
}

export enum GeoregulationType {
  NAVIGATION = 'NAVIGATION',
  MARITIME_PUBLIC_DOMAIN_OCCUPANCY = 'MARITIME_PUBLIC_DOMAIN_OCCUPANCY',
  OTHER = 'OTHER'
}

export enum GeoregulationActivity {
  NAVIGATION = 'NAVIGATION',
  ANCHORING = 'ANCHORING',
  FISHING = 'FISHING',
  DIVING = 'DIVING',
  WATER_SPORTS_AND_SEASIDE_ACTIVITIES = 'WATER_SPORTS_AND_SEASIDE_ACTIVITIES',
  PILOTAGE = 'PILOTAGE',
  OTHER_ACTIVITIES = 'OTHER_ACTIVITIES'
}

export enum GeoregulationPartType {
  NAVIGATION_PROHIBITED = 'NAVIGATION_PROHIBITED',
  NAVIGATION_RESTRICTED = 'NAVIGATION_RESTRICTED',
  ENTRY_PROHIBITED = 'ENTRY_PROHIBITED',
  ENTRY_RESTRICTED = 'ENTRY_RESTRICTED',
  ANCHORING_PROHIBITED = 'ANCHORING_PROHIBITED',
  ANCHORING_RESTRICTED = 'ANCHORING_RESTRICTED',
  FISHING_PROHIBITED = 'FISHING_PROHIBITED',
  FISHING_RESTRICTED = 'FISHING_RESTRICTED',
  FISHING_USING_TOWED_GEAR_PROHIBITED = 'FISHING_USING_TOWED_GEAR_PROHIBITED',
  FISHING_USING_TOWED_GEAR_RESTRICTED = 'FISHING_USING_TOWED_GEAR_RESTRICTED',
  FISHING_USING_PASSIVE_GEAR_PROHIBITED = 'FISHING_USING_PASSIVE_GEAR_PROHIBITED',
  FISHING_USING_PASSIVE_GEAR_RESTRICTED = 'FISHING_USING_PASSIVE_GEAR_RESTRICTED',
  TRAWLING_PROHIBITED = 'TRAWLING_PROHIBITED',
  TRAWLING_RESTRICTED = 'TRAWLING_RESTRICTED',
  DREDGING_PROHIBITED = 'DREDGING_PROHIBITED',
  DREDGING_RESTRICTED = 'DREDGING_RESTRICTED',
  DIVING_PROHIBITED = 'DIVING_PROHIBITED',
  DIVING_RESTRICTED = 'DIVING_RESTRICTED',
  LANDING_PROHIBITED = 'LANDING_PROHIBITED',
  LANDING_RESTRICTED = 'LANDING_RESTRICTED',
  SPEED_RESTRICTED = 'SPEED_RESTRICTED',
  BATHING_PROHIBITED = 'BATHING_PROHIBITED',
  MOVEMENT_PROHIBITED = 'MOVEMENT_PROHIBITED',
  MOVEMENT_RESTRICTED = 'MOVEMENT_RESTRICTED',
  STOPPING_PROHIBITED = 'STOPPING_PROHIBITED',
  STOPPING_RESTRICTED = 'STOPPING_RESTRICTED',
  RESTRICTED_FAIRWAY_OR_NARROW_CHANNEL = 'RESTRICTED_FAIRWAY_OR_NARROW_CHANNEL',
  VHF_WATCH = 'VHF_WATCH',
  OCCASIONAL_EXCLUSION = 'OCCASIONAL_EXCLUSION'
}

export const activities = [
  { key: 'NAVIGATION', value: 'enum.georegulation-activities.navigation' },
  { key: 'ANCHORING', value: 'enum.georegulation-activities.anchoring' },
  { key: 'FISHING', value: 'enum.georegulation-activities.fishing' },
  { key: 'DIVING', value: 'enum.georegulation-activities.diving' },
  { key: 'WATER_SPORTS_AND_SEASIDE_ACTIVITIES', value: 'enum.georegulation-activities.water_sports_and_seaside_activities' },
  { key: 'PILOTAGE', value: 'enum.georegulation-activities.pilotage' },
  { key: 'OTHER_ACTIVITIES', value: 'enum.georegulation-activities.other_activities' }
];

export const restrictionCategories = [
  { key: 'NAVIGATION_PROHIBITED', value: 'enum.georegulation-restrictions.navigation_prohibited' },
  { key: 'NAVIGATION_RESTRICTED', value: 'enum.georegulation-restrictions.navigation_restricted' },
  { key: 'ENTRY_PROHIBITED', value: 'enum.georegulation-restrictions.entry_prohibited' },
  { key: 'ENTRY_RESTRICTED', value: 'enum.georegulation-restrictions.entry_restricted' },
  { key: 'ANCHORING_PROHIBITED', value: 'enum.georegulation-restrictions.anchoring_prohibited' },
  { key: 'ANCHORING_RESTRICTED', value: 'enum.georegulation-restrictions.anchoring_restricted' },
  { key: 'FISHING_PROHIBITED', value: 'enum.georegulation-restrictions.fishing_prohibited' },
  { key: 'FISHING_RESTRICTED', value: 'enum.georegulation-restrictions.fishing_restricted' },
  { key: 'FISHING_USING_TOWED_GEAR_PROHIBITED', value: 'enum.georegulation-restrictions.fishing_using_towed_gear_prohibited' },
  { key: 'FISHING_USING_TOWED_GEAR_RESTRICTED', value: 'enum.georegulation-restrictions.fishing_using_towed_gear_restricted' },
  { key: 'FISHING_USING_PASSIVE_GEAR_PROHIBITED', value: 'enum.georegulation-restrictions.fishing_using_passive_gear_prohibited' },
  { key: 'FISHING_USING_PASSIVE_GEAR_RESTRICTED', value: 'enum.georegulation-restrictions.fishing_using_passive_gear_restricted' },
  { key: 'TRAWLING_PROHIBITED', value: 'enum.georegulation-restrictions.trawling_prohibited' },
  { key: 'TRAWLING_RESTRICTED', value: 'enum.georegulation-restrictions.trawling_restricted' },
  { key: 'DREDGING_PROHIBITED', value: 'enum.georegulation-restrictions.dredging_prohibited' },
  { key: 'DREDGING_RESTRICTED', value: 'enum.georegulation-restrictions.dredging_restricted' },
  { key: 'DIVING_PROHIBITED', value: 'enum.georegulation-restrictions.diving_prohibited' },
  { key: 'DIVING_RESTRICTED', value: 'enum.georegulation-restrictions.diving_restricted' },
  { key: 'LANDING_PROHIBITED', value: 'enum.georegulation-restrictions.landing_prohibited' },
  { key: 'LANDING_RESTRICTED', value: 'enum.georegulation-restrictions.landing_restricted' },
  { key: 'SPEED_RESTRICTED', value: 'enum.georegulation-restrictions.speed_restricted' },
  { key: 'BATHING_PROHIBITED', value: 'enum.georegulation-restrictions.bathing_prohibited' },
  { key: 'MOVEMENT_PROHIBITED', value: 'enum.georegulation-restrictions.movement_prohibited' },
  { key: 'MOVEMENT_RESTRICTED', value: 'enum.georegulation-restrictions.movement_restricted' },
  { key: 'STOPPING_PROHIBITED', value: 'enum.georegulation-restrictions.stopping_prohibited' },
  { key: 'STOPPING_RESTRICTED', value: 'enum.georegulation-restrictions.stopping_restricted' },
  { key: 'RESTRICTED_FAIRWAY_OR_NARROW_CHANNEL', value: 'enum.georegulation-restrictions.restricted_fairway_or_narrow_channel' },
  { key: 'VHF_WATCH', value: 'enum.georegulation-restrictions.vhf_watch' },
  { key: 'OCCASIONAL_EXCLUSION', value: 'enum.georegulation-restrictions.occasional_exclusion' }
];

export interface JsonGeoregulationNumberModalDetails extends Omit<GeoregulationNumber, 'date'> {
  date: string;
}

export interface GeoregulationPartModalDetails {
  features: Feature[];
  types?: GeoregulationPartType[];
  calendarPeriods?: CalendarPeriod[];
  seasonalPeriods?: SeasonalPeriod[];
  information?: string;
  internationalInformation?: string;
}

export interface JsonGeoregulationPartModalDetails extends Omit<GeoregulationPartModalDetails, 'features'> {
  features: JsonFeature[];
}

export interface GeoregulationModalDetails {
  id: string;
  mainNumber: GeoregulationNumber;
  additionalNumbers?: GeoregulationNumber[];
  temporary: boolean;
  calendarPeriods?: CalendarPeriod[];
  seasonalPeriods?: SeasonalPeriod[];
  type: GeoregulationType;
  hasCoastlineLimit: boolean;
  activities: GeoregulationActivity[];
  title?: string;
  internationalTitle?: string;
  entities?: MaritimeEntityBase[];
  summary?: string;
  internationalSummary?: string;
  parts: GeoregulationPartModalDetails[];
  attachments?: AttachmentDownload[];
  links?: string[];
  status: GeoregulationStatusEnum;
  publicationDate?: Date;
  repealDate?: Date;
  lastUpdate: Date;
  lastUpdateUser: string;
  issuingService: MaritimeServiceBase;
  internalComment?: string;
  isPublic?: boolean;
  canBeSent?: boolean;
  isNew?: boolean;
  canBeAddedToFolder?: boolean
}

export interface JsonGeoregulationModalDetails extends Omit<GeoregulationModalDetails, 'mainNumber' | 'additionalNumbers' | 'parts'> {
  mainNumber: JsonGeoregulationNumberModalDetails;
  additionalNumbers?: JsonGeoregulationNumberModalDetails[];
  parts: JsonGeoregulationPartModalDetails[];
}
