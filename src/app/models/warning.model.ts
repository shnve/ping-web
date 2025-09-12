import { FolderBase } from '@app/folder/models/folder.model';
import { SerieType } from '@app/models/serie.model';
import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { MapModelItem } from '@app/shared/components/details-map/details-map.component';
import { DateRange } from '@shared/models/date-range.model';
import { JsonFeature } from '@sig/models/geometry';
import Feature from 'ol/Feature';
import { Weaken } from '../types/utils';
import { GeoregulationSelectOption } from './georegulation.model';
import MaritimeEntity from './maritime-entity.model';


export enum GlobalWarningType {
  NOTICE = 'NOTICE',
  NOTICE_TP = 'NOTICE_TP',
  WARNING = 'WARNING'   // WARNING means 'Avurnav'
}

export enum WarningReferenceCategoryEnum {
  CANCELLATION = 'CANCELLATION',
  REPLACEMENT = 'REPLACEMENT',
  SOURCE_REFERENCE = 'SOURCE_REFERENCE'
}

export enum DiffusionNavtexEmergencyLevel {
  ROUTINE = 'ROUTINE',
  IMPORTANT = 'IMPORTANT',
  VITAL = 'VITAL'
}

export enum DiffusionNavtexType {
  A = 'A', // "Avertissements aux navigateurs"
  J = 'J', // "Messages concernant les satellites de navigation"
  K = 'K', // "Messages concernant d'autres aides électroniques à la navigation"
}

export interface DiffusionNavtex {
  id?: string;
  communicationType: DiffusionNavtexType;
  emergencyLevel: DiffusionNavtexEmergencyLevel;
  endDay?: number;
  endHour?: number;
  nitonNumber?: number;
  cancelNitonNumber?: number;
}

export interface MainWarningPart {
  id: string;
  nameOfSeries: string;
  warningNumber: number;
  year: number;
}


export interface WarningReference {
  id: string;
  nameOfSeries: string;
  warningNumber: number;
  year: number;
  creationDate: Date;
  publicationTime: Date;
}

export interface JsonMapWarning extends MainWarningPart {
  affectedAreas?: Array<JsonFeature>;
  geometries: Array<JsonFeature>;
  globalWarningType: string;
  warningTypeDetails: string;
}

export interface MapWarning extends Weaken<JsonMapWarning, 'affectedAreas' | 'geometries'> {
  affectedAreas: Array<Feature>;
  geometries: Array<Feature>;
}

export interface TableWarning extends MainWarningPart {
  generalAreas: { [lang: string]: Array<string> };
  localities: { [lang: string]: Array<string> };
  warningTypeDetails: string;
  warningHazardTypeGeneral: string;
  publicationTime?: Date;
  featureParts?: Array<WarningFeaturePart>;
  entities?: Array<string>;
  folders?: Array<string>;
  cancellationDate?: Date;
  cancelledWarnings?: Array<MainWarningPart>;
  status?: string;
}

export interface JsonWarning extends MainWarningPart {
  globalWarningType: string;
  generalAreas?: { [lang: string]: Array<string> };
  localities?: { [lang: string]: Array<string> };
  warningHazardTypeGeneral: string;
  featureParts?: Array<JsonWarningFeaturePart>;
  cancellationDate?: Date;
  addCancellationTimeToTelex?: boolean;
  publicationTime: Date;
  serieType: SerieType;
  serieId: string;
  status?: string;
  cancelledWarnings?: Array<MainWarningPart>;
  attachmentsPublicsReferences?: Array<AttachmentDownload>;
  warningLinksPublicsReferences?: Array<WarningLinkPublicReference>;
  entitiesReferencesPublicsReferences?: Array<WarningMaritimeEntityReference>;
  warningReferencesAsPublicsReferences?: Array<WarningReferenceAsPublicReference>;
  georegulationPublicsReferences?: Array<GeoregulationSelectOption>;
}

export interface AdminJsonWarning extends JsonWarning {
  serviceId?: string;
  creationDate?: Date;
  estimatedPublicationDate?: Date;
  reviewDate?: Date;
  endOfBroadcastDate?: Date;
  lastUpdate?: Date;
  cancelledWarnings?: Array<MainWarningPart>;
  replacedWarnings?: Array<MainWarningPart>;
  inforcedWarnings?: Array<MainWarningPart>;
  parentWarnings?: Array<MainWarningPart>;
  attachments?: Array<AttachmentDownload>;
  internalComment?: string;
  lastUpdateUser?: LastUpdateUser;
  canBePublished: boolean;
  maritimeEntities?: Array<MaritimeEntity>;
  folders?: Array<FolderBase>;
  forceToReview?: boolean;
  canBeAddedToFolder?: boolean;
}

export interface LastUpdateUser {
  firstname: string;
  lastname: string;
}

export interface AttachmentDownload {
  id: string;
  filename: string;
}

export interface Warning extends Weaken<JsonWarning, 'featureParts'>, MapModelItem {
  featureParts: Array<WarningFeaturePart>;
}

export interface AdminWarning extends Weaken<AdminJsonWarning, 'featureParts'> {
  featureParts: Array<WarningFeaturePart>;
}

export interface JsonWarningFeaturePart {
  geometries?: Array<JsonFeature>;
  affectedAreas?: Array<JsonFeature>;
  typeDetails?: Array<string>;
  information?: { [lang: string]: string };
  dateRanges?: Array<DateRange>;
}

export interface WarningFeaturePart extends Weaken<JsonWarningFeaturePart, 'geometries' | 'affectedAreas'> {
  geometries: Array<Feature>;
  affectedAreas: Array<Feature>;
}

export interface WarningReferenceAsPublicReference {
  warningId: string;
  nameOfSeries: string;
  warningNumber: number;
  year: number;
  category: WarningReferenceCategoryEnum;
}

export interface WarningLinkPublicReference {
  id?: string;
  warningId: string;
  title: string;
  internationalTitle?: string;
  url?: string;
}

export interface WarningMaritimeEntityReference {
  id: string;
  maritimeEntityName: string;
  maritimeEntityInternationalName?: string;
  title: string;
  internationalTitle?: string;
  url?: string;
  attachmentId?: string;
  attachmentFile?: CreationAttachment;
}

