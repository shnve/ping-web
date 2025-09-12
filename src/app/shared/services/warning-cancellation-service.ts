import { Injectable } from '@angular/core';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { WarningsFacade } from '@app/facades/admin/warnings.facade';
import { Serie, SerieType } from '@app/models/serie.model';
import { WarningReferenceCategoryEnum } from '@app/models/warning.model';
import { isLocalNavigationalWarning, isNavareaOrCoastalWarning, isNoticeOrNoticeTpFromSerieType } from '@shared/warning-utils';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export const CHOICE_CREATE_REPLACEMENT_NOTICE = 'createReplacementNotice';
export const CHOICE_CANCEL_WARNING = 'cancelWarning';

export enum CancellationWorkflow {
  NAVAREA_OR_COASTAL_WARNING = 'NAVAREA_OR_COASTAL_WARNING',
  LOCAL_NAVIGATIONAL_WARNING = 'LOCAL_NAVIGATIONAL_WARNING',
  NOTICE_OR_NOTICETP = 'NOTICE_OR_NOTICETP',
  DEFAULT = 'DEFAULT'
}

export interface WorkflowCreationSettings {
  shouldCreateCancellationWarning?: boolean,
  shouldCreateReplacementNotice?: boolean,
  cancellationChoice?: string
}

export interface WorkflowSelectionParams {
  workflowCreationSettings: WorkflowCreationSettings,
  cancellationWorkflow: CancellationWorkflow,
  warningId: string,
  serieId: string,
  serviceId: string
}

@Injectable({
  providedIn: 'root'
})
export class WarningCancellationService {

  private localNoticeToMarinerSerie: Serie;

  constructor(private readonly warningsAdminFacade: WarningsFacade,
    private readonly seriesAdminFacade: SeriesAdminFacade) { }

  getWorkflowFromSerieType(serieType: SerieType): CancellationWorkflow {
    if (isNavareaOrCoastalWarning(serieType)) {
      // prompt user to create cancellation warning with same serie
      return CancellationWorkflow.NAVAREA_OR_COASTAL_WARNING;
    } else if (isLocalNavigationalWarning(serieType)) {
      // prompt user to create cancellation warning with same serie OR to create replacement notice
      return CancellationWorkflow.LOCAL_NAVIGATIONAL_WARNING;
    } else if (isNoticeOrNoticeTpFromSerieType(serieType)) {
      // prompt user to create replacement warning with same serie
      return CancellationWorkflow.NOTICE_OR_NOTICETP;
    }
    return CancellationWorkflow.DEFAULT;
  }

  runWorkflow$(workflowSelectionParams: WorkflowSelectionParams): Observable<string> {
    const warningId = workflowSelectionParams.warningId;
    const workflow = workflowSelectionParams.cancellationWorkflow;
    switch (workflow) {
      case CancellationWorkflow.LOCAL_NAVIGATIONAL_WARNING:
        if (workflowSelectionParams.workflowCreationSettings.cancellationChoice === CHOICE_CANCEL_WARNING) {
          return this.runDefaultWorkflow$(warningId);
        } else {
          const shouldCreateReplacementNotice = CHOICE_CREATE_REPLACEMENT_NOTICE === workflowSelectionParams.workflowCreationSettings.cancellationChoice;
          this.updateWorkflowSelectionParams(workflowSelectionParams,
            {
              shouldCreateCancellationWarning: !shouldCreateReplacementNotice,
              shouldCreateReplacementNotice,
              cancellationChoice: workflowSelectionParams.workflowCreationSettings.cancellationChoice
            });
          if (shouldCreateReplacementNotice) {
            return this.getLocalNoticeToMarinerSerie(workflowSelectionParams.serviceId)
              .pipe(
                map(() => workflowSelectionParams.serieId = this.localNoticeToMarinerSerie.id),
                switchMap(() => this.runWorkflowWithCreation$(workflowSelectionParams))
              );
          }
          return this.runWorkflowWithCreation$(workflowSelectionParams);
        }

      case CancellationWorkflow.NAVAREA_OR_COASTAL_WARNING:
      case CancellationWorkflow.NOTICE_OR_NOTICETP:
        return this.runWorkflowWithCreation$(workflowSelectionParams);

      default:
        return this.runDefaultWorkflow$(warningId);
    }
  }

  private getLocalNoticeToMarinerSerie(serviceId: string): Observable<Serie> {
    return this.seriesAdminFacade.getSeriesForCurrentService$(serviceId).pipe(
      map(series => this.localNoticeToMarinerSerie = series.find(serie => serie.type === SerieType.LOCAL_NOTICE_TO_MARINER))
    );
  }

  private updateWorkflowSelectionParams(workflowSelectionParams: WorkflowSelectionParams,
    { shouldCreateCancellationWarning = false, shouldCreateReplacementNotice = false }: WorkflowCreationSettings = {}) {
    workflowSelectionParams.workflowCreationSettings = { shouldCreateCancellationWarning, shouldCreateReplacementNotice };
  }

  private runDefaultWorkflow$(warningId: string): Observable<string> {
    return this.warningsAdminFacade.cancel$(warningId);
  }

  private runWorkflowWithCreation$(workflowSelectionParams: WorkflowSelectionParams): Observable<string> {
    if (workflowSelectionParams.workflowCreationSettings.shouldCreateCancellationWarning) {
      return this.warningsAdminFacade.clone$(
        workflowSelectionParams.warningId,
        workflowSelectionParams.serieId,
        WarningReferenceCategoryEnum.CANCELLATION);
    }
    if (workflowSelectionParams.workflowCreationSettings.shouldCreateReplacementNotice) {
      return this.warningsAdminFacade.clone$(
        workflowSelectionParams.warningId,
        workflowSelectionParams.serieId,
        WarningReferenceCategoryEnum.REPLACEMENT);
    }
    return this.runDefaultWorkflow$(workflowSelectionParams.warningId);
  }
}
