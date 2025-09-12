import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AvailablePlaceholderReferenceType, StudyReference, StudyReferencesTypeEnum } from '@app/folder/models/folder-study.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'study-reference-item',
  templateUrl: './study-reference-item.component.html',
  styleUrls: ['./study-reference-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StudyReferenceItemComponent),
    multi: true
  }]
})
export class StudyReferenceItemComponent implements ControlValueAccessor, OnInit, OnChanges {

  @Input() disabled: boolean;
  @Input() availableReferenceTypes: Array<AvailablePlaceholderReferenceType> = [];

  reference: StudyReference;
  type: StudyReferencesTypeEnum;
  value: string;
  placeholders: {
    inputText: string;
    information: {
      title: string;
      text: string
    }
  }

  constructor(private readonly translate: TranslateService) { }

  ngOnInit() {
    this.updateSelectedReferenceType();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.availableReferenceTypes) {
      this.updateSelectedReferenceType();
    }
  }

  onChange = (reference: StudyReference) => { };

  onTouched = () => { };

  writeValue(reference: StudyReference) {
    if (!reference) {
      return;
    }

    this.type = reference.type;
    this.value = reference.value;
    this.reference = reference;
    this.updateSelectedReferenceType();
  }

  registerOnChange(fn: (reference: StudyReference) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  buildReference(): void {
    this.reference = {
      type: this.type,
      value: this.value,
    };
  }

  referenceOnChange(): void {
    this.buildReference();
    this.updateSelectedReferenceType();
  }

  updateSelectedReferenceType(): void {
    if (this.type) {
      const selectedReferenceType = this.availableReferenceTypes.find(reference => reference.type === this.type);
      if (selectedReferenceType) {
        this.placeholders = selectedReferenceType.placeholders;
      }
    }
  }

  saveReference(): void {
    this.buildReference();
    this.onChange(this.reference);
  }
}
