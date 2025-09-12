import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@app/auth/auth.service';
import { ServiceRole } from '@app/models/pro-user.model';
import { PingPaginatorComponent } from '@app/shared/components/ping-paginator/ping-paginator.component';
import { GeometryType } from '@app/sig/utils/geometry';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { DropdownModule as PrimeDropdownModule } from 'primeng/dropdown';
import { SubAreaListComponent } from './sub-area-list.component';

describe('SubareaListComponent', () => {
  let component: SubAreaListComponent;
  let fixture: ComponentFixture<SubAreaListComponent>;
  let mockAuthService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SubAreaListComponent, PingPaginatorComponent],
    imports: [PrimeDropdownModule, TranslateModule.forRoot()],
    providers: [
        ConfirmationService,
        MockProvider(AuthService, {
            hasRoleFunctionalAdmin(): boolean {
                return false;
            },
            isProUser(): boolean {
                return false;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(SubAreaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.pageItem = {
      totalElements: 10,
      totalPages: 2,
      first: true,
      last: false,
      size: 5,
      number: 0,
      pageable: {
        pageSize: 5,
        pageNumber: 0
      },
      // first 2 subareas are "secteurs" = associated with series
      content: Array.apply(null, {length: 5}).map((_, i) => {
        return {
          id: `${i}`,
          name: `Nom ${i}`,
          geom: {
            type: GeometryType.POINT,
            coordinates: [4, 5]
          },
          series: i < 2 ? [{ "id": "serieid1", "name": "NAVAREA" }] : [],
          maritimeServiceIds: ['maritimeServiceId1']
        };
      }),
    };
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should show all informations about the page / content', done => {
    const listComponent: HTMLElement = fixture.nativeElement;
    expect(listComponent.querySelectorAll('.sub-area-list > .subArea').length).toEqual(5);
    expect(listComponent.querySelector('.infos-page').innerHTML.trim()).toEqual('1 - 5 of 10');
    done();
  });

  it('should show add button when functional admin', done => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.add-button').length).toEqual(1);
    done();
  });

  it('should show edit button when functional admin', done => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.edit-button').length).toEqual(5);
    done();
  });

  it('should show preview button when pro user', done => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'isProUser').and.returnValue(true);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.preview-button').length).toEqual(5);
    done();
  });

  it('should hide add button when service user', done => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.add-button').length).toEqual(0);
    done();
  });

  it('should hide edit button when service user', done => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    fixture.detectChanges();
    expect(comp.querySelectorAll('.edit-button').length).toEqual(0);
    done();
  });

  it('should show edit button when service user is maritime notice producer', done => {
    const comp: HTMLElement = fixture.nativeElement;
    spyOn(mockAuthService, 'isMaritimeNoticeProducer').and.returnValue(true);
    spyOn(mockAuthService, 'hasRoleFunctionalAdmin').and.returnValue(false);
    spyOn(mockAuthService, 'hasAccessToService').withArgs('maritimeServiceId1', ServiceRole.SERVICE_ADMIN).and.returnValue(true);
    fixture.detectChanges();
    // equal 3 : only not associated with series
    expect(comp.querySelectorAll('.edit-button').length).toEqual(3);
    done();
  });

  it('should call reloadData when onFilteredTableChange is called', done => {
    // Given
    spyOn(component, 'reloadData');

    // When
    component.onFilteredTableChange();

    // Then
    expect(component.reloadData).toHaveBeenCalled();
    done();
  });

  it('should return HttpParams based on filters', () => {
    // Given
    const testSamples = [
      { field: 'filteredTechnicalIdentifier', value: '123', paramKey: 'technicalIdentifier' },
      { field: 'filteredName', value: 'Test Name', paramKey: 'name' },
      { field: 'filteredSeriesName', value: 'Series 1', paramKey: 'serieName' },
      { field: 'filteredParentName', value: 'Parent 1', paramKey: 'parentName' }
    ];

    testSamples.forEach(testCase => {
      // When
      component[testCase.field] = testCase.value;
      const params = component.pageableInfos;

      // Then
      expect(params.get(testCase.paramKey)).toBe(testCase.value);
      expect(params.keys().length).toBe(3);

      component[testCase.field] = ''; // Reset field for next iteration
    });
  });

  it('should return HttpParams based on filters with multiple parameters', done => {
    // Given
    component.filteredTechnicalIdentifier = '123';
    component.filteredName = 'Test Name';

    // When
    const params = component.pageableInfos;

    // Then
    expect(params.get('technicalIdentifier')).toBe('123');
    expect(params.get('name')).toBe('Test Name');
    expect(params.keys().length).toBe(4);
    done();
  });

  it('should return HttpParams based on filters with empty params', done => {
    // Given
    component.filteredTechnicalIdentifier = '';
    component.filteredName = '';

    // When
    const emptyParams = component.pageableInfos;

    // Then
    expect(emptyParams.keys().length).toBe(2);
    done();
  });
});
