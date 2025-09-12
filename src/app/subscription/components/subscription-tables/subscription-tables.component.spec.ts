import { SubscriptionTablesComponent } from '@app/subscription/components/subscription-tables/subscription-tables.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { ConfirmationService } from 'primeng/api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('SubscriptionTablesComponent', () => {
  let component: SubscriptionTablesComponent;
  let fixture: ComponentFixture<SubscriptionTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubscriptionTablesComponent],
      imports: [TranslateModule.forRoot(),
        RouterModule.forRoot([])],
      providers: [
        PermissionsProvider,
        ConfirmationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init appropriate table columns if user is pro', () => {
    // When
    const warningColumns: any[] = SubscriptionTablesComponent['getWarningColumns'](true);

    //Then
    expect(warningColumns.length).toEqual(5);
  });
});
