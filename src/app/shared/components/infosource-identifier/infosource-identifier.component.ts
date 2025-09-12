import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-infosource-identifier',
  templateUrl: './infosource-identifier.component.html',
  styleUrls: ['./infosource-identifier.component.scss']
})
export class InfosourceIdentifierComponent {

  @Input() identifier: string;

  constructor(private readonly router: Router) { }

  goToContributions(): void {
    this.router.navigate(['/infosource/tables']);
  }
}
