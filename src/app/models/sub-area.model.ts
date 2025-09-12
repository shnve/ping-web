import { Serie } from '@app/models/serie.model';
import { JsonGeometry } from '@sig/models/geometry';

export interface SubArea {
  id: string;
  position?: number;
  name: string;
  urn?: string;
  internationalName?: string;
  technicalIdentifier?: string;
  geom?: JsonGeometry;
  subAreasName?: string[]; // Uniquement pour la recherche
  subAreas?: Array<SubArea | string>;
  parents?: Array<SubArea | string>;
  areaId?: string;
  maritimeServiceIds?: string[];
  series?: Serie[];
}
