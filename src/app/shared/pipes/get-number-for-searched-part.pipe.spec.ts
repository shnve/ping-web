import { GeoregulationPartModalDetails } from '@app/georegulation/models/georegulation.model';
import { InfosourcePart } from '@app/infosource/models/infosource.model';
import { NotionType } from '@app/models/notion.model';
import { WarningFeaturePart } from '@app/models/warning.model';
import { Feature } from 'ol';
import { LineString, Polygon } from 'ol/geom';
import { GetNumberForSearchedPartPipe } from './get-number-for-searched-part.pipe';

describe('getNumberForSearchedPart', () => {
  let pipe;

  beforeEach(() => {
    pipe = new GetNumberForSearchedPartPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should get number if searchedPart is type of WarningFeaturePart', () => {
    const searchedPart: WarningFeaturePart = {
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

    const otherFeaturePart: WarningFeaturePart = {
      typeDetails: ['detail2'],
      information: { 'fr': 'petites informations' },
      affectedAreas: [
        new Feature(
          new Polygon([[[0, 0], [15, 0], [10, 10], [0, 10]]])
        )
      ],
      geometries: [
        new Feature(
          new LineString([[0, 0], [4, 5], [10, 10]])
        )
      ]
    };

    const featureParts = [searchedPart, otherFeaturePart];

    expect(pipe.transform(searchedPart, featureParts, NotionType.WARNING)).toEqual(1);
  });

  it('should get number if featurePart is type of GeoregulationPartModalDetails', () => {
    const searchedPart: GeoregulationPartModalDetails = {
      features: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
        )
      ]
    };

    const otherFeaturePart: GeoregulationPartModalDetails = {
      features: [
        new Feature(
          new Polygon([[[0, 0], [10, 25], [10, 10], [0, 10]]])
        )
      ]
    };

    const featureParts = [otherFeaturePart, searchedPart];

    expect(pipe.transform(searchedPart, featureParts, NotionType.GEOREGULATION)).toEqual(2);
  });

  it('should get number if searchedPart is type of InfosourcePart', () => {
    const searchedPart: InfosourcePart = {
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

    const otherFeaturePart: InfosourcePart = {
      description: 'description',
      internationalDescription: 'internationalDescription',
      localisation: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [13, 10], [0, 10]]])
        )
      ],
      geometries: [
        new Feature(
          new Polygon([[[0, 0], [10, 0], [13, 10], [0, 10]]])
        )
      ]
    };

    const featureParts = [searchedPart, otherFeaturePart];

    expect(pipe.transform(searchedPart, featureParts, NotionType.INFOSOURCE)).toEqual(1);
  });

  it('should return empty data if warning data is not present', () => {
    const searchedPart: InfosourcePart = {
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

    expect(pipe.transform(undefined, undefined)).toEqual(-1);
    expect(pipe.transform(undefined, searchedPart, NotionType.INFOSOURCE)).toEqual(-1);
    expect(pipe.transform([], undefined)).toEqual(-1);
  });
});

