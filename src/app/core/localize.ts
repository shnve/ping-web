import {TranslateService} from '@ngx-translate/core';
import {LangChangeEvent} from '@ngx-translate/core/lib/translate.service';

export interface OnChangeLang {
  onChangeLang: (langChangeEvent: LangChangeEvent) => void;
}


interface LocalizeAnnotation {
  onChangeLangMethodName?: string,
  translateServiceName?: string
}

/**
 * Descriptor to localize class
 * Create event, on ngInit method. Everytime the language is changed it call method '{onChangeMethodName}' (by default: 'translate') from target class.
 * Target class have to inject TranslateService from package 'ngx-translate' : '{translateServiceName}' (by default: 'onChangeLang')
 * @returns {(target: Function) => void}
 * @constructor
 * @param annotation
 */
export function Localize(annotation: LocalizeAnnotation = {}) {
  return (target: Function) => {
    const onInitOld = (target.prototype.ngOnInit as Function);
    const onDestroyOld = (target.prototype.ngOnDestroy as Function);
    const onChangeMethodName = annotation.onChangeLangMethodName || 'onChangeLang';
    const translateServiceName = annotation.translateServiceName || 'translate';
    // Add change lang subscription before ngOnInit instructions
    target.prototype.ngOnInit = function() {
      if(this.translate instanceof TranslateService && typeof this[onChangeMethodName] === 'function') {
        this._langChangeSubscription = this[translateServiceName].onLangChange.subscribe(
          this[onChangeMethodName].bind(this)
        );
      } else {
        if(!(this.translate instanceof TranslateService)) {
          console.warn(`Translation service is not injected in class ${target.name} with name: '${translateServiceName}'`);
        }
        if(typeof this[onChangeMethodName] !== 'function') {
          console.warn(`Method '${onChangeMethodName}' is not implemented in class ${target.name}`);
        }
      }
      onInitOld && onInitOld.call(this);
    };

    // Unsubscribe langChange event before ngOnDestroy instructions
    target.prototype.ngOnDestroy = function() {
      this._langChangeSubscription && this._langChangeSubscription.unsubscribe();
      this._langChangeSubscription = null;
      onDestroyOld && onDestroyOld.call(this);
    };
  };
}
