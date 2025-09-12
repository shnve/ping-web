import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { GeoregulationPartsListComponent } from './georegulation-parts-list.component';


describe('GeoregulationPartsListComponent', () => {
  let component: GeoregulationPartsListComponent;
  let fixture: ComponentFixture<GeoregulationPartsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoregulationPartsListComponent ],
      imports: [ TranslateModule.forRoot() ],
      providers: [ ConfirmationService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationPartsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