export const listWarningHazardTypeDetails = [
  { key: "CONTAINER_ADRIFT", value: "enum.warning-hazard-type-details.container-adrift" },
  { key: "SCIENTIFIC_BUOY_ADRIFT", value: "enum.warning-hazard-type-details.scientific-buoy-adrift" },
  { key: "VESSEL_ADRIFT", value: "enum.warning-hazard-type-details.vessel-adrift" },
  { key: "DERELICT_VESSEL_ADRIFT", value: "enum.warning-hazard-type-details.derelict-vessel-adrift" },
  { key: "DEAD_WHALE_ADRIFT", value: "enum.warning-hazard-type-details.dead-whale-adrift" },
  { key: "LOG_ADRIFT", value: "enum.warning-hazard-type-details.log-adrift" },
  { key: "DEAD_HEAD_ADRIFT", value: "enum.warning-hazard-type-details.dead-head-adrift" },
  { key: "LOG_BOOM_ADRIFT", value: "enum.warning-hazard-type-details.log-boom-adrift" },
  { key: "DOCK_ADRIFT", value: "enum.warning-hazard-type-details.dock-adrift" },
  { key: "FISH_NET_ADRIFT", value: "enum.warning-hazard-type-details.fish-net-adrift" },
  { key: "FLOATING_DEBRIS", value: "enum.warning-hazard-type-details.floating-debris" },
  { key: "OBJECT_ADRIFT", value: "enum.warning-hazard-type-details.object-adrift" },
  { key: "SANDSPIT", value: "enum.warning-hazard-type-details.sandspit" },
  { key: "SHALLOW_DEPTH_REPORTED", value: "enum.warning-hazard-type-details.shallow-depth-reported" },
  { key: "SHALLOW_DEPTH_CONFIRMED", value: "enum.warning-hazard-type-details.shallow-depth-confirmed" },
  { key: "SUBMERGED_FISH_NET", value: "enum.warning-hazard-type-details.submerged-fish-net" },
  { key: "UNCHARTED_ROCK", value: "enum.warning-hazard-type-details.uncharted-rock" },
  { key: "DANGEROUS_WRECK", value: "enum.warning-hazard-type-details.dangerous-wreck" },
  { key: "SUBSURFACE_MOORING", value: "enum.warning-hazard-type-details.subsurface-mooring" },
  { key: "SUBMERGED_OBJECT", value: "enum.warning-hazard-type-details.submerged-object" },
  { key: "ACOUSTIC_RECORDER", value: "enum.warning-hazard-type-details.acoustic-recorder" },
  { key: "SCIENTIFIC_BUOY_APPARATUS", value: "enum.warning-hazard-type-details.scientific-buoy-apparatus" },
  { key: "SCIENTIFIC_MOORING", value: "enum.warning-hazard-type-details.scientific-mooring" },
  { key: "TIDE_GAUGE", value: "enum.warning-hazard-type-details.tide-gauge" },
  { key: "OPEN_CLOSE_WATERWAY", value: "enum.warning-hazard-type-details.open-close-waterway" },
  { key: "WATERWAY_RECOMMENDED_NOT_RECOMMENDED_FOR_SHIPPING", value: "enum.warning-hazard-type-details.waterway-recommended-not-recommended-for-shipping" },
  { key: "VTS_CHANGE", value: "enum.warning-hazard-type-details.vts-change" },
  { key: "RADAR_SURVEILLANCE_SYSTEM", value: "enum.warning-hazard-type-details.radar-surveillance-system" },
  { key: "REGULATION", value: "enum.warning-hazard-type-details.regulation" },
  { key: "RESTRICTED_AREA", value: "enum.warning-hazard-type-details.restricted-area" },
  { key: "EXCLUSION_ZONES", value: "enum.warning-hazard-type-details.exclusion-zones" },
  { key: "REGATTA_RACE", value: "enum.warning-hazard-type-details.regatta-race" },
  { key: "SWIMMERS", value: "enum.warning-hazard-type-details.swimmers" },
  { key: "MARINE_MAMMALS", value: "enum.warning-hazard-type-details.marine-mammals" },
  { key: "FIREWORKS", value: "enum.warning-hazard-type-details.fireworks" },
  { key: "CLUSTER_OF_FISHING_VESSELS", value: "enum.warning-hazard-type-details.cluster-of-fishing-vessels" },
  { key: "TRAFFIC_CONGESTION", value: "enum.warning-hazard-type-details.traffic-congestion" },
  { key: "VESSEL_DISABLED", value: "enum.warning-hazard-type-details.vessel-disabled" },
  { key: "OPEN_CLOSE_HARBOUR", value: "enum.warning-hazard-type-details.open-close-harbour" },
  { key: "OPEN_CLOSE_SWING_BRIDGE", value: "enum.warning-hazard-type-details.open-close-swing-bridge" },
  { key: "VERTICAL_CLEARANCE_REDUCED", value: "enum.warning-hazard-type-details.vertical-clearance-reduced" },
  { key: "DREDGING_OPERATION", value: "enum.warning-hazard-type-details.dredging-operation" },
  { key: "BREAKWATER_CONSTRUCTION", value: "enum.warning-hazard-type-details.breakwater-construction" },
  { key: "WHARF_CONSTRUCTION", value: "enum.warning-hazard-type-details.wharf-construction" },
  { key: "DIVING_OPERATIONS", value: "enum.warning-hazard-type-details.diving-operations" },
  { key: "CABLE_LAYING_OPERATION", value: "enum.warning-hazard-type-details.cable-laying-operation" },
  { key: "OPERATION_ON_CABLE", value: "enum.warning-hazard-type-details.operation-on-cable" },
  { key: "PIPE_LAYING_OPERATION", value: "enum.warning-hazard-type-details.pipe-laying-operation" },
  { key: "OPERATION_ON_PIPE", value: "enum.warning-hazard-type-details.operation-on-pipe" },
  { key: "WORKS_IN_PROGRESS", value: "enum.warning-hazard-type-details.works-in-progress" },
  { key: "SEA_TRIALS", value: "enum.warning-hazard-type-details.sea-trials" },
  { key: "SEAPLANE_OPERATIONS", value: "enum.warning-hazard-type-details.seaplane-operations" },
  { key: "MILITARY_EXERCISE", value: "enum.warning-hazard-type-details.military-exercise" },
  { key: "FIRING_EXERCISE", value: "enum.warning-hazard-type-details.firing-exercise" },
  { key: "JAMMING_EXERCISE", value: "enum.warning-hazard-type-details.jamming-exercise" },
  { key: "MILITARY_OPERATION", value: "enum.warning-hazard-type-details.military-operation" },
  { key: "BLASTING_OPERATION", value: "enum.warning-hazard-type-details.blasting-operation" },
  { key: "ANTI_POLLUTION_EXERCISE", value: "enum.warning-hazard-type-details.anti-pollution-exercise" },
  { key: "ANTI_POLLUTION_OPERATION", value: "enum.warning-hazard-type-details.anti-pollution-operation" },
  { key: "SAR_EXERCISE", value: "enum.warning-hazard-type-details.sar-exercise" },
  { key: "SAR_OPERATION", value: "enum.warning-hazard-type-details.sar-operation" },
  { key: "HYDROGRAPHIC_SURVEY", value: "enum.warning-hazard-type-details.hydrographic-survey" },
  { key: "SCIENTIFIC_SURVEY", value: "enum.warning-hazard-type-details.scientific-survey" },
  { key: "SEISMIC_SURVEY", value: "enum.warning-hazard-type-details.seismic-survey" },
  { key: "DRILL_RIG_UNDER_TOW", value: "enum.warning-hazard-type-details.drill-rig-under-tow" },
  { key: "UNWIELDY_TOW", value: "enum.warning-hazard-type-details.unwieldy-tow" },
  { key: "MINES", value: "enum.warning-hazard-type-details.mines" },
  { key: "EXPLOSIVE_DEVICE", value: "enum.warning-hazard-type-details.explosive-device" },
  { key: "FALLOUT_HAZARD", value: "enum.warning-hazard-type-details.fallout-hazard" },
  { key: "HAZARDOUS_AREA", value: "enum.warning-hazard-type-details.hazardous-area" },
  { key: "AQUACULTURE_SITE", value: "enum.warning-hazard-type-details.aquaculture-site" },
  { key: "FISH_AGGREGATING_DEVICE_FAD", value: "enum.warning-hazard-type-details.fish-aggregating-device-fad" },
  { key: "DRILLING_SITE_OPERATIONS", value: "enum.warning-hazard-type-details.drilling-site-operations" },
  { key: "RENEWABLE_ENERGY_DEVICE_FARM", value: "enum.warning-hazard-type-details.renewable-energy-device-farm" },
  { key: "LIGHT_BUOY_LIGHT_UNLIT", value: "enum.warning-hazard-type-details.light-buoy-light-unlit" },
  { key: "LIGHT_BUOY_LIGHT_UNRELIABLE", value: "enum.warning-hazard-type-details.light-buoy-light-unreliable" },
  { key: "LIGHT_BUOY_LIGHT_NOT_SYNCHRONIZED", value: "enum.warning-hazard-type-details.light-buoy-light-not-synchronized" },
  { key: "LIGHT_BUOY_LIGHT_DAMAGED", value: "enum.warning-hazard-type-details.light-buoy-light-damaged" },
  { key: "BUOY_MISSING", value: "enum.warning-hazard-type-details.buoy-missing" },
  { key: "BUOY_OFF_POSITION", value: "enum.warning-hazard-type-details.buoy-off-position" },
  { key: "BUOY_ADRIFT", value: "enum.warning-hazard-type-details.buoy-adrift" },
  { key: "BUOY_DAMAGED", value: "enum.warning-hazard-type-details.buoy-damaged" },
  { key: "BUOY_DESTROYED", value: "enum.warning-hazard-type-details.buoy-destroyed" },
  { key: "BUOY_TOPMARK_MISSING", value: "enum.warning-hazard-type-details.buoy-topmark-missing" },
  { key: "BUOY_TOPMARK_DAMAGED", value: "enum.warning-hazard-type-details.buoy-topmark-damaged" },
  { key: "BUOY_DAYMARK_UNRELIABLE", value: "enum.warning-hazard-type-details.buoy-daymark-unreliable" },
  { key: "MARINE_AIDS_TO_NAVIGATION_UNRELIABLE", value: "enum.warning-hazard-type-details.marine-aids-to-navigation-unreliable" },
  { key: "BUOY_RE_ESTABLISHMENT", value: "enum.warning-hazard-type-details.buoy-re-establishment" },
  { key: "BUOY_RESTORED_TO_NORMAL", value: "enum.warning-hazard-type-details.buoy-restored-to-normal" },
  { key: "LIGHT_UNLIT", value: "enum.warning-hazard-type-details.light-unlit" },
  { key: "LIGHT_UNRELIABLE", value: "enum.warning-hazard-type-details.light-unreliable" },
  { key: "LIGHT_RANGE_REDUCED", value: "enum.warning-hazard-type-details.light-range-reduced" },
  { key: "LIGHT_WITHOUT_RHYTHM", value: "enum.warning-hazard-type-details.light-without-rhythm" },
  { key: "LIGHT_OUT_OF_SYNCHRONIZATION", value: "enum.warning-hazard-type-details.light-out-of-synchronization" },
  { key: "LIGHT_DAYMARK_UNRELIABLE", value: "enum.warning-hazard-type-details.light-daymark-unreliable" },
  { key: "LIGHT_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.light-operating-properly" },
  { key: "SECTOR_LIGHT_SECTOR_OBSCURED", value: "enum.warning-hazard-type-details.sector-light-sector-obscured" },
  { key: "LIGHT_RE_ESTABLISHMENT", value: "enum.warning-hazard-type-details.light-re-establishment" },
  { key: "BEACON_MISSING", value: "enum.warning-hazard-type-details.beacon-missing" },
  { key: "BEACON_DAMAGED", value: "enum.warning-hazard-type-details.beacon-damaged" },
  { key: "LIGHTED_BEACON_LIGHT_UNLIT", value: "enum.warning-hazard-type-details.lighted-beacon-light-unlit" },
  { key: "LIGHTED_BEACON_LIGHT_UNRELIABLE", value: "enum.warning-hazard-type-details.lighted-beacon-light-unreliable" },
  { key: "LIGHTED_BEACON_LIGHT_NOT_SYNCHRONIZED", value: "enum.warning-hazard-type-details.lighted-beacon-light-not-synchronized" },
  { key: "LIGHTED_BEACON_LIGHT_DAMAGED", value: "enum.warning-hazard-type-details.lighted-beacon-light-damaged" },
  { key: "BEACON_TOPMARK_MISSING", value: "enum.warning-hazard-type-details.beacon-topmark-missing" },
  { key: "BEACON_TOPMARK_DAMAGED", value: "enum.warning-hazard-type-details.beacon-topmark-damaged" },
  { key: "BEACON_DAYMARK_UNRELIABLE", value: "enum.warning-hazard-type-details.beacon-daymark-unreliable" },
  { key: "FLOODLIT_BEACON_UNLIT", value: "enum.warning-hazard-type-details.floodlit-beacon-unlit" },
  { key: "BEACON_RESTORED_TO_NORMAL", value: "enum.warning-hazard-type-details.beacon-restored-to-normal" },
  { key: "FRONT_LEADING_RANGE_LIGHT_LIGHT_UNLIT", value: "enum.warning-hazard-type-details.front-leading-range-light-light-unlit" },
  { key: "REAR_LEADING_RANGE_LIGHT_LIGHT_UNLIT", value: "enum.warning-hazard-type-details.rear-leading-range-light-light-unlit" },
  { key: "FRONT_LEADING_RANGE_LIGHT_UNRELIABLE", value: "enum.warning-hazard-type-details.front-leading-range-light-unreliable" },
  { key: "REAR_LEADING_RANGE_LIGHT_UNRELIABLE", value: "enum.warning-hazard-type-details.rear-leading-range-light-unreliable" },
  { key: "FRONT_LEADING_RANGE_LIGHT_LIGHT_RANGE_REDUCED", value: "enum.warning-hazard-type-details.front-leading-range-light-light-range-reduced" },
  { key: "REAR_LEADING_RANGE_LIGHT_LIGHT_RANGE_REDUCED", value: "enum.warning-hazard-type-details.rear-leading-range-light-light-range-reduced" },
  { key: "FRONT_LEADING_RANGE_LIGHT_WITHOUT_RHYTHM", value: "enum.warning-hazard-type-details.front-leading-range-light-without-rhythm" },
  { key: "REAR_LEADING_RANGE_LIGHT_WITHOUT_RHYTHM", value: "enum.warning-hazard-type-details.rear-leading-range-light-without-rhythm" },
  { key: "LEADING_RANGE_LIGHTS_OUT_OF_SYNCHRONIZATION", value: "enum.warning-hazard-type-details.leading-range-lights-out-of-synchronization" },
  { key: "FRONT_LEADING_RANGE_BEACON_UNRELIABLE", value: "enum.warning-hazard-type-details.front-leading-range-beacon-unreliable" },
  { key: "REAR_LEADING_RANGE_BEACON_UNRELIABLE", value: "enum.warning-hazard-type-details.rear-leading-range-beacon-unreliable" },
  { key: "FRONT_LEADING_RANGE_LIGHT_IS_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.front-leading-range-light-is-operating-properly" },
  { key: "REAR_LEADING_RANGE_LIGHT_IS_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.rear-leading-range-light-is-operating-properly" },
  { key: "FRONT_LEADING_RANGE_BEACON_RESTORED_TO_NORMAL", value: "enum.warning-hazard-type-details.front-leading-range-beacon-restored-to-normal" },
  { key: "REAR_LEADING_RANGE_BEACON_RESTORED_TO_NORMAL", value: "enum.warning-hazard-type-details.rear-leading-range-beacon-restored-to-normal" },
  { key: "FOG_SIGNAL_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.fog-signal-out-of-service" },
  { key: "FOG_SIGNAL_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.fog-signal-operating-properly" },
  { key: "AUDIBLE_SIGNAL_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.audible-signal-out-of-service" },
  { key: "AUDIBLE_SIGNAL_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.audible-signal-operating-properly" },
  { key: "AIS_TRANSMITTER_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.ais-transmitter-out-of-service" },
  { key: "AIS_TRANSMITTER_UNREALIABLE", value: "enum.warning-hazard-type-details.ais-transmitter-unrealiable" },
  { key: "AIS_TRANSMITTER_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.ais-transmitter-operating-properly" },
  { key: "V_AIS_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.v-ais-out-of-service" },
  { key: "V_AIS_UNREALIABLE", value: "enum.warning-hazard-type-details.v-ais-unrealiable" },
  { key: "V_AIS_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.v-ais-operating-properly" },
  { key: "RACON_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.racon-out-of-service" },
  { key: "RACON_UNREALIABLE", value: "enum.warning-hazard-type-details.racon-unrealiable" },
  { key: "RACON_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.racon-operating-properly" },
  { key: "RAMARK_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.ramark-out-of-service" },
  { key: "RAMARK_UNREALIABLE", value: "enum.warning-hazard-type-details.ramark-unrealiable" },
  { key: "RAMARK_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.ramark-operating-properly" },
  { key: "GNSS_DEGRADATION", value: "enum.warning-hazard-type-details.gnss-degradation" },
  { key: "DGPS_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.dgps-out-of-service" },
  { key: "DGPS_UNRELIABLE", value: "enum.warning-hazard-type-details.dgps-unreliable" },
  { key: "DGPS_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.dgps-operating-properly" },
  { key: "LORAN_C_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.loran-c-out-of-service" },
  { key: "LORAN_C_UNREALIABLE", value: "enum.warning-hazard-type-details.loran-c-unrealiable" },
  { key: "LORAN_C_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.loran-c-operating-properly" },
  { key: "ELORAN_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.eloran-out-of-service" },
  { key: "ELORAN_UNREALIABLE", value: "enum.warning-hazard-type-details.eloran-unrealiable" },
  { key: "ELORAN_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.eloran-operating-properly" },
  { key: "DGLONASS_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.dglonass-out-of-service" },
  { key: "DGLONASS_UNREALIABLE", value: "enum.warning-hazard-type-details.dglonass-unrealiable" },
  { key: "DGLONASS_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.dglonass-operating-properly" },
  { key: "CHAYKA_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.chayka-out-of-service" },
  { key: "CHAYKA_UNREALIABLE", value: "enum.warning-hazard-type-details.chayka-unrealiable" },
  { key: "CHAYKA_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.chayka-operating-properly" },
  { key: "E_CHAYKA_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.e-chayka-out-of-service" },
  { key: "E_CHAYKA_UNREALIABLE", value: "enum.warning-hazard-type-details.e-chayka-unrealiable" },
  { key: "E_CHAYKA_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.e-chayka-operating-properly" },
  { key: "EGNOS_OUT_OF_SERVICE", value: "enum.warning-hazard-type-details.egnos-out-of-service" },
  { key: "EGNOS_UNREALIABLE", value: "enum.warning-hazard-type-details.egnos-unrealiable" },
  { key: "EGNOS_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.egnos-operating-properly" },
  { key: "SEASONAL_RECOMMISSIONING_IN_PROGRESS", value: "enum.warning-hazard-type-details.seasonal-recommissioning-in-progress" },
  { key: "SEASONAL_RECOMMISSIONING_COMPLETE", value: "enum.warning-hazard-type-details.seasonal-recommissioning-complete" },
  { key: "BUOY_RECOMMISSIONED_FOR_NAVIGATION_SEASON", value: "enum.warning-hazard-type-details.buoy-recommissioned-for-navigation-season" },
  { key: "TEMPORARY_BUOY_BUOYS", value: "enum.warning-hazard-type-details.temporary-buoy-buoys" },
  { key: "BUOY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.buoy-establishment" },
  { key: "BUOY_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.buoy-temporary-establishment" },
  { key: "LIGHT_ESTABLISHMENT", value: "enum.warning-hazard-type-details.light-establishment" },
  { key: "LIGHT_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.light-temporary-establishment" },
  { key: "BEACON_ESTABLISHMENT", value: "enum.warning-hazard-type-details.beacon-establishment" },
  { key: "BEACON_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.beacon-temporary-establishment" },
  { key: "FOG_SIGNAL_ESTABLISHMENT", value: "enum.warning-hazard-type-details.fog-signal-establishment" },
  { key: "FOG_SIGNAL_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.fog-signal-temporary-establishment" },
  { key: "AUDIBLE_SIGNAL_ESTABLISHMENT", value: "enum.warning-hazard-type-details.audible-signal-establishment" },
  { key: "AUDIBLE_SIGNAL_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.audible-signal-temporary-establishment" },
  { key: "AIS_TRASMITTER_ESTABLISHMENT", value: "enum.warning-hazard-type-details.ais-trasmitter-establishment" },
  { key: "AIS_TRASMITTER_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.ais-trasmitter-temporary-establishment" },
  { key: "V_AIS_ESTABLISHMENT", value: "enum.warning-hazard-type-details.v-ais-establishment" },
  { key: "V_AIS_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.v-ais-temporary-establishment" },
  { key: "RACON_ESTABLISHMENT", value: "enum.warning-hazard-type-details.racon-establishment" },
  { key: "RACON_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.racon-temporary-establishment" },
  { key: "RAMARK_ESTABLISHMENT", value: "enum.warning-hazard-type-details.ramark-establishment" },
  { key: "RAMARK_TEMPORARY_ESTABLISHMENT", value: "enum.warning-hazard-type-details.ramark-temporary-establishment" },
  { key: "DGPS_STATION_ESTABLISHMENT", value: "enum.warning-hazard-type-details.dgps-station-establishment" },
  { key: "ELORAN_STATION_ESTABLISHMENT", value: "enum.warning-hazard-type-details.eloran-station-establishment" },
  { key: "DGLONASS_STATION_ESTABLISHMENT", value: "enum.warning-hazard-type-details.dglonass-station-establishment" },
  { key: "E_CHAYKA_STATION_ESTABLISHMENT", value: "enum.warning-hazard-type-details.e-chayka-station-establishment" },
  { key: "EGNOS_STATION_ESTABLISHMENT", value: "enum.warning-hazard-type-details.egnos-station-establishment" },
  { key: "BUOY_WILL_BE_WITHDRAWN", value: "enum.warning-hazard-type-details.buoy-will-be-withdrawn" },
  { key: "BUOY_WITHDRAWN", value: "enum.warning-hazard-type-details.buoy-withdrawn" },
  { key: "BUOY_REMOVAL", value: "enum.warning-hazard-type-details.buoy-removal" },
  { key: "BUOY_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.buoy-temporary-removal" },
  { key: "SEASONAL_DECOMMISSIONING_IN_PROGRESS", value: "enum.warning-hazard-type-details.seasonal-decommissioning-in-progress" },
  { key: "SEASONAL_DECOMMISSIONING_COMPLETE", value: "enum.warning-hazard-type-details.seasonal-decommissioning-complete" },
  { key: "BUOY_LIFTED_FOR_WINTER", value: "enum.warning-hazard-type-details.buoy-lifted-for-winter" },
  { key: "BUOY_REPLACED_BY_WINTER_SPAR", value: "enum.warning-hazard-type-details.buoy-replaced-by-winter-spar" },
  { key: "BUOY_DECOMMISSIONED_FOR_WINTER", value: "enum.warning-hazard-type-details.buoy-decommissioned-for-winter" },
  { key: "LIGHT_REMOVAL", value: "enum.warning-hazard-type-details.light-removal" },
  { key: "LIGHT_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.light-temporary-removal" },
  { key: "BEACON_REMOVAL", value: "enum.warning-hazard-type-details.beacon-removal" },
  { key: "BEACON_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.beacon-temporary-removal" },
  { key: "FOG_SIGNAL_REMOVAL", value: "enum.warning-hazard-type-details.fog-signal-removal" },
  { key: "FOG_SIGNAL_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.fog-signal-temporary-removal" },
  { key: "AUDIBLE_SIGNAL_REMOVAL", value: "enum.warning-hazard-type-details.audible-signal-removal" },
  { key: "AUDIBLE_SIGNAL_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.audible-signal-temporary-removal" },
  { key: "AIS_TRANSMITTER_REMOVAL", value: "enum.warning-hazard-type-details.ais-transmitter-removal" },
  { key: "AIS_TRANSMITTER_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.ais-transmitter-temporary-removal" },
  { key: "V_AIS_REMOVAL", value: "enum.warning-hazard-type-details.v-ais-removal" },
  { key: "V_AIS_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.v-ais-temporary-removal" },
  { key: "RACON_REMOVAL", value: "enum.warning-hazard-type-details.racon-removal" },
  { key: "RACON_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.racon-temporary-removal" },
  { key: "RAMARKREMOVAL", value: "enum.warning-hazard-type-details.ramarkremoval" },
  { key: "RAMARK_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.ramark-temporary-removal" },
  { key: "DGPS_STATION_REMOVAL", value: "enum.warning-hazard-type-details.dgps-station-removal" },
  { key: "DGPS_STATION_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.dgps-station-temporary-removal" },
  { key: "LORAN_C_STATION_REMOVAL", value: "enum.warning-hazard-type-details.loran-c-station-removal" },
  { key: "LORAN_C_STATION_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.loran-c-station-temporary-removal" },
  { key: "ELORAN_STATION_REMOVAL", value: "enum.warning-hazard-type-details.eloran-station-removal" },
  { key: "ELORAN_STATION_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.eloran-station-temporary-removal" },
  { key: "CHAYKA_STATION_REMOVAL", value: "enum.warning-hazard-type-details.chayka-station-removal" },
  { key: "CHAYKA_STATION_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.chayka-station-temporary-removal" },
  { key: "E_CHAYKA_STATION_REMOVAL", value: "enum.warning-hazard-type-details.e-chayka-station-removal" },
  { key: "E_CHAYKA_STATION_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.e-chayka-station-temporary-removal" },
  { key: "EGNOS_STATION_REMOVAL", value: "enum.warning-hazard-type-details.egnos-station-removal" },
  { key: "EGNOS_STATION_TEMPORARY_REMOVAL", value: "enum.warning-hazard-type-details.egnos-station-temporary-removal" },
  { key: "BUOY_MOVE", value: "enum.warning-hazard-type-details.buoy-move" },
  { key: "BUOY_CHANGE", value: "enum.warning-hazard-type-details.buoy-change" },
  { key: "BUOY_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.buoy-temporary-change" },
  { key: "LIGHT_CHANGE", value: "enum.warning-hazard-type-details.light-change" },
  { key: "LIGHT_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.light-temporary-change" },
  { key: "SECTOR_LIGHT_CHANGE", value: "enum.warning-hazard-type-details.sector-light-change" },
  { key: "SECTOR_LIGHT_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.sector-light-temporary-change" },
  { key: "BEACON_CHANGE", value: "enum.warning-hazard-type-details.beacon-change" },
  { key: "BEACON_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.beacon-temporary-change" },
  { key: "FOG_SIGNAL_CHANGE", value: "enum.warning-hazard-type-details.fog-signal-change" },
  { key: "FOG_SIGNAL_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.fog-signal-temporary-change" },
  { key: "AUDIBLE_SIGNAL_CHANGE", value: "enum.warning-hazard-type-details.audible-signal-change" },
  { key: "AUDIBLE_SIGNAL_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.audible-signal-temporary-change" },
  { key: "V_AIS_CHANGE", value: "enum.warning-hazard-type-details.v-ais-change" },
  { key: "V_AIS_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.v-ais-temporary-change" },
  { key: "RACON_CHANGE", value: "enum.warning-hazard-type-details.racon-change" },
  { key: "RACON_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.racon-temporary-change" },
  { key: "RAMARK_CHANGE", value: "enum.warning-hazard-type-details.ramark-change" },
  { key: "RAMARK_TEMPORARY_CHANGE", value: "enum.warning-hazard-type-details.ramark-temporary-change" },
  { key: "ATON_OPERATING_PROPERLY", value: "enum.warning-hazard-type-details.aton-operating-properly" },
  { key: "VHF_SERVICE", value: "enum.warning-hazard-type-details.vhf-service" },
  { key: "HF_SERVICE", value: "enum.warning-hazard-type-details.hf-service" },
  { key: "MF_SERVICE", value: "enum.warning-hazard-type-details.mf-service" },
  { key: "EGC_MSI_SERVICE", value: "enum.warning-hazard-type-details.egc-msi-service" },
  { key: "NAVTEX", value: "enum.warning-hazard-type-details.navtex" },
  { key: "MSI_SERVICES", value: "enum.warning-hazard-type-details.msi-services" },
  { key: "TSUNAMI_WARNING", value: "enum.warning-hazard-type-details.tsunami-warning" },
  { key: "VOLCANO_ACTIVITY", value: "enum.warning-hazard-type-details.volcano-activity" },
  { key: "LOW_WATER_LEVEL", value: "enum.warning-hazard-type-details.low-water-level" },
  { key: "HIGH_WATER_LEVEL", value: "enum.warning-hazard-type-details.high-water-level" },
  { key: "STORM_SURGE", value: "enum.warning-hazard-type-details.storm-surge" },
  { key: "ICE_BOOM", value: "enum.warning-hazard-type-details.ice-boom" },
  { key: "ICE_CONTROL_ZONE", value: "enum.warning-hazard-type-details.ice-control-zone" },
  { key: "ICEBERG_OUTSIDE_OF_ADVERTISED_LIMIT", value: "enum.warning-hazard-type-details.iceberg-outside-of-advertised-limit" },
  { key: "UNIDENTIFIED_RADAR_TARGET_POSSIBLE_ICEBERG", value: "enum.warning-hazard-type-details.unidentified-radar-target-possible-iceberg" },
  { key: "AUTHORIZED_ICE_ROUTING_INFORMATION", value: "enum.warning-hazard-type-details.authorized-ice-routing-information" },
  { key: "NATIONAL_HEALTH_AUTHORITY_NOTICE", value: "enum.warning-hazard-type-details.national-health-authority-notice" },
  { key: "WORLD_HEALTH_ORGANIZATION_NOTICE", value: "enum.warning-hazard-type-details.world-health-organization-notice" },
  { key: "LOCAL_HEALTH_AUTHORITY_NOTICE", value: "enum.warning-hazard-type-details.local-health-authority-notice" },
  { key: "MARITIME_SECURITY_LEVEL_CHANGE", value: "enum.warning-hazard-type-details.maritime-security-level-change" },
  { key: "SECURITY_REGULATION_CHANGE", value: "enum.warning-hazard-type-details.security-regulation-change" },
  { key: 'SUBMARINE_PIPELINE_CHG', value: "enum.warning-hazard-type-details.submarine-pipeline-chg" },
  { key: 'BRIDGE_HORIZ_CLEAR_CHG', value: "enum.warning-hazard-type-details.bridge-horiz-clear-chg" },
  { key: 'BRIDGE_UNABLE_CLOSE', value: "enum.warning-hazard-type-details.bridge-unable-close" },
  { key: 'BRIDGE_UNABLE_OPEN', value: "enum.warning-hazard-type-details.bridge-unable-open" },
  { key: 'BRIDGE_VERT_CLEAR_CHG', value: "enum.warning-hazard-type-details.bridge-vert-clear-chg" },
  { key: 'LOCK_CLOSED', value: "enum.warning-hazard-type-details.lock-closed" },
  { key: 'HORIZ_CLEAR_REDUCED', value: "enum.warning-hazard-type-details.horiz-clear-reduced" },
  { key: 'UNDERWATER_OPERATIONS', value: "enum.warning-hazard-type-details.underwater-operations" },
  { key: 'LONG_FISHING_GEAR', value: "enum.warning-hazard-type-details.long-fishing-gear" },
  { key: 'NUMEROUS_FISHING_VESSELS', value: "enum.warning-hazard-type-details.numerous-fishing-vessels" },
  { key: 'OFFSHORE_RIGS_PLATFORM_CHG', value: "enum.warning-hazard-type-details.offshore-rigs-platform-chg" },
  { key: 'SUBMARINE_CABLE_CHG', value: "enum.warning-hazard-type-details.submarine-cable-chg" },
  { key: 'ALL_AIDS_TO_NAVIGATION_NOT_RELIABLE', value: "enum.warning-hazard-type-details.all-aids-to-navigation-not-reliable" },
  { key: 'LIGHT_SPAR_BUOY_LIGHT_UNLIT', value: "enum.warning-hazard-type-details.light-spar-buoy-light-unlit" },
  { key: 'LIGHT_SPAR_BUOY_LIGHT_UNRELIABLE', value: "enum.warning-hazard-type-details.light-spar-buoy-light-unreliable" },
  { key: 'LIGHT_SPAR_BUOY_LIGHT_NOT_SYNCHRONIZED', value: "enum.warning-hazard-type-details.light-spar-buoy-light-not-synchronized" },
  { key: 'LIGHT_SPAR_BUOY_LIGHT_DAMAGED', value: "enum.warning-hazard-type-details.light-spar-buoy-light-damaged" },
  { key: 'SPAR_BUOY_MISSING', value: "enum.warning-hazard-type-details.spar-buoy-missing" },
  { key: 'SPAR_BUOY_OFF_POSITION', value: "enum.warning-hazard-type-details.spar-buoy-off-position" },
  { key: 'SPAR_BUOY_ADRIFT', value: "enum.warning-hazard-type-details.spar-buoy-adrift" },
  { key: 'SPAR_BUOY_DAMAGED', value: "enum.warning-hazard-type-details.spar-buoy-damaged" },
  { key: 'SPAR_BUOY_DESTROYED', value: "enum.warning-hazard-type-details.spar-buoy-destroyed" },
  { key: 'SPAR_BUOY_TOPMARK_MISSING', value: "enum.warning-hazard-type-details.spar-buoy-topmark-missing" },
  { key: 'SPAR_BUOY_RE_ESTABLISHMENT', value: "enum.warning-hazard-type-details.spar-buoy-re-establisment" },
  { key: 'SPAR_BUOY_RESTORED_TO_NORMAL', value: "enum.warning-hazard-type-details.spar-buoy-restored-to-normal" },
  { key: 'FAIRWAY_MARKER_LIGHT_UNLIT', value: "enum.warning-hazard-type-details.fairway-marker-light-unlit" },
  { key: 'FAIRWAY_MARKER_LIGHT_UNRELIABLE', value: "enum.warning-hazard-type-details.fairway-marker-light-unreliable" },
  { key: 'FAIRWAY_MARKER_LIGHT_NOT_SYNCHRONIZED', value: "enum.warning-hazard-type-details.fairway-marker-light-not-synchronized" },
  { key: 'FAIRWAY_MARKER_DAMAGED', value: "enum.warning-hazard-type-details.fairway-marker-damaged" },
  { key: 'FAIRWAY_MARKER_DESTROYED', value: "enum.warning-hazard-type-details.fairway-marker-destroyed" },
  { key: 'SPAR_BUOY_WITHDRAWN', value: "enum.warning-hazard-type-details.spar-buoy-withdrawn" },
  { key: 'SPAR_BUOY_MOVE', value: "enum.warning-hazard-type-details.spar-buoy-move" }
];


