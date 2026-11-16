import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  routerStateSnapshot: RouterStateSnapshot;
  /** Clave de traducción del título de la ruta actual */
  private titleKey: string | undefined;

  constructor(private readonly title: Title, private readonly translate: TranslateService) {
    super();
    // PISAC: al cambiar de idioma se vuelve a traducir el título de la pestaña
    this.translate.onLangChange.subscribe(() => this.applyTitle());
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    this.routerStateSnapshot = routerState;
    this.titleKey = this.buildTitle(routerState);
    this.applyTitle();
  }

  /**
   * PISAC: translate.get() espera a que terminen de cargar las traducciones. Con instant(), al abrir una página en
   * una pestaña nueva (p. ej. «Servicios de datos», target=_blank) el título quedaba como la clave sin traducir.
   */
  private applyTitle(): void {
    if (this.titleKey === undefined) {
      this.title.setTitle('PISAC');
      return;
    }
    const key = this.titleKey;
    this.translate.get(key).pipe(take(1)).subscribe((translatedTitle: string) => {
      // Si mientras tanto se navegó a otra ruta, no se pisa su título
      if (key === this.titleKey) {
        this.title.setTitle(`PISAC - ${translatedTitle}`);
      }
    });
  }
}
