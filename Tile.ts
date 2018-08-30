class Tile {

    position: Symbol;
    board: Board;
    display: Display;


    constructor(position: Symbol, board: Board, display: Display) {
        this.position = position;
        this.board = board;
        this.display = display;
    }

    //
    // public getSymbol(){
    //     return this.symbol;
    // }

    private clear() {
        let c = this.display.context;
        let step = this.display.step;
        let cx = this.position.x * step;
        let cy = this.position.y * step;

        c.fillStyle = "grey";
        c.fillRect(cx, cy, step, step);
    }

    private circle() {

        let c = this.display.context;

        let step = this.display.step;
        let padding = this.display.padding;

        let cx = this.position.x * step;
        let cy = this.position.y * step;

        c.beginPath();

        c.arc(
            cx + (step - padding) / 2,
            cy + (step - padding) / 2,
            step / 2 - padding,
            0,
            2 * Math.PI,
            false
        );

        c.fillStyle = 'white';
        c.fill();
    }

    private text() {

        let step = this.display.step;
        let padding = this.display.padding;

        let cx = this.position.x * step;
        let cy = this.position.y * step;

        let c = this.display.context;

        let s = this.position.character;

        c.fillStyle = "black";
        c.font = (step * 0.6) + "px Arial";

        let mt = c.measureText(s);

        c.fillText(
            s,
            Math.floor(cx + ((step - padding) / 2) - (mt.width / 2)),
            Math.ceil(cy + (step * 0.7))
        );

    }

    public draw() {
        let c = this.display.context;

        if (-1 === this.position.value) {
            this.clear(c);
        } else {
            this.circle();
            this.text();
        }
    }
}
