import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosourcePartsMapComponent } from './infosource-parts-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourcePartsMapComponent', () => {
  let component: InfosourcePartsMapComponent;
  let fixture: ComponentFixture<InfosourcePartsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourcePartsMapComponent],
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourcePartsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
