class Tile {

    position: Symbol;
    board: Board;
    display: Display;
    cx: number;
    cy: number;

    constructor(position: Symbol, board: Board, display: Display) {

        this.position = position;
        this.board = board;
        this.display = display;

        this.cx = (this.position.x * this.display.step) + this.display.horizontalOffset;
        this.cy = (this.position.y * this.display.step) + this.display.verticalOffset;
        ////console.log(this.cx,this.cy);
    }

    //
    // public getSymbol(){
    //     return this.symbol;
    // }

    private clear() {

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


        c.fillStyle = "rgb(128,128,128)";
        c.strokeStyle = "rgb(128,128,128)";

        c.fill();

        c.globalAlpha = 1;
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

        c.fillStyle = "rgb(255,255,255)";
        c.strokeStyle = "rgb(0,0,0)";
        c.lineWidth = 4.5;
        c.font = "bolder " + ((step - padding) * 0.75) + "px Arial";

        c.globalAlpha = 0.8;
        c.textAlign = "center";

        let x = Math.floor(cx + ((step - padding/2)/2));
        let y = Math.ceil(cy + (step * 0.75));

        c.strokeText(s, x, y);
        c.fillText(s, x, y);

        c.globalAlpha = 1;
    }

    public draw() {

        if (-1 === this.position.value) {
            this.clear();
        } else {
            this.circle();
            this.highlight();
            this.shadow();
            this.text();
        }
    }
}
