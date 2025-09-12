import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { NotificationState } from '@app/states/notification.state';
import { subscriptionServiceProvider } from '@app/subscription/providers/subscription.service.provider';
import { AbstractSubscriptionService } from '@app/subscription/services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { ConfirmationService } from 'primeng/api';
import MaritimeService from '@app/models/maritime-service.model';

const REDIRECT_URL = '/';

@Component({
  selector: 'subscription-delete-from-link',
  templateUrl: './subscription-delete-from-link.component.html',
  styleUrls: ['./subscription-delete-from-link.component.scss'],
  providers: [
    subscriptionServiceProvider
  ]
})
export class SubscriptionDeleteFromLinkComponent implements OnInit, OnDestroy {

  private scavenger = new Scavenger(this);

  subscriptionId: string;
  subscriptionTitle: string;
  maritimeService: MaritimeService;
  subscriptionType: string;

  constructor(private readonly route: ActivatedRoute,
    private readonly confirmationService: ConfirmationService,
    private readonly translateService: TranslateService,
    private readonly subscriptionService: AbstractSubscriptionService,
    private readonly alertMessageService: AlertMessageService,
    private readonly notificationState: NotificationState,
    private readonly router: Router
    ) { }

  ngOnInit(): void {
    this.subscriptionId = this.route.snapshot.paramMap.get('subscriptionId');
    if (this.subscriptionId) {
    this.subscriptionService.getSubscriptionById$(this.subscriptionId)
      .pipe(this.scavenger.collect())
      .subscribe({
        next: subscription => {
          this.subscriptionTitle = subscription.title;
          this.maritimeService = subscription.service;
          this.subscriptionType = `subscription.delete-from-link.type-${subscription.type.toLocaleLowerCase()}`
        },
        error: () => this.router.navigate([REDIRECT_URL])
      });
    } else {
      this.router.navigate([REDIRECT_URL]);
    }

  }

  ngOnDestroy(): void { }

  confirmDelete(event: Event) {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translateService.instant('subscription.details.delete.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete();
      }
    });
  }

  private delete(): void {
    this.subscriptionService.delete$(this.subscriptionId).subscribe(
      () => {
        this.showToast(this.translateService.instant('subscription.details.delete.delete-success'), 'success');
        this.notificationState.setNotificationObjectDeleted$();
        this.router.navigate([REDIRECT_URL]);
      },
      () => {
        this.showToast(this.translateService.instant('subscription.details.delete.delete-error'), 'error');
        this.router.navigate([REDIRECT_URL]);
      }
    );
  }

  private showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }
}
