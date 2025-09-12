import { TestBed } from '@angular/core/testing';
import { default as CartoLayer } from '@shom2/carto/core/Layer';
import { LayersState } from '@sig/states/layers.state';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { LayersApi } from '../api/layers.api';
import { LayersFacade } from './layers.facade';


describe('LayersFacade', () => {
  let service: LayersFacade;
  let mockLayersApi: LayersApi;
  let mockLayersState: LayersState;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        LayersFacade,
        MockProvider(LayersState),
        MockProvider(LayersApi)
      ]
    });
    service = TestBed.inject(LayersFacade);
    mockLayersApi = TestBed.inject(LayersApi);

    mockLayersState = TestBed.inject(LayersState);
  });

  it('should create', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should getBaseLayers$ from getCapabilities request', done => {
    const layers = new CartoLayer({});
    const stateObservable = of([layers]);
    spyOn(mockLayersState, 'isLoaded').and.returnValues(false);
    const spyLoadLayersFromGetCap = spyOn<any>(service, 'loadLayersFromGetCap').and.returnValues(stateObservable);
    const res = service.getBaseLayers$();
    expect(res).toBe(stateObservable);
    expect(spyLoadLayersFromGetCap).toHaveBeenCalled();
    done();
  });

  it('should getBaseLayers$ from state', done => {
    const layers = new CartoLayer({});
    const stateObservable = of([layers]);
    spyOn(mockLayersState, 'isLoaded').and.returnValues(true);
    const spyStateGetLayers = spyOn(mockLayersState, 'getLayers$').and.returnValues(stateObservable);
    const spyLoadLayersFromGetCap = spyOn<any>(service, 'loadLayersFromGetCap').and.returnValues(null);
    const res = service.getBaseLayers$();
    expect(res).toBe(stateObservable);
    expect(spyStateGetLayers).toHaveBeenCalled();
    expect(spyLoadLayersFromGetCap).not.toHaveBeenCalled();
    done();
  });
});
