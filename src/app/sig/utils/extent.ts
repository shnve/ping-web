import {Extent, getHeight, getWidth} from 'ol/extent';
import {fromExtent} from 'ol/geom/Polygon';
import { Circle } from 'ol/geom';
import { environment } from '@env/environment';

export function getMaxAxisSize(extent: Extent): number {
  return Math.max(getWidth(extent), getHeight(extent));
}

/**
 * Enlarge or shrink extent
 * @param {Extent} extent
 * @param {number} scale
 * @returns {Extent}
 */
export function scaleExtent(extent: Extent, scale: number): Extent {
  if (isPointExtent(extent)) { return scaleExtentForPoint(extent, scale); }
  const geom = fromExtent(extent);
  geom.scale(scale);
  return geom.getExtent();
}

/**
 * Check if extent belongs to a point
 * @param extent
 */
export function isPointExtent(extent: Extent): boolean {
  const [first, second, third, fourth] = extent;
  return first === third && second === fourth;
}

/**
 * Scale extent for a point (i.e. create a circle and scale extent)
 * @param extent
 * @param scale
 */
export function scaleExtentForPoint(extent: Extent, scale: number): Extent {
  const [first, second, _] = extent;
  const baseRadiusMeters = Math.pow(scale, environment.carto.defaultRadiusForPointExtent);
  const isDegrees = Math.abs(first) <= 180 && Math.abs(second) <= 90;
  const radius = isDegrees ? (baseRadiusMeters / 111319.49) : baseRadiusMeters;
  const circle = new Circle([first, second], radius);
  circle.scale(scale);
  return circle.getExtent();
}
