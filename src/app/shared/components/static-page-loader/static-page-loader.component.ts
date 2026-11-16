import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaticPageApi } from '@app/api/static-page.api';
import { Localize, OnChangeLang } from '@app/core/localize';
import { StaticPage } from '@app/models/static-page.model';
import { isLocalLangSelected } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

/** PISAC: entrada del índice «En esta página» (títulos h2/h3 del contenido). */
export interface StaticPageTocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

@Component({
  selector: 'app-static-page-loader',
  templateUrl: './static-page-loader.component.html',
  styleUrls: ['./static-page-loader.component.scss']
})
@Localize()
export class StaticPageLoaderComponent implements OnInit, OnDestroy, OnChangeLang {

  @ViewChild('content', { static: false }) contentRef: ElementRef<HTMLElement>;

  staticPage: StaticPage;
  pageTitle = '';
  pageContent = '';
  staticPageFindOneByPathSubscription: Subscription;
  /** Índice lateral; solo se muestra con dos títulos o más */
  toc: StaticPageTocEntry[] = [];
  activeId: string | null = null;

  constructor(private readonly route: ActivatedRoute,
              private readonly translate: TranslateService,
              private readonly staticPageApi: StaticPageApi,
              private readonly changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.staticPageFindOneByPathSubscription = this.route.paramMap.pipe(
        map(paramMap => paramMap.get('path')),
        filter(path => path !== null),
        switchMap(path => this.staticPageApi.findOneByPath(path)),
        tap(staticPage => this.staticPage = staticPage)
      )
      .subscribe(() => this.buildDisplayedInfo());
  }

  ngOnDestroy(): void {
    if (this.staticPageFindOneByPathSubscription) { this.staticPageFindOneByPathSubscription.unsubscribe(); }
  }

  /** Desplazamiento suave al título, sin cambiar la ruta (el enlace #id iría contra la base del router). */
  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeId = id;
  }

  private buildDisplayedInfo(): void {
    if (!this.staticPage) {
      return;
    }
    const isLocalLang = isLocalLangSelected(this.translate);
    this.pageTitle = isLocalLang ? this.staticPage.title : this.staticPage.internationalTitle;
    this.pageContent = (isLocalLang ? this.staticPage.content : this.staticPage.internationalContent) ?? '';
    // El HTML se pinta en el siguiente ciclo: entonces se leen sus títulos
    setTimeout(() => this.buildToc());
  }

  private buildToc(): void {
    const container = this.contentRef?.nativeElement;
    if (!container) {
      this.toc = [];
      return;
    }
    const usedIds = new Set<string>();
    this.toc = Array.from(container.querySelectorAll<HTMLElement>('h2, h3'))
      .filter(heading => heading.textContent?.trim())
      .map(heading => {
        const text = heading.textContent.trim();
        let id = 'sec-' + StaticPageLoaderComponent.slug(text);
        for (let n = 2; usedIds.has(id); n++) {
          id = `sec-${StaticPageLoaderComponent.slug(text)}-${n}`;
        }
        usedIds.add(id);
        heading.id = id;
        return { id, text, level: heading.tagName === 'H3' ? 3 : 2 } as StaticPageTocEntry;
      });
    this.activeId = this.toc[0]?.id ?? null;
    this.changeDetector.detectChanges();
  }

  private static slug(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'seccion';
  }

  onChangeLang(): void {
    this.buildDisplayedInfo();
  }

}
