import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfosourceFormatListItemTitlePipe } from '@app/admin/admin-warning/pipes/infosource-format-list-item-title.pipe';
import { GlobalConstants } from '@app/global-constants';
import { InfosourceNature } from '@app/infosource/models/infosource.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { InfosourcesListItemComponent } from './infosources-list-item.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('InfosourcesListItemComponent', () => {
  let component: InfosourcesListItemComponent;
  let fixture: ComponentFixture<InfosourcesListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        InfosourcesListItemComponent,
        InfosourceFormatListItemTitlePipe,
        CapitalizeFirstPipe
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        LocalizedDatePipe,
        FormatDatetimePipe,
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourcesListItemComponent);
    component = fixture.componentInstance;
    component.infosource = {
      id: 'id',
      number: 'snoop_doggy_dog-01-2022',
      nature: InfosourceNature.OTHER_REPORT,
      creationDate: new Date(),
      lastUpdate: new Date(),
      validationTime: new Date(),
      timezone: GlobalConstants.USER_TIMEZONE,
      featureParts: [],
      attachments: [],
      issuingUserFirstname: 'firstname',
      issuingUserLastname: 'lastname',
      issuingServiceName: 'servicename'
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
