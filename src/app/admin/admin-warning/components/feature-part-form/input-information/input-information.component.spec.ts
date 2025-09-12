import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateInPipe } from '@shared/pipes/translateIn.pipe';
import { of } from 'rxjs';
import { InputInformationComponent } from './input-information.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InputInformationComponent', () => {
  let component: InputInformationComponent;
  let fixture: ComponentFixture<InputInformationComponent>;
  let translateInPipe: TranslateInPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InputInformationComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        TranslateInPipe,
        PermissionsProvider,
        CapitalizeFirstPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    translateInPipe = TestBed.inject(TranslateInPipe);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add type expression in text area EN or FR', () => {
    // Given
    const langs = ['en', 'fr'];
    const translate = {
      'en': { path: 'enum.warning-part-type-expression.IN_PROGRESS', translatePath: 'in progress' },
      'fr': { path: 'enum.warning-part-type-expression.UNTIL_FURTHER_NOTICE', translatePath: 'Until further notice' },
    };

    let spyTranslateInPipe = spyOn(translateInPipe, 'transform');
    let spyUpdateInformation = spyOn<any>(component, 'updateInformation');

    langs.forEach((key, index) => {
      component.selectedTypeExpression = { type: translate[key].path.split('.')[2], pathTypeExpression: translate[key].path };

      spyTranslateInPipe.and.returnValue(of(translate[key].translatePath));

      spyUpdateInformation.and.callThrough();

      // When
      component.addTypeExpression(key);

      // Then
      expect(component.addInformationButtonStatuses).toContain(`typeExpression-${key}-${component.partIndex}`);
      expect(spyUpdateInformation).toHaveBeenCalled();
      expect(component.information[key]).toContain(translate[key].translatePath);
    });
  });

  it('should check AN information is valid', done => {
    // Given
    const langs = ['en', 'fr'];
    const samples = [[' ', 'test WL'], [' ', ' '], ['test WL', 'test WL'], ['   ', '   ']]
    const results = [[true, false], [true, true], [false, false], [true, true]]
    let spyIsInvalidInformation = spyOn<any>(component, 'containsNonEmptyInformation');
    spyIsInvalidInformation.and.callThrough();

    samples.forEach((sample, index) => {
      // When
      component.information[langs[0]] = sample[0];
      // Then
      expect(component['containsNonEmptyInformation'](langs[0])).toEqual(results[index][0]);

      // When
      component.information[langs[1]] = sample[1];
      // Then
      expect(component['containsNonEmptyInformation'](langs[1])).toEqual(results[index][1]);
    })

    done();
  });
});
