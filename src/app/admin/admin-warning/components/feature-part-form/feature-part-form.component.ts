import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { listWarningHazardTypeDetails, listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import _ from 'lodash';
import pick from 'lodash-es/pick';
import { Observable } from 'rxjs';
import { FeaturePart, WarningCreationData } from '../../models/creation-warning.model';
import { CreationService } from '../../services/creation.service';
import { FeaturePartMainInfo } from '../steps/prerequisites-step/prerequisites-step.component';

@Localize()
@Component({
  selector: 'aw-feature-part-form',
  templateUrl: './feature-part-form.component.html',
  styleUrls: ['./feature-part-form.component.scss']
})
export class FeaturePartFormComponent implements OnChangeLang, OnChanges {
  /**
   * Emit event only when part form is changed.
   * It doesn't work for map interaction
   */
  @Output() onChange = new EventEmitter<FeaturePartMainInfo>();
  @Input() featurePart: FeaturePart;
  @Input() anInformation: WarningCreationData;
  @Input() geometries = [];
  @Input() affectedAreas = [];
  @Input() selectedAreas = [];
  @Input() selectedLocalities: any;
  @Input() validFeaturePart = false;
  @Input() partIndex = 0;
  @Input() typeGeneral: string;
  @Input() isBathy = false;

  optionsWarningTypeDetails: Array<{ value?: string, key?: string }> = [];
  protected groupsOfTypeDetails: Array<{ value?: string, items?: string[] }>;
  private readonly scavenger = new Scavenger();
  grouped = false;
  currentLang: string;
  key: Observable<string>;
  form = this.fb.group({
    information: [{}],
    dateRanges: [[[]]],
    typeDetails: [[], Validators.required]
  });
  langs: Array<string> = [];

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService,
    private readonly creationService: CreationService) {
    this.form.valueChanges.subscribe(values => {
      this.onChange.emit(values);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featurePart) {
      this.updateFormFromFeaturePart(this.featurePart);
    }

    if (changes.typeGeneral) {
      this.updateLists();
    }
  }

  private updateLists(): void {
    const typeWarningTypeGeneral = this.typeGeneral;
    this.groupsOfTypeDetails = listWarningHazardTypeGeneral.find(({ key }) => key === typeWarningTypeGeneral)?.groups || [];
    this.hasTwoLanguages() ? this.buildLocalizedItemsBilingual() : this.buildLocalizedItems();

    const typeDetailsControl = this.form.get('typeDetails');
    if (this.optionsWarningTypeDetails && this.optionsWarningTypeDetails.length === 0) {
      typeDetailsControl?.clearValidators();
    } else {
      typeDetailsControl?.setValidators(Validators.required);
    }
    typeDetailsControl?.updateValueAndValidity();
  }

  buildLocalizedItems(): void {
    this.optionsWarningTypeDetails = [];
    if (!this.groupsOfTypeDetails || this.groupsOfTypeDetails.length === 0) {
      this.grouped = false;
      this.optionsWarningTypeDetails = [];
    } else if (this.groupsOfTypeDetails.length === 1) {
      this.grouped = false;
      const uniqGroup = this.groupsOfTypeDetails[0]?.items;
      this.optionsWarningTypeDetails = _.sortBy(
        listWarningHazardTypeDetails.filter(({ key }) => uniqGroup.includes(key)).map(({ key, value }) => this.translateTypeDetails(key, value)),
        'value'
      );
    } else {
      this.grouped = true;
      this.optionsWarningTypeDetails = this.groupsOfTypeDetails
        .reduce((groups, group) => {
          groups.push({
            label: this.translate.instant(group.value),
            items: _.sortBy(
              listWarningHazardTypeDetails.filter(({ key }) => group.items?.includes(key)).map(({ key, value }) => this.translateTypeDetails(key, value)),
              'value')
          });

          return _.sortBy(groups, 'label');
        }, []);
    }
  }

  translateTypeDetails(key: string, value: string): any {
    return {
      key,
      value: this.translate.instant(value)
    };
  }

  buildLocalizedItemsBilingual(): void {
    this.optionsWarningTypeDetails = [];
    if (!this.groupsOfTypeDetails || this.groupsOfTypeDetails.length === 0) {
      this.grouped = false;
      this.optionsWarningTypeDetails = [];
    } else if (this.groupsOfTypeDetails.length === 1) {
      this.grouped = false;
      const uniqGroup = this.groupsOfTypeDetails[0]?.items;
      this.optionsWarningTypeDetails = listWarningHazardTypeDetails
        .filter(({ key }) => uniqGroup.includes(key))
        .map(({ key, value }) => ({ key, value: this.translate.instant(value) }));

    } else {
      this.grouped = true;
      this.optionsWarningTypeDetails = this.groupsOfTypeDetails.reduce((groups, group) => {
        groups.push({
          label: this.translate.instant(group.value),
          items: listWarningHazardTypeDetails
            .filter(({ key }) => group.items?.includes(key))
            .map(({ key, value }) => ({ key, value: this.translate.instant(value) }))
        });
        return groups;
      }, []);
    }
  }

  hasTwoLanguages(): boolean {
    if (this.anInformation) {
      this.langs = [...this.anInformation.warningParts.mandatoryLanguages, ...this.anInformation.warningParts.optionalLanguages];
      this.langs.sort((a, b) => a === 'es' ? -1 : (b === 'es' ? 1 : 0));
    }
    return this.langs.includes('en') && this.langs.length > 1;
  }

  updateFormFromFeaturePart(part: FeaturePart) {
    this.form.setValue(pick(part, ['information', 'dateRanges', 'typeDetails']), { emitEvent: false });
  }

  onChangeLang() {
    this.hasTwoLanguages() ? this.buildLocalizedItemsBilingual() : this.buildLocalizedItems();
  }
}
