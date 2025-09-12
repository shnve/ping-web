import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  readonly loadingSub$ = new BehaviorSubject<boolean>(false);

  toggleLoadingSpinner(status: boolean) {
    this.loadingSub$.next(status);
  }

  /**
   * Listen to the loadingSub property in the LoadingService class. This drives the
   * display of the loading spinner.
   */
  public listenToLoading(elemRef: ElementRef): Subscription {
    return this.loadingSub$
      //.pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent totalRequests
      .subscribe(loading => this.showLoadingSpinner(elemRef, loading));
  }

  public showLoadingSpinner(elemRef: ElementRef, show = true): void {
    if (elemRef) {
      setTimeout(() => {
        if (show) {
          elemRef.nativeElement.classList.add('spinner', 'disabled');
        } else {
          elemRef.nativeElement.classList.remove('spinner', 'disabled');
        }
      }, environment.loadingSpinnerTimeout);
    }
  }

  public hideLoadingSpinner(elemRef: ElementRef): void {
    this.showLoadingSpinner(elemRef, false);
  }
}