export const listWarningHazardTypeGeneral = [
  {
    key: 'DRIFTING_HAZARDS', value: 'enum.warning-hazard-type-general.drifting-hazards', groups: [
      {
        items: [
          'CONTAINER_ADRIFT',
          'SCIENTIFIC_BUOY_ADRIFT',
          'VESSEL_ADRIFT',
          'DERELICT_VESSEL_ADRIFT',
          'DEAD_WHALE_ADRIFT',
          'LOG_ADRIFT',
          'DEAD_HEAD_ADRIFT',
          'LOG_BOOM_ADRIFT',
          'DOCK_ADRIFT',
          'FISH_NET_ADRIFT',
          'FLOATING_DEBRIS',
          'OBJECT_ADRIFT'
        ]
      }
    ]
  },
  {
    key: 'NEWLY_DISCOVERED_DANGERS', value: 'enum.warning-hazard-type-general.newly-discovered-dangers', groups: [
      {
        items: [
          'SANDSPIT',
          'SHALLOW_DEPTH_REPORTED',
          'SHALLOW_DEPTH_CONFIRMED',
          'SUBMERGED_FISH_NET',
          'UNCHARTED_ROCK',
          'DANGEROUS_WRECK',
          'SUBSURFACE_MOORING',
          'SUBMERGED_OBJECT'
        ]
      }
    ]
  },
  {
    key: 'SCIENTIFIC_INSTRUMENTS', value: 'enum.warning-hazard-type-general.scientific-instruments', groups: [
      {
        items: [
          'ACOUSTIC_RECORDER',
          'SCIENTIFIC_BUOY_APPARATUS',
          'SCIENTIFIC_MOORING',
          'TIDE_GAUGE'
        ]
      }
    ]
  },
  {
    key: 'ROUTING_INFORMATION', value: 'enum.warning-hazard-type-general.routing-information', groups: [
      {
        items: [
          'OPEN_CLOSE_WATERWAY',
          'WATERWAY_RECOMMENDED_NOT_RECOMMENDED_FOR_SHIPPING',
          'VTS_CHANGE',
          'RADAR_SURVEILLANCE_SYSTEM',
          'REGULATION',
          'RESTRICTED_AREA',
          'EXCLUSION_ZONES',
          'REGATTA_RACE',
          'SWIMMERS',
          'MARINE_MAMMALS',
          'FIREWORKS',
          'CLUSTER_OF_FISHING_VESSELS',
          'TRAFFIC_CONGESTION',
          'VESSEL_DISABLED',
          'OPEN_CLOSE_HARBOUR',
          'OPEN_CLOSE_SWING_BRIDGE',
          'VERTICAL_CLEARANCE_REDUCED',
          'BRIDGE_HORIZ_CLEAR_CHG',
          'BRIDGE_UNABLE_CLOSE',
          'BRIDGE_UNABLE_OPEN',
          'BRIDGE_VERT_CLEAR_CHG',
          'LOCK_CLOSED',
          'HORIZ_CLEAR_REDUCED'
        ]
      }
    ]
  },
  {
    key: 'WORKS', value: 'enum.warning-hazard-type-general.works', groups: [
      {
        items: [
          'DREDGING_OPERATION',
          'BREAKWATER_CONSTRUCTION',
          'WHARF_CONSTRUCTION',
          'DIVING_OPERATIONS',
          'CABLE_LAYING_OPERATION',
          'OPERATION_ON_CABLE',
          'PIPE_LAYING_OPERATION',
          'OPERATION_ON_PIPE',
          'WORKS_IN_PROGRESS',
          'UNDERWATER_OPERATIONS'
        ]
      }
    ]
  },
  {
    key: 'SPECIAL_OPERATIONS', value: 'enum.warning-hazard-type-general.special-operations', groups: [
      {
        items: [
          'SEA_TRIALS',
          'SEAPLANE_OPERATIONS',
          'MILITARY_EXERCISE',
          'FIRING_EXERCISE',
          'JAMMING_EXERCISE',
          'MILITARY_OPERATION',
          'BLASTING_OPERATION',
          'ANTI_POLLUTION_EXERCISE',
          'ANTI_POLLUTION_OPERATION',
          'SAR_EXERCISE',
          'SAR_OPERATION',
          'HYDROGRAPHIC_SURVEY',
          'SCIENTIFIC_SURVEY',
          'SEISMIC_SURVEY'
        ]
      }
    ]
  },
  {
    key: 'TOWING_OPERATIONS', value: 'enum.warning-hazard-type-general.towing-operations', groups: [
      {
        items: [
          'DRILL_RIG_UNDER_TOW',
          'UNWIELDY_TOW'
        ]
      }
    ]
  },
  {
    key: 'HAZARD_OTHER', value: 'enum.warning-hazard-type-general.hazard-other', groups: [
      {
        items: [
          'MINES',
          'EXPLOSIVE_DEVICE',
          'FALLOUT_HAZARD',
          'HAZARDOUS_AREA'
        ]
      }
    ]
  },
  { key: 'PIRACY', value: 'enum.warning-hazard-type-general.piracy' },
  {
    key: 'AQUACULTURE_AND_FISHING_INSTALLATIONS', value: 'enum.warning-hazard-type-general.aquaculture-and-fishing-installations', groups: [
      {
        items: [
          'AQUACULTURE_SITE',
          'FISH_AGGREGATING_DEVICE_FAD',
          'LONG_FISHING_GEAR',
          'NUMEROUS_FISHING_VESSELS'
        ]
      }
    ]
  },
  {
    key: 'OFFSHORE_STRUCTURES', value: 'enum.warning-hazard-type-general.offshore-structures', groups: [
      {
        items: [
          'DRILLING_SITE_OPERATIONS',
          'RENEWABLE_ENERGY_DEVICE_FARM',
          'OFFSHORE_RIGS_PLATFORM_CHG',
          'SUBMARINE_CABLE_CHG',
          'SUBMARINE_PIPELINE_CHG'
        ]
      }
    ]
  },
  {
    key: 'AIDS_TO_NAVIGATION', value: 'enum.warning-hazard-type-general.aids-to-navigation', groups: [
      {
        value: 'enum.warning-hazard-type-details-group.general',
        items: [
          'MARINE_AIDS_TO_NAVIGATION_UNRELIABLE',
          'ALL_AIDS_TO_NAVIGATION_NOT_RELIABLE'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.buoy',
        items: [
          'LIGHT_BUOY_LIGHT_UNLIT',
          'LIGHT_BUOY_LIGHT_UNRELIABLE',
          'LIGHT_BUOY_LIGHT_NOT_SYNCHRONIZED',
          'LIGHT_BUOY_LIGHT_DAMAGED',
          'BUOY_MISSING',
          'BUOY_OFF_POSITION',
          'BUOY_ADRIFT',
          'BUOY_DAMAGED',
          'BUOY_DESTROYED',
          'BUOY_TOPMARK_MISSING',
          'BUOY_TOPMARK_DAMAGED',
          'BUOY_DAYMARK_UNRELIABLE',
          'BUOY_RE_ESTABLISHMENT',
          'BUOY_RESTORED_TO_NORMAL',
          'LIGHT_SPAR_BUOY_LIGHT_UNLIT',
          'LIGHT_SPAR_BUOY_LIGHT_UNRELIABLE',
          'LIGHT_SPAR_BUOY_LIGHT_NOT_SYNCHRONIZED',
          'LIGHT_SPAR_BUOY_LIGHT_DAMAGED',
          'SPAR_BUOY_MISSING',
          'SPAR_BUOY_OFF_POSITION',
          'SPAR_BUOY_ADRIFT',
          'SPAR_BUOY_DAMAGED',
          'SPAR_BUOY_DESTROYED',
          'SPAR_BUOY_TOPMARK_MISSING',
          'SPAR_BUOY_RE_ESTABLISHMENT',
          'SPAR_BUOY_RESTORED_TO_NORMAL',
          'FAIRWAY_MARKER_LIGHT_UNLIT',
          'FAIRWAY_MARKER_LIGHT_UNRELIABLE',
          'FAIRWAY_MARKER_LIGHT_NOT_SYNCHRONIZED',
          'FAIRWAY_MARKER_DAMAGED',
          'FAIRWAY_MARKER_DESTROYED'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.light',
        items: [
          'LIGHT_UNLIT',
          'LIGHT_UNRELIABLE',
          'LIGHT_RANGE_REDUCED',
          'LIGHT_WITHOUT_RHYTHM',
          'LIGHT_OUT_OF_SYNCHRONIZATION',
          'LIGHT_DAYMARK_UNRELIABLE',
          'LIGHT_OPERATING_PROPERLY',
          'SECTOR_LIGHT_SECTOR_OBSCURED',
          'LIGHT_OPERATING_PROPERLY'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.beacon',
        items: [
          'BEACON_MISSING',
          'BEACON_DAMAGED',
          'LIGHTED_BEACON_LIGHT_UNLIT',
          'LIGHTED_BEACON_LIGHT_UNRELIABLE',
          'LIGHTED_BEACON_LIGHT_NOT_SYNCHRONIZED',
          'LIGHTED_BEACON_LIGHT_DAMAGED',
          'BEACON_TOPMARK_MISSING',
          'BEACON_TOPMARK_DAMAGED',
          'BEACON_DAYMARK_UNRELIABLE',
          'FLOODLIT_BEACON_UNLIT',
          'BEACON_RESTORED_TO_NORMAL'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.leading-light-or-beacon',
        items: [
          'FRONT_LEADING_RANGE_LIGHT_LIGHT_UNLIT',
          'REAR_LEADING_RANGE_LIGHT_LIGHT_UNLIT',
          'FRONT_LEADING_RANGE_LIGHT_UNRELIABLE',
          'REAR_LEADING_RANGE_LIGHT_UNRELIABLE',
          'FRONT_LEADING_RANGE_LIGHT_LIGHT_RANGE_REDUCED',
          'REAR_LEADING_RANGE_LIGHT_LIGHT_RANGE_REDUCED',
          'FRONT_LEADING_RANGE_LIGHT_WITHOUT_RHYTHM',
          'REAR_LEADING_RANGE_LIGHT_WITHOUT_RHYTHM',
          'LEADING_RANGE_LIGHTS_OUT_OF_SYNCHRONIZATION',
          'FRONT_LEADING_RANGE_BEACON_UNRELIABLE',
          'REAR_LEADING_RANGE_BEACON_UNRELIABLE',
          'FRONT_LEADING_RANGE_LIGHT_IS_OPERATING_PROPERLY',
          'REAR_LEADING_RANGE_LIGHT_IS_OPERATING_PROPERLY',
          'FRONT_LEADING_RANGE_BEACON_RESTORED_TO_NORMAL',
          'REAR_LEADING_RANGE_BEACON_RESTORED_TO_NORMAL'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.sound-signal',
        items: [
          'FOG_SIGNAL_OUT_OF_SERVICE',
          'FOG_SIGNAL_OPERATING_PROPERLY',
          'AUDIBLE_SIGNAL_OUT_OF_SERVICE',
          'AUDIBLE_SIGNAL_OPERATING_PROPERLY'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.radio-signal',
        items: [
          'AIS_TRANSMITTER_OUT_OF_SERVICE',
          'AIS_TRANSMITTER_UNREALIABLE',
          'AIS_TRANSMITTER_OPERATING_PROPERLY',
          'V_AIS_OUT_OF_SERVICE',
          'V_AIS_UNREALIABLE',
          'V_AIS_OPERATING_PROPERLY',
          'RACON_OUT_OF_SERVICE',
          'RACON_UNREALIABLE',
          'RACON_OPERATING_PROPERLY',
          'RAMARK_OUT_OF_SERVICE',
          'RAMARK_UNREALIABLE',
          'RAMARK_OPERATING_PROPERLY',
          'GNSS_DEGRADATION',
          'DGPS_OUT_OF_SERVICE',
          'DGPS_UNRELIABLE',
          'DGPS_OPERATING_PROPERLY',
          'LORAN_C_OUT_OF_SERVICE',
          'LORAN_C_UNREALIABLE',
          'LORAN_C_OPERATING_PROPERLY',
          'ELORAN_OUT_OF_SERVICE',
          'ELORAN_UNREALIABLE',
          'ELORAN_OPERATING_PROPERLY',
          'DGLONASS_OUT_OF_SERVICE',
          'DGLONASS_UNREALIABLE',
          'DGLONASS_OPERATING_PROPERLY',
          'CHAYKA_OUT_OF_SERVICE',
          'CHAYKA_UNREALIABLE',
          'CHAYKA_OPERATING_PROPERLY',
          'E_CHAYKA_OUT_OF_SERVICE',
          'E_CHAYKA_UNREALIABLE',
          'E_CHAYKA_OPERATING_PROPERLY',
          'EGNOS_OUT_OF_SERVICE',
          'EGNOS_UNREALIABLE',
          'EGNOS_OPERATING_PROPERLY'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.commissioning',
        items: [
          'SEASONAL_RECOMMISSIONING_IN_PROGRESS',
          'SEASONAL_RECOMMISSIONING_COMPLETE',
          'BUOY_RECOMMISSIONED_FOR_NAVIGATION_SEASON',
          'TEMPORARY_BUOY_BUOYS',
          'BUOY_ESTABLISHMENT',
          'BUOY_TEMPORARY_ESTABLISHMENT',
          'LIGHT_ESTABLISHMENT',
          'LIGHT_TEMPORARY_ESTABLISHMENT',
          'BEACON_ESTABLISHMENT',
          'BEACON_TEMPORARY_ESTABLISHMENT',
          'FOG_SIGNAL_ESTABLISHMENT',
          'FOG_SIGNAL_TEMPORARY_ESTABLISHMENT',
          'AUDIBLE_SIGNAL_ESTABLISHMENT',
          'AUDIBLE_SIGNAL_TEMPORARY_ESTABLISHMENT',
          'AIS_TRASMITTER_ESTABLISHMENT',
          'AIS_TRASMITTER_TEMPORARY_ESTABLISHMENT',
          'V_AIS_ESTABLISHMENT',
          'V_AIS_TEMPORARY_ESTABLISHMENT',
          'RACON_ESTABLISHMENT',
          'RACON_TEMPORARY_ESTABLISHMENT',
          'RAMARK_ESTABLISHMENT',
          'RAMARK_TEMPORARY_ESTABLISHMENT',
          'DGPS_STATION_ESTABLISHMENT',
          'ELORAN_STATION_ESTABLISHMENT',
          'DGLONASS_STATION_ESTABLISHMENT',
          'E_CHAYKA_STATION_ESTABLISHMENT',
          'EGNOS_STATION_ESTABLISHMENT',
          'LIGHT_RE_ESTABLISHMENT'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.removal-or-withdrawn',
        items: [
          'BUOY_WILL_BE_WITHDRAWN',
          'BUOY_WITHDRAWN',
          'BUOY_REMOVAL',
          'BUOY_TEMPORARY_REMOVAL',
          'SEASONAL_DECOMMISSIONING_IN_PROGRESS',
          'SEASONAL_DECOMMISSIONING_COMPLETE',
          'BUOY_LIFTED_FOR_WINTER',
          'BUOY_REPLACED_BY_WINTER_SPAR',
          'BUOY_DECOMMISSIONED_FOR_WINTER',
          'LIGHT_REMOVAL',
          'LIGHT_TEMPORARY_REMOVAL',
          'BEACON_REMOVAL',
          'BEACON_TEMPORARY_REMOVAL',
          'FOG_SIGNAL_REMOVAL',
          'FOG_SIGNAL_TEMPORARY_REMOVAL',
          'AUDIBLE_SIGNAL_REMOVAL',
          'AUDIBLE_SIGNAL_TEMPORARY_REMOVAL',
          'AIS_TRANSMITTER_REMOVAL',
          'AIS_TRANSMITTER_TEMPORARY_REMOVAL',
          'V_AIS_REMOVAL',
          'V_AIS_TEMPORARY_REMOVAL',
          'RACON_REMOVAL',
          'RACON_TEMPORARY_REMOVAL',
          'RAMARKREMOVAL',
          'RAMARK_TEMPORARY_REMOVAL',
          'DGPS_STATION_REMOVAL',
          'DGPS_STATION_TEMPORARY_REMOVAL',
          'LORAN_C_STATION_REMOVAL',
          'LORAN_C_STATION_TEMPORARY_REMOVAL',
          'ELORAN_STATION_REMOVAL',
          'ELORAN_STATION_TEMPORARY_REMOVAL',
          'CHAYKA_STATION_REMOVAL',
          'CHAYKA_STATION_TEMPORARY_REMOVAL',
          'E_CHAYKA_STATION_REMOVAL',
          'E_CHAYKA_STATION_TEMPORARY_REMOVAL',
          'EGNOS_STATION_REMOVAL',
          'EGNOS_STATION_TEMPORARY_REMOVAL',
          'SPAR_BUOY_WITHDRAWN'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.change',
        items: [
          'BUOY_MOVE',
          'BUOY_CHANGE',
          'BUOY_TEMPORARY_CHANGE',
          'LIGHT_CHANGE',
          'LIGHT_TEMPORARY_CHANGE',
          'SECTOR_LIGHT_CHANGE',
          'SECTOR_LIGHT_TEMPORARY_CHANGE',
          'BEACON_CHANGE',
          'BEACON_TEMPORARY_CHANGE',
          'FOG_SIGNAL_CHANGE',
          'FOG_SIGNAL_TEMPORARY_CHANGE',
          'AUDIBLE_SIGNAL_CHANGE',
          'AUDIBLE_SIGNAL_TEMPORARY_CHANGE',
          'V_AIS_CHANGE',
          'V_AIS_TEMPORARY_CHANGE',
          'RACON_CHANGE',
          'RACON_TEMPORARY_CHANGE',
          'RAMARK_CHANGE',
          'RAMARK_TEMPORARY_CHANGE',
          'SPAR_BUOY_MOVE'
        ]
      },
      {
        value: 'enum.warning-hazard-type-details-group.end-of-incident',
        items: [
          'ATON_OPERATING_PROPERLY'
        ]
      }
    ]
  },
  {
    key: 'RADIO_SERVICES', value: 'enum.warning-hazard-type-general.radio-services', groups: [
      {
        items: [
          'VHF_SERVICE',
          'HF_SERVICE',
          'MF_SERVICE',
          'EGC_MSI_SERVICE',
          'NAVTEX',
          'MSI_SERVICES'
        ]
      }
    ]
  },
  {
    key: 'NATURAL_PHENOMENA', value: 'enum.warning-hazard-type-general.natural-phenomena', groups: [
      {
        items: [
          'TSUNAMI_WARNING',
          'VOLCANO_ACTIVITY',
          'LOW_WATER_LEVEL',
          'HIGH_WATER_LEVEL',
          'STORM_SURGE'
        ]
      }
    ]
  },
  {
    key: 'ICE', value: 'enum.warning-hazard-type-general.ice', groups: [
      {
        items: [
          'ICE_BOOM',
          'ICE_CONTROL_ZONE',
          'ICEBERG_OUTSIDE_OF_ADVERTISED_LIMIT',
          'UNIDENTIFIED_RADAR_TARGET_POSSIBLE_ICEBERG',
          'AUTHORIZED_ICE_ROUTING_INFORMATION'
        ]
      }
    ]
  },
  {
    key: 'HEALTH_ADVISORY', value: 'enum.warning-hazard-type-general.health-advisory', groups: [
      {
        items: [
          'NATIONAL_HEALTH_AUTHORITY_NOTICE',
          'WORLD_HEALTH_ORGANIZATION_NOTICE',
          'LOCAL_HEALTH_AUTHORITY_NOTICE'
        ]
      }
    ]
  },
  {
    key: 'SECURITY', value: 'enum.warning-hazard-type-general.security', groups: [
      {
        items: [
          'MARITIME_SECURITY_LEVEL_CHANGE',
          'SECURITY_REGULATION_CHANGE'
        ]
      }
    ]
  },
  { key: 'ECDIS_OPERATING_ANOMALIES_INCLUDING_OFFICIAL_DATA_ISSUES', value: 'enum.warning-hazard-type-general.ecdis-operating-anomalies-including-official-data-issues' },
  { key: 'IN_FORCE_BULLETIN', value: 'enum.warning-hazard-type-general.in-force-bulletin' },
  { key: 'RIG_LIST', value: 'enum.warning-hazard-type-general.rig-list' }
];

export const listWarningStatus = {
  NOT_SAVED: 'NOT_SAVED',
  DRAFT: 'DRAFT',
  MODEL: 'MODEL',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
};

export const listTypeExpression = {
  IN_PROGRESS: 'IN_PROGRESS',
  UNTIL_FURTHER_NOTICE: 'UNTIL_FURTHER_NOTICE',
  WIDE_BERTH_REQUESTED: 'WIDE_BERTH_REQUESTED',
  MILES_BERTH_REQUESTED: 'MILES_BERTH_REQUESTED',
  VESSELS_KEEP_CLEAR: 'VESSELS_KEEP_CLEAR',
  NAVIGATE_WITH_CAUTION: 'NAVIGATE_WITH_CAUTION',
  REDUCED_SPEED: 'REDUCED_SPEED',
  HAZARDOUS_TO_NAVIGATION: 'HAZARDOUS_TO_NAVIGATION',
  PROHIBITED_AREA: 'PROHIBITED_AREA',
  RESTRICTED_AREA: 'RESTRICTED_AREA',
  ACTION_WITHIN_THIS_AREA: 'ACTION_WITHIN_THIS_AREA',
  FULL_TEXT_PREFECTORAL: 'FULL_TEXT_PREFECTORAL',
  PREFECTORAL_RESPECTED: 'PREFECTORAL_RESPECTED',
  REPORT_INFORMATION: 'REPORT_INFORMATION'
};

export const TRANSLATE_LIST_TYPE_EXPRESSION = {
  [listTypeExpression.IN_PROGRESS]: 'enum.warning-part-type-expression.IN_PROGRESS',
  [listTypeExpression.UNTIL_FURTHER_NOTICE]: 'enum.warning-part-type-expression.UNTIL_FURTHER_NOTICE',
  [listTypeExpression.WIDE_BERTH_REQUESTED]: 'enum.warning-part-type-expression.WIDE_BERTH_REQUESTED',
  [listTypeExpression.MILES_BERTH_REQUESTED]: 'enum.warning-part-type-expression.MILES_BERTH_REQUESTED',
  [listTypeExpression.VESSELS_KEEP_CLEAR]: 'enum.warning-part-type-expression.VESSELS_KEEP_CLEAR',
  [listTypeExpression.NAVIGATE_WITH_CAUTION]: 'enum.warning-part-type-expression.NAVIGATE_WITH_CAUTION',
  [listTypeExpression.REDUCED_SPEED]: 'enum.warning-part-type-expression.REDUCED_SPEED',
  [listTypeExpression.HAZARDOUS_TO_NAVIGATION]: 'enum.warning-part-type-expression.HAZARDOUS_TO_NAVIGATION',
  [listTypeExpression.PROHIBITED_AREA]: 'enum.warning-part-type-expression.PROHIBITED_AREA',
  [listTypeExpression.RESTRICTED_AREA]: 'enum.warning-part-type-expression.RESTRICTED_AREA',
  [listTypeExpression.ACTION_WITHIN_THIS_AREA]: 'enum.warning-part-type-expression.ACTION_WITHIN_THIS_AREA',
  [listTypeExpression.FULL_TEXT_PREFECTORAL]: 'enum.warning-part-type-expression.FULL_TEXT_PREFECTORAL',
  [listTypeExpression.PREFECTORAL_RESPECTED]: 'enum.warning-part-type-expression.PREFECTORAL_RESPECTED',
  [listTypeExpression.REPORT_INFORMATION]: 'enum.warning-part-type-expression.REPORT_INFORMATION'
};
