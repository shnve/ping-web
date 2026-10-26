declare module '@shom2/*' {
    // 1. CLASES Y EXPORTACIONES POR DEFECTO (Sirven como Tipo y como Valor)
    // Esto soluciona MapCarto, CartoLayer, Layer, y Carto
    export default class ShomMock {
        constructor(...args: any[]);
        [key: string]: any;
    }

    // 2. ENUMS Y MÓDULOS (Sirven como Tipo y como Valor simultáneamente)
    export type CoordinatePart = any;
    export const CoordinatePart: any;

    export type CoordDirection = any;
    export const CoordDirection: any;

    export type MeasureType = any;
    export const MeasureType: any;

    export type DistanceUnit = any;
    export const DistanceUnit: any;

    export type ProjectionSystem = any;
    export const ProjectionSystem: any;

    export type CartoModulesOptions = any;
    export const CartoModulesOptions: any;

    export type ToolKey = any;
    export const ToolKey: any;

    export type functionDecimalToFormat = any;
    export const functionDecimalToFormat: any;

    // 3. CONSTANTES (Solo valores)
    export const PROJECTION_WGS84_DECIMAL: any;
    export const PROJECTION_WGS84_DMS: any;
    export const PROJECTION_WGS84_DMSDS: any;
    export const PROJECTION_ED50_DECIMAL: any;
    export const PROJECTION_ED50_DMS: any;
    export const PROJECTION_LAMBERT_93: any;
    export const PROJECTION_LAMBERT_I: any;
    export const PROJECTION_LAMBERT_II: any;
    export const PROJECTION_LAMBERT_III: any;
    export const PROJECTION_LAMBERT_IV: any;
    export const PROJECTION_S53: any;

    // 4. FUNCIONES (Solo valores)
    export function metersToNMiles(...args: any[]): any;
    export function metersToKms(...args: any[]): any;
    export function sqrMetersToSqrKms(...args: any[]): any;
    export function sqrMetersToSqrNMiles(...args: any[]): any;
    export function convertMercatToLonLat(...args: any[]): any;
    export function getSphereRadius(...args: any[]): any;
    export function setVerticesLabels(...args: any[]): any;
}