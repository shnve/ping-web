import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Pipe, PipeTransform, SimpleChange, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { WarningsFacade } from '@app/facades/admin/warnings.facade';
import { MapWarningsFacade } from '@app/facades/map-warnings.facade';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { InfosourceFormatInformationPipe } from '@app/infosource/pipes/infosource-format-information.pipe';
import { ServiceRole } from '@app/models/maritime-service.model';
import { NotionType } from '@app/models/notion.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { SerieType } from '@app/models/serie.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { WarningFeatureFactory } from '@app/sig/core/warning-feature.factory';
import { GeometryType } from '@app/sig/utils/geometry';
import { TranslateModule } from '@ngx-translate/core';
import { WarningDetailMapComponent } from '@sig/components/warning-detail-map/warning-detail-map.component';
import { MockComponent, MockProvider } from 'ng-mocks';
import Feature from 'ol/Feature';
import { LineString, Polygon } from 'ol/geom';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Observable, of } from 'rxjs';
import { GlobalWarningType, JsonWarning, WarningFeaturePart, listWarningStatus } from 'src/app/models/warning.model';
import { DetailsMapComponent } from '../details-map/details-map.component';
import { WarningDetailComponent } from '../warning-detail/warning-detail.component';
import { WarningModalComponent } from './warning-modal.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Pipe({ name: 'formatWarningNumber' })
class MockFormatWarningNumberPipe implements PipeTransform {
  transform(value: object): object {
    return value;
  }
}

class ExtendWarningModalComponent extends WarningModalComponent {

  public setJsonWarningToWarning(warning: JsonWarning) {
    super.setJsonWarningToWarning(warning);
  }

  public selectFeaturePart(featurePart: WarningFeaturePart) {
    super.selectFeaturePart(featurePart);
  }
}

