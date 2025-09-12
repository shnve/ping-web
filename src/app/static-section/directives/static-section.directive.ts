import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { StaticSectionApi } from '../api/static-section.api';
import { StaticSection } from '../models/static-section.model';

@Directive({
  selector: '[staticSectionDirective]'
})
@Localize()
export class StaticSectionDirective implements OnInit, OnDestroy, OnChangeLang {

  @Input('staticSectionDirective') key = '';

  private staticSection: StaticSection;
  private staticSectionFindOneByKeySubscription: Subscription;
  private sectionEl: HTMLParagraphElement;

  constructor(private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly translate: TranslateService,
    private readonly staticSectionApi: StaticSectionApi) { }

  ngOnInit(): void {
    this.loadContent(this.key);
  }

  private loadContent(key: string): void {
    this.staticSectionFindOneByKeySubscription = this.staticSectionApi.findOneByKey$(key)
      .subscribe(staticSection => {
        this.staticSection = staticSection;
        this.buildDisplayedInfo();
      });
  }

  private updateDisplay(htmlContent: string): void {
    if (this.sectionEl) {
      this.renderer.removeChild(this.el.nativeElement, this.sectionEl);
    }
    this.sectionEl = this.renderer.createElement('p');
    this.sectionEl.innerHTML = htmlContent;
    this.renderer.appendChild(this.el.nativeElement, this.sectionEl);
  }

  private buildDisplayedInfo(): void {
    const isLocalLang = isLocalLangSelected(this.translate);
    const content = isLocalLang ? this.staticSection.content : this.staticSection.internationalContent;
    this.updateDisplay(content);
  }

  ngOnDestroy(): void {
    if (this.staticSectionFindOneByKeySubscription) {
      this.staticSectionFindOneByKeySubscription.unsubscribe();
    }
  }

  onChangeLang(): void {
    this.buildDisplayedInfo();
  }
}
