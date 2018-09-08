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
    }
    Display.prototype.onClick = function (ex, ey) {
        var x = Math.floor((ex - this.horizontalOffset) / this.step);
        var y = Math.floor((ey - this.verticalOffset) / this.step);
        var neighbors = {};
        this.game.onRemove(x, y, neighbors);
        this.draw();
        return {
            "neighbors": neighbors,
            "x": x,
            "y": y
        };
    };
    Display.prototype.setFont = function () {
        this.font_pixels = Math.floor(0.75 * this.scoreHeight);
        this.context.font = "bold " + this.font_pixels + "px Arial";
    };
    Display.prototype.topCenterText = function (s) {
        var c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        c.strokeText(s, this.half_width, this.font_pixels);
        c.fillText(s, this.half_width, this.font_pixels);
    };
    Display.prototype.middleCenterText = function (s) {
        var c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        var y = this.font_pixels * 3;
        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    };
    Display.prototype.bottomCenterText = function (s) {
        var c = this.context;
        c.textAlign = "center";
        c.lineWidth = 3.5;
        c.strokeStyle = "#ffeecc";
        c.fillStyle = "#333333";
        var y = this.font_pixels * 5;
        c.strokeText(s, this.half_width, y);
        c.fillText(s, this.half_width, y);
    };
    Display.addCommas = function (s) {
        var o = "";
        for (var i = s.length - 1; i >= 0; i--) {
            o = s[i] + o;
            if (i > 0 && (((s.length - i) % 3) == 0)) {
                o = "," + o;
            }
        }
        return o;
    };
    Display.prototype.showGameOver = function () {
        this.clearBackGround();
        this.middleCenterText("Game Over");
        this.bottomCenterText("Tap to Continue");
        this.updateScore();
    };
    Display.prototype.updateScore = function () {
        var s = this.game.score.toString();
        var o = Display.addCommas(s);
        this.topCenterText(o);
    };
    Display.prototype.drawTiles = function () {
        for (var y = 0; y < this.board.size; y++) {
            for (var x = 0; x < this.board.size; x++) {
                var t = new Tile(this.board.getPosition(x, y), this.board, this);
                t.draw();
            }
        }
    };
    Display.prototype.topLeftText = function (s) {
        var c = this.context;
        c.textAlign = "left";
        c.strokeText(s.toString(), this.horizontalOffset, this.font_pixels);
        c.fillText(s.toString(), this.horizontalOffset, this.font_pixels);
    };
    Display.prototype.updateMovesAvailable = function () {
        var m = this.game.movesAvailable - this.game.movesUsed;
        this.topLeftText(m.toString());
    };
    Display.prototype.clearBackGround = function () {
        var c = this.context;
        c.fillStyle = "#221100";
        c.fillRect(0, 0, this.width, this.height);
    };
    Display.prototype.draw = function () {
        this.half_width = this.horizontalOffset + (this.game.size * this.step / 2);
        this.setFont();
        this.clearBackGround();
        this.drawTiles();
        this.updateScore();
        this.updateMovesAvailable();
    };
    return Display;
}());
//# sourceMappingURL=Display.js.map