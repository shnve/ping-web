import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StaticFileDetailsComponent } from './static-file-details.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileDetailsComponent', () => {
  let component: StaticFileDetailsComponent;
  let fixture: ComponentFixture<StaticFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticFileDetailsComponent],
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

    fixture = TestBed.createComponent(StaticFileDetailsComponent);
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
