class Board {
    public positions: Array<Symbol>;
    private padding: number;
    public readonly size: number;
    private readonly blank: Symbol;

    constructor(size: number = 6) {
        this.blank = new Symbol(-1, ' ');
        this.positions = Array(size * size);
        this.size = size;
        this.padding = 3;
        this.clear();
    }

    public getPosition(x: number, y: number): Symbol {
        let s = this.positions[(y * this.size) + x];
        s.x=x;
        s.y=y;
        return s;
    }

    public setPosition(x: number, y: number, symbol: Symbol) {
        this.positions[(y * this.size) + x] = symbol;
    }

    public clear() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.setPosition(x, y, this.blank);
            }
        }
    }

}