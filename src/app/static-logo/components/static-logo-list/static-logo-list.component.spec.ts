import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { StaticLogoListComponent } from './static-logo-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticLogoListComponent', () => {
  let component: StaticLogoListComponent;
  let fixture: ComponentFixture<StaticLogoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticLogoListComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticLogoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
