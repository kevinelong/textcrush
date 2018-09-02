var Display = (function () {
    function Display(canvas, game) {
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
    Display.prototype.onClick = function (ex, ey) {
        console.log("display handling click");
        var x = Math.floor((ex - this.horizontalOffset) / this.step);
        var y = Math.floor((ey - this.verticalOffset) / this.step);
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
        var s = this.game.score.toString();
        var o = "";
        for (var i = s.length - 1; i >= 0; i--) {
            o = s[i] + o;
            if (i > 0 && (((s.length - i) % 3) == 0)) {
                o = "," + o;
            }
        }
        var font_pixels = Math.floor(0.75 * this.scoreHeight);
        var half_width = Math.floor(this.width / 2);
        c.font = "bold " + font_pixels + "px Arial";
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        c.strokeText(o, half_width, font_pixels);
        c.fillText(o, half_width, font_pixels);
        c.textAlign = "left";
    };
    return Display;
}());
//# sourceMappingURL=Display.js.map