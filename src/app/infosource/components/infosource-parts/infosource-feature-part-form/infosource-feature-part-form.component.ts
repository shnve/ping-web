import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { InfosourcePartForm, InfosourcePartFormMainInfo } from '@app/infosource/models/infosource.model';
import { pick } from 'lodash-es';
import Feature from 'ol/Feature';
import { initValidFeaturePartTypeDefaultValue, ValidFeaturePartType } from './infosource-input-information/infosource-input-information.component';

@Component({
  selector: 'infosource-feature-part-form',
  templateUrl: './infosource-feature-part-form.component.html',
  styleUrls: ['./infosource-feature-part-form.component.scss']
})
export class InfosourceFeaturePartFormComponent implements OnChanges {

  @Input() geometries: Feature[] = [];
  @Input() validFeaturePart: ValidFeaturePartType = initValidFeaturePartTypeDefaultValue;
  @Input() featurePart: InfosourcePartForm;
  @Input() timezone: string;
  @Output() onChange = new EventEmitter<InfosourcePartFormMainInfo>();
  @Input() partIndex = 0;

  form = this.fb.group({
    dateRanges: [[[]]],
    information: [{}]
  });

  constructor(private readonly fb: UntypedFormBuilder) {
    this.form.valueChanges.subscribe(values => {
      this.onChange.emit(values);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featurePart) {
      this.updateFormFromFeaturePart(this.featurePart);
    }
  }

  updateFormFromFeaturePart(part: InfosourcePartForm): void {
    this.form.setValue(pick(part, ['dateRanges', 'information']), { emitEvent: false });
  }

  get information(): AbstractControl {
    return this.form.get('information');
  }
}
