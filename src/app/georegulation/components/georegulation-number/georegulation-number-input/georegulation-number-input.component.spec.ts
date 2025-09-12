import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeoregulationFormatNumberPipe } from '@app/georegulation/pipes/georegulation-format-number.pipe';
import { TranslateInPipe } from '@app/shared/pipes/translateIn.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationNumberInputComponent } from './georegulation-number-input.component';

describe('GeoregulationNumberInputComponent', () => {
  let component: GeoregulationNumberInputComponent;
  let fixture: ComponentFixture<GeoregulationNumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [GeoregulationNumberInputComponent, GeoregulationFormatNumberPipe],
      providers: [TranslateInPipe, GeoregulationFormatNumberPipe]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
