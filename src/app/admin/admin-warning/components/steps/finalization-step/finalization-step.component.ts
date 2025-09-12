import { WarningCreationData, WarningCreationFinalization } from '@admin-warning/models/creation-warning.model';
import { CreationService } from '@admin-warning/services/creation.service';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { StepComponent } from '../step.component';
import { LoaderService } from '@sig/services/loader.service';

@Component({
  selector: 'aw-finalization-step',
  templateUrl: './finalization-step.component.html',
  styleUrls: ['../step.component.scss', './finalization-step.component.scss']
})
export class FinalizationStepComponent extends StepComponent implements OnInit, OnDestroy {
  anForm: UntypedFormGroup;
  finalizationData: WarningCreationFinalization;
  seriesSubscription: Subscription;
  private disabled: boolean;

  constructor(private readonly routerInstance: Router,
              private readonly formBuilder: UntypedFormBuilder,
              protected readonly creationService: CreationService,
              public readonly translate: TranslateService,
              protected readonly alertMessageService: AlertMessageService,
              protected elemRef: ElementRef,
              protected readonly loader: LoaderService) {
    super(routerInstance, creationService, alertMessageService, loader);
    this.baseElementRef = this.elemRef;
    this.currentStep = '/finalization';
    this.prevStep = '/diffusion';
    this.finalizationData = this.creationService.getWarningData().finalizationData;
    this.disabled = this.isModel();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initForm();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  initForm(): void {
    this.anForm = this.formBuilder.group({
      estimatedPublicationDate: {value: this.finalizationData.estimatedPublicationDate, disabled: this.disabled},
      reviewDate: {value: this.finalizationData.reviewDate, disabled: this.disabled},
      internalComment: this.finalizationData.internalComment
    });

    if (this.isPublished() || this.disabled) {
      this.anForm.get('estimatedPublicationDate').disable();
    } else {
      this.anForm.get('estimatedPublicationDate').enable();
    }
  }

  resetStep(warningData: WarningCreationData): void {
    this.finalizationData = warningData.finalizationData;
    this.disabled = this.isModel();
  }

  prevPage(): void {
    this.saveForm();
    this.routerInstance.navigate([this.rootUrl + this.prevStep]);
  }

  saveForm(force = false): boolean {
    if (!force && !this.anForm.valid) { return false; }
    if (!this.checkFeatureParts(this.creationService.getWarningData().warningParts.featureParts, this.creationService.getWarningData())) {
      this.showToast('admin-warning.creation.errors.parts-invalid');
      return false;
    }
    const formValue = this.anForm.value;
    this.finalizationData = {
      estimatedPublicationDate: this.anForm.get('estimatedPublicationDate').value,
      reviewDate: formValue.reviewDate,
      internalComment: formValue.internalComment
    };
    this.creationService.getWarningData().finalizationData = this.finalizationData;
    return true;
  }
}
