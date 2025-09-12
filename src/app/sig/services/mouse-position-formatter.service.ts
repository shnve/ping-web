import {Injectable} from '@angular/core';
import {Coordinate} from 'ol/coordinate';
import {decimalToDegMin} from '@sig/utils/coordinate';


const CARDINAL_POINTS = {
  north: 'N',
  south: 'S',
  east: 'E',
  west: 'W'
};


@Injectable({
  providedIn: 'root'
})
export class MousePositionFormatterService {

  constructor() {}

  covertCoordinateToDms(coordinate: Coordinate, format = 'DDD-MM.mmC', precision = 2, separator = ' '): string {
    const lat = decimalToDegMin(coordinate[1], format, precision, 2);
    const lon = decimalToDegMin(coordinate[0], format, precision, 3);
    return lat.replace('C', coordinate[1] >= 0
        ? CARDINAL_POINTS.north : CARDINAL_POINTS.south
      ) + separator
      + lon.replace('C', coordinate[0] >= 0
        ? CARDINAL_POINTS.east : CARDINAL_POINTS.west
      );
  }
}
