import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { FeaturePart } from '../../models/creation-warning.model';
import { getNumberForPart } from '../feature-part-utils';

@Localize()
@Component({
  selector: 'aw-feature-parts-list',
  templateUrl: './feature-parts-list.component.html',
  styleUrls: ['./feature-parts-list.component.scss']
})
export class FeaturePartsListComponent implements OnChangeLang {
  @Input() featureParts: Array<FeaturePart> = [];
  @Input() selectedParts: Array<FeaturePart> = [];
  @Input() readonly = false;
  @Input() validFeaturePart: Map<number, boolean> = new Map();
  @Output() onSelect = new EventEmitter<FeaturePart>();
  @Output() onRemove = new EventEmitter<FeaturePart>();
  currentLanguage: string;

  protected confirmRemovePart = 'confirmRemovePart';

  constructor(private readonly langService: LangService,
              private readonly translate: TranslateService,
              private readonly confirmationService: ConfirmationService) {
    this.currentLanguage = langService.getUserPreferredLang();
  }

  onChangeLang(langChangeEvent: LangChangeEvent): void {
    this.currentLanguage = langChangeEvent.lang;
  }

  selectionChange({value: featureParts}: {value: FeaturePart[]}): void {
    if (!this.readonly) {
      this.onSelect.emit(featureParts[0]);
    }
  }

  getNumberForSearchedPart(searchedPart: FeaturePart): number {
    return getNumberForPart(searchedPart, this.featureParts);
  }

  protected confirmDelete(event: Event, featurePart: FeaturePart): void {
    this.confirmationService.confirm({
      key: this.confirmRemovePart,
      target: event.target,
      message: this.translate.instant('confirm-remove-part'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.onRemove.emit(featurePart)
    });
  }
}
