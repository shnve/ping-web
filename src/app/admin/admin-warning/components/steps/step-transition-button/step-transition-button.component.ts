import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { CreationService } from '@app/admin/admin-warning/services/creation.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StepComponent } from '../step.component';
import { LoaderService } from '@sig/services/loader.service';

@Component({
  selector: 'aw-step-transition-button',
  templateUrl: './step-transition-button.component.html',
  styleUrls: ['./step-transition-button.component.scss']
})
export class StepTransitionButtonComponent extends StepComponent implements OnInit {
  @Input() anInformation: WarningCreationData;
  @Input() prevStep: string;
  @Input() nextStep: string;
  @Input() isPrerequisitesStep?: boolean;
  @Input() isFinalizationStep?: boolean;
  @Output() nextPageButton = new EventEmitter<boolean>();
  @Output() prevPageButton = new EventEmitter<boolean>();
  @Output() savePageButton = new EventEmitter<boolean>();

  constructor(readonly routerInstance: Router,
              protected readonly creationService: CreationService,
              protected readonly alertMessageService: AlertMessageService,
              protected readonly loader: LoaderService) {
    super(routerInstance, creationService, alertMessageService, loader);
  }

  nextPage() {
    this.nextPageButton.emit();
  }

  prevPage() {
    this.prevPageButton.emit();
  }

  save() {
    this.savePageButton.emit();
  }

}
