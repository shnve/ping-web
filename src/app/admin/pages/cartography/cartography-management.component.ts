import { HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription, timer } from 'rxjs';
import { delay, retryWhen, scan, switchMap, takeWhile } from 'rxjs/operators';
import { CARTOGRAPHY_BANDS, CartographyBand, CartographyFileItem, CartographyJob } from './models/cartography.model';
import { CartographyService } from './services/cartography.service';

@Component({
  selector: 'app-cartography-management',
  templateUrl: './cartography-management.component.html',
  styleUrls: ['./cartography-management.component.scss']
})
export class CartographyManagementComponent implements OnInit, OnDestroy {
  bands: CartographyBand[] = CARTOGRAPHY_BANDS;
  selectedBand: CartographyBand = CARTOGRAPHY_BANDS[3]; // Default to Banda 4 (Aproximación)
  autoReloadGeoServer: boolean = true;
  isDraggingOver: boolean = false;
  isProcessingBatch: boolean = false;

  fileQueue: CartographyFileItem[] = [];
  selectedFilesCount: number = 0;
  totalSizeMb: number = 0;

  activeSubscriptions: Map<string, Subscription> = new Map();
  private destroy$ = new Subject<void>();

  // Resumen de estado de capas en GeoServer
  bandsStatus: { [band: string]: { active: boolean; fileCount: number; reloading?: boolean } } = {
    banda1: { active: true, fileCount: 0 },
    banda2: { active: true, fileCount: 0 },
    banda3: { active: true, fileCount: 0 },
    banda4: { active: true, fileCount: 0 },
    banda5: { active: true, fileCount: 0 },
    banda6: { active: true, fileCount: 0 }
  };

  constructor(
    private readonly cartographyService: CartographyService,
    private readonly alertService: AlertMessageService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.refreshBandsStatus();
  }

