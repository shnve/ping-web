import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AreasFacade } from '@app/facades/areas.facade';
import Area from '@app/models/area.model';
import MaritimeService, { MaritimeServiceType, ServiceNetwork } from '@app/models/maritime-service.model';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import { ConfirmationService } from 'primeng/api';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { MaritimeServiceFormComponent } from './maritime-service-form.component';


import Spy = jasmine.Spy;

describe('MaritimeServiceFormComponent', () => {
  let component: MaritimeServiceFormComponent;
  let fixture: ComponentFixture<MaritimeServiceFormComponent>;
  let spyFacadeGetAreas: Spy<any>;
  let spyApiSaveMaritimeService: Spy<any>;
  let mockAreaFacade: AreasFacade;
  let maritimeServicesApi: MaritimeServicesApi;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MaritimeServiceFormComponent, OrderByPipe],
    imports: [ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        DropdownModule,
        MultiSelectModule,
        NoopAnimationsModule],
    providers: [
        ConfirmationService,
        MockProvider(Router, {}),
        MockProvider(AreasFacade, {
            getAreaSelectOptions$(): Observable<Area[]> {
                return of([]);
            }
        }),
        MockProvider(MaritimeServicesApi, {
            saveMaritimeService(): Observable<MaritimeService> {
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
    maritimeServicesApi = TestBed.inject(MaritimeServicesApi);
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
      areas: [],
      sissyId: '123',
      ihoProducerCode: '1234'
    };

    spyFacadeGetAreas = spyOn(mockAreaFacade, 'getAreaSelectOptions$').and.returnValues(of([area1, area2]));
    spyApiSaveMaritimeService = spyOn(maritimeServicesApi, 'saveMaritimeService').and.returnValues(of(maritimeService));

    fixture = TestBed.createComponent(MaritimeServiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have multiselect filled with areas list and select area', async () => {
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
    areaForm.querySelector('#maritime-service-areas').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#maritime-service-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#maritime-service-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    const networkDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-network')).componentInstance;
    networkDropdown.onOptionSelect(new Event('change'), networkDropdown.options[1]);
    expect(fixture.componentInstance.maritimeServiceForm.valid).toEqual(true);
    expect(fixture.componentInstance.maritimeService.areas).toEqual(['1']);
    expect(fixture.componentInstance.maritimeService.name).toEqual('name');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveMaritimeService).toHaveBeenCalled();
  });

  it('should have dropdown filled with countries list and select country', async () => {
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    await (areaForm.querySelector('#maritime-service-country > .p-dropdown') as HTMLDivElement).click();
    expect(areaForm.querySelectorAll('.p-dropdown-item').length).toEqual(249);
    const countryDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-country')).componentInstance;
    countryDropdown.onOptionSelect(new Event('change'), countryDropdown.options[0]);
    (areaForm.querySelector('#maritime-service-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#maritime-service-name').dispatchEvent(new Event('input'));
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    const networkDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-network')).componentInstance;
    networkDropdown.onOptionSelect(new Event('change'), networkDropdown.options[1]);
    expect(fixture.componentInstance.maritimeServiceForm.valid).toEqual(true);
    expect(fixture.componentInstance.maritimeService.country).toEqual('AD');
    expect(fixture.componentInstance.maritimeService.name).toEqual('name');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveMaritimeService).toHaveBeenCalled();
  });

  it('should fill form and submit', async () => {
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    const areaForm: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.maritimeServiceForm.valid).toEqual(false);
    (areaForm.querySelector('#maritime-service-urn') as HTMLInputElement).value = 'urn';
    areaForm.querySelector('#maritime-service-urn').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#maritime-service-name') as HTMLInputElement).value = 'name';
    areaForm.querySelector('#maritime-service-name').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#maritime-service-iname') as HTMLInputElement).value = 'iname';
    areaForm.querySelector('#maritime-service-iname').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#maritime-service-info') as HTMLInputElement).value = 'info';
    areaForm.querySelector('#maritime-service-info').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#maritime-service-englishInfo') as HTMLInputElement).value = 'english info';
    areaForm.querySelector('#maritime-service-englishInfo').dispatchEvent(new Event('input'));
    (areaForm.querySelector('#maritime-service-production-agency') as HTMLInputElement).value = 'production agency';
    areaForm.querySelector('#maritime-service-production-agency').dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.maritimeServiceForm.valid).toEqual(false);
    await (areaForm.querySelector('#maritime-service-type > .p-dropdown') as HTMLDivElement).click();
    expect(areaForm.querySelectorAll('.p-dropdown-item').length).toEqual(13);
    const typeDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-type')).componentInstance;
    typeDropdown.onOptionSelect(new Event('change'), typeDropdown.options[1]);
    await (areaForm.querySelector('#maritime-service-type > .p-dropdown') as HTMLDivElement).click();
    await (areaForm.querySelector('#maritime-service-network > .p-dropdown') as HTMLDivElement).click();
    expect(areaForm.querySelectorAll('.p-dropdown-item').length).toEqual(16);
    const networkDropdown: Dropdown = fixture.debugElement.query(By.css('#maritime-service-network')).componentInstance;
    networkDropdown.onOptionSelect(new Event('change'), networkDropdown.options[1]);
    expect(fixture.componentInstance.maritimeServiceForm.valid).toEqual(true);
    expect(fixture.componentInstance.maritimeService.urn).toEqual('urn');
    expect(fixture.componentInstance.maritimeService.name).toEqual('name');
    expect(fixture.componentInstance.maritimeService.internationalName).toEqual('iname');
    expect(fixture.componentInstance.maritimeService.information).toEqual('info');
    expect(fixture.componentInstance.maritimeService.localizedInformation).toEqual('english info');
    expect(fixture.componentInstance.maritimeService.productionAgency).toEqual('production agency');
    expect(fixture.componentInstance.maritimeService.type).toEqual(MaritimeServiceType.BRI);
    expect(fixture.componentInstance.maritimeService.serviceNetwork).toEqual('NON_STATE_OWNED_PUBLIC_SERVICE');
    await (areaForm.querySelector('.save-button') as HTMLButtonElement).click();
    areaForm.querySelector('.form').dispatchEvent(new Event('submit'));
    expect(spyApiSaveMaritimeService).toHaveBeenCalled();
  });
});
