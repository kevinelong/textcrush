class Position {
    x: number;
    y: number;
    symbol: Symbol;
    default: Symbol;

    constructor(x: number, y: number, symbol: Symbol = new Symbol(-1, ' ')) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.default = new Symbol(-1, ' ');
        this.clear();
    }

    public clear() {
        this.symbol = this.default;
    }
}
