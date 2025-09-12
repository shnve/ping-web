import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToasterComponent } from './toaster.component';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {AlertMessageService} from '../../../core/alert-message.service';


describe('ToasterComponent', () => {
  let component: ToasterComponent;
  let fixture: ComponentFixture<ToasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToasterComponent ],
      imports: [
        ToastModule
      ],
      providers: [
        {provide: MessageService, useClass: AlertMessageService}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
