import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectButtonComponent} from './select-button.component';
import {SelectButtonModule} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';

describe('SelectButtonComponent', () => {
  let component: SelectButtonComponent;
  let fixture: ComponentFixture<SelectButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectButtonComponent ],
      imports: [
        FormsModule,
        SelectButtonModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should write value', () => {
    // Given
    const optionCode = 'test';
    const options = [
      {code: 'chip', translateKey: 'chips'},
      {code: 'test', translateKey: 'teste'}
    ];
    component.options = options;
    
    // When
    component.writeValue(optionCode);
    
    // Expect
    expect(component.codeSelected).toEqual(optionCode);
    expect(component.selectedOption).toEqual(options[1]);
  })
});
