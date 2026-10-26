import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  routerStateSnapshot: RouterStateSnapshot;
  constructor(private readonly title: Title, private readonly translate: TranslateService) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    this.routerStateSnapshot = routerState;
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      if(!this.translate.getLangs().length) {
        this.translate.onLangChange.pipe(take(1)).subscribe(() => {
          const translatedTitle = this.translate.instant(title);
          this.title.setTitle(`PISAC - ${translatedTitle}`);
        });
      } else {
        const translatedTitle = this.translate.instant(title);
        this.title.setTitle(`PISAC - ${translatedTitle}`);
      }
    } else {
      this.title.setTitle(`PISAC`);
    }
  }
}
