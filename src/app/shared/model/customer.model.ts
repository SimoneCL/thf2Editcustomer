export interface ICustomer {
    // attribute: string;
    code: number;
    shortName: string;
    name: string;
    country: string;
    status: number;
}

export class Customer implements ICustomer {
    code: number;
    shortName: string;
    name: string;
    country: string;
    status: number;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: ICustomer): string {
        return item.code.toString();  // neste metodo que podemos transformar para base-64
    }

    get $code() { return this.code; }
    get $shortName() { return this.shortName; }
    get $name() { return this.name; }
    get $country() { return this.country; }
    get $status() { return this.status; }

    set $code(value: number) { this.code = value; }
    set $shortName(value: string) { this.shortName = value; }
    set $name(value: string) { this.name = value; }
    set $country(value: string) { this.country = value; }
    set $status(value: number) {this.status = value;}

    static statusLabelList(literals: {}): Array<any> {
        return [
            { value: 1, color: 'success', label: literals['active'] },
            { value: 2, color: 'danger', label: literals['inactive'] },
            { value: 3, color: 'color-09', label: literals['bloq'] }
        ];
    }
}
