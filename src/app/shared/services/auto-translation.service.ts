import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * PISAC (18-nov-2026): propuesta de traducción automática (LibreTranslate propio, `POST /admin-api/translation`).
 * La traducción es una propuesta: el operador la revisa antes de guardar.
 */
@Injectable({
  providedIn: 'root'
})
export class AutoTranslationService {

  /** Pares admitidos por el servicio (el contenedor carga solo es y en). */
  static readonly SUPPORTED = ['es', 'en'];

  private readonly url = `${environment.baseAdminApiUrl}translation`;

  constructor(private readonly http: HttpClient) { }

  static canTranslate(source: string, target: string): boolean {
    return !!source && !!target && source !== target
      && AutoTranslationService.SUPPORTED.includes(source?.toLowerCase())
      && AutoTranslationService.SUPPORTED.includes(target?.toLowerCase());
  }

  translate$(text: string, source: string, target: string): Observable<string> {
    return this.http
      .post<{ text: string }>(this.url, { text, source: source.toLowerCase(), target: target.toLowerCase() })
      .pipe(map(response => response?.text ?? ''));
  }
}
