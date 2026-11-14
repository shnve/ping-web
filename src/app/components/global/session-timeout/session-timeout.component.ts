import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, LOGOUT_REASON_KEY, LogoutReason } from '@app/auth/auth.service';
import { SessionActivityService, SessionIdleState } from '@app/auth/session-activity.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Subscription } from 'rxjs';

/**
 * PISAC: aviso y cierre de sesión por inactividad.
 *
 * Cuando falta poco para el cierre (2 min por defecto) muestra un diálogo con la cuenta atrás y los botones
 * "Continuar" y "Cerrar sesión". Al llegar a cero cierra la sesión en el portal y en Keycloak. Al volver al portal
 * tras un cierre automático muestra el motivo.
 */
@Component({
  selector: 'app-session-timeout',
  templateUrl: './session-timeout.component.html',
  styleUrls: ['./session-timeout.component.scss']
})
export class SessionTimeoutComponent implements OnInit, OnDestroy {
  visible = false;
  remainingSeconds = 0;

  private subscription: Subscription;

  constructor(private readonly sessionActivity: SessionActivityService,
              private readonly authService: AuthService,
              private readonly alertMessageService: AlertMessageService) { }

  ngOnInit(): void {
    this.showLogoutReason();
    this.subscription = this.sessionActivity.idleState$.subscribe(state => this.onIdleState(state));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get countdown(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  keepSession(): void {
    this.sessionActivity.markActivity(true);
    this.visible = false;
  }

  logoutNow(): void {
    this.visible = false;
    this.authService.logout();
  }

  private onIdleState(state: SessionIdleState): void {
    switch (state.phase) {
      case 'warning':
        this.remainingSeconds = state.remainingSeconds;
        this.visible = true;
        break;
      case 'expired':
        this.visible = false;
        if (this.authService.isConnected) {
          this.authService.logout('idle');
        }
        break;
      default:
        this.visible = false;
    }
  }

  private showLogoutReason(): void {
    const reason = sessionStorage.getItem(LOGOUT_REASON_KEY) as LogoutReason;
    if (!reason) {
      return;
    }
    sessionStorage.removeItem(LOGOUT_REASON_KEY);
    // Diferido para que el toaster ya esté en pantalla
    setTimeout(() => this.alertMessageService.add({
      severity: 'warn',
      summary: 'session-timeout.closed.summary',
      detail: `session-timeout.closed.${reason}`,
      life: 10000
    }));
  }
}
