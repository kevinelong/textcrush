class Display {

    board: Board;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    minimum: number;
    step: number;
    padding: number;
    game: Game;
    scoreHeight: number;
    horizontalOffset: number;
    verticalOffset: number;

    constructor(canvas: HTMLCanvasElement, game: Game) {
        this.game = game;
        this.board = this.game.board;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.minimum = Math.min(this.width, this.height);
        this.scoreHeight = Math.floor(this.minimum / (this.board.size + 1));
        this.verticalOffset = this.scoreHeight;
        this.horizontalOffset = (this.width - this.minimum) / 2;
        this.step = ((this.minimum - this.scoreHeight) / this.board.size);
        this.padding = 1;
        console.log(this);
    }

    onClick(ex: number, ey: number) {
        console.log("display handling click");


        let x = Math.floor((ex - this.horizontalOffset) / this.step);
        let y = Math.floor((ey - this.verticalOffset) / this.step);

        this.game.onRemove(x, y, {});
        this.draw();
        return new Neighbor(x, y);
    }

    draw() {

        let size = this.board.size;
        let c = this.context;

        c.fillStyle = "gray";
        c.fillRect(0, 0, this.width, this.height);

        c.fillStyle = "white";

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let t = new Tile(this.board.getPosition(x, y), this.board, this);
                t.draw();
            }
        }
        let s = this.game.score.toString();
        let o = "";

        for (let i = s.length - 1; i >= 0; i--) {

            o = s[i] + o;

            if (i > 0 && (((s.length - i) % 3) == 0)) {
                o = "," + o;
            }
        }

        let font_pixels = Math.floor(0.75 * this.scoreHeight);
        let half_width = Math.floor(this.width / 2);

        c.font = "bold " + font_pixels + "px Arial";
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";

        c.strokeText(o, half_width, font_pixels);
        c.fillText(o, half_width, font_pixels);

        c.textAlign = "left";
    }

    // lines(context, size) {
    //     for (let x = 0; x <= size; x++) {
    //         context.moveTo(0.5 + x * 20, 0);
    //         context.lineTo(0.5 + x * 20, size * 20);
    //         context.moveTo(0.5, 0.5 + x * 20);
    //         context.lineTo(size * 20, 0.5 + x * 20);
    //     }
    //
    //     context.strokeStyle = "black";
    //     context.stroke();
    // }
}
