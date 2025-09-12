import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * This directive permit to named a template
 */
@Directive({
  selector: 'ng-template[id]'
})
export class TemplateIdDirective {
  @Input() id: string;

  constructor(public readonly template: TemplateRef<any>) { }
}
