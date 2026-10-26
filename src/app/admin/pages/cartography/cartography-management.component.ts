import { HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { CARTOGRAPHY_BANDS, CartographyBand, CartographyFileItem } from './models/cartography.model';
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
  processFile(item: CartographyFileItem): void {
    if (item.status === 'UPLOADING' || item.status === 'CONVERTING') {
      return;
    }

    item.status = 'UPLOADING';
    item.progress = 5;
    item.message = 'Iniciando subida y validación...';

    const sub = this.cartographyService
      .uploadAndConvert$(item.file, item.targetBand, this.autoReloadGeoServer)
      .subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Progreso de subida representa el 0% - 40%
            const uploadPercent = Math.round((event.loaded / event.total) * 40);
            item.progress = Math.max(5, uploadPercent);
            item.message = `Subiendo al servidor (${Math.round((event.loaded / (1024 * 1024)) * 10) / 10} MB / ${Math.round((event.total / (1024 * 1024)) * 10) / 10} MB)...`;
            if (uploadPercent >= 40) {
              item.status = 'CONVERTING';
              item.progress = 60;
              item.message = 'Ejecutando gdalwarp y conversión a COG EPSG:3395...';
            }
          } else if (event.type === HttpEventType.Response) {
            const body = event.body;
            if (body && body.success) {
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
              this.showSuccess('Conversión exitosa', `Archivo ${item.name} convertido y publicado en ${item.targetBand}`);
              this.refreshBandsStatus();
            } else {
              item.status = 'ERROR';
              item.progress = 0;
              item.message = body?.error || body?.message || 'Error durante la conversión';
              this.showError('Error en conversión', `${item.name}: ${item.message}`);
            }
            this.activeSubscriptions.delete(item.id);
            this.checkBatchNext();
          }
        },
        error: err => {
          item.status = 'ERROR';
          item.progress = 0;
          const errMsg = err?.error?.message || err?.message || 'Error de conexión con el servidor';
          item.message = errMsg;
          this.showError('Fallo en procesamiento', `${item.name}: ${errMsg}`);
          this.activeSubscriptions.delete(item.id);
          this.checkBatchNext();
        }
      });

    this.activeSubscriptions.set(item.id, sub);
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
      const stillWorking = this.fileQueue.some(f => f.status === 'UPLOADING' || f.status === 'CONVERTING');
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
