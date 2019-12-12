import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThfI18nPipe, ThfI18nService, ThfNotificationService, ThfTableColumn, ThfTableAction, ThfDisclaimer, ThfDisclaimerGroup, ThfPageFilter, ThfModalAction, ThfModalComponent, ThfBreadcrumb, ThfPageAction, ThfLookupColumn } from '@totvs/thf-ui';
import { ThfDialogService } from '@totvs/thf-ui';
import { forkJoin, Subscription } from 'rxjs';
import { TotvsResponse } from './../../shared/interfaces/totvs-response.interface';
import { ICustomer, Customer } from './../../shared/model/customer.model';
import { CustomerService } from '../../shared/services/customer.service';
import { DisclaimerUtil } from './../../shared/utils/disclaimer.util';
import { IFilterRangeNumber } from '../../shared/interfaces/filter-range.interface';
import { FilterRangeUtil } from './../../shared/utils/filter-range.util';
import { FieldValidationUtil } from './../../shared/utils/field-validation.util';
import { BreadcrumbControlService } from './../../shared/services/breadcrumb-control.service';
import { CountryService } from '../../shared/services/country.service';


@Component({
    selector: 'app-customer-maint-list',
    templateUrl: './customer-maint.list.component.html',
    styleUrls: ['./customer-maint.list.component.css']
})
export class CustomerMaintListComponent implements OnInit, OnDestroy {
    @ViewChild('modalAdvanceSearch', { static: false }) modalAdvanceSearch: ThfModalComponent;

    literals: any = {};
    disclaimers: Array<ThfDisclaimer> = [];
    disclaimerGroup: ThfDisclaimerGroup;
    disclaimerUtil: DisclaimerUtil;

    fieldValidUtil: FieldValidationUtil;
    filterCode: IFilterRangeNumber;
    filterSettings: ThfPageFilter;
    quickSearchValue = '';

    confirmAdvSearchAction: ThfModalAction;
    cancelAdvSearchAction: ThfModalAction;

    breadcrumb: ThfBreadcrumb;

    servCustomerSubscription$: Subscription;

    columns: Array<ThfTableColumn>;
    tableActions: Array<ThfTableAction>;
    items: Array<ICustomer> = new Array<ICustomer>();

    hasNext = false;
    currentPage = 1;
    pageSize = 20;

    expandables = [''];

    pageActions: Array<ThfPageAction>;
    zoomCountryColumns: Array<ThfLookupColumn>;
    statusLabelList: Array<any>;

    constructor(
        private thfI18nPipe: ThfI18nPipe,
        private thfI18nService: ThfI18nService,
        private thfNotification: ThfNotificationService,
        private thfDialogService: ThfDialogService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private servCustomer: CustomerService,
        private breadcrumbControlService: BreadcrumbControlService,
        private serviceCountry: CountryService
    ) { }

    ngOnInit(): void {
        forkJoin(
            this.thfI18nService.getLiterals(),
            this.thfI18nService.getLiterals({ context: 'customerMaint' })
        ).subscribe(literals => {
            literals.map(item => Object.assign(this.literals, item));

            console.log('LOG', 'Início do Programa de Lista');
            this.disclaimerUtil = new DisclaimerUtil(this.thfNotification, this.thfI18nPipe, this.literals);

            this.fieldValidUtil = new FieldValidationUtil(this.thfNotification, this.thfI18nPipe, this.literals);

            this.breadcrumbControlService.addBreadcrumb(this.literals['customerMaintList'], this.activatedRoute);

            this.setupComponents();

            this.search();
        });
    }


    search(loadMore = false): void {
        if (loadMore === true) {
            this.currentPage = this.currentPage + 1;
        } else {
            this.items = [];
        }

        this.hasNext = false;
        this.servCustomerSubscription$ = this.servCustomer
            .query(this.disclaimers || [], this.expandables, this.currentPage, this.pageSize)
            .subscribe((response: TotvsResponse<ICustomer>) => {
                if (response && response.items) {
                    this.items = [...this.items, ...response.items];
                    this.hasNext = response.hasNext;
                }

                if (this.items.length === 0) { this.currentPage = 1; }
            });
    }



    searchBy(filter = null): void {
        this.disclaimers = [];

        if (!filter) {
            filter = this.quickSearchValue;
        }

        this.addDisclaimer([
            this.disclaimerUtil.makeDisclaimer('shortName', filter)
        ]);
    }



    addDisclaimer(disclaimerListItem: Array<ThfDisclaimer>): void {
        if (!disclaimerListItem) { return; }

        disclaimerListItem.map(disclaimerItem => {
            if (disclaimerItem.property !== '') { this.disclaimers.push(disclaimerItem); }
        });
        this.disclaimerGroup.disclaimers = [...this.disclaimers];
    }



