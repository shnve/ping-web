import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateInPipe } from '@app/shared/pipes/translateIn.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { CreationService } from '../../services/creation.service';

import { FeaturePartFormComponent } from './feature-part-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FeaturePartFormComponent', () => {
  let component: FeaturePartFormComponent;
  let fixture: ComponentFixture<FeaturePartFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FeaturePartFormComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        UntypedFormBuilder,
        CreationService,
        PermissionsProvider,
        TranslateInPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturePartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
