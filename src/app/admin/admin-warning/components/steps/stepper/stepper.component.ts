import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { listWarningStatus as listWarningStatusEnum } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { WarningCreationData } from '../../../models/creation-warning.model';

@Component({
  selector: 'aw-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})

@Localize()
export class StepperComponent implements OnInit, OnChangeLang {
  @Input() currentStep: string;
  @Input() warning: WarningCreationData;
  listWarningStatus = listWarningStatusEnum;
  @Output() moveStep = new EventEmitter<string>();

  steps: MenuItem[];
  constructor(private readonly translate: TranslateService) { }

  ngOnInit(): void {
    this.buildSteps();
  }

  moveToStep(event: string): void {
    this.moveStep.emit(event);
  }

  protected buildSteps(): void {
    this.steps = [
      {
        label: this.translate.instant('menu.admin-warning.edition.prerequisites'),
        routerLink: '/prerequisites'
      },
      {
        label: this.translate.instant('menu.admin-warning.edition.links-and-attachments'),
        routerLink: '/links-and-attachments'
      },
      {
        label: this.translate.instant('menu.admin-warning.edition.publics-references'),
        routerLink: '/publics-references'
      },
      {
        label: this.translate.instant('menu.admin-warning.edition.diffusion'),
        routerLink: '/diffusion'
      },
      {
        label: this.translate.instant('menu.admin-warning.edition.finalization'),
        routerLink: '/finalization'
      }
    ];
  }

  onChangeLang(): void {
    this.buildSteps();
  }

}
