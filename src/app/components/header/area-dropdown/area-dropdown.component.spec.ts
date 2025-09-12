import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaDropdownComponent } from './area-dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { AreasFacade } from '@app/facades/areas.facade';
import { Observable, of, ReplaySubject } from 'rxjs';
import Area from '../../../models/area.model';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MockProvider } from 'ng-mocks';
import Spy = jasmine.Spy;
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('AreaDropdownComponent', () => {
  let component: AreaDropdownComponent;
  let fixture: ComponentFixture<AreaDropdownComponent>;
  let spyFacadeGetAreas: Spy<any>;
  let mockAreaFacade: AreasFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AreaDropdownComponent],
    imports: [TranslateModule.forRoot(),
        FormsModule,
        DropdownModule],
    providers: [PermissionsProvider,
        MockProvider(AreasFacade, {
            getAreas$(): Observable<Area[]> {
                return of([]);
            }
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    mockAreaFacade = TestBed.inject(AreasFacade);
    const area1 = {
      id: '1',
      urn: '',
      name: 'Atlantique',
      internationalName: 'Atlantic',
      information: '',
      moreInformation: '',
      country: 'France',
      geom: null,
      borderAreas: []
    };
    spyFacadeGetAreas = spyOn(mockAreaFacade, 'getAreaSelectOptions$').and.returnValues(of([area1]));

    fixture = TestBed.createComponent(AreaDropdownComponent);
    component = fixture.componentInstance;
    mockAreaFacade.selected$ = new ReplaySubject<Area>(1)
    mockAreaFacade.selected$.next(area1);
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(spyFacadeGetAreas).toHaveBeenCalled();
    expect(component).toBeTruthy();
  });

  it('should select new area by id in area facade', () => {
    // Given
    const spyFacadeSelectArea = spyOn(mockAreaFacade, 'selectAreaById').and.callThrough();
    component.selectedArea = '1'

    // When
    component.onSelectArea('1');

    // Expect
    expect(spyFacadeSelectArea).toHaveBeenCalledWith('1');
  });
});
