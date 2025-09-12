import { Component, Input } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { NgxCaptchaComponent, NgxCaptchaService } from '@binssoft/ngx-captcha';
import { TranslateService } from '@ngx-translate/core';

@Localize()
@Component({
  selector: 'custom-captcha',
  templateUrl: './captcha.component.html'
})
export class CaptchaComponent extends NgxCaptchaComponent implements OnChangeLang {

  @Input('config') config: any;

  currentLanguage: string;
  msg: SpeechSynthesisUtterance;

  constructor(private readonly captchaService: NgxCaptchaService,
    private readonly translate: TranslateService) {
    super(captchaService);
    this.currentLanguage = this.translate.currentLang;
  }

  playCaptcha = () => {
    this.msg = new SpeechSynthesisUtterance(this.code.split('').join(' '));
    this.msg.pitch = 0.1;
    this.msg.lang = this.currentLanguage;
    window.speechSynthesis.speak(this.msg);
  }

  onChangeLang(): void {
    this.currentLanguage = this.translate.currentLang;
  }

}

