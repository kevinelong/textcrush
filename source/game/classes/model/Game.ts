class Game {

    score: number;
    size: number;
    variations: number;
    randomize: boolean;
    symbols: Array<Symbol>;
    board: Board;
    blank: Symbol;
    colors: Array<string> = [];
    movesAvailable: number = 20;
    movesUsed: number = 0;

    constructor(
        size: number = 3,
        variations: number = 3,
        randomize: boolean = true
    ) {
        this.score = 0;
        this.size = size;
        this.variations = variations;
        this.randomize = randomize;
        this.symbols = [];

        this.board = new Board(size);
        this.blank = new Symbol(-1, ' ');
        this.initColors();
        this.getSymbols();
        this.populate();
    }

    initColors() {
        let step = 8;
        let start = 0;
        let max = 255;
        let min = 256;
        for (let r = start; r <= max; r += step) {
            for (let g = start; g <= max; g += step) {
                for (let b = start; b <= max; b += step) {
                    if ((r + g + b) >= min && (r + g + b) < 999 && (r != g || r != b || b != b)) {
                        this.colors.push("rgb(" + r + "," + g + "," + b + ")");
                    }
                }
            }
        }
        this.colors.sort(Game.randomCompare);

    }

    getRandomSymbol() {
        let r = Util.getRandomInteger(this.variations);
        let s = this.symbols[r];
//	s.color = this.colors[Util.getRandomInteger(this.colors.length)];
        return this.symbols[r];
    }

    private populate() {
        let size = this.size;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                this.board.setPosition(x, y, this.getRandomSymbol());
            }
        }
    }

    private static randomCompare() {
        return 0.5 - Math.random();
    }

    private getSymbols() {

        let index = 0;

        for (let c = 0; c < 10; c++) {
            this.symbols.push(new Symbol(index++, c.toString(), this.colors[index]));
        }

        let base = "A".charCodeAt(0);

        for (let a = 0; a < 26; a++) {
            this.symbols.push(new Symbol(index++, String.fromCharCode(base + a), this.colors[index]));
        }

        let base_lower = "a".charCodeAt(0);

        for (let a = 0; a < 26; a++) {
            this.symbols.push(new Symbol(index++, String.fromCharCode(base_lower + a), this.colors[index]));
        }

        this.symbols.sort(Game.randomCompare);
    }


    public moveDown() {

        let moved = 0;
        let b = this.board;

        for (let y = b.size - 1; y >= 0; y--) {

            for (let x = b.size - 1; x >= 0; x--) {

                let v = b.getPosition(x, y).value;

                if (v == -1) {

                    if (y > 0) {
                        b.setPosition(x, y, b.getPosition(x, y - 1));
                        b.setPosition(x, y - 1, this.blank);
                    } else {
                        b.setPosition(x, y, this.getRandomSymbol());
                    }

                    moved++;
                }
            }
        }

        if (moved > 0) {
            this.moveDown();
        }

    }

    public onRemove(x: number, y: number, neighbors: any) {
        //console.log("onRemove", x, y);
        let count = Object.keys(neighbors).length;

        let b = this.board;

        let key: string = x.toString() + "," + y.toString();

        if (neighbors.hasOwnProperty(key)) {
            return;
        }

        let v: Symbol = b.getPosition(x, y);

        neighbors[key] = key;

        b.setPosition(x, y, this.blank);

        if (x < this.size - 1 && v === b.getPosition(x + 1, y)) {
            this.onRemove(x + 1, y, neighbors);
        }

        if (x > 0 && v === b.getPosition(x - 1, y)) {
            this.onRemove(x - 1, y, neighbors);
        }

        if (y < this.size - 1 && v === b.getPosition(x, y + 1)) {
            this.onRemove(x, y + 1, neighbors);
        }

        if (y > 0 && v === b.getPosition(x, y - 1)) {
            this.onRemove(x, y - 1, neighbors);
        }
        if (count == 0) {
            let n = Object.keys(neighbors).length;
            let s = Math.pow(2, n - 1);
            this.score += s;
            this.movesUsed++;
        }
    }

}
