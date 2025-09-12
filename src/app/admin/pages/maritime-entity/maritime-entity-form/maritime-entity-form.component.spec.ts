import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ViewGeometryComponent } from '@app/admin/components/view-geometry/view-geometry.component';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AreasFacade } from '@app/facades/areas.facade';
import Area from '@app/models/area.model';
import MaritimeEntity, { MaritimeEntityType } from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MapComponent } from '@app/sig/components/map/map.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import WKT from 'ol/format/WKT';
import { Polygon } from 'ol/geom';
import { ConfirmationService } from 'primeng/api';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, of } from 'rxjs';
import { MaritimeEntityFormComponent } from './maritime-entity-form.component';
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

describe('MaritimeEntityFormComponent', () => {
  let component: MaritimeEntityFormComponent;
  let fixture: ComponentFixture<MaritimeEntityFormComponent>;
  let spyFacadeGetAreas: Spy<any>;
  let spyApiSaveArea: Spy<any>;
  let spyApiGetMaritimeService: Spy<any>;
  let mockAreaFacade: AreasFacade;
  let mockMaritimeEntitiesApi: MaritimeEntitiesApi;
  let mockMaritimeServicesApi: MaritimeServicesApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MaritimeEntityFormComponent,
        MapComponent,
        ViewGeometryComponent],
    imports: [ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        DropdownModule,
        MultiSelectModule,
        NoopAnimationsModule],
    providers: [
        ConfirmationService,
        PermissionsProvider,
        MockProvider(Router, {}),
        MockProvider(AreasFacade, {
            getAreaSelectOptions$(): Observable<Area[]> {
                return of([]);
            }
        }),
        MockProvider(MaritimeEntitiesApi, {
            saveMaritimeEntity(): Observable<MaritimeEntity> {
                return of();
            }
        }),
        MockProvider(MaritimeServicesApi, {
            getMaritimeServices(): Observable<MaritimeService[]> {
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
    mockMaritimeEntitiesApi = TestBed.inject(MaritimeEntitiesApi);
    mockMaritimeServicesApi = TestBed.inject(MaritimeServicesApi);
    const area1 = {
      id: '1',
      urn: '',
      name: 'Atlantique',
      internationalName: 'Atlantic',
      information: '',
      localizedInformation: '',
      country: 'France',
      geom: null,
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
      geom: null,
      borderAreas: []
    };
    const maritimeEntity: MaritimeEntity = {
      id: '1',
      urn: '',
      name: 'Méditerannée',
      internationalName: 'Mediteranean',
      information: '',
      localizedInformation: '',
      type: MaritimeEntityType.SERVICE_AREA,
      geom: null,
      areas: [],
      maritimeServiceId: '2',
      sissyId:'123'
    };
    const maritimeService1: MaritimeService = {
      id: '1',
      urn: '',
      name: 'CND BREST',
      internationalName: 'CND BREST',
      information: '',
      localizedInformation: '',
      productionAgency: '',
      country: '',
      type: '',
      serviceNetwork: null,
      pingPartner: true,
      maritimeNoticeProducer: true,
      areas: null,
      maritimeEntities: null,
      sissyId:'123'
    };
    const maritimeService2: MaritimeService = {
      id: '2',
      urn: '',
      name: 'CND CHERBOURG',
      internationalName: 'CND CHERBOURG',
      information: '',
      localizedInformation: '',
      productionAgency: '',
      country: '',
      type: '',
      serviceNetwork: null,
      pingPartner: true,
      maritimeNoticeProducer: true,
      areas: null,
      maritimeEntities: null,
      sissyId: '123'
    };

    spyFacadeGetAreas = spyOn(mockAreaFacade, 'getAreaSelectOptions$').and.returnValues(of([area1, area2]));
    spyApiSaveArea = spyOn(mockMaritimeEntitiesApi, 'saveMaritimeEntity').and.returnValues(of(maritimeEntity));
    spyApiGetMaritimeService = spyOn(mockMaritimeServicesApi, 'getMaritimeServices').and.returnValues(of([maritimeService1, maritimeService2]));

    fixture = TestBed.createComponent(MaritimeEntityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have multiselect filled with areas list and select area', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const maritimeEntityForm: HTMLElement = fixture.nativeElement;
    await (maritimeEntityForm.querySelector('.p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    const items = [];
    maritimeEntityForm.querySelectorAll('.p-multiselect-item')
      .forEach((node: Node) => {
        items.push((node as HTMLElement).innerText);
      });
    expect(items.length).toEqual(2);
    expect(items).toEqual(['Atlantic', 'Mediteranean']);
    fixture.componentInstance.onChangeLang({ lang: 'fr', translations: null });
    expect(fixture.componentInstance.displayedAreaLabel).toEqual('name');
    await (maritimeEntityForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    maritimeEntityForm.querySelector('#maritime-entity-areas').dispatchEvent(new Event('input'));
    (maritimeEntityForm.querySelector('#maritime-entity-name') as HTMLInputElement).value = 'name';
    maritimeEntityForm.querySelector('#maritime-entity-name').dispatchEvent(new Event('input'));
    const maritimeServiceDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service')).componentInstance;
    maritimeServiceDropdown.onOptionSelect(new Event('change'), maritimeServiceDropdown.options[0]);
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-entity-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[0]);
    expect(fixture.componentInstance.maritimeEntity.areas).toEqual(['1']);
    expect(fixture.componentInstance.maritimeEntity.name).toEqual('name');
    await (maritimeEntityForm.querySelector('.save-button') as HTMLButtonElement).click();
    maritimeEntityForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveArea).toHaveBeenCalled();
  });

  it('should have dropdown filled with entity types and select type', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const maritimeEntityForm: HTMLElement = fixture.nativeElement;
    await (maritimeEntityForm.querySelector('#maritime-entity-type > .p-dropdown') as HTMLDivElement).click();
    fixture.detectChanges();
    expect(maritimeEntityForm.querySelectorAll('.p-dropdown-item').length).toEqual(1);
    const maritimeServiceDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service')).componentInstance;
    maritimeServiceDropdown.onOptionSelect(new Event('change'), maritimeServiceDropdown.options[0]);
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-entity-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[0]);
    maritimeEntityForm.querySelector('.p-dropdown').dispatchEvent(new Event('input'));
    (maritimeEntityForm.querySelector('#maritime-entity-name') as HTMLInputElement).value = 'name';
    maritimeEntityForm.querySelector('#maritime-entity-name').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.maritimeEntity.type).toEqual(MaritimeEntityType.SERVICE_AREA);
    expect(fixture.componentInstance.maritimeEntity.name).toEqual('name');
    await (maritimeEntityForm.querySelector('.save-button') as HTMLButtonElement).click();
    maritimeEntityForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveArea).toHaveBeenCalled();
  });

  it('should fill form and submit', async () => {
    component.viewGeometry.canSaveGeometry = canSaveGeometry;
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const maritimeEntityForm: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.maritimeEntityForm.valid).toEqual(false);
    (maritimeEntityForm.querySelector('#maritime-entity-urn') as HTMLInputElement).value = 'urn';
    maritimeEntityForm.querySelector('#maritime-entity-urn').dispatchEvent(new Event('input'));
    (maritimeEntityForm.querySelector('#maritime-entity-name') as HTMLInputElement).value = 'name';
    maritimeEntityForm.querySelector('#maritime-entity-name').dispatchEvent(new Event('input'));
    const maritimeServiceDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service')).componentInstance;
    maritimeServiceDropdown.onOptionSelect(new Event('change'), maritimeServiceDropdown.options[0]);
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-entity-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[0]);
    (maritimeEntityForm.querySelector('#maritime-entity-iname') as HTMLInputElement).value = 'iname';
    maritimeEntityForm.querySelector('#maritime-entity-iname').dispatchEvent(new Event('input'));
    (maritimeEntityForm.querySelector('#maritime-entity-info') as HTMLInputElement).value = 'info';
    maritimeEntityForm.querySelector('#maritime-entity-info').dispatchEvent(new Event('input'));
    (maritimeEntityForm.querySelector('#maritime-entity-englishInfo') as HTMLInputElement).value = 'english info';
    maritimeEntityForm.querySelector('#maritime-entity-englishInfo').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.maritimeEntityForm.valid).toEqual(true);
    expect(fixture.componentInstance.maritimeEntity.urn).toEqual('urn');
    expect(fixture.componentInstance.maritimeEntity.name).toEqual('name');
    expect(fixture.componentInstance.maritimeEntity.internationalName).toEqual('iname');
    expect(fixture.componentInstance.maritimeEntity.information).toEqual('info');
    expect(fixture.componentInstance.maritimeEntity.localizedInformation).toEqual('english info');
    await (maritimeEntityForm.querySelector('.save-button') as HTMLButtonElement).click();
    maritimeEntityForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveArea).toHaveBeenCalled();
  });
});
