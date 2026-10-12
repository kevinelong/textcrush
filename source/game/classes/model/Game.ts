interface FallMove {

    x: number;

    /** row the tile occupies now, negative when it starts above the grid */
    from: number;

    /** row the tile occupies once the board has settled */
    to: number;

    /** true when the tile is one of the refills injected at the top */
    spawned: boolean;
}

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


    /**
     * The eight tile colours, in the order they are handed to the symbols in play.
     *
     * Chosen, not sampled. This used to generate 26,640 colours on a step-8 RGB lattice and draw
     * eight of them per game, so 93% of boards held a pair closer than dE 20 (42% closer than dE 10)
     * and lightness ran from near-black to near-white. Measured on this set: every pair is at least
     * dE 20.5 apart, they hold one band of lightness, and one warm-white ink reads on all eight
     * (4.5:1 or better), so the colour is a second reading of the letter rather than decoration.
     */
    private static palette: Array<string> = [
        "rgb(178,44,78)",
        "rgb(180,85,26)",
        "rgb(138,108,16)",
        "rgb(76,122,34)",
        "rgb(30,122,94)",
        "rgb(31,110,156)",
        "rgb(59,75,181)",
        "rgb(119,64,158)"
    ];

    initColors() {
        this.colors = [];
        for (let i = 0; i < Game.palette.length; i++) {
            this.colors.push(Game.palette[i]);
        }
    }

    getRandomSymbol() {
        let r = Util.getRandomInteger(this.variations);
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
            this.symbols.push(new Symbol(index++, c.toString()));
        }

        let base = "A".charCodeAt(0);

        for (let a = 0; a < 26; a++) {
            this.symbols.push(new Symbol(index++, String.fromCharCode(base + a)));
        }

        let base_lower = "a".charCodeAt(0);

        for (let a = 0; a < 26; a++) {
            this.symbols.push(new Symbol(index++, String.fromCharCode(base_lower + a)));
        }

        this.symbols.sort(Game.randomCompare);

        // Colour lives on the symbol and is fixed for the whole game: eight symbols in play, eight
        // colours, so a colour always means the same letter - including for the tiles that refill
        // from the top, which draw from this same set.
        for (let i = 0; i < this.symbols.length; i++) {
            this.symbols[i].color = this.colors[i % this.colors.length];
        }
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

    /**
     * Describes what moveDown() is about to do, cell by cell, without touching the board.
     *
     * Each column settles independently: its tiles keep their bottom-up order and pack
     * against the bottom, and the freed rows above are refilled. So the tile that is
     * i-th from the bottom of a column lands on row size-1-i, and the refills enter as a
     * stack falling in from above the grid. Every cell of the board appears exactly once.
     */
    public fallPlan(): Array<FallMove> {

        let plan: Array<FallMove> = [];
        let size = this.size;
        let b = this.board;

        for (let x = 0; x < size; x++) {

            let rows: Array<number> = [];

            for (let y = size - 1; y >= 0; y--) {
                if (b.getPosition(x, y).value != -1) {
                    rows.push(y);
                }
            }

            let blanks = size - rows.length;

            for (let i = 0; i < rows.length; i++) {
                plan.push({
                    x: x, from: rows[i], to: size - 1 - i, spawned: false
                });
            }

            for (let i = 0; i < blanks; i++) {
                plan.push({
                    x: x, from: i - blanks, to: i, spawned: true
                });
            }
        }

        return plan;
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
