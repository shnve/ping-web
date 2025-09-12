import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TitleStrategy } from '@angular/router';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { FiltersBarComponent } from '@app/components/footer/filters/filters-bar/filters-bar.component';
import { TableFiltersBarComponent } from '@app/components/footer/filters/table-filters-bar/table-filters-bar.component';
import { FooterComponent } from '@app/components/footer/footer.component';
import { ToasterComponent } from '@app/components/global/toaster/toaster.component';
import { BannerComponent } from '@app/components/header/banner/banner.component';
import { BreadcrumbComponent } from '@app/components/header/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { MenuComponent } from '@app/components/header/menu/menu.component';
import { AccountCreationComponent } from '@app/components/pages/account/creation/account-creation.component';
import { AccountValidationComponent } from '@app/components/pages/account/validation/account-validation.component';
import { SubscriptionChoiceComponent } from '@app/subscription/components/subscription-choice/subscription-choice.component';
import { AvurnavNoticeComponent } from '@app/components/pages/avurnav-notice/avurnav-notice.component';
import { HomeComponent } from '@app/components/pages/home/home.component';
import { NotFoundComponent } from '@app/components/pages/not-found/not-found.component';
import { MapAdvancedFilterComponent } from '@app/components/shared/map-advanced-filter/map-advanced-filter.component';
import { MapFilterBannerComponent } from '@app/components/shared/map-filter-banner/map-filter-banner.component';
import { MapFiltersComponent } from '@app/components/shared/map-filters/map-filters.component';
import { TableAdvancedFilterComponent } from '@app/components/shared/table-advanced-filter/table-advanced-filter.component';
import { TableFiltersComponent } from '@app/components/shared/table-filters/table-filters.component';
import { WarningDetailTableComponent } from '@app/components/shared/warning-detail-table/warning-detail-table.component';
import { AlertMessageService } from '@app/core/alert-message.service';
import { CustomTitleStrategy } from '@app/custom-title-strategy';
import { ApiInterceptor } from '@app/interceptors/api.interceptor';
import { PluckPipe } from '@app/pipes/pluck.pipe';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { NgxCaptchaModule } from '@binssoft/ngx-captcha';
import { environment } from '@env/environment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedModule } from '@shared/shared.module';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { NgxSummernoteModule } from 'ngx-summernote';
import { MessageService as PrimeMessageService } from 'primeng/api';
import { BreadcrumbModule as PrimeBreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule as PrimeButtonModule } from 'primeng/button';
import { CalendarModule as PrimeCalendarModule } from 'primeng/calendar';
import { CheckboxModule as PrimeCheckboxModule } from 'primeng/checkbox';
import { ChipModule as PrimeChipModule } from 'primeng/chip';
import { ConfirmPopupModule as PrimeConfirmPopupModule } from 'primeng/confirmpopup';
import { DataViewModule as PrimeDataViewModule } from 'primeng/dataview';
import { DialogModule as PrimeDialogModule } from 'primeng/dialog';
import { DropdownModule as PrimeDropdownModule } from 'primeng/dropdown';
import { InputTextModule as PrimeInputTextModule } from 'primeng/inputtext';
import { MenuModule as PrimeMenuModule } from 'primeng/menu';
import { MenubarModule as PrimeMenuBarModule } from 'primeng/menubar';
import { MessageModule as PrimeMessageModule } from 'primeng/message';
import { MessagesModule as PrimeMessagesModule } from 'primeng/messages';
import { MultiSelectModule as PrimeMultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule as PrimeOverlayPanelModule } from 'primeng/overlaypanel';
import { PasswordModule as PrimePasswordButtonModule } from 'primeng/password';
import { ProgressSpinnerModule as PrimeProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule as PrimeRadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule as PrimeSelectButtonModule } from 'primeng/selectbutton';
import { TableModule as PrimeTableModule } from 'primeng/table';
import { TagModule as PrimeTagModule } from 'primeng/tag';
import { ToastModule as PrimeToastModule } from 'primeng/toast';
import { ToggleButtonModule as PrimeToggleButtonModule } from 'primeng/togglebutton';
import { CaptchaComponent } from './components/pages/account/creation/captcha/captcha.component';
import { AccountEditComponent } from './components/pages/account/edit/account-edit.component';
import { RedirectAfterAuthenticationComponent } from './components/pages/redirect-after-authentication/redirect-after-authentication.component';
import { SignInUpComponent } from './components/pages/sign-in-up/sign-in-up.component';
import { GeoregulationFormatNumberPipe } from './georegulation/pipes/georegulation-format-number.pipe';
import { InfosourceFormatInformationPipe } from './infosource/pipes/infosource-format-information.pipe';
import { ApiSanitizerInterceptor } from './interceptors/api-sanitizer.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { NotificationModule } from './notification/notification.module';
import { SharedPipeModule } from './shared/shared-pipe.module';
import { SigModule } from './sig/sig.module';
import { StaticLogoModule } from './static-logo/static-logo.module';
import { SubscriptionTablesComponent } from '@app/subscription/components/subscription-tables/subscription-tables.component';
import { SubscriptionPaginatedTableComponent } from '@app/subscription/components/subscription-tables/subscription-table/subscription-table.component';
import { SubscriptionCreationComponent } from '@app/subscription/components/subscription-creation/subscription-creation.component';
import { SubscriptionModalComponent } from '@app/subscription/components/subscription-modal/subscription-modal.component';
import { SubscriptionDeleteFromLinkComponent } from '@app/subscription/components/subscription-delete-from-link/subscription-delete-from-link.component';

