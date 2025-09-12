import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {WarningTableComponent} from './warning-table.component';
import {TranslateModule} from '@ngx-translate/core';
import {TableWarning} from '../../../models/warning.model';
import {TableModule} from 'primeng/table';
import {FormatWarningTitlePipe} from '@shared/pipes/format-warning-title.pipe';
import {FormatWarningNumberPipe} from '@shared/pipes/format-warning-number.pipe';
import { FormatFeaturePartDetailsPipe } from '@app/shared/pipes/format-feature-part-details.pipe';
import { FormatLocalizedTextPipe } from '@app/shared/pipes/format-localized-text.pipe';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { InfosourceFormatInformationPipe } from '@app/infosource/pipes/infosource-format-information.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WarningTableComponent', () => {
  let component: WarningTableComponent<TableWarning>;
  let fixture: ComponentFixture<WarningTableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        WarningTableComponent,
        FormatWarningNumberPipe,
        FormatWarningTitlePipe,
        FormatFeaturePartDetailsPipe,
        FormatLocalizedTextPipe
    ],
    imports: [TranslateModule.forRoot(),
        TableModule,
        SharedPipeModule],
    providers: [
        WarningTableFacade,
        InfosourceFormatInformationPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit change page event', () => {
    // Given
    const spyOnPageChange = spyOn(component.onPageChange, 'emit').and.stub();

    // When
    component.pageChange({first: 20, rows: 10});

    // Expect
    expect(spyOnPageChange).toHaveBeenCalledOnceWith({
      page: 2,
      rows: 10
    });
  });

  it('should emit select warning event on click on a row', fakeAsync(() => {
    // Given
    const warning: TableWarning = {
      id: '1',
      warningNumber: 1001,
      localities: {},
      generalAreas: {fr : ['General Area']},
      nameOfSeries: 'serie1',
      year: 21,
      warningTypeDetails: '',
      warningHazardTypeGeneral: '',
      publicationTime: new Date()
    };

    component.items = [warning];
    fixture.detectChanges();
    const spyOnModelItemSelect = spyOn(component.onModelItemSelect, 'emit').and.stub();

    // When
    const rows = fixture.debugElement.nativeElement.querySelectorAll('p-table tr');
    // Click on first row, after thead
    rows[1].click();
    tick();

    // Expect
    expect(spyOnModelItemSelect).toHaveBeenCalledWith(warning);
  }));
});
