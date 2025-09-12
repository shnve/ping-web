import { Component, Input, OnInit } from '@angular/core';
import { InfosourceReference } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { uniq } from '@app/shared/generic-utils';

@Component({
  selector: 'aw-infosources-list',
  templateUrl: './infosources-list.component.html',
  styleUrls: ['./infosources-list.component.scss'],
  providers: [
    infosourceServiceProvider
  ]
})
export class InfosourcesListComponent implements OnInit {

  @Input() infosources: InfosourceReference[] = [];

  showInfosourceModal = false;

  selectedInfosources: InfosourceReference[];

  uniqInfosources: InfosourceReference[] = [];

  constructor() { }

  ngOnInit(): void {
    this.uniqInfosources = uniq(this.infosources, 'id');
  }

  displayInfosourceModal(infosources?: InfosourceReference[]): void {
    this.selectedInfosources = infosources;
    this.showInfosourceModal = true;
  }
}
