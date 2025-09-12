import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { InfosourceDetailsMapComponent } from './infosource-details-map.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourceDetailsMapComponent', () => {
  let component: InfosourceDetailsMapComponent;
  let fixture: ComponentFixture<InfosourceDetailsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourceDetailsMapComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceDetailsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });
});
