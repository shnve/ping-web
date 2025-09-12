import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StaticLogoFormComponent } from './static-logo-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticLogoFormComponent', () => {
  let component: StaticLogoFormComponent;
  let fixture: ComponentFixture<StaticLogoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticLogoFormComponent],
    imports: [TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticLogoFormComponent);
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

  it('should checkHeightWithUnit if in range', done => {
    // Given
    // When
    const result = StaticLogoFormComponent.validateHeightWithUnit('150px');

    // Then
    expect(result).toBeNull();
    done();
  });

  it('should not validate checkHeightWithUnit if below min range', done => {
    // Given
    // When
    const result = StaticLogoFormComponent.validateHeightWithUnit('2px');

    // Then
    expect(result).toEqual({ outOfRange: true });
    done();
  });

  it('should not validate checkHeightWithUnit if above max range', done => {
    // Given
    // When
    const result = StaticLogoFormComponent.validateHeightWithUnit('501px');

    // Then
    expect(result).toEqual({ outOfRange: true });
    done();
  });

  it('should not validate checkHeightWithUnit if only spaces', done => {
    // Given
    // When
    const result = StaticLogoFormComponent.validateHeightWithUnit('    ');

    // Then
    expect(result).toEqual({ required: true });
    done();
  });
});
