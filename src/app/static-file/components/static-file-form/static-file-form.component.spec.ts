import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StaticFileFormComponent } from './static-file-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileFormComponent', () => {
  let component: StaticFileFormComponent;
  let fixture: ComponentFixture<StaticFileFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticFileFormComponent],
    imports: [TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticFileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
