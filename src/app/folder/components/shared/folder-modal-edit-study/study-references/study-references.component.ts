import { Component, Input, QueryList, ViewChildren, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AvailablePlaceholderReferenceType, StudyReference, TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE } from '@app/folder/models/folder-study.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { forEach } from 'lodash';
import { ConfirmationService } from 'primeng/api';
import { StudyReferenceItemComponent } from './study-reference-item/study-reference-item.component';

@Localize()
@Component({
  selector: 'study-references',
  templateUrl: './study-references.component.html',
  styleUrls: ['./study-references.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StudyReferencesComponent),
    multi: true
  }]
})
export class StudyReferencesComponent implements ControlValueAccessor, OnChangeLang {

  protected confirmRemoveReference: string = 'confirmRemoveReference';

  @Input() disabled: boolean;
  @ViewChildren('studyReferenceItem') studyReferenceItems: QueryList<StudyReferenceItemComponent>;

  availableReferenceTypes: Array<AvailablePlaceholderReferenceType> = [];

  references: Array<StudyReference> = [];

  constructor(private readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService) {
    this.buildReferencesTypeItems();
  }

  onChangeLang(event: LangChangeEvent): void {
    this.buildReferencesTypeItems();
  }

  onChange = (references: StudyReference[]) => { };

  onTouched = () => { };

  registerOnChange(fn: (references: StudyReference[]) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  buildReferencesTypeItems(): void {
    this.availableReferenceTypes = [];
    forEach(TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE,
      (translation: AvailablePlaceholderReferenceType) => {
        this.availableReferenceTypes.push(
          {
            type: translation.type,
            label: this.translate.instant(translation.label),
            placeholders: {
              inputText: this.translate.instant(translation.placeholders.inputText),
              information: {
                title: this.translate.instant(translation.placeholders.information.title),
                text: this.translate.instant(translation.placeholders.information.text)
              }
            }
          });
      });
  }

  addReference(): void {
    const newReference: StudyReference = {
      type: null,
      value: null,
    }
    this.references.unshift(newReference);
  }

  protected confirmDelete(event: Event, index: number): void {
    this.confirmationService.confirm({
      key: this.confirmRemoveReference,
      target: event.target,
      message: this.translate.instant('study.message.confirm-remove-reference'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.removeReference(index)
    });
  }

  removeReference(index: number) {
    this.references.splice(index, 1);
  }

  writeValue(references: StudyReference[]) {
    this.references = references;
  }

  referencesOnChange(reference: StudyReference, index: number): void {
    this.references[index] = reference;
  }

  saveReferences(): void {
    if(!this.studyReferenceItems?.length) {
      this.references = [];
    }

    this.studyReferenceItems.forEach(referenceItem => {
      referenceItem.saveReference();
      this.onChange(this.references);
    });
  }
}
