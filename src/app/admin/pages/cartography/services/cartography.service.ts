import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { CartographyConversionResponse, CartographyJob } from '../models/cartography.model';

@Injectable({
  providedIn: 'root'
})
export class CartographyService {
  private readonly baseUrl = environment.baseAdminApiUrl + 'cartography';

  constructor(private readonly http: HttpClient) {}

  /**
   * Envía un archivo cartográfico (GeoPDF o TIFF) para su procesamiento y conversión a COG EPSG:3395.
   * Emite eventos HttpEvent para permitir reportar el progreso de subida.
   */
  uploadAndConvert$(file: File, band: string, reloadGeoserver: boolean = true): Observable<HttpEvent<CartographyConversionResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('band', band);
    formData.append('reloadGeoserver', String(reloadGeoserver));

    return this.http.post<CartographyConversionResponse>(
      `${this.baseUrl}/upload-and-convert`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  /**
   * Envía una carta para procesarla en segundo plano. La respuesta llega apenas termina la subida e incluye el
   * trabajo (jobId) cuyo avance se consulta con getJob$. Emite HttpEvent para informar el progreso de subida.
   */
  submitJob$(file: File, band: string, reloadGeoserver: boolean = true): Observable<HttpEvent<CartographyJob>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('band', band);
    formData.append('reloadGeoserver', String(reloadGeoserver));

    return this.http.post<CartographyJob>(`${this.baseUrl}/jobs`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  /** Consulta el estado de un trabajo de procesamiento de carta. */
  getJob$(jobId: string): Observable<CartographyJob> {
    return this.http.get<CartographyJob>(`${this.baseUrl}/jobs/${jobId}`);
  }

  /**
   * Solicita a GeoServer recargar / re-indexar la capa de mosaico para una banda específica.
   */
  reloadLayer$(band: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/reload-layer`,
      { band }
    );
  }

  /**
   * Consulta el estado de las capas raster y archivos COG disponibles por banda.
   */
  getLayersStatus$(): Observable<{ [band: string]: { active: boolean; fileCount: number; lastModified?: string } }> {
    return this.http.get<{ [band: string]: { active: boolean; fileCount: number; lastModified?: string } }>(
      `${this.baseUrl}/layers-status`
    );
  }
}
