import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaritimeEntityFormComponent } from '@app/admin/pages/maritime-entity/maritime-entity-form/maritime-entity-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { MaritimeEntityDetailsComponent } from './maritime-entity-details.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MaritimeEntityDetailsComponent', () => {
  let component: MaritimeEntityDetailsComponent;
  let fixture: ComponentFixture<MaritimeEntityDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MaritimeEntityDetailsComponent, MaritimeEntityFormComponent],
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
    fixture = TestBed.createComponent(MaritimeEntityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
