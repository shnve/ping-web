import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { SurveyCoordinatesOrder, SurveyVerticalRef, SurveyZDirection } from '@app/survey/models/survey.model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedSurveyBathyMetadataDescriptionComponent } from './shared-survey-bathy-metadata-description.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SharedSurveyBathyMetadataDescriptionComponent', () => {
  let component: SharedSurveyBathyMetadataDescriptionComponent;
  let fixture: ComponentFixture<SharedSurveyBathyMetadataDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SharedSurveyBathyMetadataDescriptionComponent],
    imports: [TranslateModule.forRoot()],
    providers: [UntypedFormBuilder, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(SharedSurveyBathyMetadataDescriptionComponent);
    component = fixture.componentInstance;
    component.survey = {
      geographicFormat: true,
      epsg: 'epsg',
      coordinatesOrder: SurveyCoordinatesOrder.LAT_LONG_Z,
      directionZ: SurveyZDirection.ALTITUDE,
      verticalRef: SurveyVerticalRef.INSTANT_SEA_LEVEL,
      fileSeparator: '#'
    };
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    (component as any).onTouched();
    (component as any).onChange();
    done();
  });

  it('should register the onChange function', done => {
    const fn = () => {};
    component.registerOnChange(fn);
    expect((component as any).onChange).toBe(fn);
    done();
  });

  it('should register the onTouch function', done => {
    const fn = () => {};
    component.registerOnTouched(fn);
    expect((component as any).onTouched).toBe(fn);
    done();
  });

  it('should write a value', () => {
    const newValue = {
      geographicFormat: true,
      epsg: 'epsg2',
      coordinatesOrder: SurveyCoordinatesOrder.LAT_LONG_Z,
      directionZ: SurveyZDirection.ALTITUDE,
      verticalRef: SurveyVerticalRef.INSTANT_SEA_LEVEL,
      fileSeparator: '#'
    };

    component.writeValue(newValue);

    expect(component.survey).toEqual(newValue);
  });

  it('should not write a value when null', () => {
    const oldValue = {
      geographicFormat: true,
      epsg: 'epsg',
      coordinatesOrder: SurveyCoordinatesOrder.LAT_LONG_Z,
      directionZ: SurveyZDirection.ALTITUDE,
      verticalRef: SurveyVerticalRef.INSTANT_SEA_LEVEL,
      fileSeparator: '#'
    };

    component.writeValue(null);

    expect(component.survey).toEqual(oldValue);
  });

  it('should call initForm on init', done => {
    spyOn((component as any), 'initForm');
    component.ngOnInit();
    expect((component as any).initForm).toHaveBeenCalled();
    done();
  });

  it('should init form', done => {
    (component as any).initForm();
    expect((component as any).form).toBeTruthy();
    expect(component.geographicFormat.value).toEqual(true);
    expect(component.epsg.value).toEqual('epsg');
    expect(component.coordinatesOrder.value).toEqual(SurveyCoordinatesOrder.LAT_LONG_Z);
    expect(component.directionZ.value).toEqual(SurveyZDirection.ALTITUDE);
    expect(component.verticalRef.value).toEqual(SurveyVerticalRef.INSTANT_SEA_LEVEL);
    expect(component.fileSeparator.value).toEqual('#');
    done();
  });
});
