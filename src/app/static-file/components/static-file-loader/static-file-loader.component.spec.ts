import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { StaticFileLoaderComponent } from './static-file-loader.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileLoaderComponent', () => {
  let component: StaticFileLoaderComponent;
  let fixture: ComponentFixture<StaticFileLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StaticFileLoaderComponent],
    imports: [],
    providers: [
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ path: 'file01' })))
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(StaticFileLoaderComponent);
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
