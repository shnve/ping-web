import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateInPipe } from '@app/shared/pipes/translateIn.pipe';
import { TranslateModule } from '@ngx-translate/core';

import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { InfosourceInputInformationComponent } from './infosource-input-information.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourceInputInformationComponent', () => {
  let component: InfosourceInputInformationComponent;
  let fixture: ComponentFixture<InfosourceInputInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [InfosourceInputInformationComponent],
    imports: [TranslateModule.forRoot()],
    providers: [
        TranslateInPipe,
        CapitalizeFirstPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceInputInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
