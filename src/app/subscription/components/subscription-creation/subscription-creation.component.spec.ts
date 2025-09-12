import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import MaritimeEntity from '@app/models/maritime-entity.model';
import { ServiceNetwork } from '@app/models/maritime-service.model';
import { Serie, SerieType } from '@app/models/serie.model';
import { SubArea } from '@app/models/sub-area.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { TranslateNamePipe } from '@app/shared/pipes/translate-name.pipe';
import { SubscriptionCreationComponent } from '@app/subscription/components/subscription-creation/subscription-creation.component';
import { Subscription, SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';
import { TranslateModule } from '@ngx-translate/core';
import { JsonGeometry } from '@sig/models/geometry';
import { GeometryType } from '@sig/utils/geometry';
import { ConfirmationService } from 'primeng/api';

const SAMPLE_SERIE: Serie = {
  id: '7bb1f490-9c5b-4ee9-b4e9-d0de15b74ab0',
  name: 'AVURNAV Local BREST',
  type: SerieType.LOCAL_NAVIGATIONAL_WARNING,
  mandatoryLanguages: [
    'fr'
  ],
  optionalLanguages: [],
  maritimeService: {
    id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
    name: 'CND BREST',
    internationalName: 'CND BREST',
    productionAgency: 'CECLANT',
    type: 'AUTHORITY',
    serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
    pingPartner: true,
    maritimeNoticeProducer: true,
    folderManager: true,
    areas: [],
    authorityCode: 'AUTHORITY',
    shomService: true
  },
  ranges: [[1, 999]],
  subAreas: [
    {
      id: 'f08af189-ee71-47f6-af03-cded6a1f238f',
      name: 'Finistère',
      internationalName: 'Finistère',
      geom: {
        type: GeometryType.POLYGON,
        coordinates: [
          [[-559114.55236538, 6199189.65370721], [-390341.59391171, 6267982.97916386], [-337752.91845151, 6162805.62824346], [-407769.23636074, 6039283.39053463], [-539852.42123752, 6098598.52448392], [-559114.55236538, 6199189.65370721]]
        ]
      },
      subAreas: []
    }
  ],
  internationalName: 'AVURNAV Local BREST'
};

const SAMPLE_GEOMETRY: JsonGeometry = {
  type: GeometryType.POLYGON,
  coordinates: [
    [[-559114.55236538, 6199189.65370721], [-390341.59391171, 6267982.97916386], [-337752.91845151, 6162805.62824346], [-407769.23636074, 6039283.39053463], [-539852.42123752, 6098598.52448392], [-559114.55236538, 6199189.65370721]]
  ]
};

const SAMPLE_SUBAREA: SubArea = {
  id: '24',
  name: 'Name geom',
  internationalName: 'international Name geom',
  geom: SAMPLE_GEOMETRY
};

const SAMPLE_MARITIME_ENTITY: Array<MaritimeEntity> = [
  {
    id: '1',
    maritimeServiceId: '1',
    name: 'entity1',
    geom: {
      coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]],
      type: GeometryType.POLYGON
    }
  },
  {
    id: '2',
    maritimeServiceId: '2',
    name: 'entity2',
    geom: {
      coordinates: [[[0, 0], [10, 0], [10, 15], [0, 10]]],
      type: GeometryType.POLYGON
    }
  }
];

const SAMPLE_SUBSCRIPTION: Subscription = {
  id: 'ccc908fc-0f6d-4420-86da-27887945f0a4',
  title: 'Test subscription',
  type: SubscriptionTypeEnum.WARNING,
  sendingMail: true,
  service: {
    id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
    name: 'CND BREST',
    internationalName: 'CND BREST',
    productionAgency: 'CECLANT',
    type: 'AUTHORITY',
    serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
    pingPartner: true,
    maritimeNoticeProducer: true,
    folderManager: true,
    areas: [],
    authorityCode: 'AUTHORITY',
    shomService: true
  },
  area: {
    name: 'Atlantique',
    borderAreas: [],
    disclaimer: 'disclaimer',
    geom: SAMPLE_GEOMETRY,
    id: '476380f3-8546-4504-b9b1-d9ab48bab841',
    internationalDisclaimer: 'international disclaimer',
  },
  creationDate: new Date(),
  maritimeEntitiesGeographicExtent: SAMPLE_MARITIME_ENTITY,
  serie: SAMPLE_SERIE,
  lang: 'fr',
  subAreas: [SAMPLE_SUBAREA],
  warningHazardTypeGenerals: ['AQUACULTURE_AND_FISHING_INSTALLATIONS', 'RADIO_SERVICES', 'WORKS', 'IN_FORCE_BULLETIN'],
  georegulationTypes: [],
  maritimeEntities: SAMPLE_MARITIME_ENTITY,
};

describe('SubscriptionCreationComponent', () => {
  let component: SubscriptionCreationComponent;
  let fixture: ComponentFixture<SubscriptionCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SubscriptionCreationComponent,
        TranslateNamePipe
      ],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        PermissionsProvider,
        UntypedFormBuilder,
        ConfirmationService,
        GetNumberForSearchedPartPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionCreationComponent);
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

  it('should generate feature of Geom at FR or EN with label on change subArea', done => {
    // Given
    const sample_result = [
      { lang: 'fr', attribut: 'name' },
      { lang: 'en', attribut: 'internationalName' }
    ];
    component.subAreasBySerie = [SAMPLE_SUBAREA];

    // When
    sample_result.forEach((test) => {
      component['translate'].currentLang = test.lang;
      component['onChangeSubAreas'](SAMPLE_SUBSCRIPTION.subAreas.map(objet => objet.id.toString()));

      //Then
      expect(component.geometriesLayer.getSource().getFeatures().length).toBeGreaterThanOrEqual(1);
      expect(component.geometriesLayer.getSource().getFeatures()[0].getStyle()[1]['text_'].text_).toEqual(SAMPLE_SUBAREA[test.attribut]);
    })
    done();
  });
});
