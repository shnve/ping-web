// src/shom-types.d.ts
declare class Carto { map: any;[key: string]: any; constructor(...args: any[]); }
declare class MapCarto { layers: any[];[key: string]: any; constructor(...args: any[]); }
declare class CartoLayer { name: any; olLayer: any; opacity: any;[key: string]: any; constructor(...args: any[]); }
declare class MeasureType { static LENGTH: string; static AZIMUTH: string; static RADIUS: string; }
declare class CoordDirection { static NORTH: string; static SOUTH: string; static EAST: string; static WEST: string; }
declare class CoordinatePart { static LAT: string; static LON: string; }
declare class CartoModulesOptions { drawingModule: any;[key: string]: any; constructor(...args: any[]); }
declare class ProjectionSystem { coordinatesFormat: any; helper: string;[key: string]: any; constructor(...args: any[]); }

declare const metersToKms: any;
declare const metersToNMiles: any;
declare const sqrMetersToSqrKms: any;
declare const sqrMetersToSqrNMiles: any;
declare const functionDecimalToFormat: any;

declare const PROJECTION_WGS84_DECIMAL: any;
declare const PROJECTION_WGS84_DMS: any;
declare const PROJECTION_WGS84_DMSDS: any;
declare const PROJECTION_S53: any;
declare const PROJECTION_ED50_DMS: any;
declare const PROJECTION_ED50_DECIMAL: any;
declare const PROJECTION_LAMBERT_93: any;
declare const PROJECTION_LAMBERT_I: any;
declare const PROJECTION_LAMBERT_II: any;
declare const PROJECTION_LAMBERT_III: any;
declare const PROJECTION_LAMBERT_IV: any;