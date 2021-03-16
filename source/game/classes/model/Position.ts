class Position {
    x: GoalDrivenProperty;
    y: GoalDrivenProperty;
    symbol: Symbol;
    default: Symbol;

    constructor(x: number, y: number, symbol: Symbol = new Symbol(-1, ' ')) {
        this.x = new GoalDrivenProperty(x);
        this.y = new GoalDrivenProperty(y);
        this.symbol = symbol;
        this.default = new Symbol(-1, ' ');
        this.clear();
    }

    public clear() {
        this.symbol = this.default;
    }
}
