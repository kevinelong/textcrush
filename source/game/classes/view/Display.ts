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
    font_pixels: number;
    half_width: number;

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
    }

    onClick(ex: number, ey: number) {

        let x = Math.floor((ex - this.horizontalOffset) / this.step);
        let y = Math.floor((ey - this.verticalOffset) / this.step);
        let neighbors = {};
        this.game.onRemove(x, y, neighbors);
        this.draw();

        return {
            "neighbors": neighbors,
            "x": x,
            "y": y
        };
    }

    setFont() {
        this.font_pixels = Math.floor(0.75 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    }

    setFontSmall() {
        this.font_pixels = Math.floor(0.25 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    }

    topCenterText(s: string) {
        this.setFont();
        let c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";

        c.strokeText(s, this.half_width, this.font_pixels);
        c.fillText(s, this.half_width, this.font_pixels);
    }

    middleCenterText(s: string) {

        let c = this.context;

        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        let y = this.canvas.height / 2 - this.font_pixels / 2;

        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    }

    bottomCenterText(s: string) {
        this.setFont();
        let c = this.context;

        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        let y = this.canvas.height - this.step;

        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    }

    static addCommas(s: string) {
        let o = "";

        for (let i = s.length - 1; i >= 0; i--) {

            o = s[i] + o;

            if (i > 0 && (((s.length - i) % 3) == 0)) {
                o = "," + o;
            }
        }

        return o;
    }

    showGameOver(message:string) {
        this.shadeBackGround();
        this.middleCenterText(message);
        this.bottomCenterText("Tap to Continue");
        this.updateScore();
    }

    updateScore() {
        let s = this.game.score.toString();
        let o = Display.addCommas(s);
        this.topCenterText(o);
    }

    drawTiles() {
        for (let y = 0; y < this.board.size; y++) {
            for (let x = 0; x < this.board.size; x++) {
                let t = new Tile(this.board.getPosition(x, y), this.board, this);
                t.draw();
            }
        }
    }

    topLeftText(s: string) {
        this.setFont();
        let c = this.context;

        c.textAlign = "left";

        c.strokeText(s.toString(), this.horizontalOffset, this.font_pixels);
        c.fillText(s.toString(), this.horizontalOffset, this.font_pixels);

    }

    updateMovesAvailable() {
        this.setFontSmall();
        let m = this.game.movesAvailable - this.game.movesUsed;
        this.topLeftText(m.toString() + " turns");
    }

    clearBackGround() {
        let c = this.context;
        c.fillStyle = "#221100";
        c.fillRect(0, 0, this.width, this.height);
    }

    shadeBackGround() {
        let c = this.context;
        c.fillStyle = "#221100";
        c.globalAlpha = 0.70;
        c.fillRect(0, 0, this.width, this.height);
        c.globalAlpha = 1;
    }

    draw() {

        this.half_width = this.horizontalOffset + (this.game.size * this.step / 2);

        this.setFont();

        this.clearBackGround();
        this.drawTiles();
        this.updateScore();

        this.updateMovesAvailable();

    }

}
