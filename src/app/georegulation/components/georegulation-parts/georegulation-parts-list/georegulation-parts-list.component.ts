import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { getNumberForPart } from '@app/georegulation/georegulation-utils';
import { GeoregulationPartForm } from '@app/georegulation/models/georegulation.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'georegulation-parts-list',
  templateUrl: './georegulation-parts-list.component.html',
  styleUrls: ['./georegulation-parts-list.component.scss']
})
@Localize()
export class GeoregulationPartsListComponent implements OnChangeLang {

  @Input() featureParts: GeoregulationPartForm[] = [];
  @Input() selectedParts: GeoregulationPartForm[] = [];
  @Input() readonly = false;
  @Input() validFeaturePart: Map<number, boolean> = new Map();
  @Output() partSelected = new EventEmitter<GeoregulationPartForm>();
  @Output() partRemoved = new EventEmitter<GeoregulationPartForm>();
  currentLanguage: string;

  protected confirmRemovePart = 'confirmRemovePart';

  constructor(private readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService) { }

  onChangeLang(langChangeEvent: LangChangeEvent): void {
    this.currentLanguage = langChangeEvent.lang;
  }

  selectionChange({ value: featureParts }: { value: GeoregulationPartForm[] }): void {
    this.partSelected.emit(featureParts[0]);
  }

  getNumberForSearchedPart(searchedPart: GeoregulationPartForm): number {
    return getNumberForPart(searchedPart, this.featureParts);
  }

  protected confirmDelete(event: Event, featurePart: GeoregulationPartForm): void {
    this.confirmationService.confirm({
      key: this.confirmRemovePart,
      target: event.target,
      message: this.translate.instant('confirm-remove-part'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.partRemoved.emit(featurePart)
    });
  }
}
