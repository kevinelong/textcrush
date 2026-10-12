class Tile {

    position: Symbol;
    board: Board;
    display: Display;
    cx: number;
    cy: number;
    hidden: boolean;

    constructor(
        position: Symbol,
        board: Board,
        display: Display,
        row: number = null,
        hidden: boolean = false
    ) {

        this.position = position;
        this.board = board;
        this.display = display;
        this.hidden = hidden;

        let step = this.display.step;
        let r = (row === null) ? this.position.y : row;

        this.cx = (this.position.x * step) + this.display.horizontalOffset;
        this.cy = (r * step) + this.display.verticalOffset;
    }

    private circle() {

        let c = this.display.context;

        let step = this.display.step;
        let padding = this.display.padding;

        c.beginPath();

        c.arc(
            this.cx + (step - padding) / 2,
            this.cy + (step - padding) / 2,
            step / 2 - padding,
            0,
            2 * Math.PI,
            false
        );

        c.fillStyle = this.position.color;
        c.strokeStyle = this.position.color;
        c.fill();
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
            (step / 2 - padding) * 0.5,
            (step / 2 - padding) * 0.2,
            0,
            0,
            2 * Math.PI,
            false
        );
        c.globalAlpha = 0.3;
        c.fillStyle = 'rgb(255,255,255)';
        c.fill();
        c.globalAlpha = 1;
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
            (step / 2 - padding) * 0.5,
            (step / 2 - padding) * 0.2,
            0,
            0,
            2 * Math.PI,
            false
        );
        c.globalAlpha = 0.3;
        c.fillStyle = 'rgb(0,0,0)';
        c.fill();
        c.globalAlpha = 1;
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
        c.lineWidth = 2;
        c.font = "bolder " + ((step - padding) * 0.75) + "px Arial";

        c.globalAlpha = 1;
        c.textAlign = "center";

        let x = Math.floor(cx + ((step - padding/2)/2));
        let y = Math.ceil(cy + (step * 0.75));

        c.strokeText(s, x, y);
        c.fillText(s, x, y);

        c.globalAlpha = 1;
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
