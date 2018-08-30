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


    constructor(canvas: HTMLCanvasElement, game: Game) {
        this.game = game;
        this.board = this.game.board;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.minimum = Math.min(this.width, this.height);
        this.step = (this.minimum / this.board.size);
        this.padding = 3;
    }

    onClick(ex:number,ey:number) {
        let x = Math.floor(ex / this.step);
        let y = Math.floor(ey / this.step);

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
