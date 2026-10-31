import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoaderService } from '@app/sig/services/loader.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

const URL_NEED_TO_LISTENING: string[] = [
  '/wmts?',          // raster marine
  '/admin-api/warnings',
  '/admin-api/infosources/available-infosources-to-link?',
  '/admin-api/georegulations/available-georegulations-to-link?',
  '/admin-api/maritime-entities/available-entities-to-link?',
  '/admin-api/warnings/available-attachments-to-link-as-reference',
  environment.api.areas,
  environment.api.georegulations.map,
  environment.api.warnings.map,
  environment.adminApi.areas,
  environment.adminApi.series,
  environment.adminApi.maritimeServices,
  environment.carto.getWmsImage.url,  // secteurs
  environment.carto.getWmsImage.url,  // raster marine
];

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;
  constructor(private readonly loadingService: LoaderService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!URL_NEED_TO_LISTENING.some((urlListened: string) => request.url.includes(urlListened))) {
      return next.handle(request);
    }
    this.totalRequests++;
    this.loadingService.toggleLoadingSpinner(true);
    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests < 1) {
          this.loadingService.toggleLoadingSpinner(false);
        }
      })
    );
  }
}
