import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'shared-url-links',
  templateUrl: './url-links.component.html',
  styleUrls: ['./url-links.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UrlLinksComponent),
      multi: true
    }
  ]
})
export class UrlLinksComponent implements ControlValueAccessor {

  @Input() disabled = false;

  links: string[] = [];
  url: string;

  constructor() { }

  onChange = (links: string[]) => { };
  onTouched = () => { };

  writeValue(links: string[]): void {
    if (!links) {
      return;
    }
    this.links = links;
  }

  registerOnChange(fn: (links: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  addUrlLink(): void {
    if (!this.url) {
      return;
    }
    this.links.push(this.url);
    this.linksChanged();
    this.url = null;
  }

  removeUrlLink(index: number): void {
    this.links.splice(index, 1);
    this.linksChanged();
  }

  private linksChanged(): void {
    this.links = [... new Set(this.links)];
    this.onChange(this.links);
  }
}
