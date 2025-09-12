import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { GlobalConstants } from '@app/global-constants';
import { InfosourceNature, InfosourcePart, InfosourceServiceStatus, InfosourceStatus, InfosourceWithJsonParts } from '@app/infosource/models/infosource.model';
import { InfosourceFormatDateRangePipe } from '@app/infosource/pipes/infosource-format-date-range.pipe';
import { InfosourceFormatDetailsModalTitlePipe } from '@app/infosource/pipes/infosource-format-details-modal-title.pipe';
import { InfosourceFormatInformationPipe } from '@app/infosource/pipes/infosource-format-information.pipe';
import { InfosourcePartFormatDetailsModalObjectPipe } from '@app/infosource/pipes/infosource-part-format-details-modal-object.pipe';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { FormatDateRangePipe } from '@app/shared/pipes/format-date-range.pipe';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { FormatFeaturePartDetailsPipe } from '@app/shared/pipes/format-feature-part-details.pipe';
import { FormatLocalizedTextPipe } from '@app/shared/pipes/format-localized-text.pipe';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { FormatWarningTitlePipe } from '@app/shared/pipes/format-warning-title.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { AuthService } from '@app/auth/auth.service';
import { ReferencesByFolder, StudyReferencesTypeEnum } from '@app/folder/models/folder-study.model';
import { InfosourceApi } from '@app/infosource/api/infosource.api';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { NotionType } from '@app/models/notion.model';
import { DetailsMapComponent } from '@app/shared/components/details-map/details-map.component';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { MapHasContentPipe } from '@app/shared/pipes/map-has-content.pipe';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { GeometryType } from '@app/sig/utils/geometry';
import { FormatMonthPipe } from '@shared/pipes/format-month.pipe';
import { MockProvider } from 'ng-mocks';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Observable, of } from 'rxjs';
import { InfosourceDetailsMapComponent } from '../infosource-details-map/infosource-details-map.component';
import { InfosourceModalBodyComponent } from './infosource-modal-body/infosource-modal-body.component';
import { InfosourceModalComponent } from './infosource-modal.component';

