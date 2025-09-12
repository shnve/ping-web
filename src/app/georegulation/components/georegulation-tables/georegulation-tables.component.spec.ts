import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { GeoregulationTablesComponent } from './georegulation-tables.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('GeoregulationTablesComponent', () => {
  let component: GeoregulationTablesComponent;
  let fixture: ComponentFixture<GeoregulationTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationTablesComponent],
    imports: [RouterModule.forRoot([])],
    providers: [
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoregulationTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
