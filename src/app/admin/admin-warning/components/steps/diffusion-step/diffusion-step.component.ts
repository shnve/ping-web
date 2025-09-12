import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StepComponent } from '../step.component';
import { CreationService } from '@admin-warning/services/creation.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { DiffusionNavtexConfigurationComponent } from './diffusion-type/diffusion-navtex/diffusion-navtex-configuration/diffusion-navtex-configuration.component';
import { LoaderService } from '@sig/services/loader.service';

@Component({
  selector: 'aw-diffusion-step',
  templateUrl: './diffusion-step.component.html',
  styleUrls: ['../step.component.scss', './diffusion-step.component.scss']
})
export class DiffusionStepComponent extends StepComponent implements OnInit {

  @ViewChild('navtexConfiguration') navtexConfiguration: DiffusionNavtexConfigurationComponent;
  shouldHaveNavtex = false;

  constructor(readonly routerInstance: Router,
              protected readonly creationService: CreationService,
              protected readonly alertMessageService: AlertMessageService,
              protected elemRef: ElementRef,
              protected readonly loader: LoaderService) {
    super(routerInstance, creationService, alertMessageService, loader);
    this.baseElementRef = this.elemRef;
    this.currentStep = '/diffusion';
    this.prevStep = '/publics-references';
    this.nextStep = '/finalization';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.shouldHaveNavtex = this.creationService.getShouldHaveNavtex();
  }

  nextPage(): void {
    if (this.saveForm()) {
      this.update(false);
      super.nextPage();
    } else {
      this.handleSaveError(null, 'form-invalid');
    }
  }

  prevPage(): void {
    if (this.saveForm()) {
      super.prevPage();
    } else {
      this.handleSaveError(null, 'form-invalid');
    }
  }

  saveForm(force = false): boolean {
    if (this.navtexConfiguration) {
      return this.navtexConfiguration.saveNavtexConfiguration();
    }
    return true;
  }
}
