import { Component, Input, OnInit } from '@angular/core';
import { Serie } from '@app/models/serie.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-serie-item',
  templateUrl: './select-serie-item.component.html',
  styleUrls: ['./select-serie-item.component.scss']
})
export class SelectSerieItemComponent implements OnInit {

  @Input() serie: Serie;

  constructor(private readonly translate: TranslateService) { }

  ngOnInit(): void {
  }

  get currentLang(): string {
    return this.translate.currentLang;
  }

}
