import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from '@app/sig/components/map/map.component';
import Carto from '@shom2/carto';
import { MockComponent } from 'ng-mocks';
import { GeometriesFormComponent } from './geometries-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockCarto {
  olMap = {
    forEachFeatureAtPixel(coord, cb: () => {}) { }
  };
  view = {
    getZoom() { }
  }
}

describe('GeometriesFormComponent', () => {
  let component: GeometriesFormComponent;
  let fixture: ComponentFixture<GeometriesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        GeometriesFormComponent,
        MockComponent(MapComponent)
    ],
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeometriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should changeGeomArea and set only available tools for bathy', done => {
    // Given
    component.selectedGeomAreaOption = 'geometries';
    component.isBathy = true;
    const spyComponentSetAvailableTools = spyOn(component.map, 'setAvailableTools').and.callThrough();
    component.map.carto = {
      command: jasmine.createSpy()
    } as any as Carto;

    // When
    component.changeGeomArea();

    // Then
    expect(spyComponentSetAvailableTools).toHaveBeenCalledWith(['point', 'polygon', 'circle', 'dragging', 'center']);
    done();
  });
});
