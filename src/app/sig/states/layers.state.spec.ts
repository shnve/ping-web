import {TestBed} from '@angular/core/testing';
import {LayersState} from './layers.state';

describe('LayersState', () => {
  let service: LayersState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayersState]
    });
    service = TestBed.inject(LayersState);
  });


  it('should create', () => {
    expect(service).toBeTruthy();
    expect(service.isLoaded()).toBeFalse();
  });

  it('should add loaded layers', done => {
    // Given
    const layers = [];

    // When
    service.addLayers(layers);

    //
    service.getLayers$().subscribe((resLayers) => {
      expect(resLayers).toEqual(layers);
      expect(service.isLoaded()).toBeTrue();
      done();
    });
  });

  it('should set loaded', () => {
    // When
    service.setLoaded(true);

    // Expect
    expect(service.isLoaded()).toBeTrue();
  });
});
