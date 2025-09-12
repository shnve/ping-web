import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CreationService } from '@app/admin/admin-warning/services/creation.service';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { TranslateService } from '@ngx-translate/core';
import { DiffusionTypeComponent } from '../diffusion-type.component';
import { Message } from 'primeng/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'aw-diffusion-telex',
  templateUrl: '../diffusion-type.component.html',
  styleUrls: ['../diffusion-type.component.scss']
})
export class DiffusionTelexComponent extends DiffusionTypeComponent implements OnInit, OnChanges {

  @Output() telexRefreshed = new EventEmitter<boolean>();

  diffusionType = 'telex';
  protected _needRefresh = false;
  protected _isPrerequisitesFormSavable = true;

  protected readonly alertMessageToRefreshTelex: Message[] = [
    { severity: 'info', detail: 'warning.information.telex-is-not-updated' },
    { severity: 'error', detail: 'warning.alert.need-to-be-save-to-refresh' }
  ];

  constructor(protected readonly alertMessageService: AlertMessageService,
    protected readonly translateService: TranslateService,
    protected readonly warningAdminApi: WarningAdminApi,
    protected readonly creationService: CreationService) {
    super(alertMessageService, translateService, warningAdminApi);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.warning?.currentValue && !this.isPublished() && this.warning.id) {
      this.generateDiffusion();
    }
  }

  ngOnInit(): void {
    this.showReloadButton = !this.isPublished();
    // We generate the diffusion only for unpublished warnings and if we have the warning id from the localStorage
    if (!this.isPublished() && this.warning.id) {
      this.generateDiffusion();
    }
    this.diffusionContent = this.warning?.telex;
  }

  get isRefreshButtonDisabled(): boolean {
    return this.isPublished() || this.isCancelled() || !this.needRefresh || !this.isPrerequisitesFormSavable;
  }

  get canNotSavePrerequisitesForm(): boolean {
    return (this.isDraft() || this.isModel()) && (this.needRefresh && !this.isPrerequisitesFormSavable);
  }

  generateDiffusion(): void {
    const warningId = localStorage.getItem('warningId');
    if (warningId) {
      this.warningAdminApi.generateTelex$(warningId)
        .pipe(
          this.scavenger.collect(),
          filter(telex => !!telex)
        )
        .subscribe(telex => {
          this.diffusionContent = telex;
          this.needRefresh = false;
        });
    }
  }

  protected refreshTelex(): void {
    if (!this.needRefresh || !this.isPrerequisitesFormSavable) {
      return;
    }

    this.telexRefreshed.emit();
  }

  public get needRefresh() {
    return this._needRefresh;
  }

  public set needRefresh(value: boolean) {
    this._needRefresh = value;
  }

  public get isPrerequisitesFormSavable() {
    return this._isPrerequisitesFormSavable;
  }

  public set isPrerequisitesFormSavable(value: boolean) {
    this._isPrerequisitesFormSavable = value;
  }
}
