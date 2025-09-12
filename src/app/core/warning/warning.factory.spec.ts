import { TestBed } from '@angular/core/testing';
import { GeometryType } from '@app/sig/utils/geometry';
import { WarningFeatureFactory } from '@sig/core/warning-feature.factory';
import { MockProvider } from 'ng-mocks';
import Feature from 'ol/Feature';
import { GlobalWarningType, JsonMapWarning } from '../../models/warning.model';
import { WarningFactory } from './warning.factory';


describe('WarningFactory', () => {
  let service: WarningFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(WarningFeatureFactory)
      ]
    });
    service = TestBed.inject(WarningFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create 1 MapWarning from 1 JsonMapWarning', () => {
    // Given
    const jsonWarning: JsonMapWarning = {
      id: '1',
      year: 21,
      warningTypeDetails: '',
      warningNumber: 1000,
      nameOfSeries: 'serie1',
      globalWarningType: GlobalWarningType.WARNING,
      geometries: [
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [[10, 10]]
          }
        }
      ],
      affectedAreas: [
        {
          geometry: {
            type: GeometryType.POLYGON,
            coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
          }
        }
      ]
    };
    const warningFactory = TestBed.inject(WarningFeatureFactory);
    const spyCreateAfectedAreas = spyOn(warningFactory, 'createAffectedAreas').and.returnValues([new Feature()]);
    const spyCreateGeometries = spyOn(warningFactory, 'createGeometries').and.returnValues([new Feature()]);

    // When
    const res = service.create(jsonWarning);

    // Expect
    expect(res.id).toEqual('1');
    expect(res.affectedAreas[0]).toBeInstanceOf(Feature);
    expect(res.geometries[0]).toBeInstanceOf(Feature);
    expect(spyCreateAfectedAreas.calls.mostRecent().args[1]).toEqual(jsonWarning.affectedAreas);
    expect(spyCreateGeometries.calls.mostRecent().args[1]).toEqual(jsonWarning.geometries);

  })
});