@NgModule({ declarations: [
        AppComponent,
        MenuComponent,
        BreadcrumbComponent,
        HeaderComponent,
        FooterComponent,
        BannerComponent,
        HomeComponent,
        AvurnavNoticeComponent,
        NotFoundComponent,
        ToasterComponent,
        MapFilterBannerComponent,
        MapAdvancedFilterComponent,
        PluckPipe,
        TableAdvancedFilterComponent,
        WarningDetailTableComponent,
        AccountCreationComponent,
        AccountEditComponent,
        AccountValidationComponent,
        SubscriptionChoiceComponent,
        SubscriptionTablesComponent,
        SubscriptionPaginatedTableComponent,
        SubscriptionCreationComponent,
        SubscriptionModalComponent,
        SubscriptionDeleteFromLinkComponent,
        FiltersBarComponent,
        MapFiltersComponent,
        TableFiltersBarComponent,
        TableFiltersComponent,
        SignInUpComponent,
        RedirectAfterAuthenticationComponent,
        CaptchaComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            defaultLanguage: environment.defaultLanguage,
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        AppRoutingModule,
        SharedModule,
        SharedPipeModule,
        ReactiveFormsModule,
        PrimeButtonModule,
        PrimeMenuBarModule,
        PrimeDropdownModule,
        PrimeBreadcrumbModule,
        PrimeToastModule,
        PrimeSelectButtonModule,
        PrimeOverlayPanelModule,
        PrimeCalendarModule,
        PrimeChipModule,
        PrimeTableModule,
        PrimeDialogModule,
        PrimeMultiSelectModule,
        PrimeMessageModule,
        PrimeMessagesModule,
        PrimeDataViewModule,
        PrimeToggleButtonModule,
        PrimeRadioButtonModule,
        PrimePasswordButtonModule,
        PrimeProgressSpinnerModule,
        PrimeInputTextModule,
        PrimeCheckboxModule,
        PrimeTagModule,
        PrimeConfirmPopupModule,
        NgxIntlTelInputModule,
        NgxSummernoteModule,
        NgxCaptchaModule,
        RxReactiveFormsModule,
        SigModule,
        NotificationModule,
        PrimeMenuModule,
        StaticLogoModule], providers: [
        { provide: PrimeMessageService, useExisting: AlertMessageService },
        PermissionsProvider,
        { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ApiSanitizerInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
        { provide: APP_INITIALIZER, useFactory: permissionsProviderFactory, deps: [PermissionsProvider], multi: true },
        { provide: TitleStrategy, useClass: CustomTitleStrategy },
        InfosourceFormatInformationPipe,
        GeoregulationFormatNumberPipe,
        provideHttpClient(withInterceptorsFromDi())
    ] })

export class AppModule {
  constructor() {
    registerLocaleData(localeEn, 'en');
    registerLocaleData(localeFr, 'fr');
  }
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', environment.production ? `.json?v=${environment.version}` : '.json');
}

export function permissionsProviderFactory(provider: PermissionsProvider): () => Promise<any> {
  return () => provider.load();
}
