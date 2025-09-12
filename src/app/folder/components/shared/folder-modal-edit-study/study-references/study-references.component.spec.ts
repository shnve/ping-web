import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyReferencesTypeEnum, TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE } from '@app/folder/models/folder-study.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { StudyReferencesComponent } from './study-references.component';

describe('StudyReferencesComponent', () => {
  let component: StudyReferencesComponent;
  let fixture: ComponentFixture<StudyReferencesComponent>;
  let translateServiceSpy: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudyReferencesComponent],
      providers: [TranslateService,
      ConfirmationService],
      imports: [TranslateModule.forRoot()]
    })
    .compileComponents();
  });

  beforeEach(async () => {
    translateServiceSpy = TestBed.inject(TranslateService);
    fixture = TestBed.createComponent(StudyReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build available references type items', () => {
    // Given
    spyOn(translateServiceSpy, 'instant').and.callFake((label: string) => `Translated ${label}`);

    // When
    component.buildReferencesTypeItems();

    // Then
    component.availableReferenceTypes.forEach((reference, index) => {
      expect(reference.type).toBe(TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE[index].type);
      expect(reference.label).toBe(`Translated ${TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE[index].label}`);
      expect(reference.placeholders.inputText).toBe(`Translated ${TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE[index].placeholders.inputText}`);
      expect(reference.placeholders.information.title).toBe(`Translated ${TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE[index].placeholders.information.title}`);
      expect(reference.placeholders.information.text).toBe(`Translated ${TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE[index].placeholders.information.text}`);
    })
  });

  it('should add new reference', () => {
    // Given
    component.references = [];

    // When
    component.addReference();

    // Then
    expect(component.references.length).toBe(1);
    expect(component.references[0].type).toBeNull();
    expect(component.references[0].value).toBeNull();
  });

  it('should remove a reference', () => {
    // Given
    component.references = [
      { type: StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION, value: 'value1' },
      { type: StudyReferencesTypeEnum.WARNING_T_OR_P, value: 'value2' }
    ];

    // When
    component.removeReference(0);

    // Then
    expect(component.references.length).toBe(1);
    expect(component.references[0].value).toBe('value2');
  });
});
