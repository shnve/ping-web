import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditAreaComponent} from './edit-area.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {AreaFormComponent} from '@app/admin/pages/area/area-form/area-form.component';
import {ActivatedRoute} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from "@angular/router/testing";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('EditAreaComponent', () => {
  let component: EditAreaComponent;
  let fixture: ComponentFixture<EditAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EditAreaComponent, AreaFormComponent],
    imports: [ReactiveFormsModule, TranslateModule.forRoot(), DropdownModule,
        MultiSelectModule, RouterTestingModule, NoopAnimationsModule],
    providers: [{
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        areaId: '1',
                    }
                }
            }
        }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
