import { WarningCreationData } from '@admin-warning/models/creation-warning.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'aw-last-update-infos',
  templateUrl: './last-update-infos.component.html',
  styleUrls: ['./last-update-infos.component.scss']
})
export class LastUpdateInfosComponent implements OnInit {

  @Input() displayInfos: boolean;
  @Input() anInformation: WarningCreationData;

  constructor() { }

  ngOnInit(): void {
  }

  getLastUpdateDateFormatted(): string {
    if (!this.anInformation.lastUpdate) { return ''; }
    const lastUpdateDateTime = new Date(this.anInformation.lastUpdate);
    return `${lastUpdateDateTime.getDate()}/${lastUpdateDateTime.getMonth() + 1}/${lastUpdateDateTime.getFullYear()} ${lastUpdateDateTime.toLocaleTimeString()}`;
  }

  getLastUpdateUserFormatted(): string {
    if (!this.anInformation.lastUpdateUser) { return ''; }
    const user = this.anInformation.lastUpdateUser;
    const serviceName = user.serviceName ?? '';
    return `${user.firstname} ${user.lastname} ${serviceName}`;
  }
}
