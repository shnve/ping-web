import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { StaticPageDetailsComponent } from './static-page-details.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticPageDetailsComponent', () => {
  let component: StaticPageDetailsComponent;
  let fixture: ComponentFixture<StaticPageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticPageDetailsComponent],
    imports: [RouterTestingModule],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        id: '1',
                    }
                }
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticPageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
