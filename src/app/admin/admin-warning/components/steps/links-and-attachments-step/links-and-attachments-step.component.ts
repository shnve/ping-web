import { CreationService } from '@admin-warning/services/creation.service';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StepComponent } from '../step.component';
import { AttachmentsStepComponent } from './attachments-step/attachments-step.component';
import { LinksStepComponent } from './links-step/links-step.component';
import { LoaderService } from '@sig/services/loader.service';

@Component({
  selector: 'aw-links-and-attachments-step',
  templateUrl: './links-and-attachments-step.component.html',
  styleUrls: ['../step.component.scss', './links-and-attachments-step.component.scss']
})
export class LinksAndAttachmentsStepComponent extends StepComponent implements OnInit, OnDestroy {
  @ViewChild('linksStep') linkStep: LinksStepComponent;
  @ViewChild('attachmentsStep') attachmentStep: AttachmentsStepComponent;

  constructor(readonly router: Router,
    protected readonly creationService: CreationService,
    protected readonly alertMessageService: AlertMessageService,
    protected elemRef: ElementRef,
    protected readonly loader: LoaderService) {
    super(router, creationService, alertMessageService, loader);
    this.baseElementRef = this.elemRef;
    this.currentStep = '/links-and-attachments';
    this.prevStep = '/prerequisites';
    this.nextStep = '/publics-references';
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  jumpToStep(event?: string): void {
    this.linkStep.saveForm();
    this.attachmentStep.saveForm();
    super.jumpToStep(event);
  }

  nextPage(): void {
    this.linkStep.saveForm();
    this.attachmentStep.saveForm();
    this.update(false);
    this.router.navigate([this.rootUrl + this.nextStep]);
  }

  prevPage(): void {
    this.linkStep.saveForm();
    this.attachmentStep.saveForm();
    this.router.navigate([this.rootUrl + this.prevStep]);
  }

  save(): void {
    this.linkStep.saveForm();
    this.attachmentStep.saveForm();
    super.save();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
