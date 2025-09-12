import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FolderModalGraphComponent } from '@app/folder/components/folder-modal/folder-modal-graph/folder-modal-graph.component';
import { FolderStatusEnum } from '@app/folder/models/folder.model';
import { NotionType } from '@app/models/notion.model';
import { TranslateModule } from '@ngx-translate/core';

describe('FolderModalGraphComponent', () => {
  let component: FolderModalGraphComponent;
  let fixture: ComponentFixture<FolderModalGraphComponent>;

  const sampleFolder = {
    id: '1',
    number: '1',
    status: FolderStatusEnum.OPEN,
    object: 'an object',
    creationDate: new Date(2023, 26, 6),
    lastUpdate: new Date(2023, 26, 6),
    reviewDate: new Date(2023, 30, 6),
    comment: '',
    issuingService: 'CND BREST',
    notions: [
      {
        id: '1',
        objectId: '1',
        number: '123',
        type: NotionType.INFOSOURCE,
        creationDate: new Date(2023, 26, 6),
        endDate: new Date(2023, 26, 7),
        validationTime: new Date(2023, 26, 6),
        publicationDate: new Date(2023, 26, 6),
        cancellationDate: new Date(2023, 26, 8),
        repealDate: new Date(2023, 26, 6),
        infosource: {
          id: '1',
          creationDate: new Date(2023, 26, 7),
          linkedNotionIds: ['1', '2', '3', '4', '5'],
          number: '1',
          lastUpdate: new Date(2023, 26, 7)
        },
        warning: null,
        warningTP: null,
        georegulation: null,
        canBeAccessed: true
      },
      {
        id: '2',
        objectId: '2',
        number: '123',
        type: NotionType.WARNING,
        creationDate: new Date(2023, 26, 6),
        endDate: new Date(2023, 26, 7),
        validationTime: new Date(2023, 26, 6),
        publicationDate: new Date(2023, 26, 6),
        cancellationDate: new Date(2023, 26, 8),
        repealDate: new Date(2023, 26, 6),
        infosource: null,
        warning: {
          id: '1',
          creationDate: new Date(2023, 26, 7),
          linkedNotionIds: ['1', '2', '3', '4', '5'],
          nameOfSeries: 'name_series',
          warningNumber: 1,
          year: 2023,
          publicationTime: new Date(2023, 26, 7)
        },
        warningTP: null,
        georegulation: null,
        canBeAccessed: true
      },
      {
        id: '3',
        objectId: '3',
        number: '123',
        type: NotionType.GEOREGULATION,
        creationDate: new Date(2023, 26, 6),
        endDate: new Date(2023, 26, 7),
        validationTime: new Date(2023, 26, 6),
        publicationDate: new Date(2023, 26, 6),
        cancellationDate: new Date(2023, 26, 8),
        repealDate: new Date(2023, 26, 6),
        infosource: null,
        warning: null,
        warningTP: null,
        georegulation: {
          id: '1',
          creationDate: new Date(2023, 26, 7),
          linkedNotionIds: ['1', '2', '3', '4', '5'],
          number: '1',
          publicationDate: new Date(2023, 26, 7)
        },
        canBeAccessed: true
      },
    ],
    studies: [],
    attachments: [],
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        FolderModalGraphComponent
    ],
    imports: [RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderModalGraphComponent);
    component = fixture.componentInstance;
    component.folder = sampleFolder;
    component['translate'].currentLang = 'fr';
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should create node for notion or study', done => {

    // Given
    component.folder = sampleFolder

    const expectResults = [
      {
        endDate: '2025-03-06',
        id: '1',
        inForce: false,
        name: '123',
        nodeId: 1,
        objectId: '1',
        startDate: '2025-03-05',
        type: { name: NotionType.INFOSOURCE }
      },
      {
        endDate: '2025-03-06',
        id: '2',
        inForce: false,
        name: '123',
        nodeId: 2,
        objectId: '2',
        startDate: '2025-03-05',
        type: { name: NotionType.WARNING }
      },
      {
        endDate: '2025-03-06',
        id: '3',
        inForce: false,
        name: '123',
        nodeId: 3,
        objectId: '3',
        startDate: '2025-03-05',
        type: { name: NotionType.GEOREGULATION }
      },
    ]

    // When
    component.folder.notions.forEach((sample, index) => {
      const results = component['createNodeForNotionOrStudy'](+sample.id, sample, sample.objectId);

      // Then
      expect(results).toEqual(expectResults[index]);
    })
    done();
  });

});
