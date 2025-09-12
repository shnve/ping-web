import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { InfosourceFormatInformationPipe } from '@app/infosource/pipes/infosource-format-information.pipe';
import { SharedPipeModule } from '@app/shared/shared-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { DataViewModule } from 'primeng/dataview';

import { WarningDetailTableComponent } from './warning-detail-table.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WarningDetailTableComponent', () => {
  let component: WarningDetailTableComponent;
  let fixture: ComponentFixture<WarningDetailTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WarningDetailTableComponent],
    imports: [TranslateModule.forRoot(),
        DataViewModule,
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
    fixture = TestBed.createComponent(WarningDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
