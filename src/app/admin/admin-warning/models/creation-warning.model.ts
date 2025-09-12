import { InfosourceReference } from '@app/infosource/models/infosource.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { SerieType } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { WarningLinkPublicReference, DiffusionNavtex as WarningNavtexConfig, WarningReferenceCategoryEnum } from '@app/models/warning.model';
import { CreationAttachment, CreationAttachments } from '@app/shared/components/attachments/attachment.model';
import { DateRange } from '@app/shared/models/date-range.model';

export interface WarningLocalityNames {
  id?: string;
  position?: number;
  name: string;
  internationalName: string;
  parentId: string;
}
export interface GeneralArea {
  id: string;
  position: number;
}
export interface WarningCreationData {
  id?: string;
  status: string;
  lastUpdate?: Date;
  lastUpdateUser?: AuthenticatedUser;
  prerequisites: WarningCreationPrerequisites;
  links: WarningCreationLinks;
  warningParts: WarningCreationParts;
  attachments: CreationAttachments;
  references: WarningCreationReferences;
  telex?: string;
  navtex?: string;
  finalizationData: WarningCreationFinalization;
  navtexConfig?: WarningNavtexConfig;
}

export interface WarningCreationPrerequisites {
  serviceId: string;
  serieId: string;
  generalAreas: Array<GeneralArea>;
  useAsModel?: boolean;
  modelName?: string;
  localityNames: WarningLocalityNames[];
  warningNumber: number;
  year: number;
  typeGeneral: string;
  serieType: SerieType;
  selectedLocalities?: Map<string, Array<SubArea>>;
  cancellationTime: string; // Why not using Date ? To prevent timezone auto conversion of Date object
  addCancellationTimeToTelex: boolean;
  serieName?: string;
  isBathy?: boolean;
}

export interface WarningCreationLinks {
  cancelledWarningIds?: Array<string>;
  replacedWarningIds?: Array<string>;
  parentWarningIds?: Array<string>;
  infosourcesIds?: Array<string>;
  infosources?: Array<InfosourceReference>;
  maritimeEntitiesIds?: Array<string>;
  georegulationIds?: Array<string>;
}

export interface WarningCreationReferences {
  warningPublicsReferences?: Array<WarningPublicReferenceOption>;
  georegulationReferenceIds?: Array<string>;
  attachmentReferenceIds?: Array<string>;
  entityReferenceIds?: Array<string>;
  warningLinksPublicsReferences?: Array<WarningLinkPublicReference>;
}

export interface WarningPublicReferenceOption {
  warningId: string;
  warningNumber?: string;
  category: WarningReferenceCategoryEnum;
}

export interface WarningCreationParts {
  featureParts: FeaturePart[];
  mandatoryLanguages: Array<string>;
  optionalLanguages?: Array<string>;
  isBathy?: boolean;
}

export interface WarningCreationFinalization {
  estimatedPublicationDate: string; // Why not using Date ? To prevent timezone auto conversion of Date object
  reviewDate: string; // Why not using Date ? To prevent timezone auto conversion of Date object
  internalComment: string;
}

export interface JsonWarningCreationData {
  id?: string;
  serviceId: string;
  serieId: string;
  generalAreas: Array<GeneralArea>;
  localityIds?: Array<string>;
  useAsModel?: boolean;
  modelName?: string;
  warningNumber: number;
  year: number;
  typeGeneral: string;
  serieType: SerieType;
  attachmentIds?: Array<string>;
  estimatedPublicationDate: string; // Why not using Date ? To prevent timezone auto conversion of Date object
  reviewDate: string; // Why not using Date ? To prevent timezone auto conversion of Date object
  cancellationTime: string; // Why not using Date ? To prevent timezone auto conversion of Date object
  addCancellationTimeToTelex: boolean;
  internalComment: string;
  attachmentFiles?: Array<CreationAttachment>;
  lastUpdateUser?: AuthenticatedUser;
  parts: Array<JsonFeaturePart>;
  navtexConfig?: WarningNavtexConfig;
}

export interface JsonWarningAdminDetails {
  serieId: string;
  generalAreas: Array<GeneralArea>;
  localityNames: WarningLocalityNames[];
  useAsModel: boolean;
  modelName: string;
  typeGeneral: string;
  warningNumber: number;
  year: number;
  cancelledWarningIds: Array<string>;
  replacedWarningIds: Array<string>;
  inforcedWarningIds: Array<string>;
  parentWarningIds: Array<string>;
  infosourcesIds: Array<string>;
  infosources?: Array<InfosourceReference>;
  maritimeEntitiesIds: Array<string>;
  georegulationIds: Array<string>;
  attachmentIds: Array<string>;
  warningPublicsReferences: Array<WarningPublicReferenceOption>;
  georegulationReferenceIds: Array<string>;
  attachmentReferenceIds: Array<string>;
  entityReferenceIds: Array<string>;
  warningLinksPublicsReferences: Array<WarningLinkPublicReference>;
  internalComment: string;
  id: string;
  status: string;
  selectedLocalities?: Map<string, Array<SubArea>>;
  attachmentFiles?: Array<CreationAttachment>;
  serieType: SerieType;
  serieName: string;
  creationDate: Date;
  estimatedPublicationDate?: string;
  reviewDate?: string;
  cancellationTime?: Date;
  addCancellationTimeToTelex: boolean;
  lastUpdate?: Date;
  lastUpdateUser?: AuthenticatedUser;
  parts: Array<JsonFeaturePart>;
  telex?: string;
  navtex?: string;
  navtexConfig?: WarningNavtexConfig;
  isBathy: boolean;
}

export interface FeaturePart {
  information: { [key: string]: string };
  typeDetails: Array<string>;
  dateRanges: Array<DateRange>;
  geometries: any[];
  affectedAreas: any[];
}

export interface JsonFeaturePart extends Omit<FeaturePart, 'dateRanges' | 'geometries' | 'affectedAreas'> {
  dateRanges: Array<DateRange>;
  geometries: Array<any>;
  affectedAreas: Array<any>;
}

export type FeaturePartInformation = { [key: string]: string };
