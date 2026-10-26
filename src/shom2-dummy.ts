// Clases principales
export class Carto { }
export class MapCarto { }
export class CartoLayer { }
export class Layer { }

// Enums y Constantes de objetos (usados en la lógica)
export const CoordinatePart = { LAT: 'LAT', LON: 'LON' };
export const CoordDirection = { NORTH: 'N', SOUTH: 'S', EAST: 'E', WEST: 'W' };
export const MeasureType = { LENGTH: 'LENGTH', AZIMUTH: 'AZIMUTH', RADIUS: 'RADIUS' };
export const DistanceUnit = {};
export const ProjectionSystem = {};
export const CartoModulesOptions = {};
export const ToolKey = {};
export const functionDecimalToFormat = {};

// Constantes de Proyección Geoespacial
export const PROJECTION_WGS84_DECIMAL = 'EPSG:4326';
export const PROJECTION_WGS84_DMS = 'EPSG:4326';
export const PROJECTION_WGS84_DMSDS = 'EPSG:4326';
export const PROJECTION_ED50_DECIMAL = 'EPSG:4230';
export const PROJECTION_ED50_DMS = 'EPSG:4230';
export const PROJECTION_LAMBERT_93 = 'EPSG:2154';
export const PROJECTION_LAMBERT_I = 'EPSG:27571';
export const PROJECTION_LAMBERT_II = 'EPSG:27572';
export const PROJECTION_LAMBERT_III = 'EPSG:27573';
export const PROJECTION_LAMBERT_IV = 'EPSG:27574';
export const PROJECTION_S53 = 'EPSG:4326';

// Funciones vacías para que no explote la ejecución
export const metersToNMiles = () => 0;
export const metersToKms = () => 0;
export const sqrMetersToSqrKms = () => 0;
export const sqrMetersToSqrNMiles = () => 0;
export const convertMercatToLonLat = () => [0, 0];
export const getSphereRadius = () => 6378137;
export const setVerticesLabels = () => { };

// Exportación por defecto obligatoria
export default {};