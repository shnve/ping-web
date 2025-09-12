import { Component, Input, OnInit } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { getServiceStatusIconSuffix } from '@app/infosource/infosource-utils';
import { InfosourceRecipient } from '@app/infosource/models/infosource-table.model';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'infosource-table-recipient',
  templateUrl: './infosource-table-recipient.component.html',
  styleUrls: ['./infosource-table-recipient.component.scss']
})
@Localize()
export class InfosourceTableRecipientComponent implements OnInit, OnChangeLang {

  @Input() recipient: InfosourceRecipient;

  statusIcon: string;

  recipientInformation: string;

  constructor(private readonly translate: TranslateService) { }

  ngOnInit(): void {
    if (!this.recipient) { return; }

    this.statusIcon = getServiceStatusIconSuffix(this.recipient.actionType);
    this.recipientInformation = this.getDisplayedRecipientInformation(this.translate.currentLang);
  }

  private getDisplayedRecipientInformation(lang: string): string {
    return lang === 'fr' ? this.recipient.information : this.recipient.localizedInformation;
  }

  onChangeLang(event: LangChangeEvent): void {
    this.recipientInformation = this.getDisplayedRecipientInformation(event.lang);
  }
}
