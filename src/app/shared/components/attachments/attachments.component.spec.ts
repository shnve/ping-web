import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { AttachmentsComponent } from './attachments.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

xdescribe('AttachmentsComponent', () => {
  let component: AttachmentsComponent;
  let fixture: ComponentFixture<AttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AttachmentsComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
