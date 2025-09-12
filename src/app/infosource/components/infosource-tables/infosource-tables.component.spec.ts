import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { InfosourceState } from '@app/infosource/models/infosource-table.model';
import { InfosourceService } from '@app/infosource/services/infosource.service';
import MaritimeService from '@app/models/maritime-service.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InfosourceTablesComponent } from './infosource-tables.component';

const SAMPLE_INFOSOURCE_TABLE_PAGE = of({
  'modelItems': [
    {
      id: '0633967e-330b-4956-841f-edf74a13f072',
      number: 'raring_ringtail-01-2021',
      nature: 'MAP_ANOMALY',
      status: 'TAKEN',
      comment: 'a comment',
      creationDate: '2022-01-10T10:17:00Z',
      lastUpdate: '2022-01-11T09:15:00Z',
      validationTime: '2022-01-13T10:12:00Z',
      description: 'description feature 13',
      producedNauticalInformations: [],
      recipients: [{ id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36', name: 'CND BREST', actionType: 'READ' }],
      object: {},
      emitter: 'service user (CND BREST)',
      serviceStatus: 'READ',
      issuingServiceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      issuingServiceUserId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      tags: [],
      concernedMaritimeEntities: [],
      folders: [],
      warnings: []
    },
    {
      id: 'a02e0471-f5d5-488e-a0e0-3aff02863497',
      number: 'groovy_gorilla-08-2021',
      nature: 'MAP_ANOMALY',
      status: 'TAKEN',
      comment: 'a comment',
      creationDate: '2022-01-10T10:17:00Z',
      lastUpdate: '2022-01-11T09:15:00Z',
      validationTime: '2022-01-13T10:12:00Z',
      description: 'description feature 11',
      producedNauticalInformations: [],
      recipients: [
        {
          id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
          name: 'CND BREST',
          actionType: 'READ'
        },
        {
          id: 'cd2aa150-110e-4cee-828c-c131da0a5706',
          name: 'CND Cherbourg',
          actionType: 'ARCHIVE'
        },
        {
          id: 'e0432b84-ee63-422c-9650-7428f5ec85f4',
          name: 'NAVAREA II',
          actionType: 'READ'
        },
        {
          id: '81110e40-c844-4f79-a87e-47749cb5b806',
          name: 'CND Toulon',
          actionType: 'TO_PROCESS'
        }
      ],
      object: {},
      emitter: 'Gwenael Boissay',
      serviceStatus: 'READ',
      tags: [],
      concernedMaritimeEntities: [],
      folders: [],
      warnings: []
    },
    {
      id: '5e038bfc-1c6f-4705-a5a9-70423ad00b1b',
      number: 'bionic_beaver-08-2021',
      nature: 'PUBLICATION_ANOMALY',
      status: 'TAKEN',
      comment: 'a comment',
      creationDate: '2022-01-08T09:00:00Z',
      lastUpdate: '2022-01-08T09:15:00Z',
      validationTime: '2022-01-11T10:25:00Z',
      description: 'description feature 06',
      producedNauticalInformations: [],
      recipients: [{ id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36', name: 'CND BREST', actionType: 'READ' }],
      object: {},
      emitter: 'service user (CND BREST)',
      serviceStatus: 'READ',
      issuingServiceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      issuingServiceUserId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      tags: [],
      concernedMaritimeEntities: [],
      folders: [],
      warnings: []
    },
    {
      id: 'faa9ccb5-a0c4-4cc2-a55f-b5f21c92b725',
      number: 'hardy_heron-05-2021',
      nature: 'ACTIVITY_FORECAST',
      status: 'SENT',
      comment: 'a comment',
      creationDate: '2022-01-08T09:00:00Z',
      lastUpdate: '2022-01-08T09:15:00Z',
      validationTime: '2022-01-10T10:25:00Z',
      description: 'description feature 05',
      producedNauticalInformations: [],
      recipients: [{ id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36', name: 'CND BREST', actionType: 'TO_PROCESS' }],
      object: {},
      emitter: 'service user (CND BREST)',
      serviceStatus: 'TO_PROCESS',
      issuingServiceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      issuingServiceUserId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      tags: [],
      concernedMaritimeEntities: [],
      folders: [],
      warnings: []
    }
  ],
  totalElements: 4
})

describe('InfosourceTablesComponent', () => {
  let component: InfosourceTablesComponent;
  let fixture: ComponentFixture<InfosourceTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        InfosourceTablesComponent
    ],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule],
    providers: [
        MockProvider(AuthService, {
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36'
                } as any as AuthenticatedUser;
            }
        }),
        MockProvider(MaritimeServicesApi, {
            findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
                return of([{
                        id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
                        name: 'Maritime'
                    }]);
            }
        }),
        MockProvider(InfosourceService, {
            getTagsFromInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<string[]> {
                return of([]);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should load table infosources with request in a row and remove in uuidParamsQueue', done => {
    // Given
    const countRequest = 3;
    const spyLoadFilteredPage = spyOn<any>(component['infosourceService'], 'loadFilteredPage$').and.returnValue(of(SAMPLE_INFOSOURCE_TABLE_PAGE));

    // When
    for (let i = 0; i < countRequest; i++) {
      component['loadTableInfosources']();
    }

    // Then
    expect(spyLoadFilteredPage).toHaveBeenCalledTimes(countRequest);
    expect(component['uuidParamsQueue']).toHaveSize(0);
    done();
  });

  it('should not load table infosources with response request on error and remove in uuidParamsQueue', done => {
    // Given
    const spyLoadFilteredPage = spyOn<any>(component['infosourceService'], 'loadFilteredPage$')
      .and.returnValue(throwError('Test message in should load table infosource with request on error'));

    // When
    component['loadTableInfosources']();

    // Then
    expect(spyLoadFilteredPage).toHaveBeenCalled();
    expect(component['uuidParamsQueue']).toHaveSize(0);
    done();
  });

  it('should load table infosources with asynchronous request in a row', async () => {
    // Given
    const spyLoadFilteredPage = spyOn<any>(component['infosourceService'], 'loadFilteredPage$').and.returnValue(of(SAMPLE_INFOSOURCE_TABLE_PAGE).pipe(delay(500)));

    // When
    for (let i = 0; i < 3; i++) {
      component['loadTableInfosources']();
    }

    // Then
    await fixture.whenStable().then(res => {
      expect(spyLoadFilteredPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should load table infosources with different asynchronous request in a row', async () => {
    // Given
    const sampleTest = [1, 2, 3]
    const spyLoadFilteredPage = spyOn<any>(component['infosourceService'], 'loadFilteredPage$').and.returnValue(of(SAMPLE_INFOSOURCE_TABLE_PAGE).pipe(delay(500)));

    // When
    sampleTest.forEach(sample => {
      component.tableState.setPageInfo({ page: sample });
      component['loadTableInfosources']();
    });

    // Then
    await fixture.whenStable().then(res => {
      expect(spyLoadFilteredPage).toHaveBeenCalledTimes(3);
    });
  });
});
