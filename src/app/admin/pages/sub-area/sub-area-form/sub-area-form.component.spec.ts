import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ViewGeometryComponent } from '@app/admin/components/view-geometry/view-geometry.component';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { SubArea } from '@app/models/sub-area.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MapComponent } from '@app/sig/components/map/map.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import WKT from 'ol/format/WKT';
import { Polygon } from 'ol/geom';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, of } from 'rxjs';
import { SubAreaFormComponent } from './sub-area-form.component';
import Spy = jasmine.Spy;

const wkt =
  'POLYGON((10.689 -25.092, 34.595 ' +
  '-20.170, 38.814 -35.639, 13.502 ' +
  '-39.155, 10.689 -25.092))';

const format = new WKT();

const feature = format.readFeature(wkt, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857',
});

const geometry = {
  type: (feature?.getGeometry() as Polygon)?.getType(),
  coordinates: (feature?.getGeometry() as Polygon)?.getCoordinates()
    .map(coordinate => coordinate.map(coordinates => coordinates.slice(0, 2)))
};

const canSaveGeometry = () => { return true };

describe('SubAreaFormComponent', () => {
  let component: SubAreaFormComponent;
  let fixture: ComponentFixture<SubAreaFormComponent>;
  let spyApiSaveSubArea: Spy<any>;
  let mockSubAreaApi: SubAreasApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SubAreaFormComponent,
        MapComponent,
        ViewGeometryComponent,
        OrderByPipe],
    imports: [ReactiveFormsModule,
        TranslateModule.forRoot(),
        MultiSelectModule,
        NoopAnimationsModule],
    providers: [
        PermissionsProvider,
        MockProvider(Router, {}),
        MockProvider(SubAreasApi, {
            saveSubArea(): Observable<SubArea> {
                return of();
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    mockSubAreaApi = TestBed.inject(SubAreasApi);
    spyApiSaveSubArea = spyOn(mockSubAreaApi, 'saveSubArea');
    const subArea1 = {
      id: '1',
      name: 'subArea 1',
      geom: geometry,
      subAreas: ['4'],
      areaId: '1'
    };
    const subArea2 = {
      id: '2',
      name: 'subArea 2',
      geom: null,
      subAreas: ['1'],
      areaId: '2'
    };
    const subArea3 = {
      id: '3',
      name: 'subArea 3',
      geom: geometry,
      subAreas: ['5'],
      areaId: '3'
    };
    spyOn(mockSubAreaApi, 'getSubAreas').and.returnValues(of([subArea1, subArea2, subArea3]));
    fixture = TestBed.createComponent(SubAreaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should fill form and submit', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    const areaForm: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.subAreaForm.valid).toEqual(false);
    (areaForm.querySelector('#sub-area-urn') as HTMLInputElement).value = 'urn';
    areaForm.querySelector('#sub-area-urn').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#sub-area-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#sub-area-name').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#sub-area-iname') as HTMLInputElement).value = 'iname';
    areaForm.querySelector('#sub-area-iname').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.subAreaForm.valid).toEqual(true);
    expect(fixture.componentInstance.subArea.urn).toEqual('urn');
    expect(fixture.componentInstance.subArea.name).toEqual('name');
    expect(fixture.componentInstance.subArea.internationalName).toEqual('iname');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSubArea).toHaveBeenCalled();
  });

  it('should render empty list if two level hierarchy is already met', async () => {
    fixture.componentInstance.subArea = {
      id: '4',
      name: 'subArea 4',
      geom: null,
      areaId: '4'
    };
    (await fixture.componentInstance.subAreas$.subscribe(result => {
      expect(result.length).toEqual(0);
    })).unsubscribe();
  });

  it('should not render parent sub area and select sub area', async () => {
    fixture.componentInstance.subArea = {
      id: '5',
      name: 'subArea 5',
      geom: null,
      areaId: '5'
    };
    (await fixture.componentInstance.subAreas$.subscribe(result => {
      expect(result.length).toEqual(2);
    })).unsubscribe();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('.p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    (areaForm.querySelector('#sub-area-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#sub-area-name').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.subArea.subAreas).toEqual(['1']);
  });
});
