/**
 * Add '0' before number
 *
 * @param num padder number
 * @param max maxium of character to reach
 */

export function pad(num: number | string, max: number): string {
  const str = num.toString();
  return str.length < max ? pad('0' + str, max) : str;
}

export function decimalToDegMin(coord: number, format = 'DDD-MM.mm', precision = 2, maxDergreSize = 1): string {
  const abscoordinate = Math.abs(coord);
  let coordinatedegrees = Math.floor(abscoordinate);
  const coordinateminutes = (abscoordinate - coordinatedegrees) / (1 / 60);
  const coordinateMinutesParts = coordinateminutes.toFixed(precision).split('.');
  let integerPart = coordinateMinutesParts[0];
  const relativePart = coordinateMinutesParts[1];
  if (+integerPart === 60) {
    integerPart = '00';
    coordinatedegrees++;
  }

  const coordinateformatted = relativePart ? format.replace('mm', relativePart) : format.replace('.mm', '').replace(',mm', '');

  return coordinateformatted
    .replace('DD', pad(coordinatedegrees, maxDergreSize))
    .replace('MM', pad(integerPart, 2));
}
