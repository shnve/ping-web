import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { StaticSectionDetailsComponent } from './static-section-details.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticSectionDetailsComponent', () => {
  let component: StaticSectionDetailsComponent;
  let fixture: ComponentFixture<StaticSectionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticSectionDetailsComponent],
    imports: [],
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

    fixture = TestBed.createComponent(StaticSectionDetailsComponent);
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
