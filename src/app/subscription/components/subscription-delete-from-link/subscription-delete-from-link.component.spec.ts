import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { SubscriptionDeleteFromLinkComponent } from './subscription-delete-from-link.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateNamePipe } from '@shared/pipes/translate-name.pipe';

const SAMPLE_MARITIME_SERVICE = {
  id: "69a6e75d-4b15-41e6-a65a-dc739f8e7d36",
  name:"maritime service name",
  internationalName: "International Maritime service name"
};

describe('SubscriptionDeleteFromLinkComponent', () => {
  let component: SubscriptionDeleteFromLinkComponent;
  let fixture: ComponentFixture<SubscriptionDeleteFromLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
      SubscriptionDeleteFromLinkComponent,
      TranslateNamePipe
    ],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
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
    fixture = TestBed.createComponent(SubscriptionDeleteFromLinkComponent);
    component = fixture.componentInstance;

    component.maritimeService = SAMPLE_MARITIME_SERVICE;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
