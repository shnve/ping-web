import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { SafeHtmlPipe } from '@app/shared/pipes/safe-html.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { StaticPageLoaderComponent } from './static-page-loader.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticPageLoaderComponent', () => {
  let component: StaticPageLoaderComponent;
  let fixture: ComponentFixture<StaticPageLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticPageLoaderComponent, SafeHtmlPipe],
    imports: [RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ path: 'accueil' })))
            }
        },
        SafeHtmlPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticPageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
