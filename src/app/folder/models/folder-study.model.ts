import { Notion } from '@app/models/notion.model';
import { StudyStatusEnum } from '@app/models/study.model';
import { FolderAttachment } from './folder-attachments.model';


export type StudyTable = {
    id?: string;
    number?: string;
    creationDate?: Date;
    notions?: Array<Notion>;
    attachments?: Array<FolderAttachment>;
    lastUpdate?: Date;
    lastUpdateUser?: string;
    status?: StudyStatusEnum;
    references?: Array<StudyReference>;
};

export interface StudyReference {
  type: StudyReferencesTypeEnum;
  value: string;
}

export interface ReferencesByFolder {
  folderId: string;
  studyNumber: string;
  studyReferences: StudyReference[];
}

export interface AvailablePlaceholderReferenceType {
  type: StudyReferencesTypeEnum,
  label: string,
  placeholders: {
    inputText: string,
    information: {
      title: string,
      text: string
    }
  }
}

export enum StudyReferencesTypeEnum {
  NAUTICAL_MAP_CORRECTION = 'NAUTICAL_MAP_CORRECTION',
  NAUTICAL_MAP_EDITION = 'NAUTICAL_MAP_EDITION',
  NAUTICAL_PUBLICATION_CORRECTION = 'NAUTICAL_PUBLICATION_CORRECTION',
  WARNING_T_OR_P = 'WARNING_T_OR_P',
}

export const TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE = [
  {
    type: StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION,
    label: 'enum.study-type-references.nautical-map-correction',
    placeholders: {
      inputText: 'study.form.references.nautical-map-correction.input-placeholder',
      information: {
        title: 'study.form.references.nautical-map-correction.info-placeholder.title',
        text: 'study.form.references.nautical-map-correction.info-placeholder.text'
      }
    }
  },
  {
    type: StudyReferencesTypeEnum.NAUTICAL_MAP_EDITION,
    label: 'enum.study-type-references.nautical-map-edition',
    placeholders: {
      inputText: 'study.form.references.nautical-map-edition.input-placeholder',
      information: {
        title: 'study.form.references.nautical-map-edition.info-placeholder.title',
        text: 'study.form.references.nautical-map-edition.info-placeholder.text'
      }
    }
  },
  {
    type: StudyReferencesTypeEnum.NAUTICAL_PUBLICATION_CORRECTION,
    label: 'enum.study-type-references.nautical-publication-correction',
    placeholders: {
      inputText: 'study.form.references.nautical-publication-correction.input-placeholder',
      information: {
        title: 'study.form.references.nautical-publication-correction.info-placeholder.title',
        text: 'study.form.references.nautical-publication-correction.info-placeholder.text'
      }
    }
  },
  {
    type: StudyReferencesTypeEnum.WARNING_T_OR_P,
    label: 'enum.study-type-references.warning-t-or-p',
    placeholders: {
      inputText: 'study.form.references.warning-t-or-p.input-placeholder',
      information: {
        title: 'study.form.references.warning-t-or-p.info-placeholder.title',
        text: 'study.form.references.warning-t-or-p.info-placeholder.text'
      }
    }
  }
];
