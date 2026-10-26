import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { CartographyConversionResponse } from '../models/cartography.model';

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
