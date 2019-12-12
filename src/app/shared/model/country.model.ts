export interface ICountry {
    // attribute: string;
    code: string;
    name: string;
}
export class Country implements ICountry {
    code: string;
    name: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

    static getInternalId(item: ICountry): string {
        return item.code.toString();  // neste metodo que podemos transformar para base-64
    }
    get $code() { return this.code; }
    get $name() { return this.name; }

    set $code(value: string) { this.name = value; }
    set $name(value: string) { this.name = value; }
   
}