import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-infosource-home',
  templateUrl: './infosource-home.component.html',
  styleUrls: ['./infosource-home.component.scss']
})
export class InfosourceHomeComponent implements OnInit {

  protected enableSurveyModule: boolean;

  constructor() {
    this.enableSurveyModule = environment.enableSurveyModule === 'true';
  }

  ngOnInit(): void {
  }

}
