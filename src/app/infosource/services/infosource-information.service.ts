import { Injectable } from '@angular/core';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { InformationService } from '@app/shared/services/information.service';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class InfosourceInformationService extends InformationService {

  constructor(protected readonly mousePositionFormatter: MousePositionFormatterService,
    public readonly translate: TranslateService,
    protected capitalizeFirstPipe: CapitalizeFirstPipe) {
    super(mousePositionFormatter, translate, capitalizeFirstPipe);
    this.informationTemplateRootTranslationsKey = this.informationTemplate.infosource.informationRootTranslationKey;
    this.informationTemplateChildrenTranslationsKeys = this.informationTemplate.infosource.informationChildrenTranslationsKeys;
  }
}
