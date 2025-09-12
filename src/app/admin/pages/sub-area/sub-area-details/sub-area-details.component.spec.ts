import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAreaDetailsComponent } from './sub-area-details.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {SerieDetailsComponent} from '@app/admin/pages/serie/serie-details/serie-details.component';
import {SerieFormComponent} from '@app/admin/pages/serie/serie-form/serie-form.component';
import {ActivatedRoute} from '@angular/router';
import {SubAreaFormComponent} from '@app/admin/pages/sub-area/sub-area-form/sub-area-form.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SubAreaDetailsComponent', () => {
  let component: SubAreaDetailsComponent;
  let fixture: ComponentFixture<SubAreaDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SubAreaDetailsComponent, SubAreaFormComponent],
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
    fixture = TestBed.createComponent(SubAreaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