  ngOnDestroy(): void {
    this.activeSubscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshBandsStatus(): void {
    this.cartographyService.getLayersStatus$().subscribe({
      next: res => {
        if (res) {
          Object.keys(res).forEach(k => {
            if (this.bandsStatus[k]) {
              this.bandsStatus[k] = { ...this.bandsStatus[k], ...res[k] };
            }
          });
        }
      },
      error: () => {
        // En desarrollo local o antes de que el endpoint esté activo, se mantiene el estado inicial
      }
    });
  }

  // --- Manejo de Drag and Drop ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files) {
      this.handleFileList(event.dataTransfer.files);
    }
  }

  onFileInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFileList(target.files);
      target.value = ''; // Reset input to allow selecting same file again
    }
  }

  private handleFileList(fileList: FileList): void {
    const validExtensions = ['.pdf', '.tif', '.tiff'];
    let rejectedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const lowerName = file.name.toLowerCase();
      const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));

      if (!hasValidExt) {
        rejectedCount++;
        continue;
      }

      // Evitar duplicados por nombre
      if (this.fileQueue.some(item => item.name === file.name)) {
        continue;
      }

      const format: 'pdf' | 'tiff' = lowerName.endsWith('.pdf') ? 'pdf' : 'tiff';
      const newItem: CartographyFileItem = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        format,
        targetBand: this.selectedBand.id,
        status: 'QUEUED',
        progress: 0,
        message: 'Listo para procesar'
      };

      this.fileQueue.push(newItem);
    }

    this.recalculateQueueStats();

    if (rejectedCount > 0) {
      this.showError(
        'Formatos no admitidos',
        `Se descartaron ${rejectedCount} archivo(s). Formatos válidos: .pdf, .tif, .tiff`
      );
    }
  }

  recalculateQueueStats(): void {
    this.selectedFilesCount = this.fileQueue.length;
    const totalBytes = this.fileQueue.reduce((acc, curr) => acc + curr.size, 0);
    this.totalSizeMb = Math.round((totalBytes / (1024 * 1024)) * 10) / 10;
  }

  removeFile(item: CartographyFileItem): void {
    const sub = this.activeSubscriptions.get(item.id);
    if (sub) {
      sub.unsubscribe();
      this.activeSubscriptions.delete(item.id);
    }
    this.fileQueue = this.fileQueue.filter(f => f.id !== item.id);
    this.recalculateQueueStats();
  }

  clearQueue(): void {
    this.activeSubscriptions.forEach(sub => sub.unsubscribe());
    this.activeSubscriptions.clear();
    this.fileQueue = [];
    this.isProcessingBatch = false;
    this.recalculateQueueStats();
  }

  // --- Procesamiento de archivos ---
  // La carta se sube y el servidor la procesa en segundo plano; aquí se consulta el avance del trabajo
  // cada pocos segundos. Así una conversión larga no termina en un 504 del proxy aunque siga procesándose.
  processFile(item: CartographyFileItem): void {
    if (this.isItemWorking(item)) {
      return;
    }

    item.status = 'UPLOADING';
    item.progress = 5;
    item.message = 'Iniciando subida...';

    const sub = this.cartographyService
      .submitJob$(item.file, item.targetBand, this.autoReloadGeoServer)
      .subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Progreso de subida representa el 0% - 40%
            const uploadPercent = Math.round((event.loaded / event.total) * 40);
            item.progress = Math.max(5, uploadPercent);
            item.message = `Subiendo al servidor (${Math.round((event.loaded / (1024 * 1024)) * 10) / 10} MB / ${Math.round((event.total / (1024 * 1024)) * 10) / 10} MB)...`;
          } else if (event.type === HttpEventType.Response && event.body) {
            this.trackJob(item, event.body);
          }
        },
        error: err => this.failItem(item, err?.error?.message || err?.message || 'Error de conexión con el servidor')
      });

    this.activeSubscriptions.set(item.id, sub);
  }

  /** Consulta el trabajo cada 3 s hasta que termine (tolera hasta 5 fallos de red seguidos). */
  private trackJob(item: CartographyFileItem, job: CartographyJob): void {
    this.applyJobState(item, job);
    if (job.status === 'SUCCESS' || job.status === 'ERROR') {
      this.completeItem(item, job);
      return;
    }

    const sub = timer(3000, 3000)
      .pipe(
        switchMap(() =>
          this.cartographyService.getJob$(job.jobId).pipe(
            retryWhen(errors =>
              errors.pipe(
                scan((count: number, e: unknown) => {
                  if (count >= 5) {
                    throw e;
                  }
                  return count + 1;
                }, 0),
                delay(3000)
              )
            )
          )
        ),
        takeWhile(j => j.status !== 'SUCCESS' && j.status !== 'ERROR', true)
      )
      .subscribe({
        next: j => {
          this.applyJobState(item, j);
          if (j.status === 'SUCCESS' || j.status === 'ERROR') {
            this.completeItem(item, j);
          }
        },
        error: err =>
          this.failItem(
            item,
            'Se perdió la conexión mientras se procesaba la carta. El servidor puede haberla publicado igual; ' +
              'revise el estado de la banda antes de reintentar. ' + (err?.message || '')
          )
      });

    this.activeSubscriptions.set(item.id, sub);
  }

  private applyJobState(item: CartographyFileItem, job: CartographyJob): void {
    switch (job.status) {
      case 'QUEUED':
        item.status = 'VALIDATING';
        item.progress = 45;
        item.message = 'En cola en el servidor (las cartas se procesan de a una)...';
        break;
      case 'VALIDATING':
        item.status = 'VALIDATING';
        item.progress = 50;
        item.message = 'Validando georreferenciación con GDAL...';
        break;
      case 'CONVERTING':
        item.status = 'CONVERTING';
        item.progress = 65;
        item.message = 'Convirtiendo a COG EPSG:3395 (las cartas grandes pueden tardar varios minutos)...';
        break;
      case 'PUBLISHING':
        item.status = 'DEPLOYING';
        item.progress = 90;
        item.message = 'Publicando en GeoServer y verificando el mapa...';
        break;
    }
  }

  private completeItem(item: CartographyFileItem, job: CartographyJob): void {
    const body = job.result;
    if (job.status === 'SUCCESS' && body) {
      item.status = 'SUCCESS';
      item.progress = 100;
      item.message = body.message || 'Mapa publicado con éxito en GeoServer';
      item.details = {
        srsDetected: body.srsDetected,
        isGeoreferenced: body.isGeoreferenced,
        convertedSize: body.convertedSizeBytes,
        processingTimeMs: body.processingTimeMs,
        pixelSize: body.pixelSize
      };
      this.showSuccess('Carta publicada', `Archivo ${item.name} convertido y publicado en ${item.targetBand}`);
      this.refreshBandsStatus();
      this.activeSubscriptions.delete(item.id);
      this.checkBatchNext();
    } else {
      this.failItem(item, body?.message || body?.error || 'Error durante el procesamiento');
      this.refreshBandsStatus();
    }
  }

  private failItem(item: CartographyFileItem, message: string): void {
    item.status = 'ERROR';
    item.progress = 0;
    item.message = message;
    this.showError('Error en el procesamiento', `${item.name}: ${message}`);
    this.activeSubscriptions.delete(item.id);
    this.checkBatchNext();
  }

  isItemWorking(item: CartographyFileItem): boolean {
    return ['UPLOADING', 'VALIDATING', 'CONVERTING', 'DEPLOYING'].includes(item.status);
  }

  processBatch(): void {
    if (this.fileQueue.length === 0) return;
    this.isProcessingBatch = true;
    this.checkBatchNext();
  }

  private checkBatchNext(): void {
    if (!this.isProcessingBatch) return;

    // Buscar el siguiente archivo en estado QUEUED
    const nextItem = this.fileQueue.find(f => f.status === 'QUEUED');
    if (nextItem) {
      this.processFile(nextItem);
    } else {
      // Verificar si todavía hay alguno en proceso
      const stillWorking = this.fileQueue.some(f => this.isItemWorking(f));
      if (!stillWorking) {
        this.isProcessingBatch = false;
        this.showInfo('Lote finalizado', 'Procesamiento del lote completado.');
      }
    }
  }

  // --- Recarga manual de capa en GeoServer ---
  reloadBand(band: CartographyBand): void {
    if (this.bandsStatus[band.id]) {
      this.bandsStatus[band.id].reloading = true;
    }

    this.cartographyService.reloadLayer$(band.id).subscribe({
      next: res => {
        if (this.bandsStatus[band.id]) {
          this.bandsStatus[band.id].reloading = false;
        }
        if (res.success) {
          this.showSuccess('Capa actualizada', `Capa ${band.code} (${band.layerName}) recargada exitosamente en GeoServer.`);
        } else {
          this.showError('Error de recarga', `No se pudo recargar ${band.code}: ${res.message}`);
        }
      },
      error: err => {
        if (this.bandsStatus[band.id]) {
          this.bandsStatus[band.id].reloading = false;
        }
        this.showError('GeoServer no disponible', err.message || 'Error desconocido');
      }
    });
  }

  // Helpers visuales
  getBandById(id: string): CartographyBand | undefined {
    return this.bands.find(b => b.id === id);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'UPLOADING':
      case 'VALIDATING':
      case 'CONVERTING':
      case 'DEPLOYING':
        return 'info';
      case 'ERROR':
        return 'danger';
      case 'QUEUED':
      default:
        return 'warning';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'Publicado (COG)';
      case 'UPLOADING':
        return 'Subiendo...';
      case 'VALIDATING':
        return 'Validando GeoPDF/TIFF';
      case 'CONVERTING':
        return 'Convirtiendo (3395)';
      case 'DEPLOYING':
        return 'Actualizando GeoServer';
      case 'ERROR':
        return 'Error / Rechazado';
      case 'QUEUED':
      default:
        return 'En espera';
    }
  }

  private showSuccess(summary: string, detail?: string): void {
    this.alertService.add({ severity: 'success', summary, detail });
  }

  private showError(summary: string, detail?: string): void {
    this.alertService.add({ severity: 'error', summary, detail });
  }

  private showInfo(summary: string, detail?: string): void {
    this.alertService.add({ severity: 'info', summary, detail });
  }
}