describe('InfosourceModalComponent', () => {
  let component: InfosourceModalComponent;
  let fixture: ComponentFixture<InfosourceModalComponent>;
  let authService: AuthService;
  const infosource: InfosourceWithJsonParts = {
    id: '1',
    number: 'snoop_doggy_dog-01-2022',
    nature: InfosourceNature.OTHER_REPORT,
    status: InfosourceStatus.DRAFT,
    comment: 'a comment',
    creationDate: new Date(),
    lastUpdate: new Date(),
    validationTime: new Date(),
    timezone: GlobalConstants.USER_TIMEZONE,
    featureParts: [{
      description: 'desription',
      internationalDescription: 'international description',
      localisation: [{
        geometry: {
          coordinates: [[0, 0], [4, 5], [10, 10]],
          type: GeometryType.LINE_STRING
        }
      }]
    }],
    recipients: [],
    canBeTransfered: false,
    canBeAddedToFolder: true,
    issuingPublicUserId: 'public id',
    issuingUserFirstname: 'public user name',
    issuingUserLastname: 'public user lastname'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InfosourceDetailsMapComponent,
        DetailsMapComponent,
        InfosourceModalBodyComponent,
        InfosourceModalComponent,
        InfosourceFormatDetailsModalTitlePipe,
        CapitalizeFirstPipe,
        MapHasContentPipe,
        LocalizedDatePipe
      ],
      imports: [RouterTestingModule,
        TranslateModule.forRoot()],
      providers: [
        PermissionsProvider,
        LocalizedDatePipe,
        ConfirmationService,
        FormatWarningNumberPipe,
        FormatWarningTitlePipe,
        FormatFeaturePartDetailsPipe,
        FormatLocalizedTextPipe,
        FormatDateRangePipe,
        FormatMonthPipe,
        FormatDatetimePipe,
        ExportPdfService,
        WarningTableFacade,
        InfosourcePartFormatDetailsModalObjectPipe,
        InfosourceFormatDateRangePipe,
        CapitalizeFirstPipe,
        InfosourceFormatInformationPipe,
        GetNumberForSearchedPartPipe,
        infosourceServiceProvider,
        UntypedFormBuilder,
        SharedPipeModule,
        MapHasContentPipe,
        LocalizedDatePipe,
        MockProvider(AbstractInfosourceService, {
          getInfosourceById$(id: string): Observable<InfosourceWithJsonParts> {
            return of(infosource);
          },
          getFolderReferencesByFolderLinkedToInfosource$(infosourceId: string): Observable<ReferencesByFolder[]> {
            return of([{
              folderId: '1',
              studyNumber: '1',
              studyReferences: [{ type: StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION, value: 'value' }]
            }]);
          }
        }),
        MockProvider(InfosourceApi, {
          getInfosourceById$(id: string): Observable<InfosourceWithJsonParts> {
            return of(infosource);
          },
          getFolderReferencesByFolderLinkedToInfosource$(infosourceId: string): Observable<ReferencesByFolder[]> {
            return of([{
              folderId: '1',
              studyNumber: '1',
              studyReferences: [{ type: StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION, value: 'value' }]
            }]);
          }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceModalComponent);
    component = fixture.componentInstance;
    component['infosource'] = {
      number: 'snoop_doggy_dog-01-2022',
      nature: InfosourceNature.OTHER_REPORT,
      status: InfosourceStatus.DRAFT,
      comment: 'a comment',
      creationDate: new Date(),
      lastUpdate: new Date(),
      validationTime: new Date(),
      timezone: GlobalConstants.USER_TIMEZONE,
      featureParts: [],
      recipients: [],
      canBeTransfered: false
    };
    component.infosourcePartial = {
      number: 'snoop_doggy_dog-01-2022',
      nature: InfosourceNature.OTHER_REPORT,
      status: InfosourceStatus.DRAFT,
      comment: 'a comment',
      creationDate: new Date(),
      lastUpdate: new Date(),
      validationTime: new Date(),
      timezone: GlobalConstants.USER_TIMEZONE
    }
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update infosource with parts', done => {
    // Given
    const changes: SimpleChanges = {
      mainInfosourcesParts: new SimpleChange(null, infosource, true)
    };

    component.mainInfosourcesParts = [infosource];
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyUpdateInfosourceWithParts = spyOn<any>(component, 'updateInfosourceWithParts').and.callThrough();
    const spyComponentLoadInfosource = spyOn<any>(component, 'loadInfosource').and.callThrough();
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();

    // When
    component.ngOnChanges(changes);

    // Expect
    expect(component['infosource'].id).toEqual('1');
    expect(component['notionType']).toEqual(NotionType.INFOSOURCE);
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentLoadInfosource).toHaveBeenCalled();
    expect(spyUpdateInfosourceWithParts).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(component['infosource'].featureParts[0].localisation[0].getGeometry()).toBeInstanceOf(LineString);
    done();
  });

  it('should highlight features in featurePart', done => {
    // Given
    component['updateInfosourceWithParts'](infosource);
    const featurePart: InfosourcePart = {
      description: 'description',
      internationalDescription: 'internationalDescription',
      localisation: [
        new Feature(
          new LineString([[0, 0], [4, 5], [10, 10]])
        )
      ]
    };
    component['infosource'].featureParts = [featurePart];
    component['notionType'] = NotionType.INFOSOURCE;
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    const spyComponentCenterOnGeomOfFeaturePartSelected = spyOn<any>(component.mapComponent, 'centerOnGeomOfFeaturePartSelected').and.callThrough();


    // When
    component['selectFeaturePart'](featurePart);

    // Expect
    expect(component['highlightedFeatures'].localisation).toEqual(featurePart.localisation);
    expect(spyComponentCenterOnGeomOfFeaturePartSelected).toHaveBeenCalled();

    done();
  });

  it('should remove highlighting on feature parts', done => {
    // Given
    const featurePart: InfosourcePart = {
      description: 'description',
      internationalDescription: 'internationalDescription',
      localisation: [
        new Feature(
          new LineString([[0, 0], [4, 5], [10, 10]])
        )
      ]
    };
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    component['notionType'] = NotionType.INFOSOURCE;
    component['loadInfosource']();
    component['highlightedFeatures'].localisation = featurePart.localisation;
    component.infosourceDetailComponent = TestBed.createComponent(InfosourceModalBodyComponent).componentInstance;
    component.infosourceDetailComponent.featurePartBeingVisualized = 1;

    // When
    component['selectFeaturePart'](featurePart);

    // Expect
    expect(component['highlightedFeatures'].localisation).toEqual([]);
    expect(component.infosourceDetailComponent.featurePartBeingVisualized).toBeNull();
    done();
  });


  it('should visualize all feature parts', done => {
    // Given
    const featurePart: InfosourcePart = {
      description: 'description',
      internationalDescription: 'internationalDescription',
      localisation: [
        new Feature(
          new LineString([[0, 0], [4, 5], [10, 10]])
        )
      ]
    };
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    component.infosourceDetailComponent = TestBed.createComponent(InfosourceModalBodyComponent).componentInstance;
    const spyUpdateInfosourceWithParts = spyOn<any>(component, 'updateInfosourceWithParts').and.callThrough();
    const spyComponentFitToModelItem = spyOn<any>(component.mapComponent, 'fitToModelItem').and.callThrough();
    component.infosourceDetailComponent.featurePartBeingVisualized = 1;
    component['notionType'] = NotionType.INFOSOURCE;
    component['loadInfosource']();
    component['highlightedFeatures'].localisation = featurePart.localisation;
    component.infosourceDetailComponent.infosource = component['infosource'];

    // When
    component['visualizeAllFeatures']();

    // Expect
    expect(component['highlightedFeatures'].localisation).toEqual([]);
    expect(component['previousHighlightedFeatures'].localisation).toEqual([]);
    expect(component.infosourceDetailComponent.featurePartBeingVisualized).toBeNull();
    expect(spyUpdateInfosourceWithParts).toHaveBeenCalled();
    expect(spyComponentFitToModelItem).toHaveBeenCalled();
    done();
  });

  it('should manage warning', done => {
    // Given
    infosource.status = InfosourceStatus.DRAFT;
    const changes: SimpleChanges = {
      mainInfosourcesParts: new SimpleChange(null, infosource, true)
    };

    infosource.nature = InfosourceNature.OTHER_REPORT;
    component.mainInfosourcesParts = [infosource];
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyUpdateInfosourceWithParts = spyOn<any>(component, 'updateInfosourceWithParts').and.callThrough();
    const spyComponentLoadInfosource = spyOn<any>(component, 'loadInfosource').and.callThrough();
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentCheckActions = spyOn<any>(component, 'checkActions').and.callThrough();
    const spyComponentCheckIfCanCreateWarning = spyOn<any>(component, 'checkIfCanCreateWarning').and.callThrough();
    const spyAuthServiceGetAuthenticatedUser = spyOn(authService, 'getAuthenticatedUser').and.returnValue(
      {
        id: '1',
        title: 'Mr',
        firstname: 'Homer',
        lastname: 'Simpson',
        hasNotificationsSound: false
      });
    const spyAuthServiceIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spyAuthServiceIsProUser = spyOn(authService, 'isProUser').and.returnValue(true);
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyAuthServiceIsProUser).toHaveBeenCalled();
    expect(spyAuthServiceIsLoggedIn).toHaveBeenCalled();
    expect(spyAuthServiceGetAuthenticatedUser).toHaveBeenCalled();
    expect(spyUpdateInfosourceWithParts).toHaveBeenCalled();
    expect(spyComponentCheckActions).toHaveBeenCalled();
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentLoadInfosource).toHaveBeenCalled();
    expect(spyAuthServiceHasRoleServiceUser).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentCheckIfCanCreateWarning).toHaveBeenCalled();
    expect(component['notionType']).toEqual(NotionType.INFOSOURCE);
    expect(component.canSend).toBe(true);
    expect(component.canCreateWarning).toBe(false);
    expect(component.canEditOrDelete).toBe(true);
    expect(component['infosource'].canBeAddedToFolder).toBe(true);
    expect(component.canClone).toBe(true);
    expect(component['canManage']).toBe(true);
    expect(component['items'].length).toEqual(5);
    done();
  })

  it('should not be possible to create warning from infosource if nature is SURVEY_TRANSMISSION', done => {
    // Given
    infosource.nature = InfosourceNature.SURVEY_TRANSMISSION;

    // When
    const canCreateWarning = component.checkIfCanCreateWarning(infosource);

    // Then
    expect(canCreateWarning).toBeFalse();
    done();
  })

  it('should can create warning', done => {
    // Given
    infosource.status = InfosourceStatus.OPENED;
    infosource.nature = InfosourceNature.ACTIVITY_FORECAST;
    infosource.recipients = [{
      id: '1',
      name: 'myservice',
      information: '',
      localizedInformation: '',
      actionType: InfosourceServiceStatus.READ
    }];
    const changes: SimpleChanges = {
      mainInfosourcesParts: new SimpleChange(null, infosource, true)
    };

    component.mainInfosourcesParts = [infosource];
    component.canCreateWarning
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyUpdateInfosourceWithParts = spyOn<any>(component, 'updateInfosourceWithParts').and.callThrough();
    const spyComponentLoadInfosource = spyOn<any>(component, 'loadInfosource').and.callThrough();
    const spyComponentCheckActions = spyOn<any>(component, 'checkActions').and.callThrough();
    const spyAuthServiceGetAuthenticatedUser = spyOn(authService, 'getAuthenticatedUser').and.returnValue(
      {
        id: '1',
        title: 'Mr',
        firstname: 'Homer',
        lastname: 'Simpson',
        hasNotificationsSound: false,
        noticeProducer: true
      });
    const spyAuthServiceIsLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spyAuthServiceIsProUser = spyOn(authService, 'isProUser').and.returnValue(true);
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceHasRoleServiceUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyAuthServiceHasAccessToScopeWarning = spyOn(authService, 'hasAccess').and.returnValue(true);
    const spyComponentCheckIfCanCreateWarning = spyOn<any>(component, 'checkIfCanCreateWarning').and.callThrough();
    const spyAuthServiceCanCreateWarning = spyOn(authService, 'canCreateWarning').and.callThrough();

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyAuthServiceIsProUser).toHaveBeenCalled();
    expect(spyAuthServiceIsLoggedIn).toHaveBeenCalled();
    expect(spyAuthServiceGetAuthenticatedUser).toHaveBeenCalled();
    expect(spyUpdateInfosourceWithParts).toHaveBeenCalled();
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentLoadInfosource).toHaveBeenCalled();
    expect(spyAuthServiceHasRoleServiceUser).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyComponentCheckActions).toHaveBeenCalled();
    expect(spyComponentCheckIfCanCreateWarning).toHaveBeenCalled();
    expect(spyAuthServiceHasAccessToScopeWarning).toHaveBeenCalled();
    expect(spyAuthServiceCanCreateWarning).toHaveBeenCalled();
    expect(component.canCreateWarning).toBe(true);
    done();
  })

  it('should not be possible to clone infosource if nature is BATHY', done => {
    // Given
    infosource.nature = InfosourceNature.BATHY;

    // When
    const canClone = component.checkIfCanClone(infosource);

    // Then
    expect(canClone).toBeFalse();
    done();
  })

  it('should not be possible to clone infosource if nature is SURVEY_TRANSMISSION', done => {
    // Given
    infosource.nature = InfosourceNature.SURVEY_TRANSMISSION;

    // When
    const canClone = component.checkIfCanClone(infosource);

    // Then
    expect(canClone).toBeFalse();
    done();
  })
});
