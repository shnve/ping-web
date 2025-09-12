import { GeoregulationType } from '@app/georegulation/models/georegulation.model';
import Area from '@app/models/area.model';
import MaritimeEntity from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import { Serie } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';

export interface Subscription {
  id: string;
  title: string;
  type: SubscriptionTypeEnum;
  creationDate: Date;
  sendingMail: boolean;
  service: MaritimeService;
  area: Area;
  maritimeEntitiesGeographicExtent: Array<MaritimeEntity>;
  serie: Serie;
  lang: string;
  subAreas: Array<SubArea>;
  warningHazardTypeGenerals: Array<string>;
  georegulationTypes: Array<GeoregulationType>;
  maritimeEntities: Array<MaritimeEntity>;
}

export enum SubscriptionTypeEnum {
  WARNING = 'WARNING',
  GEOREGULATION = 'GEOREGULATION'
}
