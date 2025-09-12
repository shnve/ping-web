import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

import { InfosourceCreationComponent } from './infosource-creation.component';

describe('InfosourceCreationComponent', () => {
  let component: InfosourceCreationComponent;
  let fixture: ComponentFixture<InfosourceCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterModule.forRoot([]), TranslateModule.forRoot() ],
      declarations: [ InfosourceCreationComponent ],
      providers: [ ConfirmationService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
