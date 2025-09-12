import { SubArea } from '@app/models/sub-area.model';
import { GlobalWarningType } from '@app/models/warning.model';
import MaritimeService from './maritime-service.model';

export enum SerieType {
  COASTAL_NAVIGATIONAL_WARNING = 'COASTAL_NAVIGATIONAL_WARNING',
  LOCAL_NAVIGATIONAL_WARNING = 'LOCAL_NAVIGATIONAL_WARNING',
  LOCAL_NOTICE_TO_MARINER = 'LOCAL_NOTICE_TO_MARINER',
  NAVAREA_NAVIGATIONAL_WARNING = 'NAVAREA_NAVIGATIONAL_WARNING',
  PORT_NOTICE_TO_MARINER = 'PORT_NOTICE_TO_MARINER',
  PRELIMINARY_NOTICE_TO_MARINER = 'PRELIMINARY_NOTICE_TO_MARINER',
  SUB_AREA_NAVIGATIONAL_WARNING = 'SUB_AREA_NAVIGATIONAL_WARNING',
  TEMPORARY_AND_PRELIMINARY_NOTICE_TO_MARINER = 'TEMPORARY_AND_PRELIMINARY_NOTICE_TO_MARINER',
  TEMPORARY_NOTICE_TO_MARINER = 'TEMPORARY_NOTICE_TO_MARINER'
}

export const GlobalWarningTypeBySerieType = {
  LOCAL_NAVIGATIONAL_WARNING: GlobalWarningType.WARNING,
  COASTAL_NAVIGATIONAL_WARNING: GlobalWarningType.WARNING,
  SUB_AREA_NAVIGATIONAL_WARNING: GlobalWarningType.WARNING,
  NAVAREA_NAVIGATIONAL_WARNING: GlobalWarningType.WARNING,
  LOCAL_NOTICE_TO_MARINER: GlobalWarningType.NOTICE,
  PORT_NOTICE_TO_MARINER: GlobalWarningType.NOTICE,
  TEMPORARY_NOTICE_TO_MARINER: GlobalWarningType.NOTICE_TP,
  PRELIMINARY_NOTICE_TO_MARINER: GlobalWarningType.NOTICE_TP,
  TEMPORARY_AND_PRELIMINARY_NOTICE_TO_MARINER: GlobalWarningType.NOTICE_TP
};

export enum DiffusionNavtexSource {
  B = 'B', // "NAVTEX Corsen"
  N = 'N', // "NAVTEX Niton"
  T = 'T' // "NAVTEX La Garde"
}

export interface Serie {
  id: string;
  urn?: string;
  name: string;
  internationalName?: string;
  information?: string;
  localizedInformation?: string;
  type: SerieType;
  subAreas?: Array<SubArea | string>;
  maritimeService: string | MaritimeService;
  mandatoryLanguages?: string[];
  optionalLanguages?: string[];
  ranges: number[][];
  navtexSource?: DiffusionNavtexSource;
  s124Identifier?: string;
}
