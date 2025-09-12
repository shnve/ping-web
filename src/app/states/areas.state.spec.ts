import {TestBed} from '@angular/core/testing';
import {AreasState} from './areas.state';
import Area from '../models/area.model';

describe('AreasState', () => {
  let service: AreasState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AreasState]
    });
    service = TestBed.inject(AreasState);
  });


  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should return area with id "2"', () => {
    // Given
    const areas: Area[] = [{
        id: '1',
        internationalName: '',
        borderAreas: [],
        country: 'france',
        geom: null,
        information: '',
        localizedInformation : '',
        name: 'area1',
        urn: 'urn1'
      }, {
      id: '2',
      internationalName: '',
      borderAreas: [],
      country: 'france',
      geom: null,
      information: '',
      localizedInformation : '',
      name: 'area2',
      urn: 'urn2'
    }];
    service.setAreas(areas);
    // When
    const area = service.getAreaById('2');

    // Expect
    expect(area).toEqual(areas[1]);
  });
});
