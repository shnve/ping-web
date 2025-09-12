import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { getNumberForPart } from '@app/infosource/infosource-utils';
import { InfosourcePartForm } from '@app/infosource/models/infosource.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'infosource-feature-parts-list',
  templateUrl: './infosource-feature-parts-list.component.html',
  styleUrls: ['./infosource-feature-parts-list.component.scss']
})
@Localize()
export class InfosourceFeaturePartsListComponent implements OnChangeLang {

  @Input() featureParts: Array<InfosourcePartForm> = [];
  @Input() selectedParts: Array<InfosourcePartForm> = [];
  @Input() readonly = false;
  @Input() validFeaturePart: Map<number, boolean> = new Map();
  @Output() onSelect = new EventEmitter<InfosourcePartForm>();
  @Output() onRemove = new EventEmitter<InfosourcePartForm>();
  currentLanguage: string;

  protected confirmRemovePart = 'confirmRemovePart';

  constructor(private readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService) { }

  onChangeLang(langChangeEvent: LangChangeEvent): void {
    this.currentLanguage = langChangeEvent.lang;
  }

  selectionChange({ value: featureParts }: { value: InfosourcePartForm[] }): void {
    if (this.readonly) { return; }
    this.onSelect.emit(featureParts[0]);
  }

  getNumberForSearchedPart(searchedPart: InfosourcePartForm): number {
    return getNumberForPart(searchedPart, this.featureParts);
  }

  protected confirmDelete(event: Event, featurePart: InfosourcePartForm): void {
    this.confirmationService.confirm({
      key: this.confirmRemovePart,
      target: event.target,
      message: this.translate.instant('confirm-remove-part'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.onRemove.emit(featurePart)
    });
  }
}
