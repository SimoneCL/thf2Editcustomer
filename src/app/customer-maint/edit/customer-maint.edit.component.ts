import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThfI18nPipe, ThfI18nService, ThfNotificationService, ThfTableColumn, ThfTableAction, ThfDisclaimer, ThfDisclaimerGroup, ThfPageFilter, ThfModalAction, ThfModalComponent, ThfBreadcrumb, ThfRadioGroupOption } from '@totvs/thf-ui';
import { ThfDialogService } from '@totvs/thf-ui';
import { forkJoin, Subscription } from 'rxjs';
import { TotvsResponse } from './../../shared/interfaces/totvs-response.interface';
import { ICustomer, Customer } from './../../shared/model/customer.model';
import { CustomerService } from '../../shared/services/customer.service';
import { BreadcrumbControlService } from './../../shared/services/breadcrumb-control.service';
import { FieldValidationUtil } from '../../shared/utils/field-validation.util';
import { CountryService } from '../../shared/services/country.service';
import { ContactService } from '../../shared/services/contact.service';
import { IContact, Contact } from './../../shared/model/contact.model';



@Component({
    selector: 'app-customer-maint-edit',
    templateUrl: './customer-maint.edit.component.html',
    styleUrls: ['./customer-maint.edit.component.css']
})
export class CustomerMaintEditComponent implements OnInit, OnDestroy {
    @ViewChild('modalEdition', { static: false }) modalEdition: ThfModalComponent;
   
    literals: any = {};
    isEdit = false;

    breadcrumb: ThfBreadcrumb;
    statusOptions: Array<ThfRadioGroupOption>;

    fieldValidUtil: FieldValidationUtil;
    servCustomerSubscription$: Subscription;
    servContactSubscription$: Subscription;

    items: Array<IContact> = new Array<IContact>();
    hasNext = false;

    customer: ICustomer = new Customer();
    contact: IContact = new Contact();

    expandables: any;

    columns: Array<ThfTableColumn>;
    tableActions: Array<ThfTableAction>;


    constructor(
        private thfI18nPipe: ThfI18nPipe,
        private thfI18nService: ThfI18nService,
        private thfNotification: ThfNotificationService,
        private thfDialogService: ThfDialogService,
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

            console.log('LOG', 'Início do Programa de Edit');
            // Quando estava na tela de edit poderia utilizar assim
            //this.breadcrumbControlService.addBreadcrumb(this.literals['customerMaintEdit'], this.activatedRoute);

            //neste ponto a gente retorna o breadcrumb com o valor definido no literal
            this.breadcrumbControlService.addBreadcrumb(this.getTitle(), this.activatedRoute);

            this.fieldValidUtil = new FieldValidationUtil(this.thfNotification, this.thfI18nPipe, this.literals);

            // indo na url pegando o valor do registro que quero colocar na tela de detalhe
            const code = this.activatedRoute.snapshot.paramMap.get('id');

            if (code) {
                this.isEdit = true;
            }
            else {
                this.isEdit = false;
            }
            if (this.isEdit) {
                this.search(code);
            }
            this.setupComponents();
            this.searchContact(code);

        });
    }

    getTitle(): string {
        if (this.isEdit) {
            return this.literals['customerMaintEdit'];
        } else {
            return this.literals['customerMaintAdd'];
        }
    }
    cancel(): void {
        console.log(this.breadcrumbControlService.getPrevRouter());
        this.router.navigate([this.breadcrumbControlService.getPrevRouter()]);
    }
    save(): void {
        if (this.onValidFields()) {
            if (this.isEdit) {
                this.servCustomerSubscription$ = this.serviceCustomer
                    .update(this.customer)
                    .subscribe(() => {

                        this.thfNotification.success(this.literals['updatedMessage']);
                        this.router.navigate([this.breadcrumbControlService.getPrevRouter()]);

                    }, (err: any) => {
                    });
            }
            else {
                this.servCustomerSubscription$ = this.serviceCustomer
                    .create(this.customer)
                    .subscribe(() => {

                        this.thfNotification.success(this.literals['createMessage']);
                        this.router.navigate([this.breadcrumbControlService.getPrevRouter()]);

                    }, (err: any) => {
                    });

            }
        }
    }

    onValidFields(): boolean {
        let isOk = true;

        if (!this.fieldValidUtil.vldFieldNumber('code', this.customer.code, true)) { isOk = false; }
        if (!this.fieldValidUtil.vldFieldCharacter('shortName', this.customer.shortName)) { isOk = false; }

        if (!this.fieldValidUtil.vldFieldCharacter('country', this.customer.country)) { isOk = false; }

        return isOk;
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
    edit(item: ICustomer): void {
        
        this.modalEdition.open();
        //this.router.navigate(['/customerMaint', 'edit', Customer.getInternalId(item)]);
    }
       
    setupComponents(): void {

        this.breadcrumb = this.breadcrumbControlService.getBreadcrumb();
        this.statusOptions = Customer.statusLabelList(this.literals);
        this.columns = [
            { property: 'code', label: this.literals['code'], type: 'number' },
            { property: 'name', label: this.literals['name'], type: 'string' },
            { property: 'fone', label: this.literals['fone'], type: 'string' }
        ];
        this.tableActions = [
           // { action: this.detail.bind(this), label: this.literals['detail'], icon: 'thf-icon thf-icon-document' }
            { action: this.edit.bind(this), label: this.literals['edit'], icon: 'thf-icon thf-icon-edit' }
           // { action: this.delete.bind(this), label: this.literals['remove'], icon: 'thf-icon thf-icon-delete' }*/
        ]
    }

    ngOnDestroy(): void {
        if (this.servCustomerSubscription$) { this.servCustomerSubscription$.unsubscribe(); }
    }
}
