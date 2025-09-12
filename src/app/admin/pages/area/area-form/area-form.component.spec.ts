import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from "@angular/router";
import { ViewGeometryComponent } from '@app/admin/components/view-geometry/view-geometry.component';
import { AreasApi } from '@app/api/areas.api';
import { AreasFacade } from '@app/facades/areas.facade';
import Area from '@app/models/area.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MapComponent } from '@app/sig/components/map/map.component';
import { MockProvider } from 'ng-mocks';
import WKT from 'ol/format/WKT';
import { Polygon } from 'ol/geom';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, of } from 'rxjs';
import { AreaFormComponent } from './area-form.component';
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

describe('AreaFormComponent', () => {
  let component: AreaFormComponent;
  let fixture: ComponentFixture<AreaFormComponent>;
  let spyFacadeGetAreas: Spy<any>;
  let spyApiSaveArea: Spy<any>;
  let mockAreaFacade: AreasFacade;
  let mockAreaApi: AreasApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AreaFormComponent,
        MapComponent,
        ViewGeometryComponent,
    ],
    imports: [ReactiveFormsModule,
        TranslateModule.forRoot(),
        DropdownModule,
        MultiSelectModule,
        NoopAnimationsModule],
    providers: [
        PermissionsProvider,
        MockProvider(Router, {}),
        MockProvider(AreasFacade, {
            getAreaSelectOptions$(): Observable<Area[]> {
                return of([]);
            }
        }),
        MockProvider(AreasApi, {
            saveArea(): Observable<Area> {
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
    mockAreaFacade = TestBed.inject(AreasFacade);
    mockAreaApi = TestBed.inject(AreasApi);

    const area1 = {
      id: '1',
      urn: '',
      name: 'Atlantique',
      internationalName: 'Atlantic',
      information: '',
      localizedInformation: '',
      country: 'France',
      geom: geometry,
      borderAreas: []
    };
    const area2 = {
      id: '1',
      urn: '',
      name: 'Méditerannée',
      internationalName: 'Mediteranean',
      information: '',
      localizedInformation: '',
      country: 'France',
      geom: geometry,
      borderAreas: []
    };
    spyFacadeGetAreas = spyOn(mockAreaFacade, 'getAreaSelectOptions$').and.returnValues(of([area1, area2]));
    spyApiSaveArea = spyOn(mockAreaApi, 'saveArea').and.returnValues(of(area1));

    fixture = TestBed.createComponent(AreaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should have multiselect filled with areas list and select area', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('.p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    const items = [];
    areaForm.querySelectorAll('.p-multiselect-item')
      .forEach((node: Node) => {
        items.push((node as HTMLElement).innerText);
      });
    expect(items.length).toEqual(2);
    expect(items).toEqual(['Atlantic', 'Mediteranean']);
    fixture.componentInstance.onChangeLang({ lang: 'fr', translations: null });
    expect(fixture.componentInstance.displayedAreaLabel).toEqual('name');
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    areaForm.querySelector('#area-borders').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#area-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#area-name').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.area.borderAreas).toEqual(['1']);
    expect(fixture.componentInstance.area.name).toEqual('name');
    expect(fixture.componentInstance.areaForm.valid).toEqual(true);
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveArea).toHaveBeenCalled();
  });

  it('should have dropdown filled with countries list and select country', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#area-country > .p-dropdown') as HTMLDivElement).click();
    fixture.detectChanges();
    expect(areaForm.querySelectorAll('.p-dropdown-item').length).toEqual(249);
    const countryDropdown: Dropdown = fixture.debugElement.query(By.css('#area-country')).componentInstance;
    countryDropdown.onOptionSelect(new Event('change'), countryDropdown.options[0]);
    (areaForm.querySelector('#area-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#area-name').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.area.country).toEqual('AD');
    expect(fixture.componentInstance.area.name).toEqual('name');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveArea).toHaveBeenCalled();
  });

  it('should fill form and submit', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.areaForm.valid).toEqual(false);
    (areaForm.querySelector('#area-urn') as HTMLInputElement).value = 'urn';
    areaForm.querySelector('#area-urn').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#area-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#area-name').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#area-iname') as HTMLInputElement).value = 'iname';
    areaForm.querySelector('#area-iname').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#area-info') as HTMLInputElement).value = 'info';
    areaForm.querySelector('#area-info').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#area-englishInfo') as HTMLInputElement).value = 'english info';
    areaForm.querySelector('#area-englishInfo').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.areaForm.valid).toEqual(true);
    expect(fixture.componentInstance.area.urn).toEqual('urn');
    expect(fixture.componentInstance.area.name).toEqual('name');
    expect(fixture.componentInstance.area.internationalName).toEqual('iname');
    expect(fixture.componentInstance.area.information).toEqual('info');
    expect(fixture.componentInstance.area.localizedInformation).toEqual('english info');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveArea).toHaveBeenCalled();
  });
});
