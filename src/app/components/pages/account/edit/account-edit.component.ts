import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.scss']
})
export class AccountEditComponent {
  disabled = this.router.url.endsWith('/details');
  userId = this.route.snapshot.params.userId;
  constructor(private readonly route: ActivatedRoute, private readonly router: Router) { }
}
