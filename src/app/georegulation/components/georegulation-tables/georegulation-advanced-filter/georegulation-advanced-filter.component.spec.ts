import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GeoregulationAdvancedFilterComponent } from './georegulation-advanced-filter.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('GeoregulationAdvancedFilterComponent', () => {
  let component: GeoregulationAdvancedFilterComponent;
  let fixture: ComponentFixture<GeoregulationAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationAdvancedFilterComponent],
    imports: [ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationAdvancedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
