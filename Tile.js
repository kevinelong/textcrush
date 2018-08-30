var Tile = (function () {
    function Tile(position, board, display) {
        this.position = position;
        this.board = board;
        this.display = display;
    }
    Tile.prototype.clear = function () {
        var c = this.display.context;
        var step = this.display.step;
        var cx = this.position.x * step;
        var cy = this.position.y * step;
        c.fillStyle = "grey";
        c.fillRect(cx, cy, step, step);
    };
    Tile.prototype.circle = function () {
        var c = this.display.context;
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.position.x * step;
        var cy = this.position.y * step;
        c.beginPath();
        c.arc(cx + (step - padding) / 2, cy + (step - padding) / 2, step / 2 - padding, 0, 2 * Math.PI, false);
        c.fillStyle = 'white';
        c.fill();
    };
    Tile.prototype.text = function () {
        var step = this.display.step;
        var padding = this.display.padding;
        var cx = this.position.x * step;
        var cy = this.position.y * step;
        var c = this.display.context;
        var s = this.position.character;
        c.fillStyle = "black";
        c.font = (step * 0.6) + "px Arial";
        var mt = c.measureText(s);
        c.fillText(s, Math.floor(cx + ((step - padding) / 2) - (mt.width / 2)), Math.ceil(cy + (step * 0.7)));
    };
    Tile.prototype.draw = function () {
        var c = this.display.context;
        if (-1 === this.position.value) {
            this.clear(c);
        }
        else {
            this.circle();
            this.text();
        }
    };
    return Tile;
}());
//# sourceMappingURL=Tile.js.map