import { Component, OnInit } from '@angular/core';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { listWarningStatus } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { DiffusionTypeComponent } from '../diffusion-type.component';

@Component({
  selector: 'aw-diffusion-navtex',
  templateUrl: '../diffusion-type.component.html',
  styleUrls: ['../diffusion-type.component.scss']
})
export class DiffusionNavtexComponent extends DiffusionTypeComponent implements OnInit {

  diffusionType = 'navtex';

  constructor(protected readonly alertMessageService: AlertMessageService,
              protected readonly translateService: TranslateService,
              protected readonly warningAdminApi: WarningAdminApi) {
    super(alertMessageService, translateService, warningAdminApi);
  }

  ngOnInit(): void {
    this.diffusionContent = this.warning.navtex;
    this.displayDiffusionTypePart = this.isAnInStatus(this.warning, listWarningStatus.PUBLISHED) || this.isAnInStatus(this.warning, listWarningStatus.CANCELLED);
  }

  generateDiffusion(): void {
    if (this.warning.id) {
      this.warningAdminApi.generateNavtex$(this.warning.id)
        .pipe(this.scavenger.collect())
        .subscribe(navtex => this.diffusionContent = navtex);
    }
  }
}
