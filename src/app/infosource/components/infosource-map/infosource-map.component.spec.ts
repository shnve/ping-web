import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MockProvider } from 'ng-mocks';
import { InfosourceMapComponent } from './infosource-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('InfosourceMapComponent', () => {
  let component: InfosourceMapComponent;
  let fixture: ComponentFixture<InfosourceMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourceMapComponent],
    imports: [],
    providers: [
        PermissionsProvider,
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: { paramMap: convertToParamMap({ warningId: '6cac9acb-927e-4394-b523-edfe754f335c' }) }
            },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
