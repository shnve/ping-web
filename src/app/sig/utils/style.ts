import { StyleLike } from 'ol/style/Style';

export type MaritimeReportTypeStyle = {
  Point?: StyleLike,
  LineString?: StyleLike,
  Polygon?: StyleLike,
  Circle?: StyleLike
};

export interface MaritimeReportTypeStyleOptions {
  point?: {
    icon?: string,
    color: string
  };
  lineString?: {
    icon?: string,
    color: string
  };
  polygon?: {
    icon?: string,
    strokeColor: string,
    fillColor: string
  };
  circle?: {
    icon?: string,
    strokeColor: string,
    fillColor: string
  };
  text?: {
    baseline?: string,
    strokeColor?: string,
    strokeWidth?: number,
    fillColor?: string,
    offsetX?: number,
    offsetY?: number
  };
}
