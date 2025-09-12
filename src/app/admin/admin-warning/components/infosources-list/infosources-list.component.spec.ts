import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { InfosourcesListComponent } from './infosources-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('InfosourcesListComponent', () => {
  let component: InfosourcesListComponent;
  let fixture: ComponentFixture<InfosourcesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourcesListComponent],
    imports: [TranslateModule.forRoot()],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourcesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
