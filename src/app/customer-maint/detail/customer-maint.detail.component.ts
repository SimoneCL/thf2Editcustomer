import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoI18nPipe, PoI18nService, PoNotificationService, PoTableColumn, PoTableAction, PoDisclaimer, PoDisclaimerGroup, PoPageFilter, PoModalAction, PoModalComponent, PoBreadcrumb, PoRadioGroupOption } from '@portinari/portinari-ui';
import { PoDialogService } from '@portinari/portinari-ui';
import { forkJoin, Subscription } from 'rxjs';
import { TotvsResponse } from './../../shared/interfaces/totvs-response.interface';
import { ICustomer, Customer } from './../../shared/model/customer.model';
import { CustomerService } from '../../shared/services/customer.service';
import { BreadcrumbControlService } from './../../shared/services/breadcrumb-control.service';
import { CountryService } from '../../shared/services/country.service';
import { ContactService } from '../../shared/services/contact.service';
import { IContact, Contact } from './../../shared/model/contact.model';
import { IFilterRangeNumber } from '../../shared/interfaces/filter-range.interface';



@Component({
    selector: 'app-customer-maint-detail',
    templateUrl: './customer-maint.detail.component.html',
    styleUrls: ['./customer-maint.detail.component.css']
})
export class CustomerMaintDetailComponent implements OnInit, OnDestroy {
     literals: any = {};

    breadcrumb: PoBreadcrumb;
    statusOptions: Array<PoRadioGroupOption>;

    servCustomerSubscription$: Subscription;
    servContactSubscription$: Subscription;

    items: Array<IContact> = new Array<IContact>();


    hasNext = false;

    customer: ICustomer = new Customer();
    contact: IContact = new Contact();
    expandables: any;

    columns: Array<PoTableColumn>;
    tableActions: Array<PoTableAction>;


    disclaimers: Array<PoDisclaimer> = [];

    constructor(
        private thfI18nPipe: PoI18nPipe,
        private thfI18nService: PoI18nService,
        private thfNotification: PoNotificationService,
        private thfDialogService: PoDialogService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private breadcrumbControlService: BreadcrumbControlService,
        private serviceCustomer: CustomerService,
        private serviceCountry: CountryService,
        private serviceContact: ContactService
    ) { }

    ngOnInit(): void {
        forkJoin(
            this.thfI18nService.getLiterals(),
            this.thfI18nService.getLiterals({ context: 'customerMaint' })
        ).subscribe(literals => {
            literals.map(item => Object.assign(this.literals, item));

            console.log('LOG', 'Início do Programa de Detail');

            this.breadcrumbControlService.addBreadcrumb(this.literals['customerMaintDetail'], this.activatedRoute);

            this.setupComponents();
            // indo na url pegando o valor do registro que quero colocar na tela de detalhe
            const code = this.activatedRoute.snapshot.paramMap.get('id');

            this.search(code);
            console.log(this.activatedRoute);
            this.searchContact(code);
            console.log('depois do searchContact');

        });
    }
    back(): void {
        console.log(this.breadcrumbControlService.getPrevRouter());
        this.router.navigate([this.breadcrumbControlService.getPrevRouter()]);
    }
    search(code: string): void {
        this.servCustomerSubscription$ = this.serviceCustomer
            .getById(code, this.expandables)
            .subscribe((response: ICustomer) => {
                if (response) {
                    this.customer = response;
                }

            });
    }
    searchContact(code: string): void {
        this.items = [];
        this.hasNext = false;
        this.servCustomerSubscription$ = this.serviceContact
            .query([], this.expandables)
            .subscribe((response: TotvsResponse<IContact>) => {
                if (response && response.items) {
                    this.items = [...this.items, ...response.items];
                    this.hasNext = response.hasNext;
                }

            });
    }

    setupComponents(): void {

        this.breadcrumb = this.breadcrumbControlService.getBreadcrumb();
        console.log('setupComponents -breadcrumb' + this.breadcrumb)
        this.statusOptions = Customer.statusLabelList(this.literals);
        this.columns = [
            { property: 'code', label: this.literals['code'], type: 'number' },
            { property: 'name', label: this.literals['name'], type: 'string' },
            { property: 'fone', label: this.literals['fone'], type: 'string' }
        ];
        
        
    }

    ngOnDestroy(): void {
        if (this.servCustomerSubscription$) { this.servCustomerSubscription$.unsubscribe(); }
    }
}
