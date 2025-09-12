import {TestBed} from '@angular/core/testing';
import {WarningsState} from './warnings.state';
import {GlobalWarningType, MapWarning} from '../models/warning.model';

describe('WarningsState', () => {
  let service: WarningsState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WarningsState]
    });
    service = TestBed.inject(WarningsState);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch event with warning list', done => {
    // Given
    const warnings: MapWarning[] = [{
      id: '1',
      geometries: [],
      affectedAreas: [],
      globalWarningType: GlobalWarningType.WARNING,
      nameOfSeries: '',
      warningNumber: 1000,
      warningTypeDetails: '',
      year: 21
    }];

    // When
    service.setFilteredMapWarnings(warnings);

    // Expect
    service.mapWarnings$.subscribe((resWarnings) => {
      expect(resWarnings).toEqual(warnings);
      done();
    });
  });
});
