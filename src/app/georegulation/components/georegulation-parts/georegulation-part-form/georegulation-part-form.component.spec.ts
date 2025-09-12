import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { GeoregulationPartRestrictionVessel, GeoregulationPartUnitGrossTonnage } from '@app/georegulation/models/georegulation.model';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationPartFormComponent } from './georegulation-part-form.component';


describe('GeoregulationPartFormComponent', () => {
  let component: GeoregulationPartFormComponent;
  let fixture: ComponentFixture<GeoregulationPartFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [GeoregulationPartFormComponent],
      providers: [UntypedFormBuilder]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationPartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default values for choiceLengthVessel', done => {
    // Given
    const eventMock = new Event('change',);
    const spyInitRestriction = spyOn(component, 'choiceRestrictionUpdate').withArgs(eventMock).and.callThrough();

    // Expected initial Values
    expect(component.choiceLengthVessel.value).toBe(null);

    // When
    component.form.get('lengthVessel').setValue('12');
    let inputLengthVessel = fixture.nativeElement.querySelector('#lengthVessel')
    inputLengthVessel.dispatchEvent(eventMock);

    // Then
    expect(spyInitRestriction).toHaveBeenCalled()
    expect(component.choiceLengthVessel.value).toBe(GeoregulationPartRestrictionVessel.GREATER_OR_EQUAL);

    done()
  });

  it('should set default values for choiceGrossTonnage and unitsGrossTonnageVessel', done => {
    // Given
    const eventMock = new Event('change',);
    const spyInitRestriction = spyOn(component, 'choiceRestrictionUpdate').withArgs(eventMock).and.callThrough();

    // Expected initial Values
    expect(component.choiceGrossTonnageVessel.value).toBe(null);
    expect(component.unitsGrossTonnageVessel.value).toBe(null);

    // When
    component.form.get('grossTonnageVessel').setValue('12');
    let inputLengthVessel = fixture.nativeElement.querySelector('#grossTonnageVessel')
    inputLengthVessel.dispatchEvent(eventMock);

    // Then
    expect(spyInitRestriction).toHaveBeenCalled()
    expect(component.choiceGrossTonnageVessel.value).toBe(GeoregulationPartRestrictionVessel.GREATER_OR_EQUAL);
    expect(component.unitsGrossTonnageVessel.value).toBe(GeoregulationPartUnitGrossTonnage.UMS);

    done()
  });
});
