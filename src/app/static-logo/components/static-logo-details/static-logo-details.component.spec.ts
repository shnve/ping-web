import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StaticLogoDetailsComponent } from './static-logo-details.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticLogoDetailsComponent', () => {
  let component: StaticLogoDetailsComponent;
  let fixture: ComponentFixture<StaticLogoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticLogoDetailsComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: of(new Map(Object.entries({ id: 'id1' })))
                }
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticLogoDetailsComponent);
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
