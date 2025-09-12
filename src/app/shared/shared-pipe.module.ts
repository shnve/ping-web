import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FolderFormatArrayReferencePipe } from '@app/folder/pipes/folder-format-array-reference.pipe';
import { FolderFormatReferenceTypeLabelPipe } from '@app/folder/pipes/folder-format-reference-type-label.pipe';
import { InfosourceFormatDateRangePipe } from '@app/infosource/pipes/infosource-format-date-range.pipe';
import { InfosourcePartFormatDetailsModalObjectSortPipe } from '@app/infosource/pipes/infosource-part-format-details-modal-object-sort.pipe';
import { InfosourcePartFormatDetailsModalObjectPipe } from '@app/infosource/pipes/infosource-part-format-details-modal-object.pipe';
import { FormatDatePipe } from '@app/shared/pipes/format-date.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { MapHasContentPipe } from '@app/shared/pipes/map-has-content.pipe';
import { SafeHtmlPipe } from '@app/shared/pipes/safe-html.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FormatDateRangePipe } from '@shared/pipes/format-date-range.pipe';
import { FormatDatetimePipe } from '@shared/pipes/format-datetime.pipe';
import { FormatFeaturePartDetailsPipe } from '@shared/pipes/format-feature-part-details.pipe';
import { FormatLocalizedTextPipe } from '@shared/pipes/format-localized-text.pipe';
import { FormatTypeDetailsPipe } from '@shared/pipes/format-type-details.pipe';
import { FormatWarningNumberPipe } from '@shared/pipes/format-warning-number.pipe';
import { FormatWarningTitlePipe } from '@shared/pipes/format-warning-title.pipe';
import { TranslateInPipe } from '@shared/pipes/translateIn.pipe';
import { WarningStateSeverityPipe } from '@shared/pipes/warning-state-severity.pipe';
import { CapitalizeFirstPipe } from './pipes/capitalize-first.pipe';
import { FormatAttachmentFileSizePipe } from './pipes/format-attachment-file-size.pipe';
import { FormatMonthPipe } from './pipes/format-month.pipe';
import { FormatReferenceHeaderPipe } from './pipes/format-reference-header.pipe';
import { FormatStaticPageTitlePipe } from './pipes/format-static-page-title.pipe';
import { FormatSurveyFeatureDataPipe } from './pipes/format-survey-feature-data.pipe';
import { FormatTypeGeneralPipe } from './pipes/format-type-general.pipe';
import { FormatWarningsNumberToCancelPipe } from './pipes/format-warnings-number-to-cancel.pipe';
import { GetNumberForSearchedPartPipe } from './pipes/get-number-for-searched-part.pipe';
import { HasGeometriesPipe } from './pipes/has-geometries.pipe';
import { KeyValueNoSortPipe } from './pipes/keyvalue-no-sort.pipe';
import { ReplacePipe } from './pipes/replace.pipe';
import { SliceWithEllipsisPipe } from './pipes/slice-with-ellipsis.pipe';
import { TranslateNamePipe } from './pipes/translate-name.pipe';
import { TranslateStatusPipe } from './pipes/translate-status.pipe';

@NgModule({
  declarations: [
    WarningStateSeverityPipe,
    FormatDateRangePipe,
    FormatFeaturePartDetailsPipe,
    FormatTypeDetailsPipe,
    FormatLocalizedTextPipe,
    FormatWarningNumberPipe,
    FormatWarningsNumberToCancelPipe,
    FormatTypeGeneralPipe,
    FormatReferenceHeaderPipe,
    FormatWarningTitlePipe,
    FormatDatePipe,
    FormatDatetimePipe,
    LocalizedDatePipe,
    MapHasContentPipe,
    TranslateInPipe,
    SafeHtmlPipe,
    FormatStaticPageTitlePipe,
    CapitalizeFirstPipe,
    KeyValueNoSortPipe,
    TranslateNamePipe,
    SliceWithEllipsisPipe,
    FormatMonthPipe,
    HasGeometriesPipe,
    GetNumberForSearchedPartPipe,
    TranslateStatusPipe,
    FormatAttachmentFileSizePipe,
    ReplacePipe,
    FormatSurveyFeatureDataPipe,
    FolderFormatReferenceTypeLabelPipe,
    FolderFormatArrayReferencePipe
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild()
  ],
  exports: [
    WarningStateSeverityPipe,
    FormatDateRangePipe,
    FormatFeaturePartDetailsPipe,
    FormatTypeDetailsPipe,
    FormatLocalizedTextPipe,
    FormatWarningNumberPipe,
    FormatWarningsNumberToCancelPipe,
    FormatTypeGeneralPipe,
    HasGeometriesPipe,
    TranslateStatusPipe,
    GetNumberForSearchedPartPipe,
    FormatReferenceHeaderPipe,
    FormatWarningTitlePipe,
    FormatDatePipe,
    FormatDatetimePipe,
    LocalizedDatePipe,
    MapHasContentPipe,
    TranslateInPipe,
    SafeHtmlPipe,
    FormatStaticPageTitlePipe,
    CapitalizeFirstPipe,
    KeyValueNoSortPipe,
    TranslateNamePipe,
    SliceWithEllipsisPipe,
    FormatMonthPipe,
    FormatAttachmentFileSizePipe,
    ReplacePipe,
    FormatSurveyFeatureDataPipe,
    FolderFormatReferenceTypeLabelPipe,
    FolderFormatArrayReferencePipe
  ],
  providers: [
    FormatDatetimePipe,
    FormatWarningNumberPipe,
    FormatWarningsNumberToCancelPipe,
    FormatTypeGeneralPipe,
    HasGeometriesPipe,
    TranslateStatusPipe,
    GetNumberForSearchedPartPipe,
    FormatReferenceHeaderPipe,
    FormatWarningTitlePipe,
    FormatFeaturePartDetailsPipe,
    FormatLocalizedTextPipe,
    FormatDateRangePipe,
    FormatDatePipe,
    LocalizedDatePipe,
    MapHasContentPipe,
    FormatStaticPageTitlePipe,
    CapitalizeFirstPipe,
    TranslateInPipe,
    KeyValueNoSortPipe,
    InfosourcePartFormatDetailsModalObjectPipe,
    InfosourcePartFormatDetailsModalObjectSortPipe,
    InfosourceFormatDateRangePipe,
    TranslateNamePipe,
    SliceWithEllipsisPipe,
    FormatMonthPipe,
    FormatAttachmentFileSizePipe,
    ReplacePipe,
    FormatSurveyFeatureDataPipe,
    FolderFormatReferenceTypeLabelPipe
  ]
})
export class SharedPipeModule { }
