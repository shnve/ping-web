import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'infosource-report-bathy-data',
  templateUrl: './report-bathy-data.component.html',
  styleUrls: ['./report-bathy-data.component.scss']
})
export class ReportBathyDataComponent implements OnInit {

  constructor(private readonly router: Router) {
    if (environment.enableSurveyModule !== 'true') {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
  }
}
