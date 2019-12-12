import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { PoModule } from '@portinari/portinari-ui';
import { PoI18nConfig, PoI18nModule, PoI18nPipe } from '@portinari/portinari-ui';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { generalEn } from './shared/literals/i18n/general-en';
import { generalEs } from './shared/literals/i18n/general-es';
import { generalPt } from './shared/literals/i18n/general-pt';

import { customerMaintPt } from './shared/literals/i18n/customer-maint-pt';
import { customerMaintEs } from './shared/literals/i18n/customer-maint-es';
import { customerMaintEn } from './shared/literals/i18n/customer-maint-en';

import { BreadcrumbControlService } from './shared/services/breadcrumb-control.service';
import { CustomerService } from './shared/services/customer.service';
import { CountryService } from './shared/services/country.service';
import { ContactService } from './shared/services/contact.service';

const i18nConfig: PoI18nConfig = {
    default: {
        context: 'general',
        cache: true
    },
    contexts: {
        general: {
            'pt-BR': generalPt,
            'pt': generalPt,
            'en-US': generalEn,
            'en': generalEn,
            'es': generalEs
        },
        customerMaint: {
            'pt-BR': customerMaintPt,
            'pt': customerMaintPt,
            'en-US': customerMaintEn,
            'en': customerMaintEn,
            'es': customerMaintEs
        }
    }
};

@NgModule({
    declarations: [
        AppComponent
    ],
    entryComponents: [
    ],
    imports: [

        BrowserModule,
        PoModule,
        CommonModule,
        FormsModule,
        AppRoutingModule,
        PoI18nModule.config(i18nConfig)
    ],
    providers: [
        PoI18nPipe,
        BreadcrumbControlService,
        CustomerService,
        CountryService,
        ContactService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
