import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PoDisclaimer } from '@portinari/portinari-ui';
import { Observable } from 'rxjs';
import { TotvsResponse } from '../interfaces/totvs-response.interface';
import { IContact, Contact } from '../model/contact.model';


@Injectable()
export class ContactService {

    private headers = { headers: { 'X-Portinari-Screen-Lock': 'true' } };

    // private apiBaseUrl = '/dts/datasul-rest/resources/prg/fin/v1/contact';
    private apiBaseUrl = '/contact';

      private expandables = [''];

    constructor(private http: HttpClient) { }

    query(filters: PoDisclaimer[], expandables: string[], page = 1, pageSize = 20): Observable<TotvsResponse<IContact>> {
        const url = this.getUrl(this.apiBaseUrl, filters, expandables, page, pageSize);

        return this.http.get<TotvsResponse<IContact>>(url, this.headers);
    }

    getById(id: string, expandables: string[]): Observable<IContact> {
        let lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { lstExpandables = `?${lstExpandables}`; }

        return this.http.get<IContact>(`${this.apiBaseUrl}/${id}${lstExpandables}`, this.headers);
    }
    

    getByIdCustomer(codeCustomer: string, expandables: string[]): Observable<TotvsResponse<IContact>> {
       // this.getUrl(this.apiBaseUrl, String(codeCustomer), expandables, 1, 20);
        let lstExpandables = this.getExpandables(expandables);
        console.log(lstExpandables)
        if (lstExpandables !== '') { lstExpandables = `?${lstExpandables}`; }
console.log(this.apiBaseUrl)
        return this.http.get<TotvsResponse<IContact>>(`${this.apiBaseUrl}/${lstExpandables}?customer=${codeCustomer}`, this.headers);
     }

    getFilteredData(filter: string, page: number, pageSize: number): Observable<IContact> {
        const header = { params: { page: page.toString(), pageSize: pageSize.toString() } };

        if (filter && filter.length > 0) {
            header.params['code'] = filter;
        }

        return this.http.get<IContact>(`${this.apiBaseUrl}`, header);
    }

    getObjectByValue(id: string): Observable<IContact> {
        return this.http.get<IContact>(`${this.apiBaseUrl}/${id}`);
    }
    create(model: IContact): Observable<IContact> {
        return this.http.post<IContact>(this.apiBaseUrl, model, this.headers);
    }

    update(model: IContact): Observable<IContact> {
        return this.http.put<IContact>(`${this.apiBaseUrl}/${Contact.getInternalId(model)}`, model, this.headers);
    }

    delete(id: string): Observable<Object> {
        return this.http.delete(`${this.apiBaseUrl}/${id}`, this.headers);
    }

    getUrl(urlBase: string, filters: PoDisclaimer[], expandables: string[], page: number, pageSize: number): string {
        const urlParams = new Array<String>();

        urlParams.push(`pageSize=${pageSize}`);
        urlParams.push(`page=${page}`);

        const lstExpandables = this.getExpandables(expandables);
        if (lstExpandables !== '') { urlParams.push(lstExpandables); }

        if (filters && filters.length > 0) {
            filters.map(filter => {
                urlParams.push(`${filter.property}=${filter.value}`);
            });
        }

        return `${urlBase}?${urlParams.join('&')}`;
    }

    getExpandables(expandables: string[]): string {
        let lstExpandables = '';

        if (expandables && expandables.length > 0) {
            expandables.map(expandable => {
                if (expandable !== '' && this.expandables.includes(expandable)) {
                    if (lstExpandables !== '') { lstExpandables = `${lstExpandables},`; }
                    lstExpandables = `${lstExpandables}${expandable}`;
                }
            });
        }

        if (lstExpandables !== '') { lstExpandables = `expand=${lstExpandables}`; }

        return lstExpandables;
    }
}
