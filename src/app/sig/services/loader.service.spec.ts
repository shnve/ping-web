import { TestBed } from '@angular/core/testing';

import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  [true, false].forEach(status => {
    it('should call loadingSub$ ' + status, done => {
      // Given
      // When
      service.toggleLoadingSpinner(status);

      // Then
      service.loadingSub$.subscribe(result => {
        expect(result).toBe(status);
        done();
      });
    });
  });
});
