var Display = (function () {
    function Display(canvas, game) {
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
    Display.prototype.onClick = function (ex, ey) {
        var x = Math.floor(ex / this.step);
        var y = Math.floor(ey / this.step);
        this.game.onRemove(x, y, {});
        this.draw();
        return new Neighbor(x, y);
    };
    Display.prototype.draw = function () {
        var size = this.board.size;
        var c = this.context;
        c.fillStyle = "gray";
        c.fillRect(0, 0, this.width, this.height);
        c.fillStyle = "white";
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                var t = new Tile(this.board.getPosition(x, y), this.board, this);
                t.draw();
            }
        }
    };
    return Display;
}());
//# sourceMappingURL=Display.js.map