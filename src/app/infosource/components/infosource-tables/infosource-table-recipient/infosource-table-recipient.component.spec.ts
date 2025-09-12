import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfosourceServiceStatus } from '@app/infosource/models/infosource.model';
import { TranslateModule } from '@ngx-translate/core';
import { InfosourceTableRecipientComponent } from './infosource-table-recipient.component';


describe('InfosourceTableRecipientComponent', () => {
  let component: InfosourceTableRecipientComponent;
  let fixture: ComponentFixture<InfosourceTableRecipientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfosourceTableRecipientComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfosourceTableRecipientComponent);
    component = fixture.componentInstance;
    component.recipient = {
      id: 'serviceId',
      name: 'recipient name',
      information: 'this is an information',
      localizedInformation: 'information in other language',
      actionType: InfosourceServiceStatus.READ
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
