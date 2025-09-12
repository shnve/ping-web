import { WarningPublicReferenceType } from '@app/models/warning-public-reference.model';
import { environment } from '@env/environment';

export interface PublicReferenceLabels {
  referenceLengthLabel: string;
  numberLabel: string;
}

export function accessLinkToReference(warningPublicReferenceType: WarningPublicReferenceType, referenceId: string): string {
  let accessLink: string;
  switch (warningPublicReferenceType) {
    case WarningPublicReferenceType.WARNING_TP:
    case WarningPublicReferenceType.WARNING:
      accessLink = `${environment.basePortalUrl + environment.warningsSharedUrlContext}/${referenceId}`;
      break;
    case WarningPublicReferenceType.GEOREGULATION:
      accessLink = `${environment.basePortalUrl + environment.georegulationSharedUrlContext}/${referenceId}`;
      break;
    default:
      break;
  }
  return accessLink;
}

export function getPublicReferenceLabels(warningPublicReferenceType: WarningPublicReferenceType): PublicReferenceLabels {
  const publicReferenceLabels: PublicReferenceLabels = {
    numberLabel: '',
    referenceLengthLabel: ''
  };

  switch (warningPublicReferenceType) {
    case WarningPublicReferenceType.ATTACHMENT:
      publicReferenceLabels.numberLabel = 'number-of-attachments';
      publicReferenceLabels.referenceLengthLabel = 'attachmentsLength';
      break;
    case WarningPublicReferenceType.WARNING:
    case WarningPublicReferenceType.WARNING_TP:
      publicReferenceLabels.numberLabel = 'number-of-warnings';
      publicReferenceLabels.referenceLengthLabel = 'warningsLength';
      break;
    case WarningPublicReferenceType.GEOREGULATION:
      publicReferenceLabels.numberLabel = 'number-of-georegulations';
      publicReferenceLabels.referenceLengthLabel = 'georegulationsLength';
      break;
    case WarningPublicReferenceType.ENTITY_REFERENCE:
      publicReferenceLabels.numberLabel = 'number-of-entities-references';
      publicReferenceLabels.referenceLengthLabel = 'entitiesReferencesLength';
      break;
    case WarningPublicReferenceType.LINK:
      publicReferenceLabels.numberLabel = 'number-of-links';
      publicReferenceLabels.referenceLengthLabel = 'linksLength';
      break;
  }

  return publicReferenceLabels;
}
