class Symbol {
    public value: number;
    public character: string;

    public x: number;
    public y: number;

    public color: string;

    constructor(value: number = -1, character: string = ' ', color: string = 'red') {
        this.value = value;
        this.character = character;
        this.color = color;
    }
}

