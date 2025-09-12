import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerieDetailsComponent } from './serie-details.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {MultiSelectModule} from 'primeng/multiselect';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {RouterTestingModule} from '@angular/router/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {SerieFormComponent} from '@app/admin/pages/serie/serie-form/serie-form.component';
import {ActivatedRoute} from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SerieDetailsComponent', () => {
  let component: SerieDetailsComponent;
  let fixture: ComponentFixture<SerieDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SerieDetailsComponent, SerieFormComponent],
    imports: [ReactiveFormsModule, TranslateModule.forRoot(), DropdownModule,
        MultiSelectModule, NoopAnimationsModule, RouterTestingModule],
    providers: [{
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        id: '1',
                    }
                }
            }
        }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SerieDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
