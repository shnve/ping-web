import { WarningCreationPrerequisites } from '@app/admin/admin-warning/models/creation-warning.model';
import { GlobalWarningTypeBySerieType, SerieType } from '@app/models/serie.model';
import { GlobalWarningType } from '@app/models/warning.model';
import { environment } from '@env/environment.local';
import { WarningCreationData } from '../admin/admin-warning/models/creation-warning.model';

export function isNavareaOrCoastalWarning(serieType: SerieType): boolean {
  return [SerieType.NAVAREA_NAVIGATIONAL_WARNING, SerieType.COASTAL_NAVIGATIONAL_WARNING].includes(serieType);
}

export function isLocalNavigationalWarning(serieType: SerieType): boolean {
  return SerieType.LOCAL_NAVIGATIONAL_WARNING === serieType;
}

export function isNoticeOrNoticeTpFromSerieType(serieType: SerieType): boolean {
  const globalWarningType = GlobalWarningTypeBySerieType[serieType];
  return [GlobalWarningType.NOTICE, GlobalWarningType.NOTICE_TP].includes(globalWarningType);
}

export function initWarningCreationData(): WarningCreationData {
  return {
    status: 'NOT_SAVED',
    prerequisites: initWarningCreationPrerequisites(),
    links: {
      cancelledWarningIds: [],
      replacedWarningIds: [],
      parentWarningIds: [],
      infosourcesIds: [],
      infosources: [],
      maritimeEntitiesIds: [],
      georegulationIds: []
    },
    attachments: {
      attachmentIds: [],
      attachmentFiles: []
    },
    references: {
      warningPublicsReferences: [],
      georegulationReferenceIds: [],
      attachmentReferenceIds: [],
      entityReferenceIds: [],
      warningLinksPublicsReferences: []
    },
    warningParts: {
      featureParts: [],
      mandatoryLanguages: [],
      optionalLanguages: []
    },
    finalizationData: {
      estimatedPublicationDate: null,
      reviewDate: null,
      internalComment: null
    }
  };
}

export function initWarningCreationPrerequisites(): WarningCreationPrerequisites {
  return {
    serviceId: '',
    serieId: '',
    serieType: null,
    generalAreas: [],
    localityNames: [],
    warningNumber: null,
    year: null,
    typeGeneral: null,
    cancellationTime: null,
    addCancellationTimeToTelex: null,
    serieName: null
  };
}

export function getSharedLinkUrl(warningId: string, initialUrl: string): string {
  const isShared = initialUrl.includes(environment.warningsSharedUrlContext);
  const separator = isShared ? `/${ environment.warningsSharedUrlContext}` : '/administration/warnings/tables';
  const url = initialUrl.split(separator)[0];
  return `${url}/${environment.warningsSharedUrlContext}/${warningId}`;
}
