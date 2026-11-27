import { fromLonLat } from 'ol/proj';
import {
  BandExtentTuple,
  NauticalCartographyService,
  PDF_GEOMETRY_EXTENT_MULTIPLIER
} from './nautical-cartography.service';

describe('NauticalCartographyService', () => {
  let service: NauticalCartographyService;
  const sampleExtents: BandExtentTuple[] = [
    [6, -68.01131, 10.48282, -67.96827, 10.51838], // Puerto Cabello muelle (Banda 6)
    [5, -70.31022, 11.73716, -70.19341, 11.82711], // Punto Fijo puerto (Banda 5)
    [4, -68.16897, 10.41309, -67.72890, 10.75603], // Aproximación (Banda 4)
    [3, -68.55669, 10.23271, -65.86667, 12.50892], // Costera VE-300 (Banda 3)
    [2, -76.04139, 5.80105, -54.89532, 20.72081]   // General VE (Banda 2)
  ];

  beforeEach(() => {
    service = new NauticalCartographyService();
  });

  it('detects the highest covering band in memory (6 > 5 > 4 > 3 > 2)', () => {
    expect(service.findHighestCoveringBand(-67.99, 10.50, -67.99, 10.50, sampleExtents)).toBe(6);
    expect(service.findHighestCoveringBand(-70.25, 11.78, -70.25, 11.78, sampleExtents)).toBe(5);
    expect(service.findHighestCoveringBand(-67.85, 10.55, -67.85, 10.55, sampleExtents)).toBe(4);
    expect(service.findHighestCoveringBand(-66.50, 11.80, -66.50, 11.80, sampleExtents)).toBe(3);
    expect(service.findHighestCoveringBand(-64.00, 15.00, -64.00, 15.00, sampleExtents)).toBe(2);
  });

  it('computes optimal scale framing for a point according to highest available band', () => {
    const [x6, y6] = fromLonLat([-67.99, 10.50], 'EPSG:3857');
    const bboxBanda6 = service.computePdfExtent3857([x6, y6, x6, y6], 920, 600, 181, sampleExtents);
    const widthBanda6 = bboxBanda6[2] - bboxBanda6[0];

    const [x2, y2] = fromLonLat([-64.00, 15.00], 'EPSG:3857');
    const bboxBanda2 = service.computePdfExtent3857([x2, y2, x2, y2], 920, 600, 181, sampleExtents);
    const widthBanda2 = bboxBanda2[2] - bboxBanda2[0];

    // Banda 6 (~1:5.000 -> ~655 m proyectados) vs Banda 2 (~1:600.000 -> ~80 km proyectados)
    expect(widthBanda6).toBeGreaterThan(600);
    expect(widthBanda6).toBeLessThan(750);
    expect(widthBanda2).toBeGreaterThan(75000);
    expect(widthBanda2).toBeLessThan(85000);
    expect((bboxBanda6[2] - bboxBanda6[0]) / (bboxBanda6[3] - bboxBanda6[1])).toBeCloseTo(920 / 600, 3);
  });

  it('uses clean 1.25x framing for larger polygons without double margin', () => {
    const [minX, minY] = fromLonLat([-67.95, 10.52], 'EPSG:3857');
    const [maxX, maxY] = fromLonLat([-67.75, 10.62], 'EPSG:3857');
    const rawW = maxX - minX;
    const bbox = service.computePdfExtent3857([minX, minY, maxX, maxY], 920, 600, 181, sampleExtents);

    expect(bbox[2] - bbox[0]).toBeCloseTo(rawW * PDF_GEOMETRY_EXTENT_MULTIPLIER, 0);
  });
});
