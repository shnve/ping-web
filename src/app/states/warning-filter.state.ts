import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class ModelItemFilterState<T extends {}> {
  protected filterValues$: BehaviorSubject<T>;
  protected filterValues: T;
  protected defaultValues: T;

  initFilter(defaultValues: T): void {
    this.defaultValues = defaultValues;
    this.filterValues = {...this.defaultValues};
    this.filterValues$ = new BehaviorSubject<T>(this.filterValues);
  }

  setValues(filterValues: T): void {
    this.filterValues = filterValues;
    this.emitValues();
  }

  getValues$(): Observable<T> {
    return this.filterValues$;
  }

  emitValues(): void {
    this.filterValues$?.next(this.filterValues);
  }

  getDefaultValues(): T {
    return this.defaultValues;
  }

  getValues(): T {
    return this.filterValues;
  }

  clearFilter(): void {
    this.setValues({...this.defaultValues});
  }
}
