import { TestBed } from '@angular/core/testing';
import { GeometryType } from '@app/sig/utils/geometry';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { AreasApi } from '../api/areas.api';
import Area from '../models/area.model';
import { AreasState } from '../states/areas.state';
import { AreasFacade } from './areas.facade';

describe('AreasFacade', () => {
  let service: AreasFacade;
  let mockAreasApi: AreasApi;
  let mockAreasState: AreasState;
  let areas = [{
    id: '1',
    name: 'mock area 1',
    geom: null
  }] as Area[];

  beforeEach(async() => {
    TestBed.configureTestingModule({
      providers: [
        AreasFacade,
        MockProvider(AreasApi),
        MockProvider(AreasState)
      ]
    });
    service = TestBed.inject(AreasFacade);
    mockAreasApi = TestBed.inject(AreasApi);
    spyOn(mockAreasApi, 'getAreas').and.returnValues(of(areas));
    mockAreasState = TestBed.inject(AreasState);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should set areas in areasState', (done) => {
    // Given
    const spyStateSetAreas = spyOn(mockAreasState, 'setAreas');
    const resultAreas = service.getAreas$();
    resultAreas.subscribe((areas) => {
      expect(areas).toBe(areas);
      expect(spyStateSetAreas).toHaveBeenCalledTimes(1);
      const argsForSetAreas = spyStateSetAreas.calls.mostRecent().args;
      expect(argsForSetAreas.length).toBe(1);
      expect(argsForSetAreas[0]).toEqual(areas);
      done();
    });
  });

  it('should select area by id and dispach selection event', (done) => {
    // Given
    const area: Area = {
      id: '1',
      urn: 'urn1',
      name: 'area1',
      localizedInformation : '',
      information: '',
      geom: {
        type: GeometryType.MULTI_POLYGON,
        coordinates: []
      }
    };
    const areasState = TestBed.inject(AreasState);
    const spyStateSelectById = spyOn(areasState, 'getAreaById').and.returnValues(area);

    // When
    const selected = service.selectAreaById('1');
    const selected$ = service.getSelectedArea$();

    // Expect
    expect(selected).toEqual(area);
    expect(spyStateSelectById).toHaveBeenCalledWith('1');
    selected$.subscribe((nwArea) => {
      expect(nwArea).toEqual(area);
      done();
    });
  });
});
