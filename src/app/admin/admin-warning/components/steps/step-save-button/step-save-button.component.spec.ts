import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { StepSaveButtonComponent } from './step-save-button.component';

describe('StepSaveButtonComponent', () => {
  let component: StepSaveButtonComponent;
  let fixture: ComponentFixture<StepSaveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepSaveButtonComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepSaveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit savePageButton', done => {
    // Given
    const spySavePageButton = spyOn(component.savePageButton, 'emit');

    // When
    component['save']();

    // Then
    expect(spySavePageButton).toHaveBeenCalled();
    done();
  });
});
