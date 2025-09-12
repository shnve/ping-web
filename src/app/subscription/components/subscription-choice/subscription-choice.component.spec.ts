import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { SubscriptionChoiceComponent } from './subscription-choice.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SubscriptionChoiceComponent', () => {
  let component: SubscriptionChoiceComponent;
  let fixture: ComponentFixture<SubscriptionChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SubscriptionChoiceComponent],
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
    fixture = TestBed.createComponent(SubscriptionChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
