import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayersFacade } from '@sig/facades/layers.facade';
import { MockProvider } from 'ng-mocks';
import { Observable } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { SurveyDangerFactory } from '@app/sig/core/survey-danger.factory';
import { GeometryType } from '@app/sig/utils/geometry';
import { SurveyActivity, SurveyBroadcastRestriction, SurveyCoordinatesOrder, SurveyDangerNature, SurveyDangerTypeOfValue, SurveyIssuerType, SurveyProcessingStatusEnum, SurveyStateEnum, SurveyVerticalRef, SurveyZDirection } from '@app/survey/models/survey.model';
import { TranslateModule } from '@ngx-translate/core';
import { createEmpty } from 'ol/extent';
import { SurveyModalMapComponent } from './survey-modal-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SurveyModalMapComponent', () => {
  let component: SurveyModalMapComponent;
  let fixture: ComponentFixture<SurveyModalMapComponent>;
  let surveyDangerFactory: SurveyDangerFactory;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SurveyModalMapComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        MockProvider(LayersFacade, {
            getBaseLayers$(): Observable<any> {
                return new Observable();
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyModalMapComponent);
    component = fixture.componentInstance;
    component.modelItem = {
      id: '1',
      lastUpdate: new Date(2023, 2, 2),
      state: SurveyStateEnum.DRAFT,
      goal: 'goal of survey',
      nameAndLocation: 'name and location',
      issuingUserFirstName: 'firstname',
      issuingUserLastName: 'lastname',
      directionZ: SurveyZDirection.ALTITUDE,
      areaName: 'areaName',
      surveyIssuerTypes: [SurveyIssuerType.OWNER],
      verticalRef: SurveyVerticalRef.ZERO_ALTI,
      geographicFormat: false,
      epsg: 'epsg',
      fileSeparator: 'fileSeparator',
      externalAnalysisEnabled: true,
      coordinatesOrder: SurveyCoordinatesOrder.XYZ,
      broadcastRestriction: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION,
      activityChoice: SurveyActivity.EXCAVATION_GEOPHYSICAL,
      technicalManagerEmail: 'technicalManagerEmail',
      ownerEmail: 'ownerEmail',
      ownerOrganization: 'ownerOrganization',
      producerOrganization: 'producerOrganization',
      featureParts: null,
      miscAttachmentIds: null,
      technicalMetadataFile: null,
      technicalMetadataId: '1',
      boundingBox: {
        type: GeometryType.POLYGON,
        coordinates: [
          [
            [
              -532107.34410303,
              6182049.97961228
            ],
            [
              -532107.34410303,
              6190388.57125068
            ],
            [
              -536381.55613958,
              6190388.57125068
            ],
            [
              -536381.55613958,
              6182049.97961228
            ],
            [
              -532107.34410303,
              6182049.97961228
            ]
          ]
        ]
      },
      surveyExternalAnalysisResults: {
        globalErrorMessage: null,
        receptionDate: new Date('2023-03-08T23:00:00Z'),
        processingStatus: SurveyProcessingStatusEnum.FINISHED,
        surveyFilesExternalAnalysisResults: [],
        dangers: [
          {
            geometry: {
              type: GeometryType.POLYGON,
              coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
            },
            nature: SurveyDangerNature.DEPTH,
            typeOfValue: SurveyDangerTypeOfValue.DEPTH,
            value: 1.1
          }
        ],
        detections: [
          {
            geometry: {
              type: GeometryType.POINT,
              coordinates: [10, 0]
            },
            depth: 3.2,
            difference: 0.3,
            color: 2
          },
          {
            geometry: {
              type: GeometryType.POINT,
              coordinates: [10, 10]
            },
            depth: 3.2,
            difference: 0.3,
            color: 2
          }
        ],
        enc: [
          {
            name: 'FR571420',
            updateNumber: 2.1,
            updateDate: new Date('2020-03-08T23:00:00Z')
          },
          {
            name: 'FR470320',
            updateNumber: 2.1,
            updateDate: new Date('2020-03-08T23:00:00Z')
          },
          {
            name: 'FR470330',
            updateNumber: 2.3,
            updateDate: new Date('2019-11-19T23:00:00Z')
          },
          {
            name: 'FR571430',
            updateNumber: 2.5,
            updateDate: new Date('2019-05-06T22:00:00Z')
          }
        ],
        resultFiles: [
          {
            id: '1',
            filename: 'file'
          }
        ]
      },
      externalAnalysisInProgress: false,
      canBeReported: false
    };

    surveyDangerFactory = TestBed.inject(SurveyDangerFactory);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should set danger and detection', done => {
    // Given
    component.shouldShowDangers = true;
    component.shouldShowDetections = true;
    const featureParts = [{
      dangers: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.dangers),
      detections: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.detections, true)
    }];

    component.modelItem.featureParts = [...featureParts];
    const componentRetrieveFeaturesFromModelItemSpy = spyOn<any>(component, 'retrieveFeaturesFromModelItem').and.callThrough();
    const componentGetAllFeatures = spyOn<any>(component, 'getAllFeatures').and.callThrough();
    const componentSetDangerAndDetectionFeatures = spyOn<any>(component, 'setDangerAndDetectionFeatures').and.callThrough();

    // When
    component['retrieveFeaturesFromModelItem'](createEmpty());

    // Then
    expect(componentRetrieveFeaturesFromModelItemSpy).toHaveBeenCalled();
    expect(componentGetAllFeatures).toHaveBeenCalled();
    expect(componentSetDangerAndDetectionFeatures).toHaveBeenCalled();
    expect(component['dangerFeatures']).toEqual([...(component.modelItem.featureParts as any)[0].dangers]);
    expect(component['detectionFeatures']).toEqual([...(component.modelItem.featureParts as any)[0].detections]);
    done();
  });

  it('should not get features if shouldShowDangers and shouldShowDetections equal false', done => {
    // Given
    component.shouldShowDangers = false;
    component.shouldShowDetections = false;
    const featureParts = [{
      dangers: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.dangers),
      detections: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.detections, true)
    }];

    component.modelItem.featureParts = [...featureParts];
    const componentRetrieveFeaturesFromModelItemSpy = spyOn<any>(component, 'retrieveFeaturesFromModelItem').and.callThrough();
    const componentGetAllFeatures = spyOn<any>(component, 'getAllFeatures').and.callThrough();

    // When
    component['retrieveFeaturesFromModelItem'](createEmpty());

    // Then
    expect(componentRetrieveFeaturesFromModelItemSpy).toHaveBeenCalled();
    expect(componentGetAllFeatures).toHaveBeenCalled();
    expect(component['dangerFeatures']).toEqual([]);
    expect(component['detectionFeatures']).toEqual([]);
    done();
  });

  it('should get only detection features', done => {
    // Given
    component.shouldShowDangers = false;
    component.shouldShowDetections = true;
    const featureParts = [{
      dangers: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.dangers),
      detections: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.detections, true)
    }];

    component.modelItem.featureParts = [...featureParts];
    const componentRetrieveFeaturesFromModelItemSpy = spyOn<any>(component, 'retrieveFeaturesFromModelItem').and.callThrough();
    const componentGetAllFeatures = spyOn<any>(component, 'getAllFeatures').and.callThrough();
    const componentUpdateMapIfShouldShowDangersAndDetections = spyOn<any>(component, 'updateMapIfShouldShowDangersAndDetections');

    // When
    component['updateMapIfShouldShowDetections']();

    // Then
    expect(componentRetrieveFeaturesFromModelItemSpy).toHaveBeenCalled();
    expect(componentGetAllFeatures).toHaveBeenCalled();
    expect(componentUpdateMapIfShouldShowDangersAndDetections).toHaveBeenCalledTimes(0);
    expect(component['dangerFeatures']).toEqual([]);
    expect(component['detectionFeatures']).toEqual([...(component.modelItem.featureParts as any)[0].detections]);
    done();
  });

  it('should get only danger features', done => {
    // Given
    component.shouldShowDangers = true;
    component.shouldShowDetections = false;
    const featureParts = [{
      dangers: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.dangers),
      detections: surveyDangerFactory.createGeometries(component.modelItem.surveyExternalAnalysisResults.detections, true)
    }];

    component.modelItem.featureParts = [...featureParts];
    const componentRetrieveFeaturesFromModelItemSpy = spyOn<any>(component, 'retrieveFeaturesFromModelItem').and.callThrough();
    const componentGetAllFeatures = spyOn<any>(component, 'getAllFeatures').and.callThrough();
    const componentUpdateMapIfShouldShowDangersAndDetections = spyOn<any>(component, 'updateMapIfShouldShowDangersAndDetections');

    // When
    component['updateMapIfShouldShowDangers']();

    // Then
    expect(componentRetrieveFeaturesFromModelItemSpy).toHaveBeenCalled();
    expect(componentGetAllFeatures).toHaveBeenCalled();
    expect(componentUpdateMapIfShouldShowDangersAndDetections).toHaveBeenCalledTimes(0);
    expect(component['dangerFeatures']).toEqual([...(component.modelItem.featureParts as any)[0].dangers]);
    expect(component['detectionFeatures']).toEqual([]);
    done();
  });

  it('should display boundingBox on map', done => {
    // Given
    const spySurveyDangerFactoryCreateBoundingBoxGeometry = spyOn(surveyDangerFactory, 'createBoundingBoxGeometry').and.callThrough();

    // When
    component['displayBoundingBoxOnTheMapIfPresent']();

    // Then
    expect(spySurveyDangerFactoryCreateBoundingBoxGeometry).toHaveBeenCalled();
    expect(component.vectorSourceBoundingBox.getFeatures().length).toEqual(1);
    done();
  });
});
