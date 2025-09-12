import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

const SUBSCRIPTION_WARNING = '/subscription/warning';
const SUBSCRIPTION_GEOREGULATION = '/subscription/georegulation';

@Component({
  selector: 'subscription-choice',
  templateUrl: './subscription-choice.component.html',
  styleUrls: ['./subscription-choice.component.scss']
})
export class SubscriptionChoiceComponent implements OnInit {

  enableGeoregulationBtn: boolean;

  constructor(private readonly confirmationService: ConfirmationService,
              private readonly authService: AuthService,
              private readonly translate: TranslateService,
              private readonly router: Router) { }

  ngOnInit(): void {
    this.enableGeoregulationBtn = this.authService.hasRoleServiceUser();
  }

  createWarningSubscription() {
    this.router.navigate([SUBSCRIPTION_WARNING]);
  }

  createGeoregulationSubscription(): void {
    this.router.navigate([SUBSCRIPTION_GEOREGULATION]);
  }
}
