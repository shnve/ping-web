import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { SeriesAdminApi } from '@app/api/admin/series-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { SubAreasApi } from '@app/api/sub-areas.api';
import MaritimeService, { ServiceNetwork } from '@app/models/maritime-service.model';
import { Serie } from '@app/models/serie.model';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { SerieFormComponent } from './serie-form.component';

import Spy = jasmine.Spy;

describe('SerieFormComponent', () => {
  let component: SerieFormComponent;
  let fixture: ComponentFixture<SerieFormComponent>;
  let spyGetSubAreas: Spy<any>;
  let spyApiSaveSerie: Spy<any>;
  let spyApiGetMaritimeService: Spy<any>;
  let mockSubAreasApi: SubAreasApi;
  let mockMaritimeServicesApi: MaritimeServicesApi;
  let mockSeriesAdminApi: SeriesAdminApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SerieFormComponent, OrderByPipe ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        DropdownModule,
        MultiSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        MockProvider(Router, {}),
        MockProvider(SubAreasApi, {}),
        MockProvider(SeriesAdminApi, {
          saveSerie(): Observable<Serie> {
            return of();
          }
        }),
        MockProvider(MaritimeServicesApi, {})
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockSeriesAdminApi = TestBed.inject(SeriesAdminApi);
    mockSubAreasApi = TestBed.inject(SubAreasApi);
    mockMaritimeServicesApi = TestBed.inject(MaritimeServicesApi);
    const subArea1 = {id: '1',
      name: 'Atlantique sous zone 1',
      internationalName: 'Atlantic sub area 1',
      geom: null};
    const subArea2 = {id: '2',
      name: 'Atlantique sous zone 2',
      internationalName: 'Atlantic sub area 2',
      geom: null};
    const maritimeService: MaritimeService = {
      id: '1',
      urn: '',
      name: 'Méditerannée',
      internationalName: 'Mediteranean',
      information: '',
      localizedInformation: '',
      type: '1111',
      productionAgency: 'agency',
      serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
      pingPartner: true,
      maritimeNoticeProducer: false,
      areas: []
    };
    const maritimeService2: MaritimeService = {
      id: '2',
      urn: '',
      name: 'Méditerannée',
      internationalName: 'Mediteranean',
      information: '',
      localizedInformation: '',
      type: '1111',
      productionAgency: 'agency',
      serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
      pingPartner: true,
      maritimeNoticeProducer: false,
      areas: []
    };
    spyApiGetMaritimeService = spyOn(mockMaritimeServicesApi, 'getMaritimeServices').and
      .returnValues(of([maritimeService, maritimeService2]));
    spyGetSubAreas = spyOn(mockSubAreasApi, 'getSubAreas').and
      .returnValues(of([subArea1, subArea2]));
    spyApiSaveSerie = spyOn(mockSeriesAdminApi, 'saveSerie').and
      .returnValues(of());

    fixture = TestBed.createComponent(SerieFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have multiselect filled with sub areas list and select sub area', async () => {
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#serie-sub-areas > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    const items = [];
    areaForm.querySelectorAll('.p-multiselect-item')
      .forEach((node: Node) => {
        items.push((node as HTMLElement).innerText);
      });
    expect(items.length).toEqual(2);
    expect(items).toEqual(['Atlantic sub area 1', 'Atlantic sub area 2']);
    fixture.componentInstance.onChangeLang({lang: 'fr', translations: null});
    expect(fixture.componentInstance.displayedLabel).toEqual('name');
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    (areaForm.querySelector('#serie-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#serie-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    const serviceDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-service')).componentInstance;
    serviceDropdown.onOptionSelect(new Event('change'), serviceDropdown.options[1]);
    await (areaForm.querySelector('#serie-mandatory-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    expect(fixture.componentInstance.serieForm.valid).toEqual(true);
    expect(fixture.componentInstance.serie.subAreas).toEqual(['1']);
    expect(fixture.componentInstance.serie.name).toEqual('name');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSerie).toHaveBeenCalled();
  });

  it('should have multiselect filled with mandatory languages and select mandatory language', async () => {
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#serie-mandatory-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    const items = [];
    areaForm.querySelectorAll('.p-multiselect-item')
      .forEach((node: Node) => {
        items.push((node as HTMLElement).innerText);
      });
    expect(items.length).toEqual(2);
    expect(items).toEqual(['fr', 'en']);
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    (areaForm.querySelector('#serie-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#serie-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    const serviceDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-service')).componentInstance;
    serviceDropdown.onOptionSelect(new Event('change'), serviceDropdown.options[1]);
    expect(fixture.componentInstance.serieForm.valid).toEqual(true);
    expect(fixture.componentInstance.serie.mandatoryLanguages).toEqual(['fr']);
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSerie).toHaveBeenCalled();
  });

  it('should have multiselect filled with optional languages and select optional language', async () => {
    expect(spyGetSubAreas).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#serie-optional-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    const items = [];
    areaForm.querySelectorAll('.p-multiselect-item')
      .forEach((node: Node) => {
        items.push((node as HTMLElement).innerText);
      });
    expect(items.length).toEqual(2);
    expect(items).toEqual(['fr', 'en']);
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    (areaForm.querySelector('#serie-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#serie-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    const serviceDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-service')).componentInstance;
    serviceDropdown.onOptionSelect(new Event('change'), serviceDropdown.options[1]);
    await (areaForm.querySelector('#serie-mandatory-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    expect(fixture.componentInstance.serieForm.valid).toEqual(true);
    expect(fixture.componentInstance.serie.optionalLanguages).toEqual(['fr']);
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSerie).toHaveBeenCalled();
  });

  it('should have dropdown filled with maritime services and select maritime service', async () => {
    expect(spyApiGetMaritimeService).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#serie-service > .p-dropdown') as HTMLDivElement).click();
    expect(areaForm.querySelectorAll('.p-dropdown-item').length).toEqual(2);
    const serviceDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-service')).componentInstance;
    serviceDropdown.onOptionSelect(new Event('change'), serviceDropdown.options[0]);
    (areaForm.querySelector('#serie-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#serie-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    await (areaForm.querySelector('#serie-mandatory-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    expect(fixture.componentInstance.serieForm.valid).toEqual(true);
    expect(fixture.componentInstance.serie.maritimeService).toEqual('1');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSerie).toHaveBeenCalled();
  });

  it('should have dropdown filled with types and select maritime type', async () => {
    expect(spyApiGetMaritimeService).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#serie-type > .p-dropdown') as HTMLDivElement).click();
    expect(areaForm.querySelectorAll('.p-dropdown-item').length).toEqual(9);
    const serviceDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-service')).componentInstance;
    serviceDropdown.onOptionSelect(new Event('change'), serviceDropdown.options[0]);
    (areaForm.querySelector('#serie-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#serie-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    await (areaForm.querySelector('#serie-mandatory-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    expect(fixture.componentInstance.serieForm.valid).toEqual(true);
    expect(fixture.componentInstance.serie.type).toEqual('LOCAL_NAVIGATIONAL_WARNING');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSerie).toHaveBeenCalled();
  });

  it('should fill form and submit', async () => {
    expect(spyApiGetMaritimeService).toHaveBeenCalled();
    expect(spyApiGetMaritimeService).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.serieForm.valid).toEqual(false);
    (areaForm.querySelector('#serie-urn') as HTMLInputElement).value = 'urn';
    areaForm.querySelector('#serie-urn').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#serie-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#serie-name').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#serie-iname') as HTMLInputElement).value = 'iname';
    areaForm.querySelector('#serie-iname').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#serie-info') as HTMLInputElement).value = 'info';
    areaForm.querySelector('#serie-info').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#serie-englishInfo') as HTMLInputElement).value = 'english info';
    areaForm.querySelector('#serie-englishInfo').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.serieForm.valid).toEqual(false);
    const serviceDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-service')).componentInstance;
    serviceDropdown.onOptionSelect(new Event('change'), serviceDropdown.options[0]);
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#serie-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    await (areaForm.querySelector('#serie-mandatory-languages > .p-multiselect') as HTMLDivElement).click();
    fixture.detectChanges();
    await (areaForm.querySelector('.p-multiselect-item') as HTMLDivElement).click();
    expect(fixture.componentInstance.serieForm.valid).toEqual(true);
    expect(fixture.componentInstance.serie.urn).toEqual('urn');
    expect(fixture.componentInstance.serie.name).toEqual('name');
    expect(fixture.componentInstance.serie.internationalName).toEqual('iname');
    expect(fixture.componentInstance.serie.information).toEqual('info');
    expect(fixture.componentInstance.serie.localizedInformation).toEqual('english info');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveSerie).toHaveBeenCalled();
  });

  it('should add and delete ranges', async () => {
    const areaForm: HTMLElement = fixture.nativeElement;
    expect((areaForm.querySelector('.button-delete') as HTMLButtonElement).disabled).toEqual(true);
    fixture.debugElement.query(By.css('.add-range')).triggerEventHandler('onClick', null);
    fixture.detectChanges();
    (areaForm.querySelectorAll('.serie-range')[2] as HTMLInputElement).value = '2000';
    (areaForm.querySelectorAll('.serie-range')[3] as HTMLInputElement).value = '3000';
    areaForm.querySelectorAll('.serie-range')[2].dispatchEvent(new Event('input'));
    areaForm.querySelectorAll('.serie-range')[3].dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.serie.ranges).toEqual([[1, 999], [2000, 3000]]);
    await (areaForm.querySelector('.button-delete') as HTMLButtonElement).click();
    expect(fixture.componentInstance.serie.ranges).toEqual([[2000, 3000]]);
  });
});
