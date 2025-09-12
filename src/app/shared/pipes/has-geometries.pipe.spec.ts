import { GeoregulationPartModalDetails } from '@app/georegulation/models/georegulation.model';
import { InfosourcePart } from '@app/infosource/models/infosource.model';
import { NotionType } from '@app/models/notion.model';
import { WarningFeaturePart } from '@app/models/warning.model';
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { HasGeometriesPipe } from './has-geometries.pipe';

describe('hasGeometries', () => {
  let pipe;

  beforeEach(() => {
    pipe = new HasGeometriesPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should have geometries if featurePart is type of WarningFeaturePart', () => {
    const featurePart: WarningFeaturePart = {
      typeDetails: ['detail1'],
      information: { 'fr': 'petites informations' },
      affectedAreas: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ],
      geometries: [
        new Feature(
          new LineString([[0, 0], [4, 5], [10, 10]])
        )
      ]
    };

    expect(pipe.transform(featurePart, NotionType.WARNING)).toEqual(true);
  });

  it('should have geometries if featurePart is type of GeoregulationPartModalDetails', () => {
    const featurePart: GeoregulationPartModalDetails = {
      features: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ]
    };

    expect(pipe.transform(featurePart, NotionType.GEOREGULATION)).toEqual(true);
  });

  it('should have geometries if featurePart is type of InfosourcePart', () => {
    const featurePart: InfosourcePart = {
      description: 'description',
      internationalDescription: 'internationalDescription',
      localisation: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ],
      geometries: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ]
    };

    expect(pipe.transform(featurePart, NotionType.INFOSOURCE)).toEqual(true);
  });

  it('should return empty data if warning data is not present', () => {
    expect(pipe.transform(undefined)).toEqual(false);
  });
});

