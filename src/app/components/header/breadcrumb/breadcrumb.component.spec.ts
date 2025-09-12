import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Data } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbComponent } from './breadcrumb.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  const fakeActivatedRoute = {
    root: {
      children: []
    },
    snapshot: {
      data: {breadcrumb: 'testkey'} as Data,
    } as ActivatedRouteSnapshot
  } as ActivatedRoute;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [BreadcrumbComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule],
    providers: [{
            provide: ActivatedRoute,
            useValue: fakeActivatedRoute
        }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
