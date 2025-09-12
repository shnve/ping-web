import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { StaticSectionListComponent } from './static-section-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticSectionListComponent', () => {
  let component: StaticSectionListComponent;
  let fixture: ComponentFixture<StaticSectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticSectionListComponent],
    imports: [],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticSectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
