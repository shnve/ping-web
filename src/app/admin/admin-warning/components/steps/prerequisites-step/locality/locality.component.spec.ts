import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubArea } from '@app/models/sub-area.model';
import { TranslateModule } from '@ngx-translate/core';
import { OrderByImpurePipe } from 'ngx-pipes';
import { LocalityComponent } from './locality.component';

describe('LocalityComponent', () => {
  let component: LocalityComponent;
  let fixture: ComponentFixture<LocalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LocalityComponent,
        OrderByImpurePipe
      ],
      imports: [TranslateModule.forRoot()],
      providers: [OrderByImpurePipe, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalityComponent);
    component = fixture.componentInstance;
    component.selectedLocalities = new Map<string, SubArea[]>();
    component.prerequisites = { selectedLocalities: [] } as any; // as any pour éviter de devoir créer un WarningCreationPrerequisites complet car pas forcément utilisé dans les tests
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convertMapSectorLocalitiesToWarningLocalityNamesArray', done => {
    // Given
    const mapSectorLocalities = new Map<string, SubArea[]>();
    mapSectorLocalities.set('parentSector1', [
      { id: 'subArea1', name: 'subArea1FR', position: 1 },
      { id: 'subArea2', name: 'subArea2FR', internationalName: 'subArea2EN', position: 2 }
    ]);

    // When
    const result = LocalityComponent.convertMapSectorLocalitiesToWarningLocalityNamesArray(mapSectorLocalities);

    // Then
    expect(result).toEqual([
      { id: 'subArea1', parentId: 'parentSector1', name: 'subArea1FR', internationalName: 'subArea1FR', position: 1 },
      { id: 'subArea2', parentId: 'parentSector1', name: 'subArea2FR', internationalName: 'subArea2EN', position: 2 }
    ])
    done();
  });

  it('should update checkedLocalities and positions in ngOnChanges', () => {
    // Given
    component.area = { id: 'area1' } as SubArea;
    component.selectedLocalities = new Map<string, SubArea[]>();
    component.selectedLocalities.set('area1', [
      { id: 'locality1', name: 'Locality 1', position: 0 } as SubArea,
      { id: 'locality2', name: 'Locality 2', position: 0 } as SubArea
    ]);
    component.prerequisites = {
      localityNames: [
        { parentId: 'area1', name: 'Locality 1', position: 1 },
        { parentId: 'area1', name: 'Locality 2', position: 2 }
      ]
    } as any;

    // When
    component.ngOnChanges();

    // Then
    expect(component.checkedLocalities).toEqual([
      { id: 'locality1', name: 'Locality 1', position: 1 },
      { id: 'locality2', name: 'Locality 2', position: 2 }
    ]);
  });

  it('should set checkedLocalities to an empty array if no localities are found for the area', () => {
    // Given
    component.area = { id: 'area2' } as SubArea;
    component.selectedLocalities = new Map<string, SubArea[]>();
    component.prerequisites = { localityNames: [] } as any;

    // When
    component.ngOnChanges();

    // Then
    expect(component.checkedLocalities).toEqual([]);
  });

  it('should add a new locality to the selectedLocalities map and emit localityUpdated', () => {
    // Given
    spyOn(component.localityUpdated, 'emit');
    component.isPublished = false;
    component['chosenLocality'] = { id: 'locality1', name: 'Locality 1', position: null } as SubArea;
    component.selectedLocalities = new Map<string, SubArea[]>();
    const areaId = 'area1';

    // When
    component['onAddLocality'](areaId);

    // Then
    const updatedLocalities = component.selectedLocalities.get(areaId);
    expect(updatedLocalities).toEqual([
      { id: 'locality1', name: 'Locality 1', position: 1 }
    ]);
    expect(component.checkedLocalities).toEqual(updatedLocalities);
    expect(component.localityUpdated.emit).toHaveBeenCalled();
  });

  it('should not add a locality if it already exists in the selectedLocalities map', () => {
    // Given
    spyOn(component.localityUpdated, 'emit');
    component.isPublished = false;
    component['chosenLocality'] = { id: 'locality1', name: 'Locality 1', position: null } as SubArea;
    component.selectedLocalities = new Map<string, SubArea[]>();
    const areaId = 'area1';
    component.selectedLocalities.set(areaId, [
      { id: 'locality1', name: 'Locality 1', position: 1 }
    ]);

    // When
    component['onAddLocality'](areaId);

    // Then
    const updatedLocalities = component.selectedLocalities.get(areaId);
    expect(updatedLocalities).toEqual([
      { id: 'locality1', name: 'Locality 1', position: 1 }
    ]);
  });

  it('should not add a locality if isPublished is true', () => {
    // Given
    spyOn(component.localityUpdated, 'emit');
    component.isPublished = true;
    component['chosenLocality'] = { id: 'locality1', name: 'Locality 1', position: null } as SubArea;
    const areaId = 'area1';

    // When
    component['onAddLocality'](areaId);

    // Then
    expect(component.selectedLocalities.get(areaId)).toBeUndefined();
    expect(component.localityUpdated.emit).not.toHaveBeenCalled();
  });

  it('should remove a locality from the selectedLocalities map and emit localityUpdated', () => {
    // Given
    spyOn(component.localityUpdated, 'emit');
    component.isPublished = false;
    const areaId = 'area1';
    component.selectedLocalities = new Map<string, SubArea[]>();
    component.selectedLocalities.set(areaId, [
      { id: 'locality1', name: 'Locality 1', position: 1 },
      { id: 'locality2', name: 'Locality 2', position: 2 }
    ]);

    // When
    component.onRemoveLocality(areaId, 'Locality 1');

    // Then
    const updatedLocalities = component.selectedLocalities.get(areaId);
    expect(updatedLocalities).toEqual([
      { id: 'locality2', name: 'Locality 2', position: 1 }
    ]);
    expect(component.checkedLocalities).toEqual(updatedLocalities);
    expect(component.localityUpdated.emit).toHaveBeenCalled();
  });

  it('should not remove a locality if isPublished is true', () => {
    // Given
    spyOn(component.localityUpdated, 'emit');
    component.isPublished = true;
    const areaId = 'area1';
    component.selectedLocalities = new Map<string, SubArea[]>();
    component.selectedLocalities.set(areaId, [
      { id: 'locality1', name: 'Locality 1', position: 1 }
    ]);

    // When
    component.onRemoveLocality(areaId, 'Locality 1');

    // Then
    const updatedLocalities = component.selectedLocalities.get(areaId);
    expect(updatedLocalities).toEqual([
      { id: 'locality1', name: 'Locality 1', position: 1 }
    ]);
    expect(component.localityUpdated.emit).not.toHaveBeenCalled();
  });
});
