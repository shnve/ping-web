import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InfosourceFeaturePartFormComponent } from './infosource-feature-part-form.component';

describe('InfosourceFeaturePartFormComponent', () => {
  let component: InfosourceFeaturePartFormComponent;
  let fixture: ComponentFixture<InfosourceFeaturePartFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [InfosourceFeaturePartFormComponent],
      providers: [UntypedFormBuilder]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceFeaturePartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
