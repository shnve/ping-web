import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { StudyReferencesTypeEnum } from '../models/folder-study.model';
import { FolderFormatReferenceTypeLabelPipe } from './folder-format-reference-type-label.pipe';

describe('FolderFormatReferenceTypeLabelPipe', () => {
  let pipe: FolderFormatReferenceTypeLabelPipe;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        FolderFormatReferenceTypeLabelPipe,
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    });

    pipe = TestBed.inject(FolderFormatReferenceTypeLabelPipe);
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform reference type to translated label', () => {
    // Given
    const referenceType = StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION;
    const translationLabel = 'Nautical map correction';

    translateService.instant.and.returnValue(translationLabel);

    // When
    const result = pipe.transform(referenceType);

    // Then
    expect(translateService.instant).toHaveBeenCalledWith('enum.study-type-references.nautical-map-correction');
    expect(result).toBe(translationLabel);
  });
});
