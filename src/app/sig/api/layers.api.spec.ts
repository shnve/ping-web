import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { LayersApi } from './layers.api';
import Spy = jasmine.Spy;

describe('LayersApi', () => {
  let service: LayersApi;
  let httpTestingController: HttpTestingController;
  let spyParserRead: Spy<any>;

  beforeEach(() => {
    spyParserRead = spyOn(WMTSCapabilities.prototype, 'read');
    TestBed.configureTestingModule({
    imports: [],
    providers: [LayersApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LayersApi);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should load getCapabilities and parse it with "WMTSCapabilities.read"', done => {
    spyParserRead.and.callFake((data: string) => 'parsed:' + data);
    service.getLayersFromGetCap().subscribe(res => {
      expect(spyParserRead).toHaveBeenCalled();
      expect(res).toEqual('parsed:' + 'chips');
      done();
    },
      err => done.fail(err)
    );
    const url = environment.carto.getCapBaseMapUrl.replace('{{key}}', environment.baseMapKey);
    const testRequest = httpTestingController.expectOne({ url });
    testRequest.flush('chips');
    expect(testRequest.request.method).toEqual('GET');
  });

  it('should load getCapabilities and "WMTSCapabilities.read" throw "parse error"', done => {
    spyParserRead.and.throwError('parse error');
    service.getLayersFromGetCap().subscribe(res => {
      done.fail('Error must be thrown');
    }, (err: Error) => {
      expect(err.message).toEqual('parse error');
      expect(spyParserRead).toHaveBeenCalled();
      done();
    });
    const url = environment.carto.getCapBaseMapUrl.replace('{{key}}', environment.baseMapKey);
    const testRequest = httpTestingController.expectOne({ url });
    testRequest.flush('chips');
    expect(testRequest.request.method).toEqual('GET');
  });

  it('should load getCapabilities with showRasterMarineWithAdditionalLayerForWestAfrica=true and parse it with "WMTSCapabilities.read"', done => {
    spyParserRead.and.callFake((data: string) => 'parsed:' + data);
    service.getLayersFromGetCap(true).subscribe(res => {
      expect(spyParserRead).toHaveBeenCalled();
      expect(res).toEqual('parsed:' + 'chips');
      done();
    },
      err => done.fail(err)
    );
    const url = environment.carto.getCapBaseMapUrl.replace('{{key}}', environment.baseMapKeyForShomService);
    const testRequest = httpTestingController.expectOne({ url });
    testRequest.flush('chips');
    expect(testRequest.request.method).toEqual('GET');
  });

  it('should load getCapabilities with showRasterMarineWithAdditionalLayerForWestAfrica=true and "WMTSCapabilities.read" throw "parse error"', done => {
    spyParserRead.and.throwError('parse error');
    service.getLayersFromGetCap(true).subscribe(res => {
      done.fail('Error must be thrown');
    }, (err: Error) => {
      expect(err.message).toEqual('parse error');
      expect(spyParserRead).toHaveBeenCalled();
      done();
    });
    const url = environment.carto.getCapBaseMapUrl.replace('{{key}}', environment.baseMapKeyForShomService);
    const testRequest = httpTestingController.expectOne({ url });
    testRequest.flush('chips');
    expect(testRequest.request.method).toEqual('GET');
  });
});
