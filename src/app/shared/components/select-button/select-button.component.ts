import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
export type SelectButtonOption = {code: string, translateKey: string};

@Component({
  selector: 'shared-select-button',
  templateUrl: './select-button.component.html',
  styleUrls: ['./select-button.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectButtonComponent),
    multi: true
  }]
})
/**
 * Overlayer of PrimeSelectButton, allow localisation with 'translateKey' option
 */
export class SelectButtonComponent implements ControlValueAccessor {
  selectedOption: SelectButtonOption;
  @Input() options: SelectButtonOption[];
  @Input() multiple = false;
  /**
   * If this option is activated, when user click on a button already selected, this one remains selected
   */
  @Input() unselectable = true;
  codeSelected: string;
  protected previousCodeSelected: string;
  onChange = (code: string) => {};
  onTouched = () => {};

  constructor() { }

  writeValue(optionCode: string): void {
    this.codeSelected = optionCode;
    this.previousCodeSelected = this.codeSelected;
    this.selectedOption = this.options.find(({code}) => code === optionCode);
  }

  registerOnChange(fn: (string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  changeOption() {
    if(this.unselectable) {
      if(this.previousCodeSelected !== this.selectedOption.code) {
        this.codeSelected = this.selectedOption.code;
      } else {
        this.selectedOption = null;
        this.codeSelected = null;
      }
    } else {
      this.codeSelected = this.selectedOption.code;
    }
    this.previousCodeSelected = this.codeSelected;
    // Dispatch event with code, not all option
    this.onChange(this.codeSelected);
  }

  onChangeLang() {
    this.writeValue(this.codeSelected);
  }
}
