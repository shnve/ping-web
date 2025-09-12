import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { StaticSectionApi } from '../api/static-section.api';
import { StaticSection } from '../models/static-section.model';
import { StaticSectionDirective } from './static-section.directive';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  template: `<div [staticSectionDirective]="'survey-bathy-data'"></div>`
})
class TestStaticSectionDirectiveComponent {
}

describe('StaticSectionDirective', () => {

  let component: TestStaticSectionDirectiveComponent;
  let fixture: ComponentFixture<TestStaticSectionDirectiveComponent>;
  let divEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [
        TestStaticSectionDirectiveComponent,
        StaticSectionDirective
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        MockProvider(StaticSectionApi, {
            findOneByKey$(key: string): Observable<StaticSection> {
                return of({
                    id: '1',
                    key: 'survey-bathy-data',
                    location: 'location',
                    path: 'path',
                    name: 'name',
                    content: 'contenu',
                    internationalContent: 'content'
                });
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(TestStaticSectionDirectiveComponent);
    component = fixture.componentInstance;
    divEl = fixture.debugElement.query(By.css('div'));
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should load survey-bathy-data', () => {
    fixture.detectChanges();
    expect(divEl.nativeElement.textContent).toBe('content');
  });
});