    onChangeDisclaimer(disclaimers: Array<ThfDisclaimer>): void {
        this.disclaimers = disclaimers;
        this.refreshFilters();
        this.search();
    }



    resetFilters(): void {

        // Inicia os Campos de Filtros
        this.filterCode = FilterRangeUtil.makeFilterRangeNumber(0, 999999999);

    }



    refreshFilters(): void {
        if (!this.disclaimers || this.disclaimers.length === 0) {
            this.resetFilters();
            this.refreshDisclaimer();
            return;
        }

        // Atualizar os Campos de Filtro conforme o Disclaimer
        this.filterCode = this.disclaimerUtil.atzRangeNumFromDisclamer(this.disclaimers, 'code', this.filterCode);

    }



    refreshDisclaimer(): void {
        this.disclaimers = [];

        this.quickSearchValue = '';

        // Inclui os Campos de Filtro no Disclaimer
        this.addDisclaimer([
            this.disclaimerUtil.makeDisclaimerFromRangeNumber('code', this.filterCode)

        ]);
    }

    advancedSearch(): void {
        this.resetFilters();
        if (this.disclaimers && this.disclaimers.length > 0) {
            this.refreshFilters();
        }

        this.modalAdvanceSearch.open();
    }


    edit(item: ICustomer): void {
        this.router.navigate(['/customerMaint', 'edit', Customer.getInternalId(item)]);
    }
    onConfirmAdvAction(): void {
        if (this.onValidFields()) {
            this.refreshDisclaimer();
            this.modalAdvanceSearch.close();
        }
    }
    create(): void {
        this.router.navigate(['/customerMaint', 'new']);
    }

    delete(item: ICustomer): void {
        const CustomerCode = Customer.getInternalId(item);
        this.thfDialogService.confirm({
            title: this.literals['remove'],
            message: this.thfI18nPipe.transform(this.literals['modalDeleteMessage'], [CustomerCode]),
            confirm: () => {
                this.servCustomerSubscription$ = this.servCustomer
                    .delete(CustomerCode)
                    .subscribe(response => {
                        this.thfNotification.success(
                            this.thfI18nPipe.transform(this.literals['deleteSucessMessage'], [CustomerCode])
                        );
                        this.search();
                    }, (err: any) => {
                    });
            }
        });
    }
    onValidFields(): boolean {
        let isOk = true;

        // Validar os Campos do Filtro
        if (!this.fieldValidUtil.vldRangeNumber('codeInitial', 'codeFinal',
            this.filterCode.valInitial, this.filterCode.valFinal)) { isOk = false; }

        return isOk;
    }


    setupComponents(): void {
        this.breadcrumb = this.breadcrumbControlService.getBreadcrumb();

        this.disclaimerGroup = {
            title: this.literals['filters'],
            disclaimers: [],
            change: this.onChangeDisclaimer.bind(this)
        };

        this.filterSettings = {
            action: 'searchBy',
            advancedAction: 'advancedSearch',
            ngModel: 'quickSearchValue',
            placeholder: this.literals['attribute']
        };
        this.confirmAdvSearchAction = {
            action: () => this.onConfirmAdvAction(), label: this.literals['search']
        };

        this.cancelAdvSearchAction = {
            action: () => this.modalAdvanceSearch.close(), label: this.literals['cancel']
        };

        this.zoomCountryColumns = [
            { property: 'code', label: this.literals['code'], type: 'string' },
            { property: 'name', label: this.literals['name'], type: 'string' }
        ];
        this.tableActions = [
            { action: this.detail.bind(this), label: this.literals['detail'], icon: 'thf-icon thf-icon-document' },
            { action: this.edit.bind(this), label: this.literals['edit'], icon: 'thf-icon thf-icon-edit' },
            { action: this.delete.bind(this), label: this.literals['remove'], icon: 'thf-icon thf-icon-delete' }
        ];
        this.pageActions = [
            { label: this.literals['add'], action: this.create.bind(this), icon: 'thf-icon-add' }
        ];

        this.statusLabelList = Customer.statusLabelList(this.literals);

        this.columns = [
            { property: 'code', label: this.literals['code'], type: 'number' },
            { property: 'shortName', label: this.literals['shortName'], type: 'string' },
            { property: 'name', label: this.literals['name'], type: 'string' },
            { property: 'country', label: this.literals['country'], type: 'string' },
            { property: 'status', label: this.literals['status'], type: 'label', labels: this.statusLabelList }
        ];
        /*
                this.pageActions = [
                    { label: this.literals['add'], action: this.create.bind(this), icon: 'thf-icon-plus' }
                ];
        */
        this.resetFilters();

    }
    detail(item: ICustomer): void {
        this.router.navigate(['/customerMaint', 'detail', Customer.getInternalId(item)]);
    }
    ngOnDestroy(): void {
        if (this.servCustomerSubscription$) { this.servCustomerSubscription$.unsubscribe(); }
    }
}
