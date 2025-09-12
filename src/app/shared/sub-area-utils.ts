import { SubArea } from '@app/models/sub-area.model';


export function formatSubAreasName(subAreas: SubArea[]): SubArea[] {
  subAreas.forEach(subArea => {
    if (!subArea.technicalIdentifier) {
      return;
    }
    subArea.name = `${subArea.name} (${subArea.technicalIdentifier})`;
    if (subArea.internationalName) {
      subArea.internationalName = `${subArea.internationalName} (${subArea.technicalIdentifier})`;
    }
  });
  return subAreas;
}
