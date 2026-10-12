class Tile {

    position: Symbol;
    board: Board;
    display: Display;
    cx: number;
    cy: number;
    hidden: boolean;

    /** the tile is being drawn at a different size or transparency, for the press and the clear pop */
    scale: number = 1;
    alpha: number = 1;

    /** a finger is down on this tile */
    pressed: boolean = false;

    constructor(
        position: Symbol,
        board: Board,
        display: Display,
        row: number = null,
        hidden: boolean = false,
        column: number = null
    ) {

        this.position = position;
        this.board = board;
        this.display = display;
        this.hidden = hidden;

        let step = this.display.step;
        let r = (row === null) ? this.position.y : row;

        // The column is passed explicitly for tiles that are no longer on the board (the run being
        // cleared): the symbol object is shared, so its own x/y can belong to another cell.
        let cx = (column === null) ? this.position.x : column;

        this.cx = (cx * step) + this.display.horizontalOffset;
        this.cy = (r * step) + this.display.verticalOffset;
    }

    private circle() {

        let c = this.display.context;

        let step = this.display.step;
        let padding = this.display.padding;

        // A pressed tile sits a little smaller with a brighter rim, so a tap has an answer before the
        // run clears.
        let radius = (step / 2 - padding) * this.scale * (this.pressed ? 0.92 : 1);
        let centreX = this.cx + (step - padding) / 2;
        let centreY = this.cy + (step - padding) / 2;

        c.globalAlpha = this.alpha;

        c.beginPath();
        c.arc(centreX, centreY, radius, 0, 2 * Math.PI, false);

        c.fillStyle = this.position.color;
        c.strokeStyle = this.position.color;
        c.fill();

        if (this.pressed) {
            c.beginPath();
            c.arc(centreX, centreY, radius, 0, 2 * Math.PI, false);
            c.lineWidth = padding * 2;
            c.strokeStyle = "rgba(255,255,255,0.45)";
            c.stroke();
        }
    }

    private highlight() {

        let c = this.display.context;

        let step = this.display.step;
        let padding = this.display.padding;

        let cx = this.cx;
        let cy = this.cy + Math.ceil(step * 0.1);

        c.beginPath();

        c.ellipse(
            cx + (step - padding) / 2,
            cy + (((step - padding) / 2) * 0.1),
            (step / 2 - padding) * 0.5 * this.scale,
            (step / 2 - padding) * 0.2 * this.scale,
            0,
            0,
            2 * Math.PI,
            false
        );
        c.globalAlpha = (this.pressed ? 0.5 : 0.3) * this.alpha;
        c.fillStyle = 'rgb(255,255,255)';
        c.fill();
        c.globalAlpha = this.alpha;
    }

    private shadow() {

        let c = this.display.context;

        let step = this.display.step;
        let padding = this.display.padding;

        let cx = this.cx;
        let cy = this.cy + ((step - padding) * 0.75);

        c.beginPath();

        c.ellipse(
            cx + (step - padding) / 2,
            cy + (((step - padding) / 2) * 0.1),
            (step / 2 - padding) * 0.5 * this.scale,
            (step / 2 - padding) * 0.2 * this.scale,
            0,
            0,
            2 * Math.PI,
            false
        );
        c.globalAlpha = 0.3 * this.alpha;
        c.fillStyle = 'rgb(0,0,0)';
        c.fill();
        c.globalAlpha = this.alpha;
    }

    private text() {

        let step = this.display.step;
        let padding = this.display.padding;

        let cx = this.cx;
        let cy = this.cy;

        let c = this.display.context;

        let s = this.position.character;

        // Warm white clears 4.5:1 on every one of the eight tile colours, so the letter is legible on
        // its own; the thin dark rim is there to give the candy an edge, not to rescue the letter.
        c.fillStyle = "rgb(255,244,230)";
        c.strokeStyle = "rgb(0,0,0)";
        c.lineWidth = 2 * this.scale;
        c.font = "bolder " + ((step - padding) * 0.75 * this.scale) + "px Arial";

        c.globalAlpha = this.alpha;
        c.textAlign = "center";

        let x = Math.floor(cx + ((step - padding/2)/2));
        // The baseline is measured from the middle of the tile so the letter shrinks with the circle
        // rather than sliding off the top of it.
        let y = Math.ceil(cy + (step / 2) + (step * 0.25) * this.scale);

        c.strokeText(s, x, y);
        c.fillText(s, x, y);

        c.globalAlpha = this.alpha;
    }

    public draw() {

        if (this.hidden || -1 === this.position.value) {
            return;
        }

        this.circle();
        this.highlight();
        this.shadow();
        this.text();
    }
}
