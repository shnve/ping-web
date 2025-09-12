import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import normalize from 'path-normalize';
import { EMPTY, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class ApiSanitizerInterceptor implements HttpInterceptor {

  private readonly codec = new HttpUrlEncodingCodec();

  constructor(private messageService: AlertMessageService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const urlWithParams = req.urlWithParams.replaceAll(' ', '%20')
      .replaceAll('%C3%A0', 'à')
      .replaceAll('%C3%A1', 'á')
      .replaceAll('%C3%A2', 'â')
      .replaceAll('%C3%A3', 'ã')
      .replaceAll('%C3%A4', 'ä')
      .replaceAll('%C3%A7', 'ç')
      .replaceAll('%C3%A8', 'è')
      .replaceAll('%C3%A9', 'é')
      .replaceAll('%C3%AA', 'ê')
      .replaceAll('%C3%AB', 'ë')
      .replaceAll('%C3%AC', 'ì')
      .replaceAll('%C3%AD', 'í')
      .replaceAll('%C3%AE', 'î')
      .replaceAll('%C3%AF', 'ï')
      .replaceAll('%C3%B2', 'ò')
      .replaceAll('%C3%B3', 'ó')
      .replaceAll('%C3%B4', 'ô')
      .replaceAll('%C3%B5', 'õ')
      .replaceAll('%C3%B6', 'ö')
      .replaceAll('%C3%B9', 'ù')
      .replaceAll('%C3%BA', 'ú')
      .replaceAll('%C3%BB', 'û')
      .replaceAll('%C3%BC', 'ü')
      .replaceAll('%C3%BD', 'ý')
      .replaceAll('%C3%BF', 'ÿ');
    const urlWithDecodedParams = this.codec.decodeKey(urlWithParams).replaceAll(' ', '%20');
    const normalizedParams = normalize(ApiSanitizerInterceptor.prepareUrl(urlWithDecodedParams)).replaceAll(' ', '%20');

    if (normalizedParams.indexOf('../') > -1  // path traversal
      || (normalizedParams.match(/\?/g) || []).length > 1   // too many '?'
      || urlWithParams !== urlWithDecodedParams   // encoded chars are present in url
      || ApiSanitizerInterceptor.prepareUrl(urlWithParams) !== normalizedParams) {  // we could still have a ./ different from ./assets
      this.messageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'malicious-request-cancelled'
      });
      console.error('Malicious request detected', urlWithParams)
      return EMPTY;
    }

    return next.handle(req);
  }

  private static prepareUrl(url: string): string {
    return url.replace('http://', '').replace('https://', '').replace('./assets', '');
  }
}