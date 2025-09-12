import { TestBed } from '@angular/core/testing';

import { ModelItemFilterState } from './warning-filter.state';
import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
class ExtendsWarningFilterState<T> extends ModelItemFilterState<T> {
  public filterValues$: BehaviorSubject<T>;
  public filterValues: T;
  public defaultValues: T;
}
describe('WarningFilterState', () => {
  let service: ExtendsWarningFilterState<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtendsWarningFilterState]
    });
    service = TestBed.inject(ExtendsWarningFilterState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should init values', () => {
    // Given
    const testValues = {key: 'testvalue'};

    // When
    service.initFilter(testValues);

    // Expect
    expect(service.defaultValues).toEqual(testValues);
    expect(service.filterValues).toEqual(testValues);
    expect(service.filterValues$.getValue()).toEqual(testValues);
  });

  it('should get values as observable', (done) => {
    // Given
    const testValues = {key: 'testvalue'};
    service.initFilter(testValues);

    // When
    const obs = service.getValues$();

    // Expect
    obs.subscribe((values) => {
      expect(values).toEqual(values);
      done();
    });
  });

  it('should set values and dispatch observalbe', (done) => {
    // Given
    const testValues = {key: 'testvalue'};
    service.initFilter(null);

    // When
    const values$ = service.getValues$();
    service.setValues(testValues);

    // Expect
    expect(service.getValues()).toEqual(testValues);
    values$.subscribe((values) => {
      // Expect
      expect(values).toEqual(testValues);
      done();
    });
  });

  it('should get default values', () => {
    // Given
    const defaultValues = {key: 'default'};
    const othersValues = {key: 'other'};

    // When
    service.initFilter(defaultValues);
    service.setValues(othersValues);

    // Expect
    expect(service.getDefaultValues()).toEqual(defaultValues);
  })
});