describe('WarningModalComponent', () => {
  let component: ExtendWarningModalComponent;
  let fixture: ComponentFixture<ExtendWarningModalComponent>;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        MockComponent(WarningDetailMapComponent),
        MockComponent(DetailsMapComponent),
        MockComponent(WarningDetailComponent),
        ExtendWarningModalComponent,
        MockFormatWarningNumberPipe
    ],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        DialogModule,
        SharedPipeModule],
    providers: [
        MockProvider(MapWarningsFacade, {
            getWarningById$(warningId: string) {
                return new Observable();
            }
        }),
        MockProvider(WarningsFacade, {
            getById$(warningId: string) {
                return of({
                    id: '1',
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
                    globalWarningType: 'WARNING',
                    nameOfSeries: 'serie1',
                    publicationTime: null,
                    year: 2021,
                    featureParts: [{
                            typeDetails: ['detail1'],
                            information: { 'fr': 'petites informations' },
                            affectedAreas: [
                                {
                                    geometry: {
                                        type: GeometryType.POLYGON,
                                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
                                    }
                                }
                            ],
                            geometries: [
                                {
                                    geometry: {
                                        type: GeometryType.POINT,
                                        coordinates: [[10, 10]]
                                    }
                                }
                            ]
                        }],
                    generalAreas: {},
                    warningHazardTypeGeneral: 'warningHazarTypeGeneral',
                    warningNumber: 1001,
                    serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
                    serieId: '1',
                    canBePublished: true,
                    status: listWarningStatus.DRAFT,
                    canBeAddedToFolder: true
                });
            }
        }),
        MockProvider(WarningFeatureFactory),
        PermissionsProvider,
        ConfirmationService,
        WarningTableFacade,
        InfosourceFormatInformationPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendWarningModalComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should hide', done => {
    // Given
    component.display = true;
    spyOn(component.onClose, 'emit');

    // When
    component.hide();

    // Then
    expect(component.display).toBeFalse();
    expect(component.onClose.emit).toHaveBeenCalled();
    done();
  });

  it('should select previous warning', done => {
    // Given
    component.mainWarningsParts = [{
      id: '1',
      nameOfSeries: 'serie1',
      warningNumber: 1001,
      year: 2021
    }, {
      id: '2',
      nameOfSeries: 'serie2',
      warningNumber: 1002,
      year: 2021
    }]
    component.currentPosition = 1;
    const mapWarningsFacade = TestBed.inject(MapWarningsFacade);
    spyOn(mapWarningsFacade, 'getWarningById$').and.callThrough();

    // When
    component.previous();

    // Then
    expect(component.currentPosition).toBe(0);
    expect(component.warningPart).toBe(component.mainWarningsParts[0]);
    expect(mapWarningsFacade.getWarningById$).toHaveBeenCalledOnceWith('1');
    done();
  });

  it('should select next warning', done => {
    // Given
    component.mainWarningsParts = [{
      id: '1',
      nameOfSeries: 'serie1',
      warningNumber: 1001,
      year: 2021
    }, {
      id: '2',
      nameOfSeries: 'serie2',
      warningNumber: 1002,
      year: 2021
    }]
    component.currentPosition = 0;
    const mapWarningsFacade = TestBed.inject(MapWarningsFacade);
    spyOn(mapWarningsFacade, 'getWarningById$').and.callThrough();

    // When
    component.next();

    // Then
    expect(component.currentPosition).toBe(1);
    expect(component.warningPart).toBe(component.mainWarningsParts[1]);
    expect(mapWarningsFacade.getWarningById$).toHaveBeenCalledOnceWith('2');
    done();
  });

  it('should set Warning from JsonWarning', done => {
    // Given
    const jsonGeometry = {
      type: 'Feature',
      geometry: {
        coordinates: [[0, 0], [4, 5], [10, 10]],
        type: GeometryType.LINE_STRING
      }
    };
    const jsonAffectedArea = {
      type: 'Feature',
      geometry: {
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]],
        type: GeometryType.POLYGON
      }
    };
    const jsonWarning: JsonWarning = {
      id: '1',
      globalWarningType: 'WARNING',
      nameOfSeries: 'serie1',
      publicationTime: null,
      year: 2021,
      featureParts: [{
        typeDetails: ['detail1'],
        information: { 'fr': 'petites informations' },
        affectedAreas: [jsonAffectedArea],
        geometries: [jsonGeometry]
      }],
      generalAreas: {},
      warningHazardTypeGeneral: 'warningHazarTypeGeneral',
      warningNumber: 1001,
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      serieId: '1'
    };
    const warningFeatureFactory = TestBed.inject(WarningFeatureFactory);
    spyOn(warningFeatureFactory, 'createAffectedAreas').and.returnValue([
      new Feature(
        new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
      )
    ]);
    spyOn(warningFeatureFactory, 'createGeometries').and.returnValue([
      new Feature(
        new LineString([[0, 0], [4, 5], [10, 10]])
      )
    ]);

    // When
    component.setJsonWarningToWarning(jsonWarning);

    // Expect
    expect(component['warning'].id).toEqual('1');
    expect(warningFeatureFactory.createAffectedAreas).toHaveBeenCalledOnceWith(jsonWarning, [jsonAffectedArea]);
    expect(warningFeatureFactory.createGeometries).toHaveBeenCalledOnceWith(jsonWarning, [jsonGeometry]);
    expect(component.warningPart).toEqual({
      id: '1',
      nameOfSeries: 'serie1',
      warningNumber: 1001,
      year: 2021
    });
    expect(component['warning'].featureParts[0].affectedAreas[0].getGeometry()).toBeInstanceOf(Polygon);
    expect(component['warning'].featureParts[0].geometries[0].getGeometry()).toBeInstanceOf(LineString);
    expect(component['warning'].featureParts[0].information).toEqual({ 'fr': 'petites informations' });
    done();
  });

  it('should highlight features in featurePart', done => {
    // Given
    const affectedArea = new Feature(
      new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
    );
    const geometry = new Feature(
      new LineString([[0, 0], [4, 5], [10, 10]])
    );

    const featurePart: WarningFeaturePart = {
      typeDetails: ['detail1'],
      information: { 'fr': 'petites informations' },
      affectedAreas: [affectedArea],
      geometries: [geometry]
    };

    const jsonWarning: JsonWarning = {
      id: '1',
      year: 21,
      serieId: '1',
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      warningNumber: 1000,
      nameOfSeries: 'serie1',
      globalWarningType: GlobalWarningType.WARNING,
      warningHazardTypeGeneral: 'warningHazard',
      publicationTime: new Date(2023, 6, 12)
    };

    component.setJsonWarningToWarning(jsonWarning);
    component['notionType'] = NotionType.WARNING;
    component['warning'].featureParts = [featurePart];
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;

    // When
    component.selectFeaturePart(featurePart);

    // Expect
    expect(component['highlightedFeatures'].geometries).toEqual([geometry]);
    expect(component['highlightedFeatures'].affectedAreas).toEqual([affectedArea]);
    done();
  });

  it('should remove highlighting on feature parts', done => {
    // Given
    const affectedArea = new Feature(
      new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
    );
    const geometry = new Feature(
      new LineString([[0, 0], [4, 5], [10, 10]])
    );
    component['highlightedFeatures'] = { geometries: [geometry], affectedAreas: [affectedArea] };

    const featurePart: WarningFeaturePart = {
      typeDetails: ['detail1'],
      information: { 'fr': 'petites informations' },
      affectedAreas: [affectedArea],
      geometries: [geometry]
    };

    const jsonWarning: JsonWarning = {
      id: '1',
      year: 21,
      serieId: '1',
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      warningNumber: 1000,
      nameOfSeries: 'serie1',
      globalWarningType: GlobalWarningType.WARNING,
      warningHazardTypeGeneral: 'warningHazard',
      publicationTime: new Date(2023, 6, 12)
    };

    component.setJsonWarningToWarning(jsonWarning);
    component.mapComponent = TestBed.createComponent(DetailsMapComponent).componentInstance;
    component['notionType'] = NotionType.WARNING;
    component['warning'].featureParts = [featurePart];

    // When
    component.selectFeaturePart(featurePart);

    // Expect
    expect(component['highlightedFeatures']).toEqual({ geometries: [], affectedAreas: [] });
    done();
  });

  it('should manage warning', done => {
    // Given
    const warningPart = { id: '1', nameOfSeries: 'nameOfSeries 1', warningNumber: 1, year: 2021 };
    const changes: SimpleChanges = {
      mainWarningsParts: new SimpleChange(null, [warningPart], true)
    };
    component.currentPosition = 0;
    component.mainWarningsParts = [warningPart];
    const spyAuthServiceIsProUser = spyOn(authService, 'hasRoleServiceUser').and.returnValue(true);
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const warningFeatureFactory = TestBed.inject(WarningFeatureFactory);
    const spyWarningFeatureFactory = spyOn(warningFeatureFactory, 'createGeometries').and.callThrough();
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadWarning = spyOn<any>(component, 'loadWarning').and.callThrough();

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyAuthServiceIsProUser).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyWarningFeatureFactory).toHaveBeenCalled();
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentLoadWarning).toHaveBeenCalled();
    expect(component['notionType']).toEqual(NotionType.WARNING);
    expect(component.canPublish).toBe(true);
    expect(component.canEdit).toBe(true);
    expect(component.canDelete).toBe(true);
    expect(component.canManage).toBe(true);
    expect(component['items'].length).toEqual(4);
    done();
  })
});
