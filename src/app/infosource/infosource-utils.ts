import { featureToGeojson } from '@app/sig/utils/feature';
import { InfosourcePart, InfosourcePartForm, InfosourceServiceStatus, JsonInfosourcePart } from './models/infosource.model';

export function getInfosourceNature(nature: string): string | undefined {
  switch (nature) {
    case 'HAZARD_REPORT':
      return 'report-hazard';
    case 'OTHER_REPORT':
      return 'report-other';
    case 'FUTURE_INFORMATION':
      return 'report-future-updates';
    case 'MAP_ANOMALY':
      return 'report-map-anomaly';
    case 'ACTIVITY_FORECAST':
      return 'report-activity-forecast';
    case 'PUBLICATION_ANOMALY':
      return 'report-publication-anomaly';
    case 'BATHY':
      return 'report-bathy-danger';
    default:
      return undefined;
  }
}

export function getNumberForPart(searchedPart: InfosourcePartForm, featureParts: InfosourcePartForm[]): number {
  return featureParts.findIndex(part => part === searchedPart) + 1;
}

export function convertFeaturePartsToJsonFeatureParts(parts: InfosourcePart[]): JsonInfosourcePart[] {
  return parts.map((part: InfosourcePart) => {
    return {
      ...part,
      localisation: part.localisation.map(feature => featureToGeojson(feature))
    };
  });
}

export function getServiceStatusIconSuffix(actionType: InfosourceServiceStatus): string {
  switch (actionType) {
    case InfosourceServiceStatus.INIT:
      return 'envelope';
    case InfosourceServiceStatus.READ:
      return 'envelope-open';
    case InfosourceServiceStatus.ARCHIVE:
      return 'file-archive';
    case InfosourceServiceStatus.TO_PROCESS:
      return 'calendar-check';
    case InfosourceServiceStatus.PROCESSED:
      return 'check-circle';
    default:
      return null;
  }
}
