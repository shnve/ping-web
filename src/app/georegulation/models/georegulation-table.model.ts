import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { GeoregulationActivity, GeoregulationStatusEnum, GeoregulationType } from './georegulation.model';

export interface TableGeoregulationMaritimeEntity {
  id: string;
  name: string;
  internationalName?: string;
}

export interface TableGeoregulation {
  id: string;
  status: GeoregulationStatusEnum;
  number: string;
  type: GeoregulationType;
  activities: GeoregulationActivity[];
  title?: string;
  internationalTitle?: string;
  entities: MaritimeEntityBase[];
  internalComment?: string;
  lastUpdate: Date;
  publicationDate?: Date;
  repealDate?: Date;
  isPublic?: boolean;
  isNew?: boolean;
  isExpired?: boolean;
}
