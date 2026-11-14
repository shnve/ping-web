import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/** Estado de la sesión respecto a la inactividad del usuario. */
export interface SessionIdleState {
  phase: 'inactive' | 'active' | 'warning' | 'expired';
  /** Segundos que faltan para el cierre (solo en fase 'warning'). */
  remainingSeconds: number;
}

/** Última actividad del usuario, compartida entre pestañas (localStorage). */
export const LAST_ACTIVITY_KEY = 'pisac_last_activity';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart', 'scroll'];
/** Como mucho una escritura en localStorage cada 5 s, para no penalizar el movimiento del ratón. */
const WRITE_THROTTLE_MS = 5000;
const TICK_MS = 1000;

/**
 * PISAC: control de inactividad de la sesión.
 *
 * Registra la actividad del usuario (teclado, ratón, toque, desplazamiento) en cualquier pestaña del portal y
 * calcula cuánto falta para el cierre por inactividad. AuthService lo usa para renovar el token solo cuando hubo
 * actividad, y SessionTimeoutComponent para mostrar el aviso y cerrar la sesión.
 *
 * Los eventos se escuchan fuera de la zona de Angular: solo se vuelve a la zona cuando cambia la fase o, durante
 * el aviso, cada segundo para la cuenta atrás.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionActivityService implements OnDestroy {

  private readonly state$ = new BehaviorSubject<SessionIdleState>({ phase: 'inactive', remainingSeconds: 0 });
  private timeoutMs = 0;
  private warningMs = 0;
  private lastWrite = 0;
  private tickHandle: any;
  private readonly onActivity = () => this.markActivity();

  constructor(private readonly zone: NgZone) { }

  get idleState$(): Observable<SessionIdleState> {
    return this.state$.pipe(distinctUntilChanged((a, b) => a.phase === b.phase && a.remainingSeconds === b.remainingSeconds));
  }

  /** Empieza a vigilar la inactividad (al iniciar sesión o al recargar con sesión abierta). */
  start(timeoutMinutes: number, warningSeconds: number): void {
    this.stop();
    this.timeoutMs = timeoutMinutes * 60000;
    this.warningMs = Math.min(warningSeconds * 1000, this.timeoutMs);
    this.zone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, this.onActivity, { capture: true, passive: true }));
      this.tickHandle = setInterval(() => this.tick(), TICK_MS);
    });
    this.tick();
  }

  /** Deja de vigilar (al cerrar sesión). */
  stop(): void {
    ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, this.onActivity, { capture: true }));
    clearInterval(this.tickHandle);
    this.tickHandle = null;
    this.setState({ phase: 'inactive', remainingSeconds: 0 });
  }

  /** Registra actividad. `force` escribe aunque no haya pasado el intervalo mínimo (inicio de sesión, "Continuar"). */
  markActivity(force = false): void {
    const now = Date.now();
    if (!force && now - this.lastWrite < WRITE_THROTTLE_MS) {
      return;
    }
    this.lastWrite = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  }

  /** Milisegundos desde la última actividad registrada en cualquier pestaña. */
  idleMs(): number {
    const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
    return Date.now() - last;
  }

  /** ¿Hubo actividad dentro del tiempo máximo de inactividad? */
  isWithinIdleTimeout(): boolean {
    return this.timeoutMs > 0 && this.idleMs() < this.timeoutMs;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private tick(): void {
    if (!this.timeoutMs) {
      return;
    }
    const remaining = this.timeoutMs - this.idleMs();
    let next: SessionIdleState;
    if (remaining <= 0) {
      next = { phase: 'expired', remainingSeconds: 0 };
    } else if (remaining <= this.warningMs) {
      next = { phase: 'warning', remainingSeconds: Math.ceil(remaining / 1000) };
    } else {
      next = { phase: 'active', remainingSeconds: 0 };
    }
    this.setState(next);
  }

  private setState(next: SessionIdleState): void {
    const current = this.state$.value;
    if (current.phase === next.phase && current.remainingSeconds === next.remainingSeconds) {
      return;
    }
    this.zone.run(() => this.state$.next(next));
  }
}
