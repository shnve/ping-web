import { JsonGeometry } from '@sig/models/geometry';
import { SubArea } from './sub-area.model';

export interface AreaBase {
  id: string;
  name: string;
  internationalName?: string;
}

export default interface Area extends AreaBase {
  urn?: string;
  information?: string;
  localizedInformation?: string;
  disclaimer?: string;
  internationalDisclaimer?: string;
  country?: string;
  geom: JsonGeometry;
  borderAreas?: Array<string>;
  subAreas?: Array<SubArea | string>;
}
