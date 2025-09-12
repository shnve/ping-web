import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import packageInfo from '@app/../../package.json';
import { OnChangeLang } from '@app/core/localize';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { StaticLogoApi } from '../api/static-logo.api';
import { StaticLogo } from '../models/static-logo.model';

@Directive({
  selector: '[staticLogoDirective]'
})
export class StaticLogoDirective implements OnInit, OnDestroy, OnChangeLang {

  @Input('staticLogoDirective') key = '';

  private readonly scavenger = new Scavenger(this);
  private staticLogo: StaticLogo;
  private sectionEl: HTMLParagraphElement;

  protected appVersion: string;

  constructor(private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly translate: TranslateService,
    private readonly staticLogoApi: StaticLogoApi) {
      this.appVersion = environment.production ? '' : ` - v${packageInfo.version}`;
    }

  ngOnInit(): void {
    this.loadContent(this.key);
    this.translate.onLangChange.pipe(this.scavenger.collect()).subscribe(() => {
      this.buildDisplayedInfo();
    });
  }

  private loadContent(key: string): void {
    this.staticLogoApi.findOneByKey$(key)
      .pipe(this.scavenger.collect())
      .subscribe(staticLogo => {
        this.staticLogo = staticLogo;
        this.buildDisplayedInfo();
      });
  }

  private updateDisplay(imgData: string, altContent: string, titleContent: string, heightContent: string, href: string, key: string): void {
    if (this.sectionEl) {
      this.renderer.removeChild(this.el.nativeElement, this.sectionEl);
    }
    this.sectionEl = this.renderer.createElement('span');
    let htmlContent = `<img class="${key}" src="${imgData}" alt="${altContent}" title="${titleContent + ('logo-rf' === key ? this.appVersion : '')}"${heightContent ? ' height="' + heightContent + '"' : ''}/>`;
    if (href) {
      htmlContent = `<a href="${href}" class="fr-footer__brand-link" rel="noopener noreferrer external" target="_blank">${htmlContent}</a>`;
    }
    this.sectionEl.innerHTML = htmlContent;
    this.renderer.appendChild(this.el.nativeElement, this.sectionEl);
  }

  private buildDisplayedInfo(): void {
    const isLocalLang = isLocalLangSelected(this.translate);
    const imgData = this.staticLogo.content;
    const altContent = isLocalLang ? this.staticLogo.altTxt : this.staticLogo.altTxtInternational;
    const titleContent = isLocalLang ? this.staticLogo.title : this.staticLogo.titleInternational;
    const heightContent = this.staticLogo.heightWithUnit;
    const { href, key } = this.staticLogo;
    this.updateDisplay(imgData, altContent ?? '', titleContent ?? '', heightContent, href, key);
  }

  ngOnDestroy(): void {
    // empty because of scavenger
  }

  onChangeLang(): void {
    this.buildDisplayedInfo();
  }
}
