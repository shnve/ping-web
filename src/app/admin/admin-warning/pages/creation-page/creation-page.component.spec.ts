import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationPageComponent } from './creation-page.component';
import {TranslateModule} from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {PermissionsProvider} from '@app/privileges/permissions-provider';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs/internal/observable/of';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CreationPageComponent', () => {
  let component: CreationPageComponent;
  let fixture: ComponentFixture<CreationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CreationPageComponent],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule],
    providers: [
        PermissionsProvider,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ warningId: 123 })))
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationPageComponent);
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
