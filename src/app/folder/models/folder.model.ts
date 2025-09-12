import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { Notion } from '@app/models/notion.model';
import { FolderStudy } from '@app/models/study.model';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';

export interface FolderBase {
  id?: string;
  number: string;
}

export interface Folder extends FolderBase {
  year?: number;
  status: FolderStatusEnum;
  comment: string;
  object: string;
  creationDate: Date;
  lastUpdate: Date;
  reviewDate: Date;
  issuingService: string;
  area?: string;
  areaId?: string;
  localityId?: string;
  locality?: string;
  serviceId?: string;
  concernedMaritimeEntities?: Array<string>;
  concernedMaritimeEntityIds?: Array<string>;
  sharedMaritimeServices?: Array<string>;
  notions?: Array<Notion>;
  studies?: Array<FolderStudy>;
  attachments?: Array<FolderAttachment>;
}

export interface MaritimeServiceAvailableToFollowFolder {
  id: string,
  name: string,
  internationalName: string
}

export enum FolderStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export const TRANSLATIONS_LIST_FOLDER_STATUS = [
  { key: 'OPEN', value: 'enum.folder-status.open' },
  { key: 'CLOSED', value: 'enum.folder-status.closed' },
];

export const FolderSvgConst = {
  FONT_FOR_RECT: '17px sans-serif',
  FONT_SIZE_FOR_TIMELINE: 12,
  X_FOR_TIMELINE: 5,
  SVG_WIDTH: 1000,
  DAY_HEIGHT: 22,
  TIMELINE_X: 60,
  TIMELINE_PADDING: 10,
  LINK_SOURCE_PADDING: 30,
  NODE_WIDTH: 120,
  NODE_FILL: '#FFF',
  NODE_DY: '0.35em',
  NODE_FILL_OPACITY: 1,
  FULL_STROKE_OPACITY: 1,
  LIGHT_STROKE_OPACITY: 1,
  NODE_STROKE_WIDTH: 2,
  LINK_STROKE_OPACITY: 0.1,
  LINK_STROKE_WIDTH: 4,
  DAY_MS: 24 * 60 * 60,
  DATE_FORMAT: 'YYYY-MM-DD',
  ICON_NOTION_IN_FORCE: 'pi-circle-on',
  MARGIN_FOR_LEGEND: 48,
  fr: {
    DATE_FORMAT: 'DD/MM/YYYY'
  },
  en: {
    DATE_FORMAT: 'YYYY-MM-DD'
  },
  NODE_ATTRIBUTES: {
    INFOSOURCE: {
      name: 'INFOSOURCE',
      x: 1,
      x_text: 1,
      stroke: 'url(#gradient)',
      icon: 'pi-exclamation-circle',
      legend: {
        code: 'folder.graph.notion-infosource-code',
        x: 1,
        date_helper: 'folder.graph.notion-infosource-date-title'
      }
    },
    GEOREGULATION: {
      name: 'GEOREGULATION',
      x: 1,
      x_text: 1,
      stroke: '#00B0F0',
      icon: 'pi-book',
      legend: {
        code: 'folder.graph.notion-georegulation-code',
        x: 1.7,
        date_helper: 'folder.graph.notion-georegulation-date-title'
      }
    },
    ATTACHMENT: {
      name: 'ATTACHMENT',
      x: 1,
      x_text: 1,
      stroke: '#00B0F0',
      icon: 'pi-image',
      legend: {
        code: 'folder.graph.attachment-code',
        x: 2.4,
        date_helper: 'folder.graph.attachment-reception-date-title'
      }
    },
    WARNING: {
      name: 'WARNING',
      x: 2,
      x_text: 2,
      stroke: 'red',
      icon: 'pi-exclamation-triangle',
      legend: {
        code: 'folder.graph.notion-warning-code',
        x: 3.1,
        date_helper: 'folder.graph.notion-warning-date-title'
      }
    },
    STUDY: {
      name: 'STUDY',
      x: 3,
      x_text: 3,
      stroke: '#FFC000',
      icon: 'pi-folder-open',
      legend: {
        code: 'folder.graph.notion-study-code',
        x: 3.8,
        date_helper: 'folder.graph.notion-study-last-update-title'
      }
    }
  }
};

export interface SNodeExtra {
  nodeId: number;
  objectId: string;
  id: string;
  name: string;
  type?: {
    name?: string,
    coordinateX?: number
  };
  startDate?: string;
  endDate?: string;
  inForce?: boolean;
}

export interface SLinkExtra {
  source: number;
  target: number;
}

export type SNode = d3Sankey.SankeyNode<SNodeExtra, SLinkExtra>;
export type SLink = d3Sankey.SankeyLink<SNodeExtra, SLinkExtra>;

export interface DAG {
  nodes: SNode[];
  links: SLink[];
}

export type LinkD3 = d3.Selection<d3.BaseType, any, d3.BaseType, {}>;
export type NodeD3 = d3.Selection<d3.BaseType, unknown, SVGGElement, unknown>;
