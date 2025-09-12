import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyReferencesTypeEnum } from '@app/folder/models/folder-study.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StudyReferenceItemComponent } from './study-reference-item.component';

describe('StudyReferenceItemComponent', () => {
  let component: StudyReferenceItemComponent;
  let fixture: ComponentFixture<StudyReferenceItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudyReferenceItemComponent],
      imports: [TranslateModule.forRoot(),],
      providers: [TranslateService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyReferenceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the reference when referenceOnChange is called', () => {
    // Given
    // When
    component.type = StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION;
    component.value = 'someValue';
    component.referenceOnChange();

    // Then
    expect(component.reference).toEqual({ type: StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION, value: 'someValue' });
  });

  it('should register onChange and onTouched', () => {
    // Given
    const onChangeSpy = jasmine.createSpy('onChange');
    const onTouchedSpy = jasmine.createSpy('onTouched');

    // When
    component.registerOnChange(onChangeSpy);
    component.registerOnTouched(onTouchedSpy);

    // Then
    expect(component.onChange).toBe(onChangeSpy);
    expect(component.onTouched).toBe(onTouchedSpy);
  });
});
