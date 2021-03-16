class Property {

    name: string;
    value: any;
    originalValue: any;

    constructor(value: any, name: string = "Property") {
        this.name = name;
        this.value = value;
        this.originalValue = value;
    }

    isSame(): boolean {
        return this.value == this.originalValue;
    }
}