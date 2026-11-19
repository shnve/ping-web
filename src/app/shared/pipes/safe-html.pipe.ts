import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // PISAC (Sonar typescript:S6268): sanitizar siempre con DOMPurify antes de bypassSecurityTrustHtml
    const clean = DOMPurify.sanitize(value ?? '', {
      ADD_ATTR: ['target', 'rel']
    });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
