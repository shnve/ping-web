import { ControlValueAccessor } from '@angular/forms';

export abstract class ValueAccessorBase<T> implements ControlValueAccessor {
  onChange = (value: T) => {};
  onTouched = () => {};

  private innerValue: T;

  get value(): T {
    return this.innerValue;
  }

  set value(value: T) {
    if (this.innerValue !== value) {
      this.innerValue = value;
      // view => control
      this.onChange(value);
    }
  }

  writeValue(value: T) {
    // control -> view
    this.innerValue = value;
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
